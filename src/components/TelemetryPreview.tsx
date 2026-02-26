'use client';

import React from 'react';
import { Thermometer, Droplets, Waves, Clock, Sparkles } from 'lucide-react';

export default function TelemetryPreview() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mx-auto max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-gray-700">Live Telemetry Demo</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-orange-600" />
            <span className="text-xs uppercase text-gray-500">pH</span>
          </div>
          <div className="text-xl font-black text-gray-900">4.52</div>
          <div className="text-xs text-emerald-600 mt-1">Target: 4.50</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-orange-600" />
            <span className="text-xs uppercase text-gray-500">Temp</span>
          </div>
          <div className="text-xl font-black text-gray-900">28°C</div>
          <div className="text-xs text-gray-500 mt-1">Optimal</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-4 w-4 text-blue-600" />
            <span className="text-xs uppercase text-gray-500">Water</span>
          </div>
          <div className="text-xl font-black text-gray-900">85%</div>
          <div className="mt-2">
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-xs uppercase text-gray-500">Duration</span>
          </div>
          <div className="text-xl font-black text-gray-900">18 jam</div>
          <div className="text-xs text-gray-400 mt-1">of 48 jam</div>
        </div>
      </div>
    </section>
  );
}
