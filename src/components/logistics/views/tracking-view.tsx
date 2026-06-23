'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { useFleetStore } from '@/stores/fleet-store';
import { useDeliveryStore } from '@/stores/delivery-store';
import {
  MapPin, Navigation, Clock, Truck, Package, Phone,
  Play, Pause, RefreshCw, ZoomIn, ZoomOut, Maximize2,
  Signal, Fuel, Route,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import type { GPSUpdate, Delivery, Vehicle } from '@/types/logistics';

interface LiveVehicle {
  vehicleId: string;
  deliveryId: string | null;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  progress: number;
  eta: number;
  city: string;
}

const CITY_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  Delhi: { lat: 28.6139, lng: 77.2090, zoom: 11 },
  Mumbai: { lat: 19.0760, lng: 72.8777, zoom: 11 },
  Bangalore: { lat: 12.9716, lng: 77.5946, zoom: 11 },
  Hyderabad: { lat: 17.3850, lng: 78.4867, zoom: 11 },
  Chennai: { lat: 13.0827, lng: 80.2707, zoom: 11 },
  Kolkata: { lat: 22.5726, lng: 88.3639, zoom: 11 },
  Pune: { lat: 18.5204, lng: 73.8567, zoom: 11 },
  Guwahati: { lat: 26.1445, lng: 91.7362, zoom: 11 },
  Jaipur: { lat: 26.9124, lng: 75.7873, zoom: 11 },
  Lucknow: { lat: 26.8467, lng: 80.9462, zoom: 11 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 11 },
  Chandigarh: { lat: 30.7333, lng: 76.7794, zoom: 11 },
};

function latLngToPixel(lat: number, lng: number, centerLat: number, centerLng: number, scale: number, width: number, height: number) {
  const x = width / 2 + (lng - centerLng) * scale * 85;
  const y = height / 2 - (lat - centerLat) * scale * 111;
  return { x, y };
}

function getVehicleColor(status: string, speed: number): string {
  if (speed < 5) return '#ef4444'; // Stopped - red
  if (speed < 20) return '#f59e0b'; // Slow - amber (traffic)
  if (speed < 40) return '#3b82f6'; // Normal - blue
  return '#22c55e'; // Fast - green
}

