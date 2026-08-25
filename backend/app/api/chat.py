"""Chat API routes."""
import logging
from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.agents.orchestrator import process_query
from app.services.conversation import get_conversation_manager

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Process a natural language query through the multi-agent pipeline."""
    try:
        response = await process_query(request)
        return response
    except Exception as e:
        logger.error("Chat processing failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@router.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Retrieve conversation history."""
    mgr = get_conversation_manager()
    conv = mgr.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.get("/conversations")
async def list_conversations():
    """List all conversations."""
    mgr = get_conversation_manager()
    return {"conversations": mgr.list_conversations()}
