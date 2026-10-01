'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '../../components/landing/Header';
import { Footer } from '../../components/landing/Footer';
import { Card } from '../../components/ui/Card';
import { Dropdown } from '../../components/ui/Dropdown';
import { Loading } from '../../components/ui/Loading';
import { problemService, MapMarkerItem } from '../../services/problem.service';
import { ProblemCategory, PriorityLevel } from '../../types/problem';
import { FEATURED_PROBLEMS } from '../../constants/landing';
import { MapPin, RefreshCw, Layers } from 'lucide-react';

const DynamicMap = dynamic(
  () => import('../../components/map/ProblemMapContainer'),
  {
    ssr: false,
    loading: () => <Loading size="lg" text="Initializing Interactive City Map..." fullPage />,
  }
);

export default function ProblemMapPage() {
  const [markers, setMarkers] = useState<MapMarkerItem[]>([]);
  const [bounds, setBounds] = useState<string>('');
  const [category, setCategory] = useState<ProblemCategory | 'ALL'>('ALL');
  const [priority, setPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadMapMarkers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await problemService.fetchMapProblems({
        bounds,
        category,
        priority,
      });

      if (res.success && res.markers) {
        setMarkers(res.markers);
      }
    } catch {
      // Fallback preview dataset if API is offline
      let mockMarkers: MapMarkerItem[] = FEATURED_PROBLEMS.map((p) => ({
        id: p.id,
        latitude: p.latitude,
        longitude: p.longitude,
        title: p.title,
        priority: p.priority,
        status: p.status,
        reportCount: p.reportCount,
        supportCount: p.supportCount,
        address: p.address,
        area: p.area,
        city: p.city,
      }));

      if (category !== 'ALL') {
        mockMarkers = mockMarkers.filter((m) => {
          const matchingProblem = FEATURED_PROBLEMS.find((fp) => fp.id === m.id);
          return matchingProblem?.category === category;
        });
      }

      if (priority !== 'ALL') {
        mockMarkers = mockMarkers.filter((m) => m.priority === priority);
      }

      setMarkers(mockMarkers);
    } finally {
      setIsLoading(false);
    }
  }, [bounds, category, priority]);

  useEffect(() => {
    loadMapMarkers();
  }, [loadMapMarkers]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      {/* Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col space-y-4">
        {/* Header & Filter Controls Bar */}
        <div className="bg-white dark:bg-[#141d19] p-4 rounded-xl border border-[#e5e1d8] dark:border-[#24312b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0f6b4f] dark:text-[#5cc9a0]">
              <MapPin className="w-4 h-4" />
              <span>SPATIAL PROBLEM EXPLORER</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-[#14201c] dark:text-[#ece9e1] mt-0.5">
              Interactive Problem Map
            </h1>
          </div>

          {/* Filters & Refresh */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <Dropdown
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                options={[
                  { value: 'ALL', label: 'All Categories' },
                  { value: 'ROAD', label: 'Road Damage' },
                  { value: 'WATER', label: 'Water Supply' },
                  { value: 'GARBAGE', label: 'Garbage' },
                  { value: 'ELECTRICITY', label: 'Electricity' },
                  { value: 'TRAFFIC', label: 'Traffic' },
                ]}
              />
            </div>

            <div className="w-36">
              <Dropdown
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                options={[
                  { value: 'ALL', label: 'All Priorities' },
                  { value: 'CRITICAL', label: 'Critical' },
                  { value: 'MAJOR', label: 'Major' },
                  { value: 'LOW', label: 'Low' },
                ]}
              />
            </div>

            {/* Marker Count Badge */}
            <div className="px-3 py-2 bg-[#e3f0ea] dark:bg-[#173026] text-[#0f6b4f] dark:text-[#5cc9a0] rounded-lg border border-[#0f6b4f]/20 text-xs font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>{markers.length} Pins Loaded</span>
            </div>
          </div>
        </div>

        {/* Legend Row */}
        <div className="flex items-center gap-6 px-4 py-2 bg-white/60 dark:bg-[#141d19]/60 rounded-lg border border-[#e5e1d8] dark:border-[#24312b] text-xs text-[#5d6b65] dark:text-[#9aa8a1]">
          <span className="font-semibold text-[#14201c] dark:text-[#ece9e1]">Priority Pins:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#dc2626] inline-block" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ea580c] inline-block" />
            <span>Major</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#16a34a] inline-block" />
            <span>Low</span>
          </div>
        </div>

        {/* Leaflet Map Box */}
        <div className="w-full h-[650px] min-h-[500px] relative">
          <DynamicMap
            markers={markers}
            onBoundsChange={(b) => setBounds(b)}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
