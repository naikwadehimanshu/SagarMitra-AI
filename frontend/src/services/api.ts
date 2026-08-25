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
    return this.fetchWithTimeout(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationId, location, language })
    }, 30000); // Longer timeout for AI
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
