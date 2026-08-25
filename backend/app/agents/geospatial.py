"""Geospatial Reasoning Agent — spatial queries, distance, geofencing."""
import json
import logging
from pathlib import Path
from typing import Optional

from app.tools.calculations import haversine_distance, bearing, bearing_to_cardinal
from app.schemas.marine import PFZZone
from app.schemas.geofence import Geofence, GeofenceAlert
from app.schemas.common import Location

logger = logging.getLogger(__name__)

# Path to GeoJSON data
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data" / "geojson"


class GeospatialAgent:
    """Agent for geospatial reasoning — distances, bearings, geofences, zones."""

    def __init__(self):
        self._geofences: list[Geofence] | None = None

    def calculate_distance(self, lat1: float, lon1: float,
                           lat2: float, lon2: float) -> float:
        """Calculate distance between two points in km."""
        return haversine_distance(lat1, lon1, lat2, lon2)

    def calculate_bearing_info(self, lat1: float, lon1: float,
                                lat2: float, lon2: float) -> dict:
        """Calculate bearing and cardinal direction."""
        b = bearing(lat1, lon1, lat2, lon2)
        return {"degrees": round(b, 1), "direction": bearing_to_cardinal(b)}

    def find_nearest_pfz(self, lat: float, lon: float,
                         pfz_list: list[PFZZone]) -> Optional[PFZZone]:
        """Find the PFZ zone closest to the given coordinates."""
        if not pfz_list:
            return None
        for zone in pfz_list:
            zone.distance_km = haversine_distance(lat, lon, zone.latitude, zone.longitude)
            b = bearing(lat, lon, zone.latitude, zone.longitude)
            zone.direction = bearing_to_cardinal(b)
        return min(pfz_list, key=lambda z: z.distance_km)

    def rank_pfz_zones(self, lat: float, lon: float,
                       pfz_list: list[PFZZone]) -> list[PFZZone]:
        """Rank PFZ zones by a composite score of suitability and distance."""
        for zone in pfz_list:
            zone.distance_km = haversine_distance(lat, lon, zone.latitude, zone.longitude)
            b = bearing(lat, lon, zone.latitude, zone.longitude)
            zone.direction = bearing_to_cardinal(b)

        # Composite rank: suitability high + distance low is best
        def rank_key(z: PFZZone) -> float:
            dist_penalty = min(z.distance_km / 100.0, 1.0) * 30  # max 30-point penalty
            return z.suitability_score - dist_penalty

        pfz_list.sort(key=rank_key, reverse=True)
        return pfz_list

    def _load_geofences(self) -> list[Geofence]:
        """Load geofence data from GeoJSON files."""
        if self._geofences is not None:
            return self._geofences

        self._geofences = []
        geofence_file = DATA_DIR / "restricted_zones.geojson"

        if not geofence_file.exists():
            logger.warning("Geofence file not found: %s", geofence_file)
            return self._geofences

        try:
            with open(geofence_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            for feature in data.get("features", []):
                props = feature.get("properties", {})
                self._geofences.append(Geofence(
                    id=props.get("id", f"gf_{len(self._geofences)}"),
                    name=props.get("name", "Unknown Zone"),
                    type=props.get("type", "restricted"),
                    description=props.get("description", ""),
                    geometry=feature.get("geometry", {}),
                    restriction_level=props.get("restriction_level", "warning"),
                    reason=props.get("reason", ""),
                    source=props.get("source", "Demo Data"),
                ))
        except Exception as e:
            logger.error("Failed to load geofences: %s", e)

        return self._geofences

    def check_geofences(self, lat: float, lon: float,
                        radius_km: float = 50.0) -> list[GeofenceAlert]:
        """Check if location is near any restricted/protected zones."""
        geofences = self._load_geofences()
        alerts: list[GeofenceAlert] = []

        for gf in geofences:
            geom = gf.geometry
            # Simple centroid-based distance check for polygons
            centroid_lat, centroid_lon = self._geometry_centroid(geom)
            if centroid_lat is None:
                continue

            dist = haversine_distance(lat, lon, centroid_lat, centroid_lon)
            if dist <= radius_km:
                alerts.append(GeofenceAlert(
                    geofence=gf,
                    distance_km=round(dist, 1),
                    user_location=Location(latitude=lat, longitude=lon),
                    message=self._geofence_message(gf, dist),
                ))

        alerts.sort(key=lambda a: a.distance_km)
        return alerts

    def get_all_geofences(self) -> list[Geofence]:
        """Return all loaded geofences."""
        return self._load_geofences()

    @staticmethod
    def _geometry_centroid(geometry: dict) -> tuple:
        """Calculate approximate centroid of a GeoJSON geometry."""
        try:
            geom_type = geometry.get("type", "")
            coords = geometry.get("coordinates", [])

            if geom_type == "Point":
                return coords[1], coords[0]
            elif geom_type == "Polygon" and coords:
                ring = coords[0]
                avg_lon = sum(p[0] for p in ring) / len(ring)
                avg_lat = sum(p[1] for p in ring) / len(ring)
                return avg_lat, avg_lon
            elif geom_type == "MultiPolygon" and coords:
                all_points = [p for poly in coords for ring in poly for p in ring]
                if all_points:
                    avg_lon = sum(p[0] for p in all_points) / len(all_points)
                    avg_lat = sum(p[1] for p in all_points) / len(all_points)
                    return avg_lat, avg_lon
        except Exception:
            pass
        return None, None

    @staticmethod
    def _geofence_message(gf: Geofence, distance: float) -> str:
        """Generate human-readable geofence alert message."""
        if distance < 5:
            return f"🚨 You are very close to {gf.name} ({gf.type}). {gf.reason}"
        elif distance < 15:
            return f"⚠️ {gf.name} is {distance:.1f} km away. {gf.reason}"
        else:
            return f"ℹ️ {gf.name} ({gf.type}) is {distance:.1f} km from your location."

    def get_coastal_info(self, lat: float, lon: float) -> dict:
        """Get information about proximity to coast."""
        from app.tools.geocoding import coords_to_location
        nearest = coords_to_location(lat, lon)
        return {
            "nearest_coast": nearest,
            "estimated_distance_to_shore_km": 5.0,  # Simplified
            "maritime_zone": "EEZ (Exclusive Economic Zone)",
        }
