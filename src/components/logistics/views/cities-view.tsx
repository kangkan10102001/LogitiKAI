'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Building2, MapPin, Truck, Package, Users, TrendingUp,
} from 'lucide-react';
import type { City } from '@/types/logistics';

export function CitiesView() {
  const [cities, setCities] = useState<Array<City & { _count: { vehicles: number; deliveries: number } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCities() {
      setLoading(true);
      try {
        const res = await fetch('/api/cities');
        const data = await res.json();
        setCities(data);
      } catch (e) {
        console.error('Failed to fetch cities', e);
      } finally {
        setLoading(false);
      }
    }
    fetchCities();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  const totalVehicles = cities.reduce((s, c) => s + c._count.vehicles, 0);
  const totalDeliveries = cities.reduce((s, c) => s + c._count.deliveries, 0);
  const metroCities = cities.filter(c => c.type === 'metro');
  const tier2Cities = cities.filter(c => c.type === 'tier2');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Multi-City Operations</h2>
        <p className="text-muted-foreground text-sm">Managing logistics across {cities.length} Indian cities</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{cities.length}</p>
              <p className="text-xs text-muted-foreground">Active Cities</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><Truck className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{totalVehicles}</p>
              <p className="text-xs text-muted-foreground">Total Vehicles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"><Package className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{totalDeliveries}</p>
              <p className="text-xs text-muted-foreground">Total Deliveries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"><TrendingUp className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{metroCities.length}/{tier2Cities.length}</p>
              <p className="text-xs text-muted-foreground">Metro / Tier-2</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => {
          const utilization = city._count.vehicles > 0
            ? Math.round((city._count.deliveries / city._count.vehicles) * 10)
            : 0;
          return (
            <Card key={city.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{city.name}</CardTitle>
                      <CardDescription>{city.state}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={city.type === 'metro' ? 'default' : 'secondary'} className="text-[10px]">
                    {city.type === 'metro' ? 'Metro' : 'Tier-2'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{city._count.vehicles}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Truck className="h-3 w-3" />Vehicles
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{city._count.deliveries}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Package className="h-3 w-3" />Deliveries
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Fleet utilization</span>
                    <span>{Math.min(utilization, 100)}%</span>
                  </div>
                  <Progress value={Math.min(utilization, 100)} className="h-1.5" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}