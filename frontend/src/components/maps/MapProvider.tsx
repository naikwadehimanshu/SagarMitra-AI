'use client';
import React, { createContext, useContext, useState, useRef, ReactNode, useCallback, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { api } from '@/services/api';
import { useLocation } from '@/hooks/useLocation';
import type { MapLayer } from '@/types';

export type LayerType = 'ship' | 'fishing_zone' | 'temperature' | 'weather' | 'hazard' | 'port' | 'wind';

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
  layers: MapLayer[];
  setLayers: React.Dispatch<React.SetStateAction<MapLayer[]>>;
  activeLayers: Set<LayerType>;
  toggleLayer: (layer: LayerType) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [activeLayers, setActiveLayers] = useState<Set<LayerType>>(new Set<LayerType>(['ship', 'fishing_zone', 'weather', 'wind']));
  const { location } = useLocation();

  // Fetch layers from API when location changes
  useEffect(() => {
    const fetchLayers = async () => {
      try {
        if (location.latitude && location.longitude) {
          const response = await api.getMapLayers(location.latitude, location.longitude);
          // If we get null from the API (indicating an error in the API call), use demo data
          if (response !== null) {
            // @ts-ignore - Handle backend returning { layers: [...] }
            if (response.layers && Array.isArray(response.layers)) {
              // @ts-ignore
              setLayers(response.layers);
            } else if (Array.isArray(response)) {
              setLayers(response as MapLayer[]);
            } else {
              setLayers(getDemoLayers());
            }
          } else {
            setLayers(getDemoLayers());
          }
        }
      } catch (error) {
        console.error('Failed to fetch map layers:', error);
        // Fallback to demo data if API fails
        setLayers(getDemoLayers());
      }
    };

    fetchLayers();
  }, [location.latitude, location.longitude]);

  // Demo data fallback - returns hardcoded layers similar to original implementation
  const getDemoLayers = (): MapLayer[] => {
    // Get a default location for demo data (Mumbai coordinates)
    const demoLat = 19.076;
    const demoLng = 72.877;

    return [
      // User location layer
      {
        id: 'user-location',
        name: 'Your Location',
        type: 'marker',
        visible: true,
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [demoLng, demoLat] },
            properties: { name: 'Your Location' }
          }]
        },
        source_name: 'Demo Data'
      },
      // PFZ layer (marker type, will be rendered as circles by renderMarkerLayer based on radius_km)
      {
        id: 'demo-pfz-1',
        name: 'Primary PFZ Alpha',
        type: 'marker',
        visible: true,
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [demoLng - 0.5, demoLat + 0.5] },
            properties: {
              name: 'Primary PFZ Alpha',
              suitability: 92,
              sst: 28.5,
              chlorophyll: 1.8,
              // Add radius for circle rendering in marker layer
              radius_km: 8
            }
          }]
        },
        source_name: 'Demo Data'
      },
      // SST layer (heatmap type)
      {
        id: 'demo-sst',
        name: 'Sea Surface Temperature',
        type: 'heatmap',
        visible: true,
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [demoLng, demoLat] },
            properties: {
              sst: 28.5,
              intensity: 0.8 // Normalized intensity
            }
          }]
        },
        source_name: 'Demo Data'
      },
      // Chlorophyll layer (heatmap type)
      {
        id: 'demo-chlorophyll',
        name: 'Chlorophyll Concentration',
        type: 'heatmap',
        visible: true,
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [demoLng + 0.3, demoLat - 0.2] },
            properties: {
              chlorophyll: 1.8,
              intensity: 0.6 // Normalized intensity (chlorophyll / 3.0, capped at 1.0)
            }
          }]
        },
        source_name: 'Demo Data'
      },
      // Weather layer (marker type)
      {
        id: 'demo-weather',
        name: 'Weather Conditions',
        type: 'marker',
        visible: true,
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [demoLng - 0.3, demoLat - 0.5] },
            properties: {
              wind: '45 knots',
              severity: 'high',
              temperature: 29,
              humidity: 80
            }
          }]
        },
        source_name: 'Demo Data'
      }
    ];
  };

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
      features, setFeatures,
      addFeature, removeFeature,
      layers, setLayers,
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