"""Geocoding tools — hardcoded dictionary of Indian coastal cities."""
from typing import Optional, Tuple

# Comprehensive Indian coastal cities with coordinates
COASTAL_CITIES: dict[str, Tuple[float, float]] = {
    # Maharashtra
    "mumbai": (19.076, 72.877),
    "ratnagiri": (16.994, 73.300),
    "sindhudurg": (16.349, 73.536),
    "alibag": (18.648, 72.872),
    "malvan": (16.060, 73.463),
    # Gujarat
    "porbandar": (21.642, 69.609),
    "veraval": (20.907, 70.367),
    "dwarka": (22.238, 68.968),
    "mundra": (22.839, 69.722),
    "okha": (22.468, 69.069),
    "bhavnagar": (21.764, 72.153),
    # Goa
    "panaji": (15.491, 73.827),
    "vasco": (15.398, 73.812),
    "goa": (15.491, 73.827),
    "mormugao": (15.410, 73.800),
    # Kerala
    "kochi": (9.931, 76.267),
    "thiruvananthapuram": (8.524, 76.936),
    "trivandrum": (8.524, 76.936),
    "kozhikode": (11.259, 75.780),
    "calicut": (11.259, 75.780),
    "kollam": (8.893, 76.614),
    "alappuzha": (9.494, 76.338),
    # Tamil Nadu
    "chennai": (13.083, 80.270),
    "rameswaram": (9.288, 79.313),
    "tuticorin": (8.764, 78.135),
    "thoothukudi": (8.764, 78.135),
    "nagapattinam": (10.766, 79.843),
    "kanyakumari": (8.088, 77.538),
    "cuddalore": (11.748, 79.768),
    # Andhra Pradesh
    "visakhapatnam": (17.687, 83.218),
    "vizag": (17.687, 83.218),
    "machilipatnam": (16.187, 81.138),
    "kakinada": (16.960, 82.238),
    "nellore": (14.450, 79.987),
    # Odisha
    "paradip": (20.316, 86.611),
    "puri": (19.798, 85.825),
    "gopalpur": (19.259, 84.905),
    "chandbali": (20.774, 86.744),
    # West Bengal
    "digha": (21.628, 87.551),
    "haldia": (22.025, 88.063),
    "kolkata": (22.572, 88.363),
    "diamond harbour": (22.191, 88.186),
    "kakdwip": (21.874, 88.188),
    # Karnataka
    "mangalore": (12.914, 74.856),
    "karwar": (14.814, 74.129),
    "udupi": (13.340, 74.742),
    # Lakshadweep
    "kavaratti": (10.569, 72.642),
    # Andaman & Nicobar
    "port blair": (11.667, 92.736),
}

# Hindi/regional names mapping
REGIONAL_NAMES: dict[str, str] = {
    "मुंबई": "mumbai",
    "चेन्नई": "chennai",
    "कोची": "kochi",
    "कोलकाता": "kolkata",
    "विशाखापत्तनम": "visakhapatnam",
    "रत्नागिरी": "ratnagiri",
    "गोवा": "goa",
    "पुरी": "puri",
    "दीघा": "digha",
    "पोरबंदर": "porbandar",
    "द्वारका": "dwarka",
    "कन्याकुमारी": "kanyakumari",
    "रामेश्वरम": "rameswaram",
    "तिरुवनंतपुरम": "thiruvananthapuram",
    "मंगलौर": "mangalore",
    "पारादीप": "paradip",
    "হলদিয়া": "haldia",
    "দীঘা": "digha",
    "পুরী": "puri",
}


def location_to_coords(name: str) -> Optional[Tuple[float, float]]:
    """Convert a known city name to lat/lon coordinates."""
    key = name.lower().strip()
    # Check direct match
    if key in COASTAL_CITIES:
        return COASTAL_CITIES[key]
    # Check regional names
    if name.strip() in REGIONAL_NAMES:
        mapped = REGIONAL_NAMES[name.strip()]
        return COASTAL_CITIES.get(mapped)
    # Partial match
    for city_name, coords in COASTAL_CITIES.items():
        if key in city_name or city_name in key:
            return coords
    return None


def coords_to_location(lat: float, lon: float) -> str:
    """Find the nearest known city from coordinates."""
    min_dist = float("inf")
    closest = "Unknown Location"
    for city, (c_lat, c_lon) in COASTAL_CITIES.items():
        dist = (c_lat - lat) ** 2 + (c_lon - lon) ** 2
        if dist < min_dist:
            min_dist = dist
            closest = city.title()
    return closest


def get_all_locations() -> dict[str, Tuple[float, float]]:
    """Return all known coastal locations."""
    return COASTAL_CITIES.copy()
