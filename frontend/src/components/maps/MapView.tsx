'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLocation } from '@/hooks/useLocation';
import { useMap } from './MapProvider';

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { location } = useLocation();
  const { mapInstance, setMapInstance, features, activeLayers } = useMap();
  
  // Track active markers
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});

  useEffect(() => {
    if (mapInstance || !mapContainer.current) return;

    const initialCenter = (location.longitude && location.latitude) 
      ? [location.longitude, location.latitude] 
      : [78.9629, 20.5937]; // Default India

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: process.env.NEXT_PUBLIC_MAPLIBRE_STYLE || 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: initialCenter as [number, number],
      zoom: 5,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }),
      'bottom-right'
    );

    map.on('load', () => {
      setMapLoaded(true);
      setMapInstance(map);
    });

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [location.latitude, location.longitude, setMapInstance]);

  // Handle features rendering
  useEffect(() => {
    if (!mapInstance || !mapLoaded) return;

    // We'll separate point features (markers) and polygon/heatmap features
    const currentFeatures = features.filter(f => activeLayers.has(f.type));
    const currentIds = new Set(currentFeatures.map(f => f.id));

    // Remove old markers
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    currentFeatures.forEach(feature => {
      // Determine what to show for point data
      if (!feature.geometry && !markersRef.current[feature.id]) {
        // Create custom element
        const el = document.createElement('div');
        el.className = 'w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform';
        
        let icon = '📍';
        let bgColor = 'bg-blue-500';

        switch(feature.type) {
          case 'ship':
            icon = feature.metadata?.vesselType === 'fishing' ? '🎣' : '🚢';
            bgColor = feature.metadata?.status === 'danger' ? 'bg-red-500' : 'bg-slate-700';
            break;
          case 'port':
            icon = '⚓';
            bgColor = 'bg-green-600';
            break;
          case 'fishing_zone':
            icon = '🐟';
            bgColor = 'bg-cyan-500';
            break;
          case 'weather':
            icon = '🌪';
            bgColor = 'bg-blue-400';
            break;
          case 'temperature':
            icon = '🌡';
            bgColor = feature.color || 'bg-red-400';
            break;
          case 'hazard':
            icon = '⚠️';
            bgColor = 'bg-amber-500';
            break;
        }

        el.className += ` ${bgColor}`;
        el.innerHTML = `<span class="text-xs">${icon}</span>`;

        // Create popup
        const popupContent = `
          <div class="text-sm p-1 max-w-xs">
            <h4 class="font-bold text-cyan-400 mb-1 border-b border-white/20 pb-1">${feature.name}</h4>
            <div class="text-white space-y-1 mt-2">
              ${feature.metadata ? Object.entries(feature.metadata).map(([k, v]) => `
                <div class="flex justify-between gap-4"><span class="text-slate-400 capitalize">${k.replace(/_/g, ' ')}:</span> <span>${v}</span></div>
              `).join('') : '<p class="text-slate-400">No additional details</p>'}
            </div>
          </div>
        `;
        const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(popupContent);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([feature.longitude, feature.latitude])
          .setPopup(popup)
          .addTo(mapInstance);
          
        markersRef.current[feature.id] = marker;
      }

      // Handle polygon/geojson layers (simplified for this prototype)
      if (feature.geometry) {
        const sourceId = `source-${feature.id}`;
        const layerId = `layer-${feature.id}`;
        
        if (!mapInstance.getSource(sourceId)) {
          mapInstance.addSource(sourceId, {
            type: 'geojson',
            data: feature.geometry
          });

          mapInstance.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': feature.color || '#00d4ff',
              'fill-opacity': 0.3
            }
          });
          mapInstance.addLayer({
            id: `${layerId}-outline`,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': feature.color || '#00d4ff',
              'line-width': 2
            }
          });
        }
      }
    });

    // Cleanup invisible polygons
    const allFeaturesWithGeom = features.filter(f => f.geometry);
    allFeaturesWithGeom.forEach(f => {
      if (!activeLayers.has(f.type)) {
        const sourceId = `source-${f.id}`;
        const layerId = `layer-${f.id}`;
        if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
        if (mapInstance.getLayer(`${layerId}-outline`)) mapInstance.removeLayer(`${layerId}-outline`);
        if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId);
      }
    });

  }, [features, activeLayers, mapInstance, mapLoaded]);

  // Initial bounds fitting
  const hasFitBounds = useRef(false);
  useEffect(() => {
    if (!mapInstance || !mapLoaded || features.length === 0 || hasFitBounds.current) return;
    
    const bounds = new maplibregl.LngLatBounds();
    let hasValidPoints = false;
    
    features.forEach(f => {
      if (f.longitude && f.latitude) {
        bounds.extend([f.longitude, f.latitude]);
        hasValidPoints = true;
      }
    });
    
    if (hasValidPoints) {
      mapInstance.fitBounds(bounds, { padding: 80, maxZoom: 10 });
      hasFitBounds.current = true;
    }
  }, [mapInstance, mapLoaded, features]);

  return (
    <div className="absolute inset-0 w-full h-full bg-navy relative z-0">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
