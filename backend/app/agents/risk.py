"""Risk Assessment Agent — marine safety risk scoring engine."""
import logging
from datetime import datetime
from typing import Optional

from app.schemas.weather import WeatherData
from app.schemas.marine import OceanData
from app.schemas.alert import Alert
from app.schemas.geofence import GeofenceAlert
from app.schemas.risk import RiskFactor, RiskAssessment

logger = logging.getLogger(__name__)


class RiskAgent:
    """Marine safety risk assessment engine.

    Evaluates multiple factors and produces a composite risk score
    with transparent, explainable breakdown.
    """

    def assess_risk(
        self,
        weather: Optional[WeatherData],
        ocean: Optional[OceanData],
        alerts: Optional[list[Alert]] = None,
        geofence_alerts: Optional[list[GeofenceAlert]] = None,
    ) -> RiskAssessment:
        """Calculate comprehensive marine safety risk assessment."""
        factors: list[RiskFactor] = []
        warnings: list[str] = []
        sources: list[str] = []

        # --- Weather Risk (0-25) ---
        weather_score = 0
        weather_desc = "No weather data available"
        if weather:
            sources.append(weather.source)
            ws = weather.wind_speed
            if ws < 15:
                weather_score = int(ws * 0.3)
            elif ws < 25:
                weather_score = 6 + int((ws - 15) * 0.6)
            elif ws < 40:
                weather_score = 13 + int((ws - 25) * 0.4)
            else:
                weather_score = 20 + min(5, int((ws - 40) * 0.2))
                warnings.append(f"⚠️ Very high wind speed: {ws} km/h")

            # Precipitation penalty
            if weather.precipitation > 20:
                weather_score = min(25, weather_score + 4)
            elif weather.precipitation > 10:
                weather_score = min(25, weather_score + 2)

            # Visibility penalty
            if weather.visibility < 3:
                weather_score = min(25, weather_score + 3)
                warnings.append(f"🌫️ Low visibility: {weather.visibility} km")

            weather_score = min(25, weather_score)
            level = self._score_to_level(weather_score, 25)
            weather_desc = f"Wind {ws} km/h, Rain {weather.precipitation}mm, Visibility {weather.visibility}km"

        factors.append(RiskFactor(
            name="Weather Risk", score=weather_score, max_score=25,
            level=self._score_to_level(weather_score, 25),
            description=weather_desc, icon="🌬️"
        ))

        # --- Wave Risk (0-25) ---
        wave_score = 0
        wave_desc = "No wave data available"
        if ocean:
            sources.append(ocean.source)
            wh = ocean.wave_height
            if wh < 1.0:
                wave_score = int(wh * 5)
            elif wh < 2.0:
                wave_score = 6 + int((wh - 1.0) * 6)
            elif wh < 3.0:
                wave_score = 13 + int((wh - 2.0) * 5)
            else:
                wave_score = 19 + min(6, int((wh - 3.0) * 3))
                warnings.append(f"🌊 High waves: {wh}m")

            wave_score = min(25, wave_score)
            wave_desc = f"Wave height {wh}m, Sea state: {ocean.sea_state}"

        factors.append(RiskFactor(
            name="Wave Risk", score=wave_score, max_score=25,
            level=self._score_to_level(wave_score, 25),
            description=wave_desc, icon="🌊"
        ))

        # --- Wind Risk (0-20) ---
        wind_score = 0
        wind_desc = "No wind data available"
        if weather:
            ws = weather.wind_speed
            if ws < 15:
                wind_score = int(ws * 0.3)
            elif ws < 25:
                wind_score = 5 + int((ws - 15) * 0.5)
            elif ws < 40:
                wind_score = 10 + int((ws - 25) * 0.4)
            else:
                wind_score = 16 + min(4, int((ws - 40) * 0.2))

            wind_score = min(20, wind_score)
            wind_desc = f"Sustained wind: {ws} km/h from {weather.wind_direction}°"

        factors.append(RiskFactor(
            name="Wind Risk", score=wind_score, max_score=20,
            level=self._score_to_level(wind_score, 20),
            description=wind_desc, icon="💨"
        ))

        # --- Lightning Risk (0-10) ---
        lightning_score = 0
        lightning_desc = "No significant lightning activity detected"
        if weather:
            lr = weather.lightning_risk.lower() if weather.lightning_risk else "none"
            if lr == "high":
                lightning_score = 10
                lightning_desc = "High lightning risk — stay off water"
                warnings.append("⚡ High lightning risk")
            elif lr == "moderate":
                lightning_score = 6
                lightning_desc = "Moderate lightning risk"
            elif lr == "low":
                lightning_score = 3
                lightning_desc = "Low lightning activity"

        factors.append(RiskFactor(
            name="Lightning Risk", score=lightning_score, max_score=10,
            level=self._score_to_level(lightning_score, 10),
            description=lightning_desc, icon="⚡"
        ))

        # --- Cyclone Risk (0-10) ---
        cyclone_score = 0
        cyclone_desc = "No active cyclone warning detected"
        if alerts:
            cyclone_alerts = [a for a in alerts if a.type == "cyclone"]
            if cyclone_alerts:
                cyclone_score = 10
                cyclone_desc = f"Active cyclone warning: {cyclone_alerts[0].title}"
                warnings.append(f"🌀 {cyclone_alerts[0].title}")

        factors.append(RiskFactor(
            name="Cyclone Risk", score=cyclone_score, max_score=10,
            level=self._score_to_level(cyclone_score, 10),
            description=cyclone_desc, icon="🌀"
        ))

        # --- Geofence Risk (0-10) ---
        geofence_score = 0
        geofence_desc = "Clear — no restricted zones nearby"
        if geofence_alerts:
            closest = min(geofence_alerts, key=lambda g: g.distance_km)
            if closest.distance_km < 5:
                geofence_score = 10
                geofence_desc = f"Inside or very near {closest.geofence.name}"
                warnings.append(f"🚫 Restricted zone: {closest.geofence.name}")
            elif closest.distance_km < 15:
                geofence_score = 6
                geofence_desc = f"Near {closest.geofence.name} ({closest.distance_km:.1f} km)"
            elif closest.distance_km < 30:
                geofence_score = 3
                geofence_desc = f"{closest.geofence.name} is {closest.distance_km:.1f} km away"

        factors.append(RiskFactor(
            name="Geofence Risk", score=geofence_score, max_score=10,
            level=self._score_to_level(geofence_score, 10),
            description=geofence_desc, icon="🚫"
        ))

        # --- Overall calculation ---
        overall = sum(f.score for f in factors)
        overall = min(100, max(0, overall))

        if overall <= 25:
            risk_level = "LOW"
        elif overall <= 50:
            risk_level = "MODERATE"
        elif overall <= 75:
            risk_level = "HIGH"
        else:
            risk_level = "EXTREME"

        # Generate recommendation
        recommendation = self._generate_recommendation(risk_level, factors, warnings)
        explanation = self._generate_explanation(factors)

        # Determine data mode
        data_modes = set()
        if weather:
            data_modes.add(weather.data_mode)
        if ocean:
            data_modes.add(ocean.data_mode)
        data_mode = "demo" if "demo" in data_modes else "live"

        return RiskAssessment(
            overall_score=overall,
            risk_level=risk_level,
            factors=factors,
            recommendation=recommendation,
            explanation=explanation,
            warnings=warnings,
            timestamp=datetime.utcnow().isoformat(),
            sources=list(set(sources)) or ["Demo Data"],
            confidence=0.75 if data_mode == "demo" else 0.9,
            data_mode=data_mode,
        )

    @staticmethod
    def _score_to_level(score: int, max_score: int) -> str:
        """Convert a score to a risk level string."""
        ratio = score / max_score if max_score > 0 else 0
        if ratio <= 0.25:
            return "LOW"
        elif ratio <= 0.50:
            return "MODERATE"
        elif ratio <= 0.75:
            return "HIGH"
        else:
            return "EXTREME"

    @staticmethod
    def _generate_recommendation(level: str, factors: list[RiskFactor],
                                  warnings: list[str]) -> str:
        """Generate actionable recommendation text."""
        if level == "LOW":
            return ("Conditions are currently assessed as relatively safe for maritime activity. "
                    "Standard precautions apply. Always monitor the latest official marine advisory.")
        elif level == "MODERATE":
            return ("Conditions are manageable for experienced operators, but some caution is advised. "
                    "Monitor conditions closely and check the latest official marine advisory before departure.")
        elif level == "HIGH":
            return ("Conditions are challenging. Only experienced operators with suitable vessels should consider "
                    "going out. Strongly recommend checking official advisories and having safety equipment ready.")
        else:
            return ("⚠️ EXTREME RISK — Conditions are dangerous. Maritime activity is strongly discouraged. "
                    "Stay in port and monitor official emergency communications.")

    @staticmethod
    def _generate_explanation(factors: list[RiskFactor]) -> str:
        """Explain which factors contribute most to the risk."""
        sorted_factors = sorted(factors, key=lambda f: f.score / f.max_score, reverse=True)
        top = sorted_factors[:2]
        if top[0].score == 0:
            return "All risk factors are currently at minimal levels."

        names = " and ".join(f.name.lower() for f in top if f.score > 0)
        return f"The primary contributors to the current risk score are {names}."
