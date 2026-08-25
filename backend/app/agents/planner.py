"""Planner / Supervisor Agent — the brain of the multi-agent system.

Responsibilities:
- Language detection via Unicode script analysis
- Intent classification via rule-based NLP
- Entity extraction (locations, dates, coordinates)
- Task decomposition and agent selection
"""
import re
import logging
from datetime import datetime, timedelta
from typing import Any

from app.tools.geocoding import location_to_coords, COASTAL_CITIES, REGIONAL_NAMES

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

SCRIPT_RANGES = {
    "hindi":     (0x0900, 0x097F),
    "bengali":   (0x0980, 0x09FF),
    "tamil":     (0x0B80, 0x0BFF),
    "telugu":    (0x0C00, 0x0C7F),
    "kannada":   (0x0C80, 0x0CFF),
    "malayalam": (0x0D00, 0x0D7F),
    "gujarati":  (0x0A80, 0x0AFF),
    "odia":      (0x0B00, 0x0B7F),
}


def detect_language(text: str) -> str:
    """Detect language from Unicode script ranges."""
    script_counts: dict[str, int] = {}
    for char in text:
        code = ord(char)
        for lang, (lo, hi) in SCRIPT_RANGES.items():
            if lo <= code <= hi:
                script_counts[lang] = script_counts.get(lang, 0) + 1

    if script_counts:
        detected = max(script_counts, key=script_counts.get)
        # Distinguish Hindi vs Marathi using common Marathi keywords
        if detected == "hindi":
            marathi_words = ["माशा", "मासे", "समुद्र", "किनारा", "सुरक्षित", "मासेमारी", "नौका"]
            if any(w in text for w in marathi_words):
                return "marathi"
        return detected
    return "english"


# ---------------------------------------------------------------------------
# Intent classification
# ---------------------------------------------------------------------------

INTENT_KEYWORDS: dict[str, list[str]] = {
    "fishing_zone": [
        "fishing", "fish", "catch", "pfz", "zone", "मछली", "मत्स्य", "मासे",
        "मीन", "मাছ", "மீன்", "చేప", "ಮೀನು", "മത്സ്യ", "માછલી", "ମାଛ",
        "where to fish", "best spot", "potential fishing",
    ],
    "safety_check": [
        "safe", "safety", "danger", "dangerous", "risk", "should i go",
        "सुरक्षित", "खतरा", "নিরাপদ", "பாதுகாப்பு", "safe to go",
        "is it okay", "can i go", "advisable",
    ],
    "route_planning": [
        "route", "path", "navigate", "navigation", "direction", "way to",
        "रास्ता", "मार्ग", "পথ", "வழி", "safest route", "fastest route",
    ],
    "cyclone_alert": [
        "cyclone", "storm", "hurricane", "typhoon", "तूफान", "ঘূর্ণিঝড়",
        "புயல்", "తుఫాను", "ಚಂಡಮಾರುತ",
    ],
    "geofence_check": [
        "geofence", "restricted", "boundary", "border", "prohibited",
        "no-go", "protected area", "प्रतिबंधित", "সীমানা",
    ],
    "weather_query": [
        "weather", "rain", "wind", "temperature", "forecast", "humidity",
        "cloud", "visibility", "मौसम", "बारिश", "আবহাওয়া", "வானிலை",
    ],
    "ocean_conditions": [
        "ocean", "wave", "sst", "chlorophyll", "sea surface", "current",
        "tide", "sea state", "समुद्र", "लहर", "সমুদ্র", "கடல்",
    ],
    "productivity_analysis": [
        "productivity", "why decrease", "trend", "analysis", "explain",
        "reason", "कारण", "उत्पादकता",
    ],
}

# Time keywords
TIME_KEYWORDS = {
    "today": 0, "tonight": 0, "now": 0,
    "tomorrow": 1, "tomorrow morning": 1, "tomorrow evening": 1,
    "day after": 2, "next week": 7,
    "आज": 0, "कल": 1, "अभी": 0, "सुबह": 0,
    "আজ": 0, "কাল": 1, "இன்று": 0, "நாளை": 1,
}


def classify_intent(text: str) -> str:
    """Rule-based intent classification with scoring."""
    text_lower = text.lower()
    scores: dict[str, int] = {}

    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[intent] = score

    if not scores:
        return "general_marine"

    # If multiple strong intents, mark as multi-intent
    top_intents = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    if len(top_intents) > 1 and top_intents[1][1] >= 2:
        return top_intents[0][0]  # Still return primary intent

    return top_intents[0][0]


