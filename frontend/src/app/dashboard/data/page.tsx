'use client';

import React from 'react';
import { Database, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DataExplorerPage() {
  const sources = [
    { name: 'INCOIS API', status: 'active', types: 'SST, Chlorophyll, PFZ', updated: '10 mins ago', reliability: 98 },
    { name: 'Open-Meteo', status: 'active', types: 'Weather, Wind', updated: '1 hr ago', reliability: 95 },
    { name: 'NOAA GFS', status: 'active', types: 'Wave Height, Currents', updated: '3 hrs ago', reliability: 90 },
    { name: 'Local Sensors', status: 'demo', types: 'Salinity, Temp', updated: 'N/A', reliability: 100 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Database className="text-cyan-400" size={32} />
        Data Explorer
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map(src => (
          <div key={src.name} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-white">{src.name}</h3>
              {src.status === 'active' ? (
                <CheckCircle size={18} className="text-green-400" />
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase font-bold">Demo</span>
              )}
            </div>
            <p className="text-xs text-white/50 mb-4">{src.types}</p>
            <div className="flex justify-between text-xs border-t border-white/10 pt-3">
              <span className="text-white/40">Updated: {src.updated}</span>
              <span className="text-cyan-400">{src.reliability}% Rel.</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-8">
        <h2 className="text-xl font-bold text-white mb-6">Data Freshness & Confidence</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/50 border-b border-white/10">
              <tr>
                <th className="pb-3 font-medium">Parameter</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Last Updated</th>
                <th className="pb-3 font-medium">Mode</th>
                <th className="pb-3 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {[
                ['Sea Surface Temp (SST)', 'INCOIS', '2024-08-25 10:00', 'Live', '95%'],
                ['Weather', 'Open-Meteo', '2024-08-25 09:30', 'Live', '98%'],
                ['Geofence Boundaries', 'Local DB', '2024-08-01 00:00', 'Static', '100%'],
                ['Chlorophyll', 'INCOIS', '2024-08-25 10:00', 'Live', '90%']
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-4">{row[0]}</td>
                  <td className="py-4">{row[1]}</td>
                  <td className="py-4 text-white/60">{row[2]}</td>
                  <td className="py-4">
                    <span className={cn("px-2 py-1 rounded-md text-[10px] uppercase font-bold", row[3] === 'Live' ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-white")}>
                      {row[3]}
                    </span>
                  </td>
                  <td className="py-4 text-cyan-400">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
