'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package, Truck, CheckCircle2, AlertTriangle, Clock, Fuel,
  TrendingUp, Activity,
} from 'lucide-react';
import { useFleetStore } from '@/stores/fleet-store';
import { useDeliveryStore } from '@/stores/delivery-store';
import { useAuthStore } from '@/stores/auth-store';
import type { DashboardStats, Delivery } from '@/types/logistics';

function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, color = 'primary' }: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ElementType; trend?: string; trendUp?: boolean; color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
    amber: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
    red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  };
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                {trendUp ? <TrendingUp className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {trend}
              </div>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
    assigned: { label: 'Assigned', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
    in_transit: { label: 'In Transit', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
    delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  };
  const c = config[status] || config.pending;
  return <Badge variant="secondary" className={c.className}>{c.label}</Badge>;
}

function RecentDeliveriesTable({ deliveries }: { deliveries: Delivery[] }) {
  const recent = deliveries.slice(0, 6);
  return (
    <div className="space-y-2">
      {recent.map((d) => (
        <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{d.trackingNo}</span>
              <StatusBadge status={d.status} />
              {d.priority === 'urgent' && (
                <Badge variant="outline" className="text-[10px] text-red-500 border-red-300 dark:border-red-700">URGENT</Badge>
              )}
            </div>
            <p className="text-sm font-medium truncate mt-0.5">{d.dropoffAddress}</p>
            <p className="text-xs text-muted-foreground">{d.pickupCity} → {d.dropoffCity}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium">{d.recipientName}</p>
            <p className="text-xs text-muted-foreground">{d.estimatedDistance} km</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CityOverview() {
  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Guwahati'];
  const cityStats = cities.map((city) => ({
    name: city,
    active: Math.floor(Math.random() * 8) + 2,
    delivered: Math.floor(Math.random() * 15) + 5,
    onTime: Math.floor(75 + Math.random() * 20),
  }));

  return (
    <div className="space-y-3">
      {cityStats.map((c) => (
        <div key={c.name} className="flex items-center gap-3">
          <div className="w-24 text-sm font-medium truncate">{c.name}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{c.active} active</span>
              <span className="text-xs text-muted-foreground">{c.onTime}% on-time</span>
            </div>
            <Progress value={c.onTime} className="h-1.5" />
          </div>
          <Badge variant="outline" className="text-xs shrink-0">{c.delivered} today</Badge>
        </div>
      ))}
    </div>
  );
}

export function DashboardView() {
  const { stats, setStats } = useFleetStore();
  const { deliveries, setDeliveries, setLoading } = useDeliveryStore();
  const { currentRole } = useAuthStore();
  const [loading, setLoadingLocal] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setLoadingLocal(true);
      try {
        const [statsRes, deliveriesRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/deliveries'),
        ]);
        const statsData = await statsRes.json();
        const deliveriesData = await deliveriesRes.json();
        setStats(statsData);
        setDeliveries(deliveriesData);
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
        setLoadingLocal(false);
      }
    }
    fetchData();
  }, [setStats, setDeliveries, setLoading]);

  const inTransit = deliveries.filter(d => d.status === 'in_transit').length;
  const assigned = deliveries.filter(d => d.status === 'assigned').length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (currentRole === 'driver') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {currentRole === 'admin' ? 'Operations Dashboard' : 'Fleet Overview'}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time overview of your logistics operations across India
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Deliveries"
          value={stats?.totalDeliveries || 0}
          subtitle={`${inTransit} in transit, ${assigned} assigned`}
          icon={Package}
          trend="+12% this week"
          trendUp={true}
          color="primary"
        />
        <StatCard
          title="Active Fleet"
          value={`${stats?.activeVehicles || 0}/${stats?.totalFleetSize || 0}`}
          subtitle="Vehicles on road"
          icon={Truck}
          trend="+3 since morning"
          trendUp={true}
          color="green"
        />
        <StatCard
          title="Delivered Today"
          value={stats?.deliveredToday || 0}
          subtitle={`${stats?.onTimeRate || 0}% on-time rate`}
          icon={CheckCircle2}
          trend="+8% vs yesterday"
          trendUp={true}
          color="green"
        />
        <StatCard
          title="Failed Deliveries"
          value={stats?.failedDeliveries || 0}
          subtitle="Requires attention"
          icon={AlertTriangle}
          trend="-2 vs yesterday"
          trendUp={false}
          color="red"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
                <p className="text-xl font-bold">{stats?.avgDeliveryTime || 0} <span className="text-sm font-normal text-muted-foreground">min</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Fuel className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Fuel Efficiency</p>
                <p className="text-xl font-bold">{stats?.avgFuelEfficiency || 0} <span className="text-sm font-normal text-muted-foreground">km/l</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Distance Today</p>
                <p className="text-xl font-bold">{Math.round(stats?.totalDistanceToday || 0)} <span className="text-sm font-normal text-muted-foreground">km</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Deliveries */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Deliveries</CardTitle>
                <CardDescription>Latest shipment updates</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">{deliveries.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <RecentDeliveriesTable deliveries={deliveries} />
          </CardContent>
        </Card>

        {/* City Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">City Performance</CardTitle>
                <CardDescription>On-time delivery rates</CardDescription>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <CityOverview />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}