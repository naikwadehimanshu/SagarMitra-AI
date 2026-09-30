'use client';
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useLocation } from '@/hooks/useLocation';
import { useMap } from './MapProvider';
import type { MapLayer } from '@/types';

const isLayerActive = (layer: any, activeLayers: Set<string>) => {
  if (!layer || !layer.id) return false;
  const id = layer.id.toLowerCase();
  
  if (id.includes('user')) return true;
  if (id.includes('pfz')) return activeLayers.has('fishing_zone');
  if (id.includes('sst') || id.includes('temperature')) return activeLayers.has('temperature');
  if (id.includes('chlorophyll')) return activeLayers.has('fishing_zone');
  if (id.includes('weather')) return activeLayers.has('weather');
  if (id.includes('risk') || id.includes('hazard')) return activeLayers.has('hazard');
  if (id.includes('route')) return activeLayers.has('ship');
  if (id.includes('geofence')) return activeLayers.has('hazard');
  
  return true;
};

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { location } = useLocation();
  const { mapInstance, setMapInstance, layers, activeLayers } = useMap();
  
  // Track active markers
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});

  useEffect(() => {
    if (mapInstance || !mapContainer.current) return;

    const initialCenter = (location.longitude && location.latitude) 
      ? [location.longitude, location.latitude] 
      : [78.9629, 20.5937]; // Default India

    const satelliteStyle = {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Tiles &copy; Esri'
        }
      },
      layers: [{
        id: 'satellite',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 19
      }]
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: (satelliteStyle as maplibregl.StyleSpecification),
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

      // Add windy.com style wind particles
      // Try to use maplibre-wind plugin, fallback to canvas-based if needed
      fetch('/wind.json')
        .then(res => res.json())
        .then(windData => {
          try {
            // Initialize wind layer using maplibre-wind
            // Based on documentation, we need to create a proper data source
            const windSource = new (window as any).maplibreWind.ImageSource('wind-data', {
              url: '/wind.json',
              coordinates: [
                [0, 90.0],      // top left [lon, lat]
                [359.0, 90.0],  // top right
                [359.0, -90.0], // bottom right
                [0.0, -90.0]    // bottom left
              ],
              dataRange: [-50, 50], // TODO: adjust based on actual data
              decodeType: 3, // imageWithExif
              wrapX: true
            });

            const windLayerInstance = new (window as any).maplibreWind.Layer(
              'wind-particles',
              windSource,
              {
                renderType: 2, // particles
                renderFrom: 'rg', // assuming u/v vector data
                displayRange: [0, 100],
                widthSegments: 1,
                heightSegments: 1,
                styleSpec: {
                  'fill-color': [
                    'interpolate',
                    ['linear', ['zoom']],
                    0, 'rgba(0,0,255,0)',
                    1, 'rgba(0,0,255,0.6)'
                  ],
                  numParticles: [
                    'interpolate',
                    ['linear', ['zoom']],
                    0, 100,   // min zoom
                    10, 500   // max zoom
                  ],
                  particleFadeOpacity: 0.6,
                  particleDropRate: 0.005,
                  particleVelocityScale: 0.01
                }
              }
            );

            map.addLayer(windLayerInstance);
          } catch (e) {
            console.warn("maplibre-wind plugin failed, trying fallback:", e);
            // Fallback to simple indication that wind data is available
            initializeWindFallback(map, windData);
          }
        })
        .catch(err => {
          console.error('Failed to load wind data:', err);
          initializeWindFallback(map, null);
        });
    });

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [location.latitude, location.longitude, setMapInstance]);

  // Handle layers rendering
  useEffect(() => {
    if (!mapInstance || !mapLoaded) return;

    // Process each layer
    layers.forEach(layer => {
      if (!isLayerActive(layer, activeLayers as unknown as Set<string>)) return;

      switch (layer.type) {
        case 'marker':
          renderMarkerLayer(layer);
          break;
        case 'heatmap':
          renderHeatmapLayer(layer);
          break;
        case 'line':
          renderLineLayer(layer);
          break;
        case 'polygon':
          renderPolygonLayer(layer);
          break;
        // Add other layer types as needed
      }
    });
  }, [layers, activeLayers, mapInstance, mapLoaded]);

  // Initial bounds fitting
  const hasFitBounds = useRef(false);
  useEffect(() => {
    if (!mapInstance || !mapLoaded || hasFitBounds.current) return;

    const bounds = new maplibregl.LngLatBounds();
    let hasValidPoints = false;

    // Collect points from all visible layers
    layers.forEach(layer => {
      if (!isLayerActive(layer, activeLayers as unknown as Set<string>)) return;

      // Extract points from layer data based on layer type
      if (layer.data && layer.data.features) {
        layer.data.features.forEach((feature: any) => {
          if (!feature.geometry || !feature.geometry.coordinates) return;

          let coords: [number, number][] = [];

          // Extract coordinates based on geometry type
          if (feature.geometry.type === 'Point') {
            coords = [feature.geometry.coordinates as [number, number]];
          } else if (feature.geometry.type === 'LineString') {
            coords = feature.geometry.coordinates as [number, number][];
          } else if (feature.geometry.type === 'Polygon') {
            // For polygons, use the exterior ring coordinates
            coords = (feature.geometry.coordinates as [number, number][][])[0];
          }

          // Add all coordinates to bounds
          coords.forEach(coord => {
            bounds.extend(coord);
            hasValidPoints = true;
          });
        });
      }
    });

    if (hasValidPoints) {
      mapInstance.fitBounds(bounds, { padding: 80, maxZoom: 10 });
      hasFitBounds.current = true;
    }
  }, [mapInstance, mapLoaded, layers, activeLayers]);

  // Layer rendering functions

  const renderMarkerLayer = (layer: MapLayer): void => {
    if (!mapInstance || !layer.data || !layer.data.features) return;

    layer.data.features.forEach((feature: any) => {
      if (!feature.geometry || feature.geometry.type !== 'Point') return;

      const [longitude, latitude] = feature.geometry.coordinates;

      // Check if this should be rendered as a circle (e.g., PFZ with radius)
      const radiusKm = feature.properties?.radius_km;
      const isCircle = radiusKm !== undefined && radiusKm > 0;

      if (isCircle) {
        // Render as circle/polygon instead of marker
        renderCircleFeature(layer, feature);
        return;
      }

      const markerId = `${layer.id}-${feature.properties?.id || Math.random()}`;

      // Skip if marker already exists
      if (markersRef.current[markerId]) return;

      // Determine icon and color based on layer type and feature properties
      let icon = '📍';
      let bgColor = 'bg-blue-500';

      if (layer.id?.includes('ship') || layer.name?.toLowerCase().includes('ship')) {
        icon = feature.properties?.vesselType === 'fishing' ? '🎣' : '🚢';
        bgColor = feature.properties?.status === 'danger' ? 'bg-red-500' : 'bg-slate-700';
      } else if (layer.id?.includes('port') || layer.name?.toLowerCase().includes('port')) {
        icon = '⚓';
        bgColor = 'bg-green-600';
      } else if (layer.id?.includes('pfz') || layer.name?.toLowerCase().includes('pfz') ||
                 layer.id?.includes('fishing_zone') || layer.name?.toLowerCase().includes('fishing zone')) {
        icon = '🐟';
        // Color will be handled in the popup, marker uses default cyan
        bgColor = 'bg-cyan-500';
      } else if (layer.id?.includes('weather') || layer.name?.toLowerCase().includes('weather')) {
        icon = '🌪';
        bgColor = 'bg-blue-400';
      } else if (layer.id?.includes('temperature') || layer.name?.toLowerCase().includes('temperature')) {
        icon = '🌡';
        bgColor = feature.properties?.color || 'bg-red-400';
      } else if (layer.id?.includes('hazard') || layer.name?.toLowerCase().includes('hazard')) {
        icon = '⚠️';
        bgColor = 'bg-amber-500';
      }

      // Create custom element
      const el = document.createElement('div');
      el.className = 'w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform';
      el.className += ` ${bgColor}`;
      el.innerHTML = `<span class="text-xs">${icon}</span>`;

      // Create popup content
      const popupContent = `
        <div class="text-sm p-1 max-w-xs">
          <h4 class="font-bold text-cyan-400 mb-1 border-b border-white/20 pb-1">${feature.properties?.name || 'Unnamed'}</h4>
          <div class="text-white space-y-1 mt-2">
            ${feature.properties ? Object.entries(feature.properties).map(([k, v]) => `
              <div class="flex justify-between gap-4"><span class="text-slate-400 capitalize">${k.replace(/_/g, ' ')}:</span> <span>${v}</span></div>
            `).join('') : '<p class="text-slate-400">No additional details</p>'}
          </div>
        </div>
      `;
      const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(popupContent);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(mapInstance);

      markersRef.current[markerId] = marker;
    });
  };

  const renderHeatmapLayer = (layer: MapLayer): void => {
    if (!mapInstance || !layer.data || !layer.data.features) return;

    // For heatmap visualization, we'll create circle layers with intensity-based sizing/coloring
    layer.data.features.forEach((feature: any, index: number) => {
      if (!feature.geometry || feature.geometry.type !== 'Point') return;

      const [longitude, latitude] = feature.geometry.coordinates;
      const sourceId = `${layer.id}-source-${index}`;
      const layerId = `${layer.id}-layer-${index}`;
      const intensity = feature.properties?.intensity || 0.5; // Default intensity

      // Skip if source already exists
      if (mapInstance.getSource(sourceId)) return;

      // Add GeoJSON source
      mapInstance.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [longitude, latitude] },
          properties: feature.properties
        }
      });

      // Add circle layer for heatmap effect
      mapInstance.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'], ['get', 'intensity'],
            0, '#3b82f6',    // Blue - low intensity
            0.5, '#22c55e',  // Green - medium intensity
            1, '#ef4444'     // Red - high intensity
          ],
          'circle-radius': [
            'interpolate',
            ['linear'], ['zoom'],
            0, 10,   // Minimum radius at zoom 0
            10, 80,  // Medium radius at zoom 10
            22, 300  // Maximum radius at high zoom
          ],
          'circle-opacity': 0.6
        }
      });
    });
  };

  const renderLineLayer = (layer: MapLayer): void => {
    if (!mapInstance || !layer.data || !layer.data.features) return;

    layer.data.features.forEach((feature: any, index: number) => {
      if (!feature.geometry) return;

      const sourceId = `${layer.id}-source-${index}`;
      const layerId = `${layer.id}-layer-${index}`;

      // Skip if source already exists
      if (mapInstance.getSource(sourceId)) return;

      // Add GeoJSON source
      mapInstance.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: feature.geometry,
          properties: feature.properties
        }
      });

      // Add line layer
      mapInstance.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': feature.properties?.color || '#00d4ff',
          'line-width': feature.properties?.width || 2,
          'line-opacity': feature.properties?.opacity || 0.8
        }
      });
    });
  };

  const renderPolygonLayer = (layer: MapLayer): void => {
    if (!mapInstance || !layer.data || !layer.data.features) return;

    layer.data.features.forEach((feature: any, index: number) => {
      if (!feature.geometry) return;

      const sourceId = `${layer.id}-source-${index}`;
      const layerId = `${layer.id}-layer-${index}`;

      // Skip if source already exists
      if (mapInstance.getSource(sourceId)) return;

      // Add GeoJSON source
      mapInstance.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: feature.geometry,
          properties: feature.properties
        }
      });

      // Add fill layer
      mapInstance.addLayer({
        id: `${layerId}-fill`,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': feature.properties?.color || '#00d4ff',
          'fill-opacity': feature.properties?.opacity || 0.35
        }
      });

      // Add outline layer
      mapInstance.addLayer({
        id: `${layerId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': feature.properties?.color || '#00d4ff',
          'line-width': feature.properties?.width || 2
        }
      });
    });
  };

  const renderCircleFeature = (layer: MapLayer, feature: any): void => {
    if (!mapInstance || !feature.geometry || feature.geometry.type !== 'Point') return;

    const [longitude, latitude] = feature.geometry.coordinates;
    const radiusKm = feature.properties?.radius_km || 8; // Default 8km radius
    const featureId = feature.properties?.id || Math.random();
    const sourceId = `${layer.id}-circle-source-${featureId}`;
    const layerId = `${layer.id}-circle-layer-${featureId}`;

    // Skip if source already exists
    if (mapInstance.getSource(sourceId)) return;

    // Calculate circular polygon coordinates
    const coords = { latitude, longitude };
    const ret = [];
    const distanceX = radiusKm / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
    const distanceY = radiusKm / 110.574;
    for (let i = 0; i < 32; i++) {
      const theta = (i / 32) * (2 * Math.PI);
      ret.push([coords.longitude + distanceX * Math.cos(theta), coords.latitude + distanceY * Math.sin(theta)]);
    }
    ret.push(ret[0]); // Close the polygon

    // Determine color based on chlorophyll level
    const chlorophyll = feature.properties?.chlorophyll || 0;
    let featureColor = '#3b82f6'; // Default blue - very low chlorophyll

    if (chlorophyll >= 2.0) featureColor = '#ef4444'; // Red - high chlorophyll
    else if (chlorophyll >= 1.0) featureColor = '#eab308'; // Yellow - medium chlorophyll
    else if (chlorophyll >= 0.5) featureColor = '#22c55e'; // Green - low-medium chlorophyll

    // Add GeoJSON source for the circle
    mapInstance.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [ret] },
        properties: feature.properties
      }
    });

    // Add fill layer
    mapInstance.addLayer({
      id: `${layerId}-fill`,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': featureColor,
        'fill-opacity': 0.35
      }
    });

    // Add outline layer
    mapInstance.addLayer({
      id: `${layerId}-outline`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': featureColor,
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    });
  };

  // Helper function to process wind data for the wind plugin
  const processWindData = (rawData: any): any => {
    try {
      // Based on the wind.json structure, it appears to be gridded data
      // We need to convert it to the format expected by maplibre-wind
      // For now, we'll return a structure that the plugin can work with
      // This is a simplified implementation - in production, you'd want to properly
      // parse the GRIB2/JPEG2000 data or use preprocessed wind vectors

      // Since we're having issues with the plugin and JSON sources in ESM builds,
      // let's return a minimal structure and handle the error gracefully
      return rawData;
    } catch (error) {
      console.error('Error processing wind data:', error);
      return null;
    }
  };

  // Fallback method for wind visualization if plugin fails
  const initializeWindFallback = (map: maplibregl.Map, windData: any = null): void => {
    console.log('Initializing wind visualization fallback');
    if (windData) {
      console.log('Wind data loaded successfully, particles visualization would go here');
      // In a full implementation, we would add a custom canvas layer here
      // that uses the windData to animate particles
    } else {
      console.log('No wind data available');
    }
    // For now, we'll just log that we're skipping wind particles
    console.log('Wind particles visualization skipped due to technical limitations');
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-navy relative z-0">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
