import { useState, useCallback } from 'react';
import { MapLayer } from '@/types';

export function useMapLayers() {
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [activeLayerIds, setActiveLayerIds] = useState<Set<string>>(new Set());

  const addLayer = useCallback((layer: MapLayer) => {
    setLayers(prev => {
      // Don't add duplicate layers
      const exists = prev.some(l => l.id === layer.id);
      if (exists) {
        return prev.map(l => l.id === layer.id ? layer : l); // Update existing
      }
      return [...prev, layer];
    });
    
    if (layer.visible) {
      setActiveLayerIds(prev => {
        const newSet = new Set(prev);
        newSet.add(layer.id);
        return newSet;
      });
    }
  }, []);

  const toggleLayer = useCallback((id: string) => {
    setActiveLayerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

    // Also update the layer's visible property
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  const removeLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
    setActiveLayerIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const clearLayers = useCallback(() => {
    setLayers([]);
    setActiveLayerIds(new Set());
  }, []);

  return {
    layers,
    activeLayerIds,
    toggleLayer,
    addLayer,
    removeLayer,
    clearLayers
  };
}
