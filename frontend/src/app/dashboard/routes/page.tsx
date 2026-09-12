'use client';

import React, { useState } from 'react';
import { Compass, MapPin, Loader2 } from 'lucide-react';
import { RouteComparison } from '@/components/routes/RouteComparison';
import { Toggle } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { motion } from 'framer-motion';

const CITIES = [
  { value: 'mumbai', label: 'Mumbai' }, { value: 'kochi', label: 'Kochi' }, 
  { value: 'chennai', label: 'Chennai' }, { value: 'visakhapatnam', label: 'Visakhapatnam' }
];

export default function RoutePlannerPage() {
  const [calculating, setCalculating] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [avoidRisk, setAvoidRisk] = useState(true);

  const handleCalculate = () => {
    setCalculating(true);
    setCalculated(false);
    setTimeout(() => {
      setCalculating(false);
      setCalculated(true);
    }, 2000);
  };

  const dummyRoutes = [
    { id: '1', name: 'Direct Route', type: 'Fastest' as const, distance: 45.2, duration: 2.1, riskScore: 65, hazards: ['High Waves', 'Naval Zone Buffer'] },
    { id: '2', name: 'Coastal Avoidance', type: 'Safest' as const, distance: 58.4, duration: 2.8, riskScore: 25, hazards: [] }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Compass className="text-cyan-400" size={32} />
        Route Planner
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Panel - Config */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:col-span-1 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Plan Route</h2>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Start Location</label>
              <Select options={CITIES} value="mumbai" onChange={() => {}} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Destination (PFZ)</label>
              <Select options={[{value: 'pfz1', label: 'Zone Alpha (12km)'}]} value="pfz1" onChange={() => {}} />
            </div>
            
            <div className="pt-4 border-t border-white/10 mt-4">
              <Toggle checked={avoidRisk} onChange={setAvoidRisk} label="Avoid high-risk areas" />
            </div>
          </div>

          <button 
            onClick={handleCalculate}
            disabled={calculating}
            className="w-full py-3 bg-cyan-500 text-slate-900 rounded-xl font-bold hover:bg-cyan-400 transition-colors flex justify-center items-center gap-2 mt-4"
          >
            {calculating ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
            {calculating ? 'Calculating...' : 'Calculate Route'}
          </button>
        </div>

        {/* Right Panel - Results & Map */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:col-span-3 flex flex-col overflow-y-auto">
          {!calculated && !calculating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40">
              <Compass size={64} className="mb-4 opacity-50" />
              <p>Configure your route and click calculate to see options.</p>
            </div>
          ) : calculating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-cyan-400">
              <Loader2 size={64} className="animate-spin mb-4" />
              <p>AI is analyzing weather, sea state, and geofences...</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <RouteComparison 
                routes={dummyRoutes} 
                recommendation="The Coastal Avoidance route is highly recommended. Although it adds 40 minutes to the journey, it entirely bypasses the active Naval training buffer zone and areas with currently elevated wave heights, reducing the risk score by 60%."
              />
              
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Map View</h3>
                <div className="w-full h-64 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center text-white/40">
                  Interactive Map Component Placeholder
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
