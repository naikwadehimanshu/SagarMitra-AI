"""Orchestrator — the core LangGraph-inspired multi-agent pipeline.

This module coordinates all specialized agents into a coherent pipeline:
Planner → Data Agents → Analysis Agents → Visualization → Response

Works entirely without an LLM API key using rule-based planning.
"""
import logging
import time
import uuid
from datetime import datetime
from typing import Any, Optional

from app.schemas.common import Location, DataMetadata
from app.schemas.chat import ChatRequest, ChatResponse, AgentActivity
from app.schemas.marine import PFZZone
from app.schemas.risk import RiskAssessment

from app.agents.planner import PlannerAgent
from app.agents.marine import MarineAgent
from app.agents.weather import WeatherAgent
from app.agents.ocean_analytics import OceanAnalyticsAgent
from app.agents.geospatial import GeospatialAgent
from app.agents.risk import RiskAgent
from app.agents.route import RouteAgent
from app.agents.visualization import VisualizationAgent
from app.agents.alerts import AlertsAgent
from app.agents.conversational import ConversationalAgent

from app.services.conversation import get_conversation_manager
from app.tools.geocoding import coords_to_location

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """Multi-agent orchestrator that coordinates the full pipeline.

    Pipeline:
    1. Plan (intent, entities, agent selection)
    2. Data retrieval (weather, marine, ocean — in parallel conceptually)
    3. Analysis (risk, fishing potential, geofencing)
    4. Visualization (map layer generation)
    5. Response (natural language formatting)
    """

    def __init__(self):
        self.planner = PlannerAgent()
        self.marine = MarineAgent()
        self.weather = WeatherAgent()
        self.ocean_analytics = OceanAnalyticsAgent()
        self.geospatial = GeospatialAgent()
        self.risk = RiskAgent()
        self.route = RouteAgent()
        self.viz = VisualizationAgent()
        self.alerts_agent = AlertsAgent()
        self.conversational = ConversationalAgent()
        self.conversation_mgr = get_conversation_manager()

    async def process_query(self, request: ChatRequest) -> ChatResponse:
        """Process a user query through the full agent pipeline."""
        start_time = time.time()
        activities: list[AgentActivity] = []
        results: dict[str, Any] = {}

        # --- Conversation setup ---
        conv_id = request.conversation_id or str(uuid.uuid4())
        self.conversation_mgr.add_message(conv_id, "user", request.message)

        # --- Step 1: Planning ---
        act_start = time.time()
        activities.append(self._activity("Planner", "running", "Understanding query and extracting intent"))

        user_loc = None
        if request.location:
            user_loc = {"latitude": request.location.latitude, "longitude": request.location.longitude}

        # Check conversation context for location
        ctx = self.conversation_mgr.get_context(conv_id)
        if not user_loc and ctx.get("location"):
            user_loc = ctx["location"]

        plan = self.planner.plan(request.message, user_loc)
        intent = plan["intent"]
        language = plan["language"]
        entities = plan["entities"]
        agents_needed = plan["agents"]

        # Override language if user specified
        if request.language and request.language != "en":
            lang_map = {"hi": "hindi", "mr": "marathi", "bn": "bengali", "ta": "tamil",
                        "te": "telugu", "ml": "malayalam", "kn": "kannada", "gu": "gujarati", "or": "odia"}
            language = lang_map.get(request.language, language)

        activities[-1] = self._activity("Planner", "completed",
                                         f"Intent: {intent}, Language: {language}",
                                         time.time() - act_start)

        # --- Resolve location ---
        lat, lon = 19.076, 72.877  # Default: Mumbai
        location_name = "Mumbai (default)"

        if entities.get("coordinates"):
            lat = entities["coordinates"]["latitude"]
            lon = entities["coordinates"]["longitude"]
            location_name = entities.get("location_name", coords_to_location(lat, lon))
        elif user_loc:
            lat = user_loc["latitude"]
            lon = user_loc["longitude"]
            location_name = coords_to_location(lat, lon)

        activities.append(self._activity("Planner", "completed",
                                         f"Location: {location_name} ({lat:.3f}, {lon:.3f})"))

        # Update conversation context
        self.conversation_mgr.update_context(conv_id, {
            "location": {"latitude": lat, "longitude": lon},
            "location_name": location_name,
            "language": language,
            "last_intent": intent,
        })

        # --- Step 2: Data Retrieval ---
        map_layers = []

        # Always add user location marker
        map_layers.append(self.viz.create_user_location_layer(lat, lon, location_name))

        # Weather
        if "weather" in agents_needed:
            act_start = time.time()
            activities.append(self._activity("Weather", "running", "Fetching weather data"))
            try:
                weather_data = self.weather.get_current_weather(lat, lon)
                results["weather_data"] = weather_data
                if weather_data:
                    map_layers.append(self.viz.create_weather_layer(weather_data))
                    activities[-1] = self._activity("Weather", "completed",
                                                     f"Temperature: {weather_data.temperature}°C, Wind: {weather_data.wind_speed}km/h",
                                                     time.time() - act_start)
            except Exception as e:
                logger.error("Weather agent failed: %s", e)
                activities[-1] = self._activity("Weather", "error", f"Failed: {str(e)[:50]}")

        # Marine / Ocean data
        if "marine" in agents_needed:
            act_start = time.time()
            activities.append(self._activity("Marine Data", "running", "Retrieving ocean observations"))
            try:
                ocean_data = self.marine.get_ocean_data(lat, lon)
                results["ocean_data"] = ocean_data
                if ocean_data:
                    map_layers.append(self.viz.create_sst_layer(ocean_data))
                    map_layers.append(self.viz.create_chlorophyll_layer(ocean_data))
                    activities[-1] = self._activity("Marine Data", "completed",
                                                     f"SST: {ocean_data.sst}°C, Waves: {ocean_data.wave_height}m",
                                                     time.time() - act_start)
            except Exception as e:
                logger.error("Marine agent failed: %s", e)
                activities[-1] = self._activity("Marine Data", "error", str(e)[:50])

        # PFZ zones
        if intent in ("fishing_zone", "safety_check", "general_marine", "route_planning"):
            act_start = time.time()
            activities.append(self._activity("PFZ Intelligence", "running", "Searching for fishing zones"))
            try:
                pfz_zones = self.marine.get_pfz_zones(lat, lon, radius_km=50)
                pfz_zones = self.geospatial.rank_pfz_zones(lat, lon, pfz_zones)
                results["pfz_data"] = pfz_zones
                if pfz_zones:
                    map_layers.append(self.viz.create_pfz_layer(pfz_zones))
                    self.conversation_mgr.update_context(conv_id, {"last_pfz_zones": pfz_zones})
                activities[-1] = self._activity("PFZ Intelligence", "completed",
                                                 f"Found {len(pfz_zones)} zone(s)",
                                                 time.time() - act_start)
            except Exception as e:
                logger.error("PFZ retrieval failed: %s", e)
                activities[-1] = self._activity("PFZ Intelligence", "error", str(e)[:50])

        # --- Step 3: Analysis ---

        # Ocean analytics
        if "ocean_analytics" in agents_needed and results.get("ocean_data"):
            act_start = time.time()
            activities.append(self._activity("Ocean Analytics", "running", "Analyzing ocean conditions"))
            try:
                ocean = results["ocean_data"]
                weather = results.get("weather_data")
                fishing_potential = self.ocean_analytics.calculate_fishing_potential(ocean, weather)
                results["fishing_potential"] = fishing_potential

                if intent == "productivity_analysis":
                    results["productivity_trend"] = self.ocean_analytics.analyze_productivity_trend(lat, lon)

                activities[-1] = self._activity("Ocean Analytics", "completed",
                                                 f"Fishing potential: {fishing_potential['overall_score']}/100",
                                                 time.time() - act_start)
            except Exception as e:
                logger.error("Ocean analytics failed: %s", e)
                activities[-1] = self._activity("Ocean Analytics", "error", str(e)[:50])

        # Geospatial
        if "geospatial" in agents_needed:
            act_start = time.time()
            activities.append(self._activity("Geospatial", "running", "Checking spatial constraints"))
            try:
                geofence_alerts = self.geospatial.check_geofences(lat, lon, radius_km=50)
                results["geofence_alerts"] = geofence_alerts

                # Add geofence layer
                geofences = self.geospatial.get_all_geofences()
                if geofences:
                    map_layers.append(self.viz.create_geofence_layer(geofences))

                activities[-1] = self._activity("Geospatial", "completed",
                                                 f"Checked {len(geofences)} zone(s), {len(geofence_alerts)} alert(s)",
                                                 time.time() - act_start)
            except Exception as e:
                logger.error("Geospatial agent failed: %s", e)
                activities[-1] = self._activity("Geospatial", "error", str(e)[:50])

        # Alerts
        if "alerts" in agents_needed:
            act_start = time.time()
            activities.append(self._activity("Alert Monitor", "running", "Checking active alerts"))
            try:
                all_alerts = self.alerts_agent.get_active_alerts(lat, lon)
                if results.get("weather_data"):
                    all_alerts.extend(self.alerts_agent.check_weather_alerts(results["weather_data"]))
                if results.get("ocean_data"):
                    all_alerts.extend(self.alerts_agent.check_marine_alerts(results["ocean_data"]))
                results["alerts"] = all_alerts
                activities[-1] = self._activity("Alert Monitor", "completed",
                                                 f"{len(all_alerts)} alert(s) active",
                                                 time.time() - act_start)
            except Exception as e:
                logger.error("Alerts agent failed: %s", e)
                activities[-1] = self._activity("Alert Monitor", "error", str(e)[:50])

        # Risk assessment
        if "risk" in agents_needed:
            act_start = time.time()
            activities.append(self._activity("Risk Engine", "running", "Calculating safety risk"))
            try:
                risk_assessment = self.risk.assess_risk(
                    weather=results.get("weather_data"),
                    ocean=results.get("ocean_data"),
                    alerts=results.get("alerts", []),
                    geofence_alerts=results.get("geofence_alerts", []),
                )
                results["risk_assessment"] = risk_assessment
                self.conversation_mgr.update_context(conv_id, {"last_risk_assessment": risk_assessment})

                # Risk zone on map
                map_layers.append(self.viz.create_risk_layer(lat, lon,
                                                             risk_assessment.overall_score,
                                                             risk_assessment.risk_level))

                activities[-1] = self._activity("Risk Engine", "completed",
                                                 f"Risk: {risk_assessment.risk_level} ({risk_assessment.overall_score}/100)",
                                                 time.time() - act_start)
            except Exception as e:
                logger.error("Risk assessment failed: %s", e)
                activities[-1] = self._activity("Risk Engine", "error", str(e)[:50])

        # Route planning
        if "route" in agents_needed:
            act_start = time.time()
            activities.append(self._activity("Route Optimizer", "running", "Computing maritime route"))
            try:
                # Determine destination
                pfz = results.get("pfz_data", [])
                if pfz:
                    dest = Location(latitude=pfz[0].latitude, longitude=pfz[0].longitude,
                                    name=pfz[0].name)
                else:
                    # Default destination: offset from start
                    dest = Location(latitude=lat + 0.2, longitude=lon + 0.2, name="Destination")

                start_loc = Location(latitude=lat, longitude=lon, name=location_name)
                route_response = self.route.calculate_route(
                    start=start_loc, end=dest,
                    weather_data=results.get("weather_data"),
                    geofence_alerts=results.get("geofence_alerts"),
                    ocean_data=results.get("ocean_data"),
                )
                results["route_data"] = route_response
                results["destination"] = dest.name or "destination"

                map_layers.append(self.viz.create_route_layer(route_response.routes))
                activities[-1] = self._activity("Route Optimizer", "completed",
                                                 f"{len(route_response.routes)} route option(s) generated",
                                                 time.time() - act_start)
            except Exception as e:
                logger.error("Route agent failed: %s", e)
                activities[-1] = self._activity("Route Optimizer", "error", str(e)[:50])

        # --- Step 4: Response Generation ---
        act_start = time.time()
        activities.append(self._activity("Response Generator", "running", "Generating response"))

        response_text = self.conversational.format_response(
            intent=intent,
            language=language,
            results=results,
            location_name=location_name,
        )

        activities[-1] = self._activity("Response Generator", "completed",
                                         "Response ready", time.time() - act_start)

        # Store assistant response
        self.conversation_mgr.add_message(conv_id, "assistant", response_text)

        # --- Build final response ---
        total_time = time.time() - start_time
        agents_used = [a.agent_name for a in activities if a.status == "completed"]

        # Determine data mode
        data_mode = "demo"
        if results.get("weather_data") and results["weather_data"].data_mode == "live":
            data_mode = "live"

        # Calculate confidence
        completed_count = sum(1 for a in activities if a.status == "completed")
        total_count = len(activities)
        confidence = round(completed_count / total_count, 2) if total_count > 0 else 0.5

        return ChatResponse(
            response=response_text,
            conversation_id=conv_id,
            language=language,
            agents_used=agents_used,
            agent_activity=activities,
            risk_assessment=results.get("risk_assessment"),
            pfz_data=results.get("pfz_data"),
            map_layers=[self._layer_to_dict(l) for l in map_layers],
            recommendations=self._build_recommendations(results),
            alerts=results.get("alerts"),
            route=results.get("route_data"),
            metadata=DataMetadata(
                source="SagarMitra AI Multi-Agent System",
                timestamp=datetime.utcnow().isoformat(),
                data_mode=data_mode,
                confidence=confidence,
            ),
        )

    @staticmethod
    def _activity(agent: str, status: str, description: str,
                  duration: float | None = None) -> AgentActivity:
        """Create an AgentActivity record."""
        return AgentActivity(
            agent_name=agent,
            status=status,
            description=description,
            timestamp=datetime.utcnow().isoformat(),
            duration_ms=int(duration * 1000) if duration else None,
        )

    @staticmethod
    def _layer_to_dict(layer) -> dict:
        """Convert MapLayer to dict for JSON serialization."""
        if hasattr(layer, "model_dump"):
            return layer.model_dump()
        return layer.__dict__

    @staticmethod
    def _build_recommendations(results: dict) -> list[dict]:
        """Build structured recommendations from results."""
        recs = []

        if results.get("risk_assessment"):
            risk = results["risk_assessment"]
            recs.append({
                "title": f"Safety Assessment: {risk.risk_level}",
                "description": risk.recommendation,
                "evidence": [f.description for f in risk.factors[:3]],
                "confidence": risk.confidence,
                "sources": risk.sources,
                "timestamp": risk.timestamp,
            })

        if results.get("fishing_potential"):
            fp = results["fishing_potential"]
            recs.append({
                "title": f"Fishing Potential: {fp['overall_score']}/100",
                "description": fp["recommendation"],
                "evidence": [v["detail"] for v in fp.get("breakdown", {}).values()],
                "confidence": 0.75,
                "sources": ["Ocean Analytics Engine"],
                "timestamp": datetime.utcnow().isoformat(),
            })

        if results.get("pfz_data"):
            best = results["pfz_data"][0]
            recs.append({
                "title": f"Best Fishing Zone: {best.name}",
                "description": f"Distance: {best.distance_km:.1f} km, Suitability: {best.suitability_score}/100",
                "evidence": [f"SST: {best.sst}°C", f"Chlorophyll: {best.chlorophyll} mg/m³"],
                "confidence": 0.7,
                "sources": ["PFZ Intelligence"],
                "timestamp": datetime.utcnow().isoformat(),
            })

        return recs


# Singleton orchestrator
_orchestrator: AgentOrchestrator | None = None


def get_orchestrator() -> AgentOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = AgentOrchestrator()
    return _orchestrator


async def process_query(request: ChatRequest) -> ChatResponse:
    """Convenience function to process a query through the orchestrator."""
    return await get_orchestrator().process_query(request)
