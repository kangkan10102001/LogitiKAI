'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package, Navigation, Clock, MapPin, Phone, CheckCircle2,
  ArrowRight, Truck, Route, Signal, Fuel,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useDeliveryStore } from '@/stores/delivery-store';
import { useAppStore } from '@/stores/app-store';
import { useFleetStore } from '@/stores/fleet-store';
import type { Delivery } from '@/types/logistics';

export function DriverView() {
  const { currentUser } = useAuthStore();
  const { deliveries, setDeliveries, updateDelivery } = useDeliveryStore();
  const { vehicles, setVehicles } = useFleetStore();
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [deliveriesRes, vehiclesRes] = await Promise.all([
          fetch('/api/deliveries'),
          fetch('/api/vehicles'),
        ]);
        const deliveriesData = await deliveriesRes.json();
        const vehiclesData = await vehiclesRes.json();
        setDeliveries(deliveriesData);
        setVehicles(vehiclesData);

        // Find driver's active delivery
        const myDelivery = deliveriesData.find(
          (d: Delivery) => d.driverId === currentUser?.id && (d.status === 'assigned' || d.status === 'in_transit')
        );
        if (myDelivery) {
          setActiveDelivery(myDelivery);
          setEta(Math.max(5, Math.round(myDelivery.estimatedTime * 0.4)));
        }
      } catch (e) {
        console.error('Failed to fetch driver data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser?.id, setDeliveries, setVehicles]);

  const handleStatusUpdate = (status: 'in_transit' | 'delivered') => {
    if (activeDelivery) {
      updateDelivery(activeDelivery.id, { status });
      setActiveDelivery({ ...activeDelivery, status });
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-40" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  const myVehicles = vehicles.filter(v => v.driverId === currentUser?.id);
  const myCompletedToday = deliveries.filter(
    d => d.driverId === currentUser?.id && d.status === 'delivered'
  ).length;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      {/* Driver Header */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Welcome back,</p>
              <h2 className="text-xl font-bold">{currentUser?.name}</h2>
              <p className="text-xs opacity-70 mt-0.5">{currentUser?.phone}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-300">
                <Signal className="h-4 w-4" />
                <span className="text-sm font-medium">Online</span>
              </div>
              <p className="text-xs opacity-70 mt-1">{myCompletedToday} completed today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Delivery Card */}
      {activeDelivery ? (
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Active Delivery
              </CardTitle>
              <Badge className={
                activeDelivery.status === 'in_transit'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
              }>
                {activeDelivery.status === 'in_transit' ? 'In Transit' : 'Assigned'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Route Info */}
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="w-0.5 h-16 bg-gradient-to-b from-green-500 via-blue-500 to-red-500 my-1" />
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="text-sm font-medium">{activeDelivery.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Drop-off</p>
                    <p className="text-sm font-medium">{activeDelivery.dropoffAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ETA & Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold">{eta}</p>
                <p className="text-[10px] text-muted-foreground">ETA (min)</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Route className="h-4 w-4 mx-auto text-green-500 mb-1" />
                <p className="text-lg font-bold">{activeDelivery.estimatedDistance}</p>
                <p className="text-[10px] text-muted-foreground">Distance (km)</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Navigation className="h-4 w-4 mx-auto text-purple-500 mb-1" />
                <p className="text-lg font-bold">24</p>
                <p className="text-[10px] text-muted-foreground">Speed (km/h)</p>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Pickup</span>
                <span>Drop-off</span>
              </div>
              <Progress value={activeDelivery.status === 'in_transit' ? 55 : 10} className="h-2" />
              <p className="text-center text-xs text-muted-foreground mt-1">
                {activeDelivery.status === 'in_transit' ? 'On the way — traffic-aware routing active' : 'Ready to start — navigate to pickup point'}
              </p>
            </div>

            {/* Recipient Info */}
            <div className="p-3 rounded-lg bg-muted/30 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Recipient</p>
              <p className="text-sm font-medium">{activeDelivery.recipientName}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{activeDelivery.recipientPhone}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{activeDelivery.recipientPincode}</span>
              </div>
              {activeDelivery.codAmount && (
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  COD: ₹{activeDelivery.codAmount.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {activeDelivery.status === 'assigned' && (
                <Button className="flex-1" onClick={() => handleStatusUpdate('in_transit')}>
                  <Navigation className="h-4 w-4 mr-2" />Start Delivery
                </Button>
              )}
              {activeDelivery.status === 'in_transit' && (
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('delivered')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />Mark Delivered
                </Button>
              )}
              <Button variant="outline" className="shrink-0">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="font-semibold">No Active Delivery</h3>
            <p className="text-sm text-muted-foreground mt-1">All assigned deliveries completed. Waiting for new assignment.</p>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium">Today&apos;s Summary</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{myCompletedToday}</p>
              <p className="text-xs text-muted-foreground">deliveries completed</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Info */}
      {myVehicles.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />My Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myVehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium font-mono">{v.vehicleNo}</p>
                  <p className="text-xs text-muted-foreground capitalize">{v.type} · {v.fuelType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{v.totalKms.toLocaleString()} km</p>
                  <p className="text-xs text-muted-foreground">{v.fuelEfficiency.toFixed(1)} km/l</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats for Mobile */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{myCompletedToday}</p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {deliveries.filter(d => d.driverId === currentUser?.id && d.status === 'in_transit').length}
              </p>
              <p className="text-[10px] text-muted-foreground">In Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}