"""Route Optimization Agent — calculates safe maritime routes."""
import logging
import uuid
from typing import Optional

from app.schemas.route import Route, RouteWaypoint, RouteRequest, RouteResponse
from app.schemas.common import Location, DataMetadata
from app.tools.calculations import (
    haversine_distance, bearing, bearing_to_cardinal,
    generate_waypoints, offset_point,
)
from datetime import datetime

logger = logging.getLogger(__name__)


class RouteAgent:
    """Agent for computing optimized maritime routes.

    Generates two route options:
    1. FASTEST — most direct path
    2. SAFEST — adjusted to avoid hazards and restricted zones
    """

    AVERAGE_SPEED_KNOTS = 15  # ~27.78 km/h

    def calculate_route(
        self,
        start: Location,
        end: Location,
        weather_data=None,
        geofence_alerts=None,
        ocean_data=None,
    ) -> RouteResponse:
        """Calculate fastest and safest routes between two points."""
        s = (start.latitude, start.longitude)
        e = (end.latitude, end.longitude)
        total_dist = haversine_distance(s[0], s[1], e[0], e[1])

        # Number of intermediate waypoints
        n_waypoints = max(3, int(total_dist / 10))

        # --- FASTEST ROUTE ---
        fastest_wps = generate_waypoints(s, e, n_waypoints)
        fastest_waypoints = []
        for lat, lon in fastest_wps:
            wp_risk = self._estimate_waypoint_risk(lat, lon, weather_data, ocean_data)
            fastest_waypoints.append(RouteWaypoint(
                latitude=lat, longitude=lon,
                risk_score=wp_risk,
                weather_note=None,
            ))

        fastest_hazards = self._identify_hazards(fastest_waypoints, geofence_alerts)
        avg_risk_fast = sum(w.risk_score for w in fastest_waypoints) / len(fastest_waypoints)
        fastest_duration = total_dist / (self.AVERAGE_SPEED_KNOTS * 1.852)  # knots to km/h

        fastest = Route(
            id=f"route_fast_{uuid.uuid4().hex[:8]}",
            name="Fastest Route",
            waypoints=fastest_waypoints,
            distance_km=round(total_dist, 1),
            duration_hours=round(fastest_duration, 1),
            risk_score=round(avg_risk_fast),
            hazards=fastest_hazards,
            geojson=self._waypoints_to_geojson(fastest_waypoints, "fastest"),
            route_type="fastest",
        )

        # --- SAFEST ROUTE ---
        safest_wps = self._offset_for_safety(fastest_wps, geofence_alerts)
        safest_waypoints = []
        for lat, lon in safest_wps:
            wp_risk = max(0, self._estimate_waypoint_risk(lat, lon, weather_data, ocean_data) - 5)
            safest_waypoints.append(RouteWaypoint(
                latitude=lat, longitude=lon,
                risk_score=wp_risk,
                weather_note=None,
            ))

        safest_dist = self._calculate_path_distance(safest_wps)
        safest_hazards = self._identify_hazards(safest_waypoints, geofence_alerts)
        avg_risk_safe = sum(w.risk_score for w in safest_waypoints) / len(safest_waypoints)
        safest_duration = safest_dist / (self.AVERAGE_SPEED_KNOTS * 1.852)

        safest = Route(
            id=f"route_safe_{uuid.uuid4().hex[:8]}",
            name="Safest Route",
            waypoints=safest_waypoints,
            distance_km=round(safest_dist, 1),
            duration_hours=round(safest_duration, 1),
            risk_score=round(avg_risk_safe),
            hazards=safest_hazards,
            geojson=self._waypoints_to_geojson(safest_waypoints, "safest"),
            route_type="safest",
        )

        # Recommendation
        if avg_risk_safe < avg_risk_fast * 0.7:
            recommendation = (
                f"The safest route is {safest_dist - total_dist:.1f} km longer but has "
                f"significantly lower risk (score {round(avg_risk_safe)} vs {round(avg_risk_fast)}). "
                f"We recommend the safest route for better safety margins."
            )
        else:
            recommendation = (
                f"Both routes have similar risk profiles. The fastest route saves "
                f"{safest_duration - fastest_duration:.1f} hours. "
                f"Choose based on your experience and vessel capability."
            )

        return RouteResponse(
            routes=[fastest, safest],
            recommendation=recommendation,
            metadata=DataMetadata(
                source="Route Optimization Engine",
                timestamp=datetime.utcnow().isoformat(),
                data_mode="demo",
                confidence=0.75,
            ),
        )

    def _estimate_waypoint_risk(self, lat: float, lon: float,
                                 weather_data=None, ocean_data=None) -> float:
        """Estimate risk at a waypoint (0-100)."""
        risk = 20  # base risk for open water
        if weather_data:
            if hasattr(weather_data, 'wind_speed') and weather_data.wind_speed > 25:
                risk += 20
            if hasattr(weather_data, 'precipitation') and weather_data.precipitation > 15:
                risk += 10
        if ocean_data:
            if hasattr(ocean_data, 'wave_height') and ocean_data.wave_height > 2.0:
                risk += 15
        return min(100, risk)

    def _offset_for_safety(self, waypoints: list, geofence_alerts=None) -> list:
        """Slightly offset intermediate waypoints for the 'safer' route."""
        if len(waypoints) <= 2:
            return waypoints
        # Offset middle waypoints slightly perpendicular to the main route
        result = [waypoints[0]]
        for i, (lat, lon) in enumerate(waypoints[1:-1], 1):
            offset_lat = lat + 0.02 * (1 if i % 2 == 0 else -1)
            offset_lon = lon + 0.01 * (1 if i % 2 == 0 else -1)
            result.append((round(offset_lat, 6), round(offset_lon, 6)))
        result.append(waypoints[-1])
        return result

    @staticmethod
    def _calculate_path_distance(waypoints: list) -> float:
        """Sum up distance along a path of waypoints."""
        total = 0.0
        for i in range(len(waypoints) - 1):
            total += haversine_distance(
                waypoints[i][0], waypoints[i][1],
                waypoints[i + 1][0], waypoints[i + 1][1],
            )
        return round(total, 1)

    @staticmethod
    def _identify_hazards(waypoints: list[RouteWaypoint],
                          geofence_alerts=None) -> list[str]:
        """Identify hazards along the route."""
        hazards = []
        high_risk_wps = [w for w in waypoints if w.risk_score > 50]
        if high_risk_wps:
            hazards.append(f"{len(high_risk_wps)} waypoint(s) with elevated risk")
        if geofence_alerts:
            hazards.append(f"{len(geofence_alerts)} restricted zone(s) nearby")
        return hazards

    @staticmethod
    def _waypoints_to_geojson(waypoints: list[RouteWaypoint], route_type: str) -> dict:
        """Convert waypoints to GeoJSON LineString."""
        coordinates = [[w.longitude, w.latitude] for w in waypoints]
        return {
            "type": "Feature",
            "properties": {
                "route_type": route_type,
                "color": "#22c55e" if route_type == "safest" else "#0ea5e9",
            },
            "geometry": {
                "type": "LineString",
                "coordinates": coordinates,
            },
        }
