'use client';

import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { RiskGauge } from '@/components/safety/RiskGauge';
import { SafetyBreakdown } from '@/components/safety/SafetyBreakdown';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';

const CITIES = [
  { value: 'mumbai', label: 'Mumbai' }, { value: 'kochi', label: 'Kochi' }, 
  { value: 'chennai', label: 'Chennai' }, { value: 'visakhapatnam', label: 'Visakhapatnam' }
];

export default function SafetyCenterPage() {
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('mumbai');

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [city]);

  const riskFactors = [
    { name: 'Weather', icon: '⛈️', score: 15, max: 25, description: 'Moderate winds, chance of rain.' },
    { name: 'Wave', icon: '🌊', score: 10, max: 25, description: 'Wave height 1.2m, within safe limits.' },
    { name: 'Wind', icon: '💨', score: 12, max: 20, description: '15 knots NW.' },
    { name: 'Lightning', icon: '⚡', score: 0, max: 10, description: 'No electrical activity detected.' },
    { name: 'Cyclone', icon: '🌀', score: 0, max: 10, description: 'No cyclonic warnings active.' },
    { name: 'Geofence', icon: '🚫', score: 5, max: 10, description: 'Operating near restricted naval zone buffer.' },
  ];

  const totalScore = riskFactors.reduce((acc, curr) => acc + curr.score, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="text-cyan-400" size={32} />
          Marine Safety Center
        </h1>
        <div className="flex items-center gap-4">
          <Select options={CITIES} value={city} onChange={setCity} className="w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center lg:col-span-1 min-h-[300px]">
          <h2 className="text-xl font-bold text-white mb-8 self-start w-full">Overall Risk Assessment</h2>
          {loading ? <Skeleton width={200} height={200} rounded="rounded-full" /> : (
            <RiskGauge score={totalScore} size="lg" />
          )}
        </div>

        {/* Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">Risk Factors Breakdown</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} height={60} />)}
            </div>
          ) : (
            <SafetyBreakdown factors={riskFactors} />
          )}
        </div>

        {/* AI Explanation */}
        <div className="bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 lg:col-span-3">
          <h2 className="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2">AI Safety Analysis</h2>
          {loading ? <Skeleton height={80} /> : (
            <p className="text-cyan-100/80 leading-relaxed">
              Overall risk is <strong className="text-amber-400">MODERATE</strong>. The primary contributors to this score are the current wind patterns and proximity to a naval geofence buffer zone. Sea state remains calm, but it is advised to monitor weather updates every 4 hours. No cyclonic activity detected in the region.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
