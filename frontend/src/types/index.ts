export interface Location { latitude: number; longitude: number; name?: string; }
export interface DataMetadata { source: string; timestamp: string; data_mode: 'live' | 'demo' | 'forecast' | 'historical'; confidence: number; }
export interface PFZZone { id: string; name: string; latitude: number; longitude: number; timestamp: string; confidence: number; source: string; suitability_score: number; sst: number; chlorophyll: number; distance_km?: number; direction?: string; weather_risk?: string; sea_state?: string; fish_species?: string[]; }
export interface WeatherData { latitude: number; longitude: number; timestamp: string; temperature: number; humidity: number; wind_speed: number; wind_direction: number; precipitation: number; cloud_cover: number; visibility: number; lightning_risk: string; pressure: number; source: string; data_mode: string; }
export interface OceanData { latitude: number; longitude: number; timestamp: string; sst: number; chlorophyll: number; wave_height: number; wave_period: number; wave_direction: number; current_speed: number; current_direction: number; sea_state: string; source: string; data_mode: string; }
export interface RiskFactor { name: string; score: number; max_score: number; level: string; description: string; icon: string; }
export interface RiskAssessment { overall_score: number; risk_level: string; factors: RiskFactor[]; recommendation: string; explanation: string; warnings: string[]; timestamp: string; sources: string[]; confidence: number; data_mode: string; }
export interface Alert { id: string; type: string; severity: string; title: string; description: string; latitude: number; longitude: number; radius_km: number; timestamp: string; expires?: string; source: string; icon: string; }
export interface Route { id: string; name: string; waypoints: Array<{latitude: number; longitude: number; risk_score: number; weather_note?: string}>; distance_km: number; duration_hours: number; risk_score: number; hazards: string[]; geojson: any; route_type: string; }
export interface RouteResponse { routes: Route[]; recommendation: string; metadata: DataMetadata; }
export interface Geofence { id: string; name: string; type: string; description: string; geometry: any; restriction_level: string; reason: string; source: string; }
export interface MapLayer { id: string; name: string; type: string; visible: boolean; data: any; style?: any; source_name: string; }
export interface AgentActivity { agent_name: string; status: string; description: string; timestamp: string; duration_ms?: number; }
export interface ChatMessage { role: 'user' | 'assistant'; content: string; timestamp: string; agents_used?: string[]; agent_activity?: AgentActivity[]; risk_assessment?: RiskAssessment; pfz_data?: PFZZone[]; map_layers?: MapLayer[]; alerts?: Alert[]; route?: RouteResponse; metadata?: DataMetadata; }
export interface Conversation { id: string; messages: ChatMessage[]; location?: Location; language: string; }
