import { useState, useCallback } from 'react';
import { ChatMessage, Location } from '@/types';
import { api } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>(uuidv4());
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string, location?: Location, language?: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await api.chat(text, conversationId, location, language);
      
      if (aiResponse) {
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again.');
      // Add a fallback error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I am having trouble connecting to my systems right now. Please try again later.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(uuidv4());
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    error,
    sendMessage,
    clearChat
  };
}
