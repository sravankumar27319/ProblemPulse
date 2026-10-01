'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { adminService } from '../../../services/admin.service';
import {
  AdminMapMarkerItem,
  AdminMapFilterType,
  AdminMapCounts,
  AdminDepartment,
} from '../../../types/admin';
import { ProblemCategory, PriorityLevel, ProblemStatus } from '../../../types/problem';
import { Sidebar } from '../../../components/Sidebar';
import { Loading } from '../../../components/ui/Loading';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { StatusPill } from '../../../components/ui/StatusPill';
import { VerifyModal } from '../../../components/admin/VerifyModal';
import { AssignDepartmentModal } from '../../../components/admin/AssignDepartmentModal';
import { UpdateStatusModal } from '../../../components/admin/UpdateStatusModal';
import { cn } from '../../../lib/utils';

const DynamicAdminMap = dynamic(
  () => import('../../../components/admin/AdminMapContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-[#faf8f4] dark:bg-[#141d19] rounded-2xl border border-[#e5e1d8] dark:border-[#24312b]">
        <Loading size="lg" text="Loading Spatial Map Engine..." />
      </div>
    ),
  }
);

const CATEGORIES: { label: string; value: ProblemCategory | 'ALL' }[] = [
  { label: 'All Categories', value: 'ALL' },
  { label: 'Road Infrastructure', value: 'ROAD' },
  { label: 'Water & Sewage', value: 'WATER' },
  { label: 'Solid Waste / Garbage', value: 'GARBAGE' },
  { label: 'Power & Electricity', value: 'ELECTRICITY' },
  { label: 'Traffic & Signals', value: 'TRAFFIC' },
  { label: 'Other Civic Issues', value: 'OTHER' },
];

