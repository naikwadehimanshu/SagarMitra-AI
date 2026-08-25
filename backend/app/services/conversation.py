"""Conversation Manager — in-memory multi-turn conversation storage."""
import uuid
from datetime import datetime
from typing import Any, Optional


class ConversationManager:
    """In-memory conversation state manager with multi-turn context tracking.

    Stores conversation history, user context (location, language, last PFZ, etc.),
    and supports follow-up queries that reference previous results.
    """

    _instance: Optional["ConversationManager"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.conversations = {}
        return cls._instance

    def create(self) -> str:
        """Create a new conversation and return its ID."""
        conv_id = str(uuid.uuid4())
        self.conversations[conv_id] = {
            "id": conv_id,
            "created_at": datetime.utcnow().isoformat(),
            "messages": [],
            "context": {
                "location": None,
                "location_name": None,
                "language": "english",
                "last_pfz_zones": None,
                "last_risk_assessment": None,
                "last_intent": None,
            },
        }
        return conv_id

    def add_message(self, conv_id: str, role: str, content: str,
                    metadata: dict | None = None):
        """Add a message to the conversation."""
        if conv_id not in self.conversations:
            self.create_with_id(conv_id)

        self.conversations[conv_id]["messages"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {},
        })

    def create_with_id(self, conv_id: str):
        """Create a conversation with a specific ID."""
        if conv_id not in self.conversations:
            self.conversations[conv_id] = {
                "id": conv_id,
                "created_at": datetime.utcnow().isoformat(),
                "messages": [],
                "context": {
                    "location": None,
                    "location_name": None,
                    "language": "english",
                    "last_pfz_zones": None,
                    "last_risk_assessment": None,
                    "last_intent": None,
                },
            }

    def get_history(self, conv_id: str) -> list[dict]:
        """Get all messages in a conversation."""
        if conv_id in self.conversations:
            return self.conversations[conv_id]["messages"]
        return []

    def get_context(self, conv_id: str) -> dict:
        """Get the current context for a conversation."""
        if conv_id in self.conversations:
            return self.conversations[conv_id]["context"]
        return {}

    def update_context(self, conv_id: str, updates: dict):
        """Update conversation context with new information."""
        if conv_id not in self.conversations:
            self.create_with_id(conv_id)
        self.conversations[conv_id]["context"].update(updates)

    def get_conversation(self, conv_id: str) -> dict | None:
        """Get full conversation data."""
        return self.conversations.get(conv_id)

    def list_conversations(self) -> list[dict]:
        """List all conversations (summary)."""
        summaries = []
        for conv_id, conv in self.conversations.items():
            msgs = conv["messages"]
            summaries.append({
                "id": conv_id,
                "created_at": conv["created_at"],
                "message_count": len(msgs),
                "first_message": msgs[0]["content"][:100] if msgs else "",
                "last_message_at": msgs[-1]["timestamp"] if msgs else conv["created_at"],
            })
        return summaries


# Singleton accessor
def get_conversation_manager() -> ConversationManager:
    return ConversationManager()