def extract_entities(text: str) -> dict[str, Any]:
    """Extract locations, coordinates, dates, and other entities."""
    entities: dict[str, Any] = {}
    text_lower = text.lower()

    # --- Coordinate extraction ---
    coord_pattern = r'(-?\d{1,3}(?:\.\d+)?)\s*[,°]\s*(-?\d{1,3}(?:\.\d+)?)'
    match = re.search(coord_pattern, text)
    if match:
        lat, lon = float(match.group(1)), float(match.group(2))
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            entities["coordinates"] = {"latitude": lat, "longitude": lon}

    # --- Named location extraction ---
    for city_name in COASTAL_CITIES:
        if city_name in text_lower:
            coords = COASTAL_CITIES[city_name]
            entities["location_name"] = city_name.title()
            entities["coordinates"] = {"latitude": coords[0], "longitude": coords[1]}
            break

    # Check regional names too
    if "location_name" not in entities:
        for regional, english in REGIONAL_NAMES.items():
            if regional in text:
                coords = COASTAL_CITIES.get(english)
                if coords:
                    entities["location_name"] = english.title()
                    entities["coordinates"] = {"latitude": coords[0], "longitude": coords[1]}
                    break

    # --- Time extraction ---
    for time_word, days_offset in TIME_KEYWORDS.items():
        if time_word in text_lower:
            target = datetime.now() + timedelta(days=days_offset)
            entities["target_datetime"] = target.isoformat()
            entities["time_reference"] = time_word
            break

    # --- Distance extraction ---
    dist_match = re.search(r'(\d+(?:\.\d+)?)\s*(km|nautical miles?|nm|kilometers?)', text_lower)
    if dist_match:
        entities["distance"] = {
            "value": float(dist_match.group(1)),
            "unit": dist_match.group(2),
        }

    return entities


# ---------------------------------------------------------------------------
# Agent selection
# ---------------------------------------------------------------------------

INTENT_TO_AGENTS: dict[str, list[str]] = {
    "fishing_zone":         ["marine", "ocean_analytics", "weather", "geospatial", "risk", "visualization"],
    "safety_check":         ["weather", "marine", "risk", "geospatial", "alerts", "visualization"],
    "weather_query":        ["weather", "visualization"],
    "ocean_conditions":     ["marine", "ocean_analytics", "visualization"],
    "route_planning":       ["weather", "marine", "geospatial", "risk", "route", "visualization"],
    "cyclone_alert":        ["weather", "alerts", "risk", "visualization"],
    "geofence_check":       ["geospatial", "visualization"],
    "general_marine":       ["marine", "weather", "ocean_analytics", "visualization"],
    "productivity_analysis": ["ocean_analytics", "marine", "visualization"],
}


class PlannerAgent:
    """Planner/Supervisor Agent — orchestrates the multi-agent pipeline.

    Analyzes user intent, extracts entities, and produces an execution plan
    describing which agents to invoke and with what parameters.
    """

    def plan(self, message: str, user_location: dict | None = None) -> dict[str, Any]:
        """Produce an execution plan for the given user message."""
        language = detect_language(message)
        intent = classify_intent(message)
        entities = extract_entities(message)

        # If user provided location explicitly but we didn't find one in text
        if "coordinates" not in entities and user_location:
            entities["coordinates"] = user_location

        agents_needed = INTENT_TO_AGENTS.get(intent, ["marine", "weather"])

        plan = {
            "language": language,
            "intent": intent,
            "entities": entities,
            "agents": agents_needed,
            "steps": self._build_steps(intent, agents_needed),
        }

        logger.info("Plan: intent=%s, lang=%s, agents=%s", intent, language, agents_needed)
        return plan

    @staticmethod
    def _build_steps(intent: str, agents: list[str]) -> list[dict[str, str]]:
        """Build human-readable execution steps for the agent activity panel."""
        steps = [
            {"agent": "planner", "description": "Understanding query and extracting intent"},
            {"agent": "planner", "description": "Identifying location and time context"},
        ]
        agent_descriptions = {
            "weather":         "Fetching weather data and forecast",
            "marine":          "Retrieving marine and ocean observations",
            "ocean_analytics": "Analyzing ocean conditions and productivity",
            "geospatial":      "Performing spatial analysis and distance calculations",
            "risk":            "Calculating safety risk assessment",
            "route":           "Computing optimized maritime route",
            "alerts":          "Checking active alerts and warnings",
            "visualization":   "Generating map layers and visualizations",
        }
        for agent in agents:
            desc = agent_descriptions.get(agent, f"Running {agent} agent")
            steps.append({"agent": agent, "description": desc})

        steps.append({"agent": "conversational", "description": "Generating response"})
        return steps
