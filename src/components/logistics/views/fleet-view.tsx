'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Truck, Search, Fuel, Gauge, MapPin, Wrench, User,
  Package, Activity,
} from 'lucide-react';
import { useFleetStore } from '@/stores/fleet-store';
import type { Vehicle } from '@/types/logistics';

const vehicleTypeIcons: Record<string, string> = {
  truck: '🚛',
  van: '🚐',
  bike: '🏍️',
  tempo: '🚚',
};

const vehicleTypeLabels: Record<string, string> = {
  truck: 'Heavy Truck',
  van: 'Delivery Van',
  bike: 'Bike Courier',
  tempo: 'Tempo',
};

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  in_transit: { label: 'In Transit', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  maintenance: { label: 'Maintenance', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
};

export function FleetView() {
  const { vehicles, setVehicles, cityFilter, setCityFilter, statusFilter, setStatusFilter, getFilteredVehicles } = useFleetStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        setVehicles(data);
      } catch (e) {
        console.error('Failed to fetch vehicles', e);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, [setVehicles]);

  const filtered = getFilteredVehicles().filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.vehicleNo.toLowerCase().includes(q) ||
      (v.driver?.name || '').toLowerCase().includes(q) ||
      v.city?.name?.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q)
    );
  });

  const totalVehicles = vehicles.length;
  const available = vehicles.filter(v => v.status === 'available').length;
  const inTransit = vehicles.filter(v => v.status === 'in_transit').length;
  const maintenance = vehicles.filter(v => v.status === 'maintenance').length;

  const cities = Array.from(new Set(vehicles.map(v => v.city?.name).filter(Boolean) as string[])).sort();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Fleet Management</h2>
        <p className="text-muted-foreground text-sm">Manage vehicles and drivers across {cities.length} cities</p>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Truck className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{totalVehicles}</p>
              <p className="text-xs text-muted-foreground">Total Fleet</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"><Activity className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{available}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><MapPin className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{inTransit}</p>
              <p className="text-xs text-muted-foreground">In Transit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"><Wrench className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{maintenance}</p>
              <p className="text-xs text-muted-foreground">Maintenance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, drivers..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle Grid/Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Driver</TableHead>
                  <TableHead className="hidden lg:table-cell">City</TableHead>
                  <TableHead className="hidden sm:table-cell">Capacity</TableHead>
                  <TableHead className="hidden lg:table-cell">Fuel Eff.</TableHead>
                  <TableHead className="hidden md:table-cell">Total KMs</TableHead>
                  <TableHead className="hidden sm:table-cell">Active Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{vehicleTypeIcons[v.type]}</span>
                        <span className="font-mono text-sm font-medium">{v.vehicleNo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{vehicleTypeLabels[v.type]}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusConfig[v.status]?.className}>
                        {statusConfig[v.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {v.driver ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                            {v.driver.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          {v.driver.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {v.city?.name && (
                        <Badge variant="outline" className="text-xs">{v.city.name}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{v.capacity} kg</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{v.fuelEfficiency.toFixed(1)} km/l</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{v.totalKms.toLocaleString()} km</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {v.deliveries?.length > 0 ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          {v.deliveries.length}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}