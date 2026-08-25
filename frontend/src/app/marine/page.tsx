'use client';

import React, { useState, useEffect } from 'react';
import { Satellite, RefreshCw, Navigation } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';

const CITIES = [
  { value: 'mumbai', label: 'Mumbai' }, { value: 'kochi', label: 'Kochi' }, 
  { value: 'chennai', label: 'Chennai' }, { value: 'visakhapatnam', label: 'Visakhapatnam' }
];

export default function MarineIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('mumbai');

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [city]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Satellite className="text-cyan-400" size={32} />
          Marine Intelligence
        </h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select options={CITIES} value={city} onChange={setCity} className="w-48" />
          <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
            <RefreshCw size={20} className={loading ? "animate-spin text-cyan-400" : "text-white"} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SST Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Satellite size={100} /></div>
          <h2 className="text-xl font-bold text-white mb-4">Sea Surface Temperature</h2>
          {loading ? <Skeleton height={100} /> : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-5xl font-bold text-white mb-2">28.4<span className="text-2xl text-white/50">°C</span></div>
              <div className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full font-medium mb-4">OPTIMAL SUITABILITY</div>
              <div className="text-xs text-white/40">Source: INCOIS | Updated: 10 mins ago</div>
            </motion.div>
          )}
        </div>

        {/* Chlorophyll Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Chlorophyll Concentration</h2>
          {loading ? <Skeleton height={100} /> : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-4xl font-bold text-white mb-2">1.2<span className="text-xl text-white/50"> mg/m³</span></div>
              <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full font-medium mb-4">MODERATE PRODUCTIVITY</div>
              <div className="w-full h-2 bg-slate-800 rounded-full mb-2">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '60%' }} />
              </div>
              <div className="text-xs text-white/40">Source: NOAA MODIS | Updated: 1 hour ago</div>
            </motion.div>
          )}
        </div>

        {/* Ocean Conditions */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Ocean Conditions</h2>
          {loading ? <Skeleton height={150} /> : (
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-white/50 text-sm">Wave Height</p><p className="text-xl font-bold">1.5m</p></div>
              <div><p className="text-white/50 text-sm">Wave Period</p><p className="text-xl font-bold">8s</p></div>
              <div><p className="text-white/50 text-sm">Current Speed</p><p className="text-xl font-bold">0.8 kn</p></div>
              <div><p className="text-white/50 text-sm">Sea State</p><p className="text-xl font-bold text-green-400">Slight</p></div>
            </div>
          )}
        </div>

        {/* PFZ Analytics */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">PFZ Analytics</h2>
          {loading ? <Skeleton height={150} /> : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-white/50 text-sm mb-1">Active Zones</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-sm mb-1">Nearest Zone</p>
                  <p className="text-lg font-bold flex items-center gap-1 justify-end"><Navigation size={16} className="text-cyan-400"/> 15km NW</p>
                </div>
              </div>
              <button className="w-full py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-medium hover:bg-cyan-500/30 transition-colors">
                View Best Recommendation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
