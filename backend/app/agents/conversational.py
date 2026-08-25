"""Conversational Agent — formats natural language responses with multilingual support."""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Response templates
# ---------------------------------------------------------------------------

TEMPLATES = {
    "english": {
        "safety_check": (
            "Based on the available forecast and marine data, conditions near **{location}** "
            "are currently assessed as **{risk_level}** (Risk Score: {risk_score}/100).\n\n"
            "**Key Factors:**\n{factors}\n\n"
            "**Recommendation:** {recommendation}\n\n"
            "{warnings}"
            "---\n"
            "⚠️ *Always verify with the latest official marine advisory before departure.*\n\n"
            "📊 *Data sources: {sources} | Mode: {data_mode} | Confidence: {confidence}%*"
        ),
        "fishing_zone": (
            "Here are the nearest Potential Fishing Zones (PFZ) near **{location}**:\n\n"
            "{pfz_list}\n\n"
            "**Recommendation:** {recommendation}\n\n"
            "---\n"
            "🐟 *Fishing potential is a decision-support score and NOT a guarantee of fish availability.*\n\n"
            "📊 *Data sources: {sources} | Mode: {data_mode}*"
        ),
        "weather_query": (
            "**Current Weather near {location}:**\n\n"
            "🌡️ Temperature: {temperature}°C\n"
            "💧 Humidity: {humidity}%\n"
            "🌬️ Wind: {wind_speed} km/h from {wind_direction}°\n"
            "🌧️ Precipitation: {precipitation} mm\n"
            "☁️ Cloud Cover: {cloud_cover}%\n"
            "👁️ Visibility: {visibility} km\n"
            "⚡ Lightning Risk: {lightning_risk}\n"
            "🌡️ Pressure: {pressure} hPa\n\n"
            "{alerts_text}"
            "📊 *Source: {source} | Mode: {data_mode}*"
        ),
        "ocean_conditions": (
            "**Ocean Conditions near {location}:**\n\n"
            "🌊 Sea Surface Temperature: {sst}°C\n"
            "🧪 Chlorophyll: {chlorophyll} mg/m³\n"
            "🌊 Wave Height: {wave_height} m\n"
            "🌊 Wave Period: {wave_period} s\n"
            "🔄 Current Speed: {current_speed} knots\n"
            "🌊 Sea State: {sea_state}\n\n"
            "{analysis}\n\n"
            "📊 *Source: {source} | Mode: {data_mode}*"
        ),
        "route_planning": (
            "Here are your route options from **{start}** to **{end}**:\n\n"
            "{route_details}\n\n"
            "**Recommendation:** {recommendation}\n\n"
            "⚠️ *Route calculations are approximate. Always follow official navigation charts and guidelines.*"
        ),
        "cyclone_alert": (
            "**Cyclone / Storm Alert Status near {location}:**\n\n"
            "{alert_details}\n\n"
            "⚠️ *Always follow official IMD and INCOIS advisories for cyclone information.*"
        ),
        "geofence_check": (
            "**Restricted Zone Status near {location}:**\n\n"
            "{geofence_details}\n\n"
            "ℹ️ *Geofence data is based on available maritime boundary information.*"
        ),
        "general_marine": (
            "**Marine Intelligence Summary for {location}:**\n\n"
            "{summary}\n\n"
            "📊 *Data sources: {sources} | Mode: {data_mode}*"
        ),
        "productivity_analysis": (
            "**Fish Productivity Analysis for {location}:**\n\n"
            "{analysis}\n\n"
            "📊 *Based on satellite and oceanographic model data.*"
        ),
        "fallback": (
            "I've analyzed the available marine data for **{location}**. "
            "Here's what I found:\n\n{summary}\n\n"
            "Would you like me to provide more details on any specific aspect?"
        ),
    },
    "hindi": {
        "safety_check": (
            "उपलब्ध मौसम और समुद्री डेटा के आधार पर, **{location}** के पास की स्थिति "
            "वर्तमान में **{risk_level}** (जोखिम स्कोर: {risk_score}/100) के रूप में आंकी गई है।\n\n"
            "**प्रमुख कारक:**\n{factors}\n\n"
            "**सिफारिश:** {recommendation}\n\n"
            "{warnings}"
            "---\n"
            "⚠️ *प्रस्थान से पहले नवीनतम आधिकारिक समुद्री सलाह से हमेशा सत्यापित करें।*\n\n"
            "📊 *डेटा स्रोत: {sources} | मोड: {data_mode} | विश्वास: {confidence}%*"
        ),
        "fishing_zone": (
            "**{location}** के पास संभावित मछली पकड़ने के क्षेत्र (PFZ):\n\n"
            "{pfz_list}\n\n"
            "**सिफारिश:** {recommendation}\n\n"
            "🐟 *यह एक निर्णय-सहायता स्कोर है, मछली उपलब्धता की गारंटी नहीं।*"
        ),
        "weather_query": (
            "**{location} के पास वर्तमान मौसम:**\n\n"
            "🌡️ तापमान: {temperature}°C\n"
            "💧 आर्द्रता: {humidity}%\n"
            "🌬️ हवा: {wind_speed} km/h\n"
            "🌧️ वर्षा: {precipitation} mm\n"
            "👁️ दृश्यता: {visibility} km\n\n"
            "📊 *स्रोत: {source} | मोड: {data_mode}*"
        ),
        "fallback": (
            "मैंने **{location}** के लिए उपलब्ध समुद्री डेटा का विश्लेषण किया है।\n\n{summary}\n\n"
            "क्या आप किसी विशेष पहलू पर अधिक जानकारी चाहेंगे?"
        ),
    },
}


