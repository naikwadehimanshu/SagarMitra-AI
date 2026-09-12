'use client';
import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';
import maplibregl from 'maplibre-gl';

export type LayerType = 'ship' | 'fishing_zone' | 'temperature' | 'weather' | 'hazard' | 'port';

export interface GeoFeature {
  id: string;
  type: LayerType;
  latitude: number;
  longitude: number;
  name: string;
  metadata?: any;
  color?: string;
  geometry?: any; // For polygons/heatmaps
}

interface MapContextProps {
  mapInstance: maplibregl.Map | null;
  setMapInstance: (map: maplibregl.Map | null) => void;
  features: GeoFeature[];
  setFeatures: React.Dispatch<React.SetStateAction<GeoFeature[]>>;
  addFeature: (feature: GeoFeature) => void;
  removeFeature: (id: string) => void;
  activeLayers: Set<LayerType>;
  toggleLayer: (layer: LayerType) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [features, setFeatures] = useState<GeoFeature[]>([
    {
      id: 'demo-ship-1',
      type: 'ship',
      latitude: 18.52,
      longitude: 72.85,
      name: 'MV Ocean Star',
      metadata: { vesselType: 'cargo', speed: '12 knots', status: 'active' }
    },
    {
      id: 'demo-ship-2',
      type: 'ship',
      latitude: 19.10,
      longitude: 72.50,
      name: 'Aqua Voyager',
      metadata: { vesselType: 'fishing', speed: '5 knots', status: 'fishing' }
    },
    {
      id: 'demo-pfz-1',
      type: 'fishing_zone',
      latitude: 18.80,
      longitude: 72.10,
      name: 'Primary PFZ Alpha',
      metadata: { suitability: 92, sst: 28.5, chlorophyll: 1.8 }
    },
    {
      id: 'demo-weather-1',
      type: 'weather',
      latitude: 17.50,
      longitude: 71.80,
      name: 'Approaching Squall',
      metadata: { wind: '45 knots', severity: 'high' }
    }
  ]);
  const [activeLayers, setActiveLayers] = useState<Set<LayerType>>(new Set<LayerType>(['ship', 'fishing_zone', 'weather']));

  const addFeature = useCallback((feature: GeoFeature) => {
    setFeatures(prev => {
      const filtered = prev.filter(f => f.id !== feature.id);
      return [...filtered, feature];
    });
  }, []);

  const removeFeature = useCallback((id: string) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
  }, []);

  const toggleLayer = useCallback((layer: LayerType) => {
    setActiveLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layer)) newSet.delete(layer);
      else newSet.add(layer);
      return newSet;
    });
  }, []);

  const flyTo = useCallback((lat: number, lng: number, zoom = 8) => {
    if (mapInstance) {
      mapInstance.flyTo({ center: [lng, lat], zoom });
    }
  }, [mapInstance]);

  return (
    <MapContext.Provider value={{
      mapInstance, setMapInstance,
      features, setFeatures, addFeature, removeFeature,
      activeLayers, toggleLayer, flyTo
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error('useMap must be used within a MapProvider');
  return context;
}