export default function AdminMapPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Map Data State
  const [markers, setMarkers] = useState<AdminMapMarkerItem[]>([]);
  const [counts, setCounts] = useState<AdminMapCounts>({
    all: 0,
    critical: 0,
    unverified: 0,
    inProgress: 0,
    unresolved: 0,
  });
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [activeFilter, setActiveFilter] = useState<AdminMapFilterType>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | 'ALL'>('ALL');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bounds, setBounds] = useState<string>('');
  const [isFilterBoundsEnabled, setIsFilterBoundsEnabled] = useState<boolean>(false);
  const boundsRef = React.useRef<string>('');

  // Selected Marker & Drawer State
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [drawerTab, setDrawerTab] = useState<'detail' | 'list'>('detail');

  // Quick Action Modal States
  const [verifyModalMarker, setVerifyModalMarker] = useState<AdminMapMarkerItem | null>(null);
  const [assignModalMarker, setAssignModalMarker] = useState<AdminMapMarkerItem | null>(null);
  const [statusModalMarker, setStatusModalMarker] = useState<AdminMapMarkerItem | null>(null);

  // Selected Marker Item
  const selectedMarker = useMemo(
    () => markers.find((m) => m.id === selectedMarkerId) || null,
    [markers, selectedMarkerId]
  );

  // Load Departments
  const loadDepartments = useCallback(async () => {
    try {
      const res = await adminService.fetchDepartments();
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch {
      // Fallback empty if departments API unavailable
    }
  }, []);

  // Fetch Map Data
  const loadMapData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminService.fetchAdminMapProblems({
        filter: activeFilter,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        departmentId: selectedDepartmentId !== 'ALL' ? selectedDepartmentId : undefined,
        bounds: isFilterBoundsEnabled && boundsRef.current ? boundsRef.current : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res.success) {
        setMarkers(res.markers);
        setCounts(res.counts);

        // Keep selected marker if it exists in new dataset
        setSelectedMarkerId((currentId) => {
          if (currentId && res.markers.some((m) => m.id === currentId)) {
            return currentId;
          }
          return res.markers[0]?.id || null;
        });
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Failed to load map data. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, [
    activeFilter,
    selectedCategory,
    selectedDepartmentId,
    isFilterBoundsEnabled,
    searchQuery,
  ]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'ADMIN') {
      loadDepartments();
      loadMapData();
    }
  }, [authLoading, user, loadDepartments, loadMapData]);

  // Handle Quick Action Submissions
  const handleVerifyConfirm = async (payload: { note?: string; adminPriority?: PriorityLevel }) => {
    if (!verifyModalMarker) return;
    await adminService.verifyProblem(verifyModalMarker.id, payload);
    setVerifyModalMarker(null);
    await loadMapData();
  };

  const handleAssignConfirm = async (payload: { departmentId: string; zone?: string; team?: string; note?: string }) => {
    if (!assignModalMarker) return;
    await adminService.assignProblem(assignModalMarker.id, payload);
    setAssignModalMarker(null);
    await loadMapData();
  };

  const handleStatusConfirm = async (payload: { status: ProblemStatus; note?: string; departmentId?: string }) => {
    if (!statusModalMarker) return;
    await adminService.updateStatus(statusModalMarker.id, payload);
    setStatusModalMarker(null);
    await loadMapData();
  };

  // Auth Guard
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] dark:bg-[#0e1512]">
        <Loading size="lg" text="Authenticating administrator session..." fullPage />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] dark:bg-[#0e1512] px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border border-[#e6e2dc] dark:border-[#24312b] bg-white dark:bg-[#141d19]">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#14221c] dark:text-[#ece9e1]">
            Administrator Access Required
          </h2>
          <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1]">
            The spatial operations map is restricted to authorized municipal officers and administrators.
          </p>
          <div className="pt-2">
            <Link href="/login?redirect=/admin/map">
              <Button className="w-full bg-[#14221c] hover:bg-[#0c543e] text-white">
                Sign in with Admin Credentials
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Operational Header */}
        {/* Admin Map Top Header */}
        {/* Admin Map Top Header */}
        <header className="bg-white dark:bg-[#141d19] border-b border-[#e5e1d8] dark:border-[#24312b] px-7 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 z-20 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-[26px] font-medium text-[#14201c] dark:text-[#ece9e1]">
                Admin Map
              </h1>
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] bg-[#e3f0ea] text-[#0f6b4f] dark:bg-[#173026] dark:text-[#5cc9a0] px-2.5 py-0.5 rounded-full">
                Operations
              </span>
            </div>
            <p className="text-[14px] text-[#5d6b65] dark:text-[#9aa8a1] mt-0.5">
              Spatial incident triage and municipal operational dispatch map
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Search */}
            <div className="relative w-52 sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadMapData()}
                placeholder="Search area or title..."
                className="w-full px-3 py-1.5 text-[14px] rounded-[8px] border border-[#e5e1d8] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#1a2520] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#78716c] hover:text-[#14201c]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMapData()}
              disabled={isLoading}
              className="text-[14px] font-medium h-8 rounded-[8px] border-[#e5e1d8] dark:border-[#24312b]"
            >
              <span>{isLoading ? 'Syncing...' : 'Sync'}</span>
            </Button>

            {/* Toggle Drawer */}
            <Button
              variant={isDrawerOpen ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={cn(
                'text-[14px] font-medium h-8 rounded-[8px]',
                isDrawerOpen
                  ? 'bg-[#14221c] dark:bg-[#ece9e1] text-white dark:text-[#0e1512]'
                  : 'border-[#e5e1d8] dark:border-[#24312b]'
              )}
            >
              <span>Inspector</span>
            </Button>
          </div>
        </header>

        {/* Primary Filter Tabs Bar (All / Critical / Unverified / In Progress / Unresolved) */}
        <div className="bg-white dark:bg-[#141d19] border-b border-[#e5e1d8] dark:border-[#24312b] px-7 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 z-10 shrink-0">
          {/* 5 Prominent Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* 1. All */}
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all flex items-center gap-1.5 border cursor-pointer',
                activeFilter === 'ALL'
                  ? 'bg-[#0f6b4f] text-white border-[#0f6b4f] shadow-xs'
                  : 'bg-[#faf8f4] dark:bg-[#1a2520] text-[#5d6b65] dark:text-[#a2b0a8] border-[#e5e1d8] dark:border-[#2a3a33] hover:bg-stone-100'
              )}
            >
              <span>All Problems</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[11px] font-semibold',
                  activeFilter === 'ALL'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#e5e1d8] dark:bg-[#2a3a33] text-[#14201c] dark:text-[#ece9e1]'
                )}
              >
                {counts.all}
              </span>
            </button>

            {/* 2. Critical */}
            <button
              type="button"
              onClick={() => setActiveFilter('CRITICAL')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all flex items-center gap-1.5 border cursor-pointer',
                activeFilter === 'CRITICAL'
                  ? 'bg-[#c8371d] text-white border-[#c8371d] shadow-xs'
                  : 'bg-[#fbe6e2] dark:bg-[#2c1712] text-[#c8371d] dark:text-[#ff8a70] border-[#c8371d]/20 hover:bg-[#fbe6e2]/80'
              )}
            >
              <span>Critical</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[11px] font-semibold',
                  activeFilter === 'CRITICAL'
                    ? 'bg-white/25 text-white'
                    : 'bg-[#c8371d]/20 text-[#c8371d] dark:text-[#ff8a70]'
                )}
              >
                {counts.critical}
              </span>
            </button>

            {/* 3. Unverified */}
            <button
              type="button"
              onClick={() => setActiveFilter('UNVERIFIED')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all flex items-center gap-1.5 border cursor-pointer',
                activeFilter === 'UNVERIFIED'
                  ? 'bg-[#c77700] text-white border-[#c77700] shadow-xs'
                  : 'bg-[#faf0da] dark:bg-[#2b230f] text-[#c77700] dark:text-[#f0b04a] border-[#c77700]/20 hover:bg-[#faf0da]/80'
              )}
            >
              <span>Unverified</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[11px] font-semibold',
                  activeFilter === 'UNVERIFIED'
                    ? 'bg-white/25 text-white'
                    : 'bg-[#c77700]/20 text-[#c77700] dark:text-[#f0b04a]'
                )}
              >
                {counts.unverified}
              </span>
            </button>

            {/* 4. In Progress */}
            <button
              type="button"
              onClick={() => setActiveFilter('IN_PROGRESS')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all flex items-center gap-1.5 border cursor-pointer',
                activeFilter === 'IN_PROGRESS'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-blue-50/70 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/40 hover:bg-blue-100'
              )}
            >
              <span>In Progress</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[11px] font-semibold',
                  activeFilter === 'IN_PROGRESS'
                    ? 'bg-white/25 text-white'
                    : 'bg-blue-200 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100'
                )}
              >
                {counts.inProgress}
              </span>
            </button>

            {/* 5. Unresolved */}
            <button
              type="button"
              onClick={() => setActiveFilter('UNRESOLVED')}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all flex items-center gap-1.5 border cursor-pointer',
                activeFilter === 'UNRESOLVED'
                  ? 'bg-[#c77700] text-white border-[#c77700] shadow-xs'
                  : 'bg-[#faf0da] dark:bg-[#2b230f] text-[#c77700] dark:text-[#f0b04a] border-[#c77700]/20 hover:bg-[#faf0da]/80'
              )}
            >
              <span>Unresolved</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[11px] font-semibold',
                  activeFilter === 'UNRESOLVED'
                    ? 'bg-white/25 text-white'
                    : 'bg-[#c77700]/20 text-[#c77700] dark:text-[#f0b04a]'
                )}
              >
                {counts.unresolved}
              </span>
            </button>
          </div>

          {/* Secondary Dropdown Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ProblemCategory | 'ALL')}
              className="px-2.5 py-1.5 rounded-[8px] border border-[#e5e1d8] dark:border-[#2a3a33] bg-[#faf8f4] dark:bg-[#1a2520] text-[#14201c] dark:text-[#ece9e1] font-medium focus:ring-1 focus:ring-[#0f6b4f]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Department Dropdown */}
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="px-2.5 py-1.5 rounded-[8px] border border-[#e5e1d8] dark:border-[#2a3a33] bg-[#faf8f4] dark:bg-[#1a2520] text-[#14201c] dark:text-[#ece9e1] font-medium focus:ring-1 focus:ring-[#0f6b4f]"
            >
              <option value="ALL">All Departments</option>
              <option value="UNASSIGNED">Dept Unassigned</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>

            {/* Bounds Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsFilterBoundsEnabled(!isFilterBoundsEnabled)}
              title="Only show problems visible within current map viewport"
              className={cn(
                'px-2.5 py-1.5 rounded-[8px] border text-[12px] font-semibold transition-colors cursor-pointer',
                isFilterBoundsEnabled
                  ? 'bg-[#0f6b4f]/10 text-[#0f6b4f] border-[#0f6b4f]'
                  : 'bg-[#faf8f4] dark:bg-[#1a2520] text-[#5d6b65] border-[#e5e1d8] dark:border-[#2a3a33]'
              )}
            >
              <span>{isFilterBoundsEnabled ? 'Viewport Locked' : 'All Coordinates'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert if any */}
        {error && (
          <div className="px-5 pt-3">
            <ErrorMessage message={error} onRetry={() => loadMapData()} />
          </div>
        )}

        {/* Map Canvas + Inspector Dock */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Main Map Canvas */}
          <div className="flex-1 relative h-full">
            <DynamicAdminMap
              markers={markers}
              selectedMarkerId={selectedMarkerId}
              onSelectMarker={(m) => {
                setSelectedMarkerId(m.id);
                setIsDrawerOpen(true);
                setDrawerTab('detail');
              }}
              onBoundsChange={(boundsStr) => {
                boundsRef.current = boundsStr;
                setBounds(boundsStr);
                if (isFilterBoundsEnabled) {
                  loadMapData();
                }
              }}
              onQuickAssign={(m) => setAssignModalMarker(m)}
              onQuickStatus={(m) => setStatusModalMarker(m)}
              onQuickVerify={(m) => setVerifyModalMarker(m)}
            />

            {/* Floating Marker Count Tag */}
            <div className="absolute top-4 left-4 z-20 bg-white/95 dark:bg-[#141d19]/95 backdrop-blur-md px-3 py-1.5 rounded-[8px] border border-[#e5e1d8] dark:border-[#24312b] shadow-xs text-[12px] font-semibold text-[#14201c] dark:text-[#ece9e1] flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{markers.length} Incidents Rendered</span>
            </div>
          </div>

          {/* Right Inspector Panel */}
          {isDrawerOpen && (
            <aside
              className="w-80 md:w-96 bg-white dark:bg-[#141d19] border-l border-[#e5e1d8] dark:border-[#24312b] flex flex-col h-full max-h-full min-h-0 z-20 shrink-0 shadow-lg overflow-hidden"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Drawer Tabs - Pinned Header */}
              <div className="flex items-center justify-between border-b border-[#e5e1d8] dark:border-[#24312b] px-4 py-3 shrink-0 bg-white dark:bg-[#141d19]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDrawerTab('detail')}
                    className={cn(
                      'px-3 py-1.5 text-[12px] font-semibold rounded-[8px] transition-colors cursor-pointer',
                      drawerTab === 'detail'
                        ? 'bg-[#0f6b4f] text-white'
                        : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1]'
                    )}
                  >
                    Problem Dossier
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab('list')}
                    className={cn(
                      'px-3 py-1.5 text-[12px] font-semibold rounded-[8px] transition-colors flex items-center gap-1.5 cursor-pointer',
                      drawerTab === 'list'
                        ? 'bg-[#0f6b4f] text-white'
                        : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1]'
                    )}
                  >
                    <span>Feed</span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-semibold">
                      {markers.length}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-2.5 py-1 text-[12px] font-semibold rounded-[8px] text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1] hover:bg-stone-100 dark:hover:bg-[#1a2520] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Drawer Content - Single Scrollable Body */}
              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {drawerTab === 'detail' ? (
                  selectedMarker ? (
                    <div className="space-y-4">
                      {/* Priority & Status Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <PriorityBadge priority={selectedMarker.priority} size="md" />
                        <StatusPill status={selectedMarker.status} size="md" />
                      </div>

                      {/* Title & Category */}
                      <div>
                        <div className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#0f6b4f] dark:text-[#5cc9a0]">
                          {selectedMarker.category} MUNICIPAL REPORT
                        </div>
                        <h3 className="font-heading font-medium text-[18px] text-[#14201c] dark:text-[#ece9e1] mt-1 leading-snug">
                          {selectedMarker.title}
                        </h3>
                        <p className="text-[14px] text-[#5d6b65] dark:text-[#9aa8a1] mt-1.5 leading-relaxed">
                          {selectedMarker.description}
                        </p>
                      </div>

                      {/* Location Information */}
                      <Card className="p-3.5 bg-[#faf8f4] dark:bg-[#1a2520] border border-[#e5e1d8] dark:border-[#2a3a33] rounded-[14px] space-y-1.5 text-[13.5px]">
                        <div>
                          <div className="font-medium text-[#14201c] dark:text-[#ece9e1]">
                            {selectedMarker.address || `${selectedMarker.area}, ${selectedMarker.city}`}
                          </div>
                          <div className="text-[12px] text-[#5d6b65] dark:text-[#9aa8a1]">
                            {selectedMarker.area} • {selectedMarker.city}
                          </div>
                          <div className="text-[12px] font-mono text-[#0f6b4f] dark:text-[#5cc9a0] mt-0.5">
                            Lat: {selectedMarker.latitude.toFixed(5)}, Lng: {selectedMarker.longitude.toFixed(5)}
                          </div>
                        </div>
                      </Card>

                      {/* Citizen Support & Impact Breakdown */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-[14px] border border-[#e5e1d8] dark:border-[#2a3a33] bg-[#faf8f4] dark:bg-[#1a2520]">
                          <div className="text-[12px] font-medium text-[#5d6b65] dark:text-[#9aa8a1] uppercase tracking-[0.04em]">
                            Reports
                          </div>
                          <div className="font-heading font-medium text-[32px] text-[#c8371d] dark:text-[#ff8a70] mt-0.5 leading-tight">
                            {selectedMarker.reportCount}
                          </div>
                          <div className="text-[12px] text-[#5d6b65] dark:text-[#9aa8a1]">Citizens logged</div>
                        </div>

                        <div className="p-3 rounded-[14px] border border-[#e5e1d8] dark:border-[#2a3a33] bg-[#faf8f4] dark:bg-[#1a2520]">
                          <div className="text-[12px] font-medium text-[#5d6b65] dark:text-[#9aa8a1] uppercase tracking-[0.04em]">
                            Supports
                          </div>
                          <div className="font-heading font-medium text-[32px] text-[#0f6b4f] dark:text-[#5cc9a0] mt-0.5 leading-tight">
                            {selectedMarker.supportCount}
                          </div>
                          <div className="text-[12px] text-[#5d6b65] dark:text-[#9aa8a1]">Community votes</div>
                        </div>
                      </div>

                      {/* Assigned Department Card */}
                      <Card className="p-4 border border-[#e5e1d8] dark:border-[#2a3a33] bg-white dark:bg-[#141d19] rounded-[14px] space-y-2.5">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="font-medium uppercase tracking-[0.04em] text-[#5d6b65] dark:text-[#9aa8a1]">
                            Assigned Department
                          </span>
                          {!selectedMarker.department && (
                            <span className="text-[12px] font-semibold text-[#c77700] bg-[#faf0da] dark:bg-[#2b230f] dark:text-[#f0b04a] px-2 py-0.5 rounded-full">
                              Unassigned
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-[14px] text-[#14201c] dark:text-[#ece9e1]">
                            {selectedMarker.department
                              ? selectedMarker.department.name
                              : 'Pending Administrative Allocation'}
                          </div>
                          {selectedMarker.department && (
                            <div className="text-[12px] text-[#5d6b65] dark:text-[#9aa8a1] font-mono mt-0.5">
                              Code: {selectedMarker.department.code}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAssignModalMarker(selectedMarker)}
                          className="w-full text-[14px] font-medium h-8 rounded-[8px] border-[#e5e1d8] dark:border-[#2a3a33]"
                        >
                          {selectedMarker.department ? 'Reassign Department' : 'Assign Department'}
                        </Button>
                      </Card>

                      {/* Action Buttons Toolbar */}
                      <div className="space-y-2.5 pt-3 border-t border-[#e5e1d8] dark:border-[#2a3a33]">
                        {/* If unverified, show verify button */}
                        {['SUBMITTED', 'UNDER_REVIEW'].includes(selectedMarker.status) && (
                          <Button
                            size="sm"
                            onClick={() => setVerifyModalMarker(selectedMarker)}
                            className="w-full bg-[#0f6b4f] hover:bg-[#0c543e] text-white text-[14px] font-medium h-9 rounded-[8px]"
                          >
                            Verify Report & Set Priority
                          </Button>
                        )}

                        {/* Status Transition Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStatusModalMarker(selectedMarker)}
                          className="w-full text-[14px] font-medium h-9 rounded-[8px] border-[#e5e1d8] dark:border-[#2a3a33]"
                        >
                          Advance Problem Lifecycle Status
                        </Button>

                        {/* Full Review Page Link */}
                        <Link
                          href={`/problems/${selectedMarker.id}`}
                          className="inline-flex items-center justify-center w-full px-3 py-2 rounded-[8px] border border-[#e5e1d8] dark:border-[#2a3a33] text-[14px] font-medium text-[#0f6b4f] dark:text-[#5cc9a0] hover:bg-[#faf8f4] dark:hover:bg-[#1a2520] transition-colors"
                        >
                          Open Problem Review Dossier →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#5d6b65] dark:text-[#9aa8a1] space-y-2">
                      <p className="font-heading font-medium text-[16px] text-[#14201c] dark:text-[#ece9e1]">No Problem Selected</p>
                      <p className="text-[13px]">Click on any marker on the map to inspect its civic dossier.</p>
                    </div>
                  )
                ) : (
                  /* Feed Tab: List of markers */
                  <div className="space-y-2.5">
                    {markers.length > 0 ? (
                      markers.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedMarkerId(item.id)}
                          className={cn(
                            'p-3 rounded-[14px] cursor-pointer transition-all space-y-1.5 border',
                            item.id === selectedMarkerId
                              ? 'bg-[#0f6b4f]/10 border-[#0f6b4f]'
                              : 'bg-white dark:bg-[#141d19] border-[#e5e1d8] dark:border-[#24312b] hover:bg-[#faf8f4] dark:hover:bg-[#1a2520]'
                          )}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <PriorityBadge priority={item.priority} size="sm" />
                            <StatusPill status={item.status} size="sm" />
                          </div>
                          <h4 className="font-semibold text-[14px] text-[#14201c] dark:text-[#ece9e1] line-clamp-1">
                            {item.title}
                          </h4>
                          <div className="flex items-center justify-between text-[12px] text-[#5d6b65] dark:text-[#9aa8a1]">
                            <span className="truncate">{item.area}</span>
                            <span>{item.reportCount} Reps • {item.supportCount} Sups</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-center text-[#5d6b65] dark:text-[#9aa8a1] py-6">
                        No problems match the current spatial filter.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Quick Action Modals */}
      {verifyModalMarker && (
        <VerifyModal
          isOpen={true}
          onClose={() => setVerifyModalMarker(null)}
          onConfirm={handleVerifyConfirm}
          currentPriority={verifyModalMarker.priority}
          problemTitle={verifyModalMarker.title}
        />
      )}

      {assignModalMarker && (
        <AssignDepartmentModal
          isOpen={true}
          onClose={() => setAssignModalMarker(null)}
          onConfirm={handleAssignConfirm}
          problemTitle={assignModalMarker.title}
          problemCategory={assignModalMarker.category}
          currentDepartmentId={assignModalMarker.departmentId}
          departments={departments}
        />
      )}

      {statusModalMarker && (
        <UpdateStatusModal
          isOpen={true}
          onClose={() => setStatusModalMarker(null)}
          onConfirm={handleStatusConfirm}
          problemTitle={statusModalMarker.title}
          currentStatus={statusModalMarker.status}
        />
      )}
    </div>
  );
}
