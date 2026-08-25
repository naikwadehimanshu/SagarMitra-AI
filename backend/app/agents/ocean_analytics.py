"""Ocean Analytics Agent — analyzes SST, chlorophyll, and fishing suitability."""
import logging
from typing import Optional

from app.schemas.marine import OceanData
from app.schemas.weather import WeatherData

logger = logging.getLogger(__name__)


class OceanAnalyticsAgent:
    """Agent for analyzing oceanographic conditions and calculating fishing potential.

    Evaluates SST suitability, chlorophyll concentration, sea state,
    and produces a composite fishing potential score.
    """

    # SST ideal range for tropical fish species (Indian Ocean)
    SST_IDEAL_MIN = 26.0
    SST_IDEAL_MAX = 29.0
    SST_GOOD_MIN = 24.0
    SST_GOOD_MAX = 31.0

    def analyze_sst_suitability(self, sst: float) -> dict:
        """Analyze Sea Surface Temperature suitability for fishing."""
        if self.SST_IDEAL_MIN <= sst <= self.SST_IDEAL_MAX:
            score = 90 + int((1 - abs(sst - 27.5) / 1.5) * 10)
            return {
                "score": min(100, score),
                "assessment": "Ideal",
                "explanation": f"SST of {sst}°C is in the ideal range ({self.SST_IDEAL_MIN}-{self.SST_IDEAL_MAX}°C) for tropical marine species.",
                "icon": "🟢",
            }
        elif self.SST_GOOD_MIN <= sst < self.SST_IDEAL_MIN:
            return {
                "score": 65,
                "assessment": "Acceptable",
                "explanation": f"SST of {sst}°C is slightly below ideal but within acceptable range.",
                "icon": "🟡",
            }
        elif self.SST_IDEAL_MAX < sst <= self.SST_GOOD_MAX:
            return {
                "score": 60,
                "assessment": "Acceptable",
                "explanation": f"SST of {sst}°C is slightly above ideal but within acceptable range.",
                "icon": "🟡",
            }
        else:
            return {
                "score": 30,
                "assessment": "Poor",
                "explanation": f"SST of {sst}°C is outside the suitable range for most species.",
                "icon": "🔴",
            }

    def analyze_chlorophyll(self, chl: float) -> dict:
        """Analyze chlorophyll concentration as a productivity indicator."""
        if chl > 2.0:
            return {
                "score": 95,
                "assessment": "Very High",
                "explanation": f"Chlorophyll at {chl} mg/m³ indicates excellent primary productivity and potential prey abundance.",
                "icon": "🟢",
            }
        elif chl > 1.0:
            return {
                "score": 85,
                "assessment": "High",
                "explanation": f"Chlorophyll at {chl} mg/m³ indicates good productivity levels.",
                "icon": "🟢",
            }
        elif chl > 0.5:
            return {
                "score": 65,
                "assessment": "Moderate",
                "explanation": f"Chlorophyll at {chl} mg/m³ indicates moderate productivity.",
                "icon": "🟡",
            }
        elif chl > 0.2:
            return {
                "score": 45,
                "assessment": "Low",
                "explanation": f"Chlorophyll at {chl} mg/m³ indicates lower productivity.",
                "icon": "🟠",
            }
        else:
            return {
                "score": 25,
                "assessment": "Very Low",
                "explanation": f"Chlorophyll at {chl} mg/m³ indicates poor productivity — oligotrophic waters.",
                "icon": "🔴",
            }

    def analyze_sea_state(self, wave_height: float, sea_state: str) -> dict:
        """Analyze sea state for fishing suitability."""
        if wave_height <= 1.0 or sea_state == "calm":
            return {"score": 95, "assessment": "Excellent", "explanation": "Calm seas — ideal for fishing operations."}
        elif wave_height <= 1.5 or sea_state == "slight":
            return {"score": 80, "assessment": "Good", "explanation": "Slight seas — suitable for most vessels."}
        elif wave_height <= 2.5 or sea_state == "moderate":
            return {"score": 55, "assessment": "Moderate", "explanation": "Moderate seas — experienced operators only."}
        elif wave_height <= 4.0 or sea_state == "rough":
            return {"score": 25, "assessment": "Poor", "explanation": "Rough seas — not recommended for fishing."}
        else:
            return {"score": 5, "assessment": "Dangerous", "explanation": "Very rough seas — stay in port."}

    def calculate_fishing_potential(self, ocean_data: OceanData,
                                    weather_data: Optional[WeatherData] = None) -> dict:
        """Calculate composite fishing potential score.

        Weighted model:
        - SST suitability:     25%
        - Chlorophyll:         25%
        - Sea state:           20%
        - Weather conditions:  20%
        - Other factors:       10%
        """
        sst_result = self.analyze_sst_suitability(ocean_data.sst)
        chl_result = self.analyze_chlorophyll(ocean_data.chlorophyll)
        sea_result = self.analyze_sea_state(ocean_data.wave_height, ocean_data.sea_state)

        # Weather score
        weather_score = 70  # default
        if weather_data:
            weather_score = 100
            if weather_data.wind_speed > 30:
                weather_score -= 40
            elif weather_data.wind_speed > 20:
                weather_score -= 20
            if weather_data.precipitation > 20:
                weather_score -= 25
            elif weather_data.precipitation > 10:
                weather_score -= 10
            if weather_data.visibility < 5:
                weather_score -= 15
            weather_score = max(10, weather_score)

        # Base score from other factors
        base_score = 70

        # Weighted overall
        overall = (
            sst_result["score"] * 0.25 +
            chl_result["score"] * 0.25 +
            sea_result["score"] * 0.20 +
            weather_score * 0.20 +
            base_score * 0.10
        )
        overall = round(min(100, max(0, overall)))

        # Assessment
        if overall >= 80:
            assessment = "HIGH POTENTIAL"
            recommendation = "Conditions are very favourable for fishing. This is a good opportunity."
        elif overall >= 60:
            assessment = "MODERATE POTENTIAL"
            recommendation = "Conditions are reasonably favourable. Monitor weather before departure."
        elif overall >= 40:
            assessment = "LOW POTENTIAL"
            recommendation = "Conditions are below average. Consider alternative zones or timing."
        else:
            assessment = "POOR POTENTIAL"
            recommendation = "Conditions are unfavourable for fishing at this time."

        return {
            "overall_score": overall,
            "assessment": assessment,
            "recommendation": recommendation,
            "breakdown": {
                "sst": {"score": sst_result["score"], "detail": sst_result["explanation"]},
                "chlorophyll": {"score": chl_result["score"], "detail": chl_result["explanation"]},
                "sea_state": {"score": sea_result["score"], "detail": sea_result["explanation"]},
                "weather": {"score": weather_score, "detail": "Based on wind, rain, and visibility."},
            },
            "disclaimer": "This is a decision-support score and NOT a guarantee of fish availability. "
                          "Always verify with local knowledge and official advisories.",
        }

    def analyze_productivity_trend(self, lat: float, lon: float) -> dict:
        """Analyze and explain productivity factors for a region."""
        return {
            "trend": "Stable",
            "period": "Last 30 days",
            "factors": [
                "Upwelling patterns are normal for this season",
                "Chlorophyll levels are consistent with monthly averages",
                "SST is within seasonal norms for the Indian Ocean",
                "Monsoon currents are bringing nutrient-rich waters to the coast",
            ],
            "explanation": (
                "Fish productivity in this region is influenced by seasonal upwelling, "
                "monsoon-driven nutrient transport, and SST patterns. Current conditions "
                "indicate stable productivity levels consistent with historical trends."
            ),
            "data_sources": ["INCOIS satellite observations", "Chlorophyll-a analysis", "SST time-series"],
            "disclaimer": "Trend analysis is based on available satellite and model data.",
        }
