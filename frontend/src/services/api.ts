import { ChatMessage, PFZZone, WeatherData, OceanData, RiskAssessment, Alert, Geofence, RouteResponse, MapLayer, Location } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(id);
      console.error(`API request failed for ${url}:`, error);
      return null;
    }
  }

  async chat(message: string, conversationId?: string, location?: Location, language?: string): Promise<ChatMessage | null> {
    const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId, location, language })
    }, 5000); // Shorter timeout for faster fallback to demo

    if (response) return response;

    // --- DEMO / MOCK DATA FALLBACK ---
    console.warn('API down, using demo data');
    const msgLower = message.toLowerCase();
    let content = 'I am currently running in offline demo mode. I can show you demo ships, temperature zones, or fishing areas if you ask.';
    let pfz_data: PFZZone[] | undefined;
    let map_layers: MapLayer[] | undefined;
    
    const centerLat = location?.latitude || 19.076;
    const centerLng = location?.longitude || 72.877;

    if (msgLower.includes('fish') || msgLower.includes('pfz')) {
      content = 'Here are the nearest Potential Fishing Zones based on demo satellite data (SST & Chlorophyll). I have highlighted them on the map for you.';
      pfz_data = [
        {
          id: 'pfz-1', name: 'Alpha Fishing Zone',
          latitude: centerLat - 0.5, longitude: centerLng - 0.5,
          suitability_score: 85, sst: 28.5, chlorophyll: 1.2,
          timestamp: new Date().toISOString(), confidence: 0.9, source: 'Demo Data',
          fish_species: ['Tuna', 'Mackerel']
        }
      ];
    } else if (msgLower.includes('ship') || msgLower.includes('vessel')) {
      content = 'I have located several vessels near your selected area. Please check the map for their precise coordinates and status.';
      map_layers = [{
        id: 'mock-ships', name: 'Mock Ships', type: 'ship', visible: true, source_name: 'Demo AIS',
        data: [
          { id: 'ship-1', latitude: centerLat + 0.1, longitude: centerLng + 0.2, name: 'Sagar Samrat', metadata: { vesselType: 'commercial', speed: '12 knots', status: 'moving' } },
          { id: 'ship-2', latitude: centerLat - 0.2, longitude: centerLng + 0.1, name: 'Matsya-45', metadata: { vesselType: 'fishing', speed: '4 knots', status: 'fishing' } },
          { id: 'ship-3', latitude: centerLat + 0.05, longitude: centerLng - 0.3, name: 'Distressed Vessel X', metadata: { vesselType: 'commercial', speed: '0 knots', status: 'danger' } }
        ]
      }];
    } else if (msgLower.includes('temp') || msgLower.includes('sst') || msgLower.includes('weather')) {
      content = 'Displaying the Sea Surface Temperature heatmap for your region. The red zones indicate warmer currents which might attract specific marine life.';
      map_layers = [{
        id: 'mock-temp', name: 'SST Heatmap', type: 'temperature', visible: true, source_name: 'Demo Satellite',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [[[centerLng-1, centerLat-1], [centerLng+1, centerLat-1], [centerLng+1, centerLat+1], [centerLng-1, centerLat+1], [centerLng-1, centerLat-1]]] },
            properties: { temperature: '29°C' }
          }]
        }
      }];
    }

    return {
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      pfz_data,
      map_layers,
      metadata: { source: 'Demo Agent', timestamp: new Date().toISOString(), data_mode: 'demo', confidence: 100 }
    };
  }

  async getPFZZones(lat: number, lon: number, radius?: number): Promise<PFZZone[] | null> {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    if (radius) params.append('radius', radius.toString());
    return this.fetchWithTimeout(`${API_BASE_URL}/api/pfz?${params}`);
  }

  async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    return this.fetchWithTimeout(`${API_BASE_URL}/api/weather?lat=${lat}&lon=${lon}`);
  }

  async getOceanData(lat: number, lon: number): Promise<OceanData | null> {
    return this.fetchWithTimeout(`${API_BASE_URL}/api/ocean?lat=${lat}&lon=${lon}`);
  }

  async getRiskAssessment(lat: number, lon: number, datetime?: string): Promise<RiskAssessment | null> {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    if (datetime) params.append('datetime', datetime);
    return this.fetchWithTimeout(`${API_BASE_URL}/api/risk?${params}`);
  }

  async getAlerts(lat: number, lon: number, radius?: number): Promise<Alert[] | null> {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    if (radius) params.append('radius', radius.toString());
    return this.fetchWithTimeout(`${API_BASE_URL}/api/alerts?${params}`);
  }

  async getGeofences(lat: number, lon: number, radius?: number): Promise<Geofence[] | null> {
    const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
    if (radius) params.append('radius', radius.toString());
    return this.fetchWithTimeout(`${API_BASE_URL}/api/geofences?${params}`);
  }

  async getRoute(startLat: number, startLon: number, endLat: number, endLon: number): Promise<RouteResponse | null> {
    return this.fetchWithTimeout(`${API_BASE_URL}/api/route?startLat=${startLat}&startLon=${startLon}&endLat=${endLat}&endLon=${endLon}`);
  }

  async getMapLayers(lat: number, lon: number): Promise<MapLayer[] | null> {
    return this.fetchWithTimeout(`${API_BASE_URL}/api/map-layers?lat=${lat}&lon=${lon}`);
  }

  async getDataSources(): Promise<any[] | null> {
    return this.fetchWithTimeout(`${API_BASE_URL}/api/sources`);
  }
}

export const api = new ApiService();
