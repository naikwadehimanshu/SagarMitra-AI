"""Mathematical utilities for geospatial calculations."""
import math
from typing import List, Tuple


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth (in km)."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate initial bearing from point 1 to point 2 (in degrees)."""
    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    dlon = math.radians(lon2 - lon1)
    x = math.sin(dlon) * math.cos(lat2_r)
    y = (math.cos(lat1_r) * math.sin(lat2_r) -
         math.sin(lat1_r) * math.cos(lat2_r) * math.cos(dlon))
    return (math.degrees(math.atan2(x, y)) + 360) % 360


def bearing_to_cardinal(degrees: float) -> str:
    """Convert bearing degrees to cardinal direction."""
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
            "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    idx = round(degrees / (360.0 / len(dirs))) % len(dirs)
    return dirs[idx]


def interpolate_point(lat1: float, lon1: float, lat2: float, lon2: float,
                      fraction: float) -> Tuple[float, float]:
    """Linearly interpolate between two coordinates."""
    return (
        round(lat1 + (lat2 - lat1) * fraction, 6),
        round(lon1 + (lon2 - lon1) * fraction, 6),
    )


def generate_waypoints(start: Tuple[float, float], end: Tuple[float, float],
                       num_points: int = 5) -> List[Tuple[float, float]]:
    """Generate evenly spaced waypoints between start and end."""
    if num_points <= 1:
        return [start, end]
    waypoints = [start]
    for i in range(1, num_points):
        frac = i / num_points
        waypoints.append(interpolate_point(start[0], start[1], end[0], end[1], frac))
    waypoints.append(end)
    return waypoints


def offset_point(lat: float, lon: float, bearing_deg: float,
                 distance_km: float) -> Tuple[float, float]:
    """Offset a point by a given bearing and distance."""
    R = 6371.0
    d = distance_km / R
    brng = math.radians(bearing_deg)
    lat1 = math.radians(lat)
    lon1 = math.radians(lon)
    lat2 = math.asin(math.sin(lat1) * math.cos(d) +
                     math.cos(lat1) * math.sin(d) * math.cos(brng))
    lon2 = lon1 + math.atan2(math.sin(brng) * math.sin(d) * math.cos(lat1),
                              math.cos(d) - math.sin(lat1) * math.sin(lat2))
    return (round(math.degrees(lat2), 6), round(math.degrees(lon2), 6))
