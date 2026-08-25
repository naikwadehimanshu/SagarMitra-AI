import json
import random
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from geopy.distance import geodesic
from pathlib import Path

from ..schemas.marine import PFZZone, OceanData
from ..schemas.weather import WeatherData
from ..schemas.alert import Alert

class DemoDataProvider:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DemoDataProvider, cls).__new__(cls)
            cls._instance._initialize_data()
        return cls._instance

    def _initialize_data(self):
        self.locations = {
            "Mumbai": {"lat": 19.076, "lon": 72.877, "state": "Maharashtra"},
            "Ratnagiri": {"lat": 16.994, "lon": 73.300, "state": "Maharashtra"},
            "Sindhudurg": {"lat": 16.349, "lon": 73.536, "state": "Maharashtra"},
            "Porbandar": {"lat": 21.642, "lon": 69.609, "state": "Gujarat"},
            "Veraval": {"lat": 20.907, "lon": 70.367, "state": "Gujarat"},
            "Dwarka": {"lat": 22.238, "lon": 68.968, "state": "Gujarat"},
            "Kochi": {"lat": 9.931, "lon": 76.267, "state": "Kerala"},
            "Thiruvananthapuram": {"lat": 8.524, "lon": 76.936, "state": "Kerala"},
            "Kozhikode": {"lat": 11.259, "lon": 75.780, "state": "Kerala"},
            "Chennai": {"lat": 13.083, "lon": 80.270, "state": "Tamil Nadu"},
            "Rameswaram": {"lat": 9.288, "lon": 79.313, "state": "Tamil Nadu"},
            "Tuticorin": {"lat": 8.764, "lon": 78.135, "state": "Tamil Nadu"},
            "Visakhapatnam": {"lat": 17.687, "lon": 83.218, "state": "Andhra Pradesh"},
            "Machilipatnam": {"lat": 16.187, "lon": 81.138, "state": "Andhra Pradesh"},
            "Paradip": {"lat": 20.316, "lon": 86.611, "state": "Odisha"},
            "Puri": {"lat": 19.798, "lon": 85.825, "state": "Odisha"},
            "Digha": {"lat": 21.628, "lon": 87.551, "state": "West Bengal"},
            "Haldia": {"lat": 22.025, "lon": 88.063, "state": "West Bengal"},
            "Panaji": {"lat": 15.491, "lon": 73.827, "state": "Goa"},
            "Vasco": {"lat": 15.398, "lon": 73.812, "state": "Goa"}
        }

        self.pfz_zones = self._generate_pfz_data()
        self.alerts = self._generate_alerts()

    def _generate_pfz_data(self) -> List[PFZZone]:
        zones = []
        for loc_name, loc_data in self.locations.items():
            num_zones = random.randint(3, 6)
            for _ in range(num_zones):
                # Offset by 10-40km roughly (0.1 to 0.4 degrees)
                lat_offset = random.uniform(0.1, 0.4) * random.choice([1, -1])
                lon_offset = random.uniform(0.1, 0.4) * random.choice([1, -1])
                
                zones.append(PFZZone(
                    id=str(uuid.uuid4()),
                    name=f"PFZ near {loc_name}",
                    latitude=loc_data["lat"] + lat_offset,
                    longitude=loc_data["lon"] + lon_offset,
                    timestamp=datetime.now(timezone.utc),
                    confidence=random.uniform(0.7, 0.95),
                    source="INCOIS_DEMO",
                    suitability_score=random.randint(55, 95),
                    sst=random.uniform(26.0, 30.0),
                    chlorophyll=random.uniform(0.2, 3.5),
                    sea_state=random.choice(["calm", "slight", "moderate"]),
                    fish_species=random.sample(["Tuna", "Mackerel", "Sardine", "Pomfret"], random.randint(1, 3))
                ))
        return zones
        
    def _generate_alerts(self) -> List[Alert]:
        return [
            Alert(
                id=str(uuid.uuid4()),
                type="wave",
                severity="warning",
                title="High Wave Warning",
                description="High waves expected off Gujarat coast. Fishermen are advised not to venture into the sea.",
                latitude=21.0,
                longitude=69.0,
                radius_km=100.0,
                timestamp=datetime.now(timezone.utc),
                source="INCOIS_DEMO",
                icon="🌊"
            ),
            Alert(
                id=str(uuid.uuid4()),
                type="lightning",
                severity="critical",
                title="Lightning Alert",
                description="Severe lightning storms detected near Odisha coast.",
                latitude=20.0,
                longitude=86.0,
                radius_km=50.0,
                timestamp=datetime.now(timezone.utc),
                source="NDMA_DEMO",
                icon="⚡"
            ),
            Alert(
                id=str(uuid.uuid4()),
                type="weather",
                severity="warning",
                title="Strong Wind Advisory",
                description="Strong winds (45-55 kmph) likely off Tamil Nadu coast.",
                latitude=11.0,
                longitude=80.0,
                radius_km=150.0,
                timestamp=datetime.now(timezone.utc),
                source="IMD_DEMO",
                icon="💨"
            ),
            Alert(
                id=str(uuid.uuid4()),
                type="advisory",
                severity="info",
                title="Fishing Advisory",
                description="Favorable fishing conditions off Kerala coast.",
                latitude=10.0,
                longitude=75.5,
                radius_km=80.0,
                timestamp=datetime.now(timezone.utc),
                source="INCOIS_DEMO",
                icon="🐟"
            ),
            Alert(
                id=str(uuid.uuid4()),
                type="sea_state",
                severity="info",
                title="Moderate Sea Conditions",
                description="Moderate sea conditions expected off Maharashtra coast.",
                latitude=18.0,
                longitude=72.0,
                radius_km=120.0,
                timestamp=datetime.now(timezone.utc),
                source="INCOIS_DEMO",
                icon="🌊"
            )
        ]

    def get_weather_data(self, lat: float, lon: float) -> WeatherData:
        return WeatherData(
            latitude=lat,
            longitude=lon,
            timestamp=datetime.now(timezone.utc),
            temperature=random.uniform(25.0, 34.0),
            humidity=random.uniform(60.0, 90.0),
            wind_speed=random.uniform(5.0, 30.0),
            wind_direction=random.uniform(0, 360),
            precipitation=random.uniform(0.0, 15.0),
            cloud_cover=random.uniform(10.0, 90.0),
            visibility=random.uniform(5.0, 20.0),
            lightning_risk=random.choice(['none', 'low', 'moderate', 'high']),
            pressure=random.uniform(1000.0, 1015.0),
            source="DEMO",
            data_mode="demo"
        )

    def get_ocean_data(self, lat: float, lon: float) -> OceanData:
        return OceanData(
            latitude=lat,
            longitude=lon,
            timestamp=datetime.now(timezone.utc),
            sst=random.uniform(26.0, 30.0),
            chlorophyll=random.uniform(0.2, 3.5),
            wave_height=random.uniform(0.5, 3.5),
            wave_period=random.uniform(4.0, 12.0),
            wave_direction=random.uniform(0, 360),
            current_speed=random.uniform(0.1, 1.5),
            current_direction=random.uniform(0, 360),
            sea_state=random.choice(["calm", "slight", "moderate", "rough"]),
            source="DEMO",
            data_mode="demo"
        )
    
    def get_nearest_pfz_zones(self, lat: float, lon: float, radius_km: float = 50.0) -> List[PFZZone]:
        user_loc = (lat, lon)
        nearby_zones = []
        for zone in self.pfz_zones:
            zone_loc = (zone.latitude, zone.longitude)
            dist = geodesic(user_loc, zone_loc).km
            if dist <= radius_km:
                zone_copy = zone.model_copy()
                zone_copy.distance_km = dist
                nearby_zones.append(zone_copy)
        return sorted(nearby_zones, key=lambda x: x.distance_km)

    def get_pfz_zones(self, lat: float, lon: float, radius_km: float = 50.0) -> List[PFZZone]:
        """Alias for get_nearest_pfz_zones — used by agents."""
        return self.get_nearest_pfz_zones(lat, lon, radius_km)

    def get_marine_observations(self, lat: float, lon: float) -> list:
        """Get marine observations for a location (simplified demo)."""
        from ..schemas.marine import MarineObservation
        ocean = self.get_ocean_data(lat, lon)
        return [
            MarineObservation(
                latitude=lat, longitude=lon,
                timestamp=datetime.now(timezone.utc),
                parameter="SST", value=ocean.sst, unit="°C",
                source="DEMO", confidence=0.8, metadata={}
            ),
            MarineObservation(
                latitude=lat, longitude=lon,
                timestamp=datetime.now(timezone.utc),
                parameter="Chlorophyll", value=ocean.chlorophyll, unit="mg/m³",
                source="DEMO", confidence=0.75, metadata={}
            ),
        ]

    def get_alerts(self) -> List[Alert]:
        """Get pre-configured demo alerts."""
        return self.alerts


demo_provider = DemoDataProvider()
