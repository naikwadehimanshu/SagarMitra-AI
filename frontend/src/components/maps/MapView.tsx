'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapLayer } from '@/types';
import { useLocation } from '@/hooks/useLocation';

interface MapViewProps {
  layers?: MapLayer[];
  markers?: Array<{lat: number; lon: number; color?: string; label?: string; popup?: string}>;
  onMapClick?: (lat: number, lon: number) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function MapView({ layers = [], markers = [], onMapClick, center, zoom, className }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { location } = useLocation();

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const initialCenter = center || [location.longitude, location.latitude] || [78.9629, 20.5937]; // Default India

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: initialCenter as [number, number],
      zoom: zoom || 5,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.current.addControl(new maplibregl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');
    
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }),
      'bottom-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [center, zoom, location.latitude, location.longitude, onMapClick]);

  // Handle layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Simple layer cleanup logic for this prototype
    layers.forEach(layer => {
      if (!map.current) return;
      const sourceId = `source-${layer.id}`;
      const layerId = `layer-${layer.id}`;

      if (layer.visible) {
        if (!map.current.getSource(sourceId)) {
          map.current.addSource(sourceId, {
            type: 'geojson',
            data: layer.data
          });

          if (layer.type === 'polygon') {
            map.current.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': layer.style?.color || '#00d4ff',
                'fill-opacity': layer.style?.opacity || 0.4
              }
            });
            map.current.addLayer({
              id: `${layerId}-outline`,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': layer.style?.color || '#00d4ff',
                'line-width': 2
              }
            });
          }
          // Add other layer types (line, circle, etc) as needed
        }
      } else {
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
        if (map.current.getLayer(`${layerId}-outline`)) map.current.removeLayer(`${layerId}-outline`);
        if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);
      }
    });

  }, [layers, mapLoaded]);

  return <div ref={mapContainer} className={`w-full h-full ${className || ''}`} />;
}
