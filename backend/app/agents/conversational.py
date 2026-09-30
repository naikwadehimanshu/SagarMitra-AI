import logging
import json
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. Conversational agent may fail.")
    
model = genai.GenerativeModel("gemini-3.5-flash-lite")

class ConversationalAgent:
    def format_response(self, intent: str, language: str, results: dict, location_name: str) -> str:
        try:
            context_data = {}
            for k, v in results.items():
                if hasattr(v, "model_dump"):
                    context_data[k] = v.model_dump(mode="json")
                elif isinstance(v, list) and len(v) > 0 and hasattr(v[0], "model_dump"):
                    context_data[k] = [item.model_dump(mode="json") for item in v]
                else:
                    context_data[k] = str(v)

            prompt = (
                f"You are ORCA, a Marine AI assistant. The user asked a question with intent '{intent}' "
                f"in language '{language}'. Location is '{location_name}'.\n\n"
                f"Here is the retrieved data from specialized agents: \n{json.dumps(context_data, indent=2, default=str)}\n\n"
                f"Based on this data, write a highly professional, helpful, and concise response to the user. "
                f"Use bullet points for readability. Include relevant emojis. Be specific about numbers, distances, "
                f"and safety scores. Do NOT mention that you are a language model or 'Based on the data provided'. "
                f"Just answer the user directly as the ORCA assistant."
            )

            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error("Failed to generate response with Gemini: %s", e)
            return f"Analysis complete for {location_name}. We encountered an issue generating the natural language response, but the data layers on your map have been updated."
