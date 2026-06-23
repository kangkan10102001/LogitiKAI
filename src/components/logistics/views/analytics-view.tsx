'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  BarChart3, TrendingUp, Clock, MapPin, Truck, Package,
  ArrowUpRight, Target, Timer, IndianRupee,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

interface AnalyticsData {
  cityPerformance: Array<{
    city: string; state: string; type: string; totalDeliveries: number;
    deliveredCount: number; onTimeRate: number; avgTime: number;
    avgDistance: number; revenue: number; vehicles: number;
  }>;
  statusDistribution: Array<{ status: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
  vehicleTypeDistribution: Array<{ type: string; count: number }>;
  hourlyPattern: Array<{ hour: number; congestion: number; label: string }>;
  weeklyTrend: Array<{ day: string; deliveries: number; onTime: number; avgTime: number }>;
}

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  assigned: '#3b82f6',
  in_transit: '#8b5cf6',
  delivered: '#22c55e',
  failed: '#ef4444',
};

const priorityColors: Record<string, string> = {
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#f97316',
  urgent: '#ef4444',
};

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[300px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground text-sm">Delivery performance insights for Indian logistics patterns</p>
      </div>

      {/* Indian Traffic Congestion Pattern */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Indian Traffic Congestion Pattern
              </CardTitle>
              <CardDescription>Peak hours: 8-11 AM & 5-8 PM (IST) — Route optimization adjusts accordingly</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">IST Hours</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.hourlyPattern}>
              <defs>
                <linearGradient id="congestionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={2} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                labelFormatter={(l) => `Time: ${l} IST`}
                formatter={(v: number) => [`${v}% congestion`, 'Level']}
              />
              <Area type="monotone" dataKey="congestion" stroke="#f59e0b" fill="url(#congestionGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Off-peak: Best delivery window</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Peak: Traffic delays expected</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical: Major congestion zones</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Delivery Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Weekly Delivery Trend
            </CardTitle>
            <CardDescription>Deliveries and on-time performance by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="deliveries" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Delivery Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              Delivery Status Distribution
            </CardTitle>
            <CardDescription>Current breakdown of all shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    dataKey="count"
                    paddingAngle={3}
                  >
                    {data.statusDistribution.map((entry) => (
                      <Cell key={entry.status} fill={statusColors[entry.status] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {data.statusDistribution.map((s) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: statusColors[s.status] }} />
                      <span className="text-sm capitalize">{s.status.replace('_', ' ')}</span>
                    </div>
                    <span className="text-sm font-semibold">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City Performance Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                City Performance Overview
              </CardTitle>
              <CardDescription>Multi-city delivery analytics across India</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.cityPerformance.filter(c => c.deliveredCount > 0).map((city) => (
              <div key={city.city} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{city.city}</p>
                    <p className="text-[11px] text-muted-foreground">{city.state} · {city.type === 'metro' ? 'Metro' : 'Tier-2'}</p>
                  </div>
                  <Badge variant="outline" className={city.onTimeRate >= 80 ? 'text-green-600 border-green-300 dark:border-green-700' : 'text-amber-600 border-amber-300 dark:border-amber-700'}>
                    {city.onTimeRate}% on-time
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold">{city.deliveredCount}</p>
                    <p className="text-[10px] text-muted-foreground">Delivered</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{city.avgTime}<span className="text-xs font-normal">m</span></p>
                    <p className="text-[10px] text-muted-foreground">Avg Time</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">₹{city.revenue.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Type + Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              Vehicle Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.vehicleTypeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 12 }} width={80} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-red-500" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.priorityDistribution.map((entry) => (
                    <Cell key={entry.priority} fill={priorityColors[entry.priority] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}