class ConversationalAgent:
    """Agent for formatting final user-facing responses.

    Produces natural language responses with structured data,
    evidence, and multilingual support.
    """

    def format_response(self, intent: str, language: str, results: dict,
                        location_name: str = "your location") -> str:
        """Format agent results into a conversational response."""
        lang_templates = TEMPLATES.get(language, TEMPLATES["english"])
        template = lang_templates.get(intent, lang_templates.get("fallback", ""))

        try:
            if intent == "safety_check":
                return self._format_safety(template, results, location_name)
            elif intent == "fishing_zone":
                return self._format_fishing(template, results, location_name)
            elif intent == "weather_query":
                return self._format_weather(template, results, location_name)
            elif intent == "ocean_conditions":
                return self._format_ocean(template, results, location_name)
            elif intent == "route_planning":
                return self._format_route(template, results, location_name)
            elif intent == "cyclone_alert":
                return self._format_cyclone(template, results, location_name)
            elif intent == "geofence_check":
                return self._format_geofence(template, results, location_name)
            elif intent == "productivity_analysis":
                return self._format_productivity(template, results, location_name)
            else:
                return self._format_general(lang_templates, results, location_name)
        except Exception as e:
            logger.error("Failed to format response: %s", e)
            return self._format_general(lang_templates, results, location_name)

    def _format_safety(self, template: str, results: dict, location: str) -> str:
        risk = results.get("risk_assessment")
        if not risk:
            return f"Unable to complete safety assessment for {location}. Some data sources may be unavailable."

        factors_text = ""
        for f in risk.factors:
            factors_text += f"- {f.icon} **{f.name}**: {f.score}/{f.max_score} ({f.level}) — {f.description}\n"

        warnings_text = ""
        if risk.warnings:
            warnings_text = "**⚠️ Warnings:**\n" + "\n".join(f"- {w}" for w in risk.warnings) + "\n\n"

        return template.format(
            location=location,
            risk_level=risk.risk_level,
            risk_score=risk.overall_score,
            factors=factors_text,
            recommendation=risk.recommendation,
            warnings=warnings_text,
            sources=", ".join(risk.sources),
            data_mode=risk.data_mode,
            confidence=int(risk.confidence * 100),
        )

    def _format_fishing(self, template: str, results: dict, location: str) -> str:
        pfz_zones = results.get("pfz_data", [])
        if not pfz_zones:
            return f"No Potential Fishing Zones found near {location} at this time."

        pfz_list = ""
        for i, zone in enumerate(pfz_zones[:5], 1):
            pfz_list += (
                f"**{i}. {zone.name}**\n"
                f"   📍 Distance: {zone.distance_km:.1f} km ({zone.direction})\n"
                f"   🌡️ SST: {zone.sst}°C | 🧪 Chlorophyll: {zone.chlorophyll} mg/m³\n"
                f"   🌊 Sea State: {zone.sea_state or 'N/A'} | "
                f"Score: **{zone.suitability_score}/100**\n\n"
            )

        best = pfz_zones[0]
        recommendation = (
            f"{best.name} is currently the most favourable zone at {best.distance_km:.1f} km "
            f"({best.direction}) with a suitability score of {best.suitability_score}/100."
        )

        return template.format(
            location=location,
            pfz_list=pfz_list,
            recommendation=recommendation,
            sources="PFZ Intelligence, Ocean Observations",
            data_mode=results.get("data_mode", "demo"),
        )

    def _format_weather(self, template: str, results: dict, location: str) -> str:
        weather = results.get("weather_data")
        if not weather:
            return f"Weather data is currently unavailable for {location}."

        alerts = results.get("alerts", [])
        alerts_text = ""
        if alerts:
            alerts_text = "**Active Alerts:**\n"
            for a in alerts:
                alerts_text += f"- {a.icon} {a.title}: {a.description}\n"
            alerts_text += "\n"

        return template.format(
            location=location,
            temperature=weather.temperature,
            humidity=weather.humidity,
            wind_speed=weather.wind_speed,
            wind_direction=weather.wind_direction,
            precipitation=weather.precipitation,
            cloud_cover=weather.cloud_cover,
            visibility=weather.visibility,
            lightning_risk=weather.lightning_risk or "None",
            pressure=weather.pressure,
            alerts_text=alerts_text,
            source=weather.source,
            data_mode=weather.data_mode,
        )

    def _format_ocean(self, template: str, results: dict, location: str) -> str:
        ocean = results.get("ocean_data")
        if not ocean:
            return f"Ocean data is currently unavailable for {location}."

        analysis = results.get("fishing_potential", {})
        analysis_text = ""
        if analysis:
            analysis_text = (
                f"**Fishing Potential: {analysis.get('overall_score', 'N/A')}/100 "
                f"— {analysis.get('assessment', 'N/A')}**\n"
                f"{analysis.get('recommendation', '')}"
            )

        return template.format(
            location=location,
            sst=ocean.sst,
            chlorophyll=ocean.chlorophyll,
            wave_height=ocean.wave_height,
            wave_period=ocean.wave_period,
            current_speed=ocean.current_speed,
            sea_state=ocean.sea_state,
            analysis=analysis_text,
            source=ocean.source,
            data_mode=ocean.data_mode,
        )

    def _format_route(self, template: str, results: dict, location: str) -> str:
        route_resp = results.get("route_data")
        if not route_resp or not route_resp.routes:
            return "Unable to calculate route at this time."

        details = ""
        for route in route_resp.routes:
            details += (
                f"**{route.name}** ({route.route_type.upper()}):\n"
                f"   📏 Distance: {route.distance_km} km\n"
                f"   ⏱️ Duration: {route.duration_hours} hours\n"
                f"   ⚠️ Risk Score: {route.risk_score}/100\n"
                f"   🚧 Hazards: {', '.join(route.hazards) if route.hazards else 'None identified'}\n\n"
            )

        return template.format(
            start=location,
            end=results.get("destination", "destination"),
            route_details=details,
            recommendation=route_resp.recommendation,
        )

    def _format_cyclone(self, template: str, results: dict, location: str) -> str:
        alerts = results.get("alerts", [])
        cyclone_alerts = [a for a in alerts if a.type == "cyclone"]
        if not cyclone_alerts:
            detail = "✅ No active cyclone or storm warnings detected in this region."
        else:
            detail = "\n".join(f"- {a.icon} **{a.title}**: {a.description}" for a in cyclone_alerts)
        return template.format(location=location, alert_details=detail)

    def _format_geofence(self, template: str, results: dict, location: str) -> str:
        gf_alerts = results.get("geofence_alerts", [])
        if not gf_alerts:
            detail = "✅ No restricted zones detected within 50 km of your location."
        else:
            detail = "\n".join(
                f"- {ga.message} (Distance: {ga.distance_km:.1f} km)"
                for ga in gf_alerts
            )
        return template.format(location=location, geofence_details=detail)

    def _format_productivity(self, template: str, results: dict, location: str) -> str:
        trend = results.get("productivity_trend", {})
        analysis = f"**Trend:** {trend.get('trend', 'N/A')}\n\n"
        for factor in trend.get("factors", []):
            analysis += f"- {factor}\n"
        analysis += f"\n{trend.get('explanation', '')}"
        return template.format(location=location, analysis=analysis)

    def _format_general(self, templates: dict, results: dict, location: str) -> str:
        template = templates.get("fallback", "Analysis complete for {location}.\n\n{summary}")
        summary_parts = []
        if results.get("weather_data"):
            w = results["weather_data"]
            summary_parts.append(f"🌤️ Weather: {w.temperature}°C, Wind {w.wind_speed} km/h")
        if results.get("ocean_data"):
            o = results["ocean_data"]
            summary_parts.append(f"🌊 Ocean: SST {o.sst}°C, Waves {o.wave_height}m, {o.sea_state}")
        if results.get("pfz_data"):
            summary_parts.append(f"🐟 {len(results['pfz_data'])} fishing zone(s) found nearby")
        if results.get("risk_assessment"):
            r = results["risk_assessment"]
            summary_parts.append(f"⚠️ Risk: {r.risk_level} ({r.overall_score}/100)")

        summary = "\n".join(summary_parts) if summary_parts else "Data analysis completed."
        return template.format(location=location, summary=summary)
