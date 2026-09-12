'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Mic } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useLocation } from '@/hooks/useLocation';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { QuickActions } from './QuickActions';
import { LoadingDots } from '@/components/ui/LoadingDots';
import { useMap } from '@/components/maps/MapProvider';

export function ChatInterface() {
  const { messages, isLoading, sendMessage } = useChat();
  const { location } = useLocation();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addFeature, activeLayers, toggleLayer, flyTo } = useMap();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // AI ↔ Map Integration
  useEffect(() => {
    if (messages.length === 0) return;
    const latestMessage = messages[messages.length - 1];
    
    // Only process assistant messages
    if (latestMessage.role !== 'assistant') return;

    let flyLat: number | null = null;
    let flyLng: number | null = null;

    // Process PFZ Zones
    if (latestMessage.pfz_data) {
      if (!activeLayers.has('fishing_zone')) toggleLayer('fishing_zone');
      latestMessage.pfz_data.forEach(pfz => {
        flyLat = pfz.latitude;
        flyLng = pfz.longitude;
        addFeature({
          id: pfz.id,
          type: 'fishing_zone',
          latitude: pfz.latitude,
          longitude: pfz.longitude,
          name: pfz.name || 'Potential Fishing Zone',
          metadata: {
            suitability: pfz.suitability_score,
            sst: pfz.sst,
            chlorophyll: pfz.chlorophyll,
            fish_species: pfz.fish_species?.join(', ') || 'Unknown'
          }
        });
      });
    }

    // Process general map layers (could be ships, temperature, etc.)
    if (latestMessage.map_layers) {
      latestMessage.map_layers.forEach(layer => {
        // Mock unpacking a layer into features based on the layer type
        // In a real app, layer.data contains GeoJSON or arrays of data
        if (layer.type === 'ship' || layer.type === 'vessel') {
          if (!activeLayers.has('ship')) toggleLayer('ship');
          // Assuming layer.data is an array of ship features
          if (Array.isArray(layer.data)) {
            layer.data.forEach((item: any, idx: number) => {
              if (!flyLat) { flyLat = item.latitude; flyLng = item.longitude; }
              addFeature({
                id: item.id || `ship-${idx}`,
                type: 'ship',
                latitude: item.latitude,
                longitude: item.longitude,
                name: item.name || 'Unknown Vessel',
                metadata: item.metadata || {}
              });
            });
          }
        }
        else if (layer.type === 'temperature' || layer.type === 'sst') {
          if (!activeLayers.has('temperature')) toggleLayer('temperature');
          // Assuming layer.data is geojson for temp zone
          if (layer.data && layer.data.type === 'FeatureCollection') {
            const firstFeature = layer.data.features[0];
            if (firstFeature && firstFeature.geometry && firstFeature.geometry.coordinates) {
              // rough center
              flyLng = firstFeature.geometry.coordinates[0][0][0];
              flyLat = firstFeature.geometry.coordinates[0][0][1];
            }
            addFeature({
              id: layer.id,
              type: 'temperature',
              latitude: flyLat || 0,
              longitude: flyLng || 0,
              name: layer.name || 'Temperature Zone',
              geometry: layer.data,
              color: layer.style?.color || '#ef4444' // red by default
            });
          }
        }
      });
    }

    // Process alerts/hazards
    if (latestMessage.alerts) {
      if (!activeLayers.has('hazard')) toggleLayer('hazard');
      latestMessage.alerts.forEach(alert => {
        flyLat = alert.latitude;
        flyLng = alert.longitude;
        addFeature({
          id: alert.id,
          type: 'hazard',
          latitude: alert.latitude,
          longitude: alert.longitude,
          name: alert.title,
          metadata: {
            severity: alert.severity,
            description: alert.description
          }
        });
      });
    }

    // Fly to the new features if we found coordinates
    if (flyLat !== null && flyLng !== null) {
      flyTo(flyLat, flyLng, 9);
    }
  }, [messages]); // deliberately omitting other dependencies to only run when messages update

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input, location);
    setInput('');
  };

  const handleQuickAction = (text: string) => {
    if (isLoading) return;
    sendMessage(text, location);
  };

  return (
    <div className="flex flex-col h-full bg-navy/80 backdrop-blur-xl border-l border-white/10 relative">
      <div className="p-4 border-b border-white/10 flex items-center justify-between glass sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
            🤖
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm">AI Marine Assistant</h2>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" /> Multi-Agent AI Active
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 relative z-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 text-slate-400">
            <div className="text-4xl mb-4">🌊</div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">How can I help you navigate today?</h3>
            <p className="text-sm max-w-sm mb-6">Ask me about weather conditions, find fishing zones, ships, or plan a safe route.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessageComponent key={idx} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-slate-400 p-4">
                🤖 <LoadingDots />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 bg-navy border-t border-white/10 relative z-10">
        <div className="mb-3">
          <QuickActions onSelect={handleQuickAction} />
        </div>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <button type="button" className="absolute left-3 text-slate-400 hover:text-cyan-400 transition-colors">
            <MapPin size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-24 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-500"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button type="button" className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5" title="Voice Input">
              <Mic size={18} />
            </button>
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-2 bg-cyan-500 text-navy rounded-full disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400 hover:bg-cyan-400 transition-colors"
            >
              <Send size={18} className={input.trim() && !isLoading ? "ml-0.5" : ""} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