export function TrackingView() {
  const { socketConnected, setSocketConnected, selectedCity, setSelectedCity } = useAppStore();
  const { currentRole, currentUser } = useAuthStore();
  const { vehicles, setVehicles, updateVehiclePosition, updateVehicleStatus } = useFleetStore();
  const { deliveries, setDeliveries, updateDelivery } = useDeliveryStore();
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 22.5, lng: 79.0 });
  const [mapZoom, setMapZoom] = useState(5.5);
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const socketRef = useRef<Socket | null>(null);

  // Initialize data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [vehiclesRes, deliveriesRes] = await Promise.all([
          fetch('/api/vehicles'),
          fetch('/api/deliveries'),
        ]);
        setVehicles(await vehiclesRes.json());
        setDeliveries(await deliveriesRes.json());
      } catch (e) {
        console.error('Failed to fetch tracking data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [setVehicles, setDeliveries]);

  // Socket.IO connection
  useEffect(() => {
    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 15000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Tracking] Connected');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Tracking] Disconnected');
      setSocketConnected(false);
    });

    socket.on('initial-state', (data: { vehicles: LiveVehicle[] }) => {
      setLiveVehicles(data.vehicles);
    });

    socket.on('batch-update', (data: { updates: LiveVehicle[] }) => {
      setLiveVehicles((prev) => {
        const updated = new Map(prev.map((v) => [v.vehicleId, v]));
        for (const u of data.updates) {
          updated.set(u.vehicleId, u);
          // Update store vehicles
          updateVehiclePosition(u.vehicleId, u.lat, u.lng, u.speed);
          // Update delivery position if linked
          if (u.deliveryId) {
            updateDelivery(u.deliveryId, { currentLat: u.lat, currentLng: u.lng });
          }
        }
        return Array.from(updated.values());
      });
    });

    socket.on('simulation-status', (data: { running: boolean }) => {
      setSimulationRunning(data.running);
    });

    // Auto start simulation
    socket.emit('start-simulation');

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [setSocketConnected, updateVehiclePosition, updateDelivery]);

  // Draw map canvas
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Background gradient
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#1a1f2e' : '#e8edf5';
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 0.5;
    const gridSpacing = 30 * mapZoom;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw city labels and dots
    const cityNames = Object.keys(CITY_CENTERS);
    for (const cityName of cityNames) {
      const center = CITY_CENTERS[cityName];
      const pos = latLngToPixel(center.lat, center.lng, mapCenter.lat, mapCenter.lng, mapZoom, w, h);
      if (pos.x < -50 || pos.x > w + 50 || pos.y < -50 || pos.y > h + 50) continue;

      // City dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(96, 165, 250, 0.6)' : 'rgba(37, 99, 235, 0.5)';
      ctx.fill();

      // City label
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(cityName, pos.x, pos.y - 10);

      // Vehicle count
      const cityVehicles = liveVehicles.filter(v => v.city === cityName);
      if (cityVehicles.length > 0) {
        ctx.beginPath();
        ctx.arc(pos.x + 12, pos.y - 8, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.font = 'bold 9px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(String(cityVehicles.length), pos.x + 12, pos.y - 5);
      }
    }

    // Draw vehicle markers
    for (const v of liveVehicles) {
      const pos = latLngToPixel(v.lat, v.lng, mapCenter.lat, mapCenter.lng, mapZoom, w, h);
      if (pos.x < -30 || pos.x > w + 30 || pos.y < -30 || pos.y > h + 30) continue;

      const color = getVehicleColor('', v.speed);
      const isSelected = selectedVehicle?.vehicleId === v.vehicleId;

      // Selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Info tooltip
        ctx.fillStyle = isDark ? 'rgba(26,31,46,0.95)' : 'rgba(255,255,255,0.95)';
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        const tooltipW = 140;
        const tooltipH = 50;
        const tx = pos.x - tooltipW / 2;
        const ty = pos.y - 32 - tooltipH;
        ctx.beginPath();
        ctx.roundRect(tx, ty, tooltipW, tooltipH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.fillStyle = isDark ? '#fff' : '#111';
        ctx.textAlign = 'left';
        ctx.fillText(`Vehicle: ${v.vehicleId.slice(-6)}`, tx + 8, ty + 18);
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = isDark ? '#aaa' : '#666';
        ctx.fillText(`${v.speed} km/h | ETA: ${v.eta} min`, tx + 8, ty + 33);
        ctx.fillText(`Progress: ${Math.round(v.progress * 100)}%`, tx + 8, ty + 45);
      }

      // Vehicle marker
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isSelected ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = isDark ? '#1a1f2e' : '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Speed label
      ctx.font = '8px Inter, system-ui, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(`${v.speed}`, pos.x, pos.y + 14);
    }

    // Legend
    const legendX = w - 160;
    const legendY = 16;
    ctx.fillStyle = isDark ? 'rgba(26,31,46,0.9)' : 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, 145, 80, 8);
    ctx.fill();
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'bold 10px Inter, system-ui, sans-serif';
    ctx.fillStyle = isDark ? '#fff' : '#111';
    ctx.textAlign = 'left';
    ctx.fillText('Speed Legend', legendX + 10, legendY + 18);

    const legends = [
      { color: '#ef4444', label: 'Stopped (<5 km/h)' },
      { color: '#f59e0b', label: 'Slow - Traffic' },
      { color: '#3b82f6', label: 'Normal (20-40)' },
      { color: '#22c55e', label: 'Fast (>40 km/h)' },
    ];
    legends.forEach((l, i) => {
      const ly = legendY + 30 + i * 13;
      ctx.beginPath();
      ctx.arc(legendX + 16, ly - 3, 3, 0, Math.PI * 2);
      ctx.fillStyle = l.color;
      ctx.fill();
      ctx.font = '9px Inter, system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#ccc' : '#555';
      ctx.fillText(l.label, legendX + 24, ly);
    });

    animFrameRef.current = requestAnimationFrame(drawMap);
  }, [liveVehicles, mapCenter, mapZoom, selectedVehicle]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(drawMap);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [drawMap]);

  // Handle city filter
  useEffect(() => {
    if (selectedCity === 'all') {
      setMapCenter({ lat: 22.5, lng: 79.0 });
      setMapZoom(5.5);
    } else if (CITY_CENTERS[selectedCity]) {
      setMapCenter({ lat: CITY_CENTERS[selectedCity].lat, lng: CITY_CENTERS[selectedCity].lng });
      setMapZoom(CITY_CENTERS[selectedCity].zoom);
    }
  }, [selectedCity]);

  const handleZoomIn = () => setMapZoom((z) => Math.min(z * 1.3, 18));
  const handleZoomOut = () => setMapZoom((z) => Math.max(z / 1.3, 3));

  const toggleSimulation = () => {
    if (socketRef.current) {
      if (simulationRunning) {
        socketRef.current.emit('stop-simulation');
      } else {
        socketRef.current.emit('start-simulation');
      }
    }
  };

  const inTransitDeliveries = deliveries.filter(d => d.status === 'in_transit');

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[500px] lg:col-span-2" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Live Tracking
            {socketConnected && (
              <span className="flex items-center gap-1 text-sm font-normal text-green-600 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500 status-pulse" />
                Real-time
              </span>
            )}
          </h2>
          <p className="text-muted-foreground text-sm">GPS tracking across {liveVehicles.length} active vehicles</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant={simulationRunning ? 'default' : 'outline'}
            size="sm"
            onClick={toggleSimulation}
          >
            {simulationRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {simulationRunning ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardContent className="p-0 relative">
            <div className="relative w-full" style={{ height: currentRole === 'driver' ? 'calc(100vh - 200px)' : '500px' }}>
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            {/* City selector overlay */}
            <div className="absolute top-3 left-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs bg-card/90 backdrop-blur-sm border rounded-lg px-3 py-1.5 font-medium"
              >
                <option value="all">All India</option>
                {Object.keys(CITY_CENTERS).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Vehicle list */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Vehicles ({liveVehicles.length})</CardTitle>
            <CardDescription>Click a vehicle to highlight</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[420px] logistics-scroll">
              {liveVehicles.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Waiting for GPS data...
                </div>
              ) : (
                <div className="divide-y">
                  {liveVehicles.map((v) => (
                    <button
                      key={v.vehicleId}
                      onClick={() => setSelectedVehicle(selectedVehicle?.vehicleId === v.vehicleId ? null : v)}
                      className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                        selectedVehicle?.vehicleId === v.vehicleId ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: getVehicleColor('', v.speed) }}
                          />
                          <span className="text-sm font-medium font-mono">{v.vehicleId.slice(-6)}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{v.city}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />{v.speed} km/h
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />ETA {v.eta} min
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                          <span>Progress</span>
                          <span>{Math.round(v.progress * 100)}%</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                            style={{ width: `${v.progress * 100}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}