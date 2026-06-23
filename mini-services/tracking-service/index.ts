import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

interface VehicleState {
  id: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  deliveryId: string | null;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  progress: number; // 0-1
  routePoints: Array<{ lat: number; lng: number }>;
}

const activeVehicles = new Map<string, VehicleState>();
let simulationInterval: ReturnType<typeof setInterval> | null = null;
let simulationRunning = false;

// Generate intermediate route points with slight randomness (Indian road simulation)
function generateRoutePoints(pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number, numPoints: number = 20): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const baseLat = pickupLat + (dropoffLat - pickupLat) * t;
    const baseLng = pickupLng + (dropoffLng - pickupLng) * t;
    // Add realistic road deviation
    const deviation = Math.sin(t * Math.PI * 3) * 0.003 + Math.cos(t * Math.PI * 5) * 0.001;
    points.push({
      lat: baseLat + deviation * (Math.random() - 0.5),
      lng: baseLng + deviation * (Math.random() - 0.5),
    });
  }
  return points;
}

// Initialize vehicles with sample data for Indian cities
const sampleVehicles = [
  { id: 'v-sample-1', lat: 28.62, lng: 77.22, pickupLat: 28.60, pickupLng: 77.20, dropoffLat: 28.65, dropoffLng: 77.25, deliveryId: 'd-sample-1', city: 'Delhi' },
  { id: 'v-sample-2', lat: 19.08, lng: 72.88, pickupLat: 19.05, pickupLng: 72.85, dropoffLat: 19.10, dropoffLng: 72.90, deliveryId: 'd-sample-2', city: 'Mumbai' },
  { id: 'v-sample-3', lat: 12.97, lng: 77.59, pickupLat: 12.94, pickupLng: 77.57, dropoffLat: 13.00, dropoffLng: 77.62, deliveryId: 'd-sample-3', city: 'Bangalore' },
  { id: 'v-sample-4', lat: 17.39, lng: 78.49, pickupLat: 17.37, pickupLng: 78.47, dropoffLat: 17.42, dropoffLng: 78.51, deliveryId: 'd-sample-4', city: 'Hyderabad' },
  { id: 'v-sample-5', lat: 13.08, lng: 80.27, pickupLat: 13.06, pickupLng: 80.25, dropoffLat: 13.10, dropoffLng: 80.29, deliveryId: 'd-sample-5', city: 'Chennai' },
  { id: 'v-sample-6', lat: 22.57, lng: 88.36, pickupLat: 22.55, pickupLng: 88.34, dropoffLat: 22.59, dropoffLng: 88.38, deliveryId: 'd-sample-6', city: 'Kolkata' },
  { id: 'v-sample-7', lat: 18.52, lng: 73.86, pickupLat: 18.50, pickupLng: 73.83, dropoffLat: 18.55, dropoffLng: 73.89, deliveryId: 'd-sample-7', city: 'Pune' },
  { id: 'v-sample-8', lat: 26.14, lng: 91.74, pickupLat: 26.12, pickupLng: 91.72, dropoffLat: 26.16, dropoffLng: 91.76, deliveryId: 'd-sample-8', city: 'Guwahati' },
];

function initializeVehicles() {
  for (const sv of sampleVehicles) {
    const progress = 0.2 + Math.random() * 0.5;
    const routePoints = generateRoutePoints(sv.pickupLat, sv.pickupLng, sv.dropoffLat, sv.dropoffLng);
    const pointIndex = Math.floor(progress * (routePoints.length - 1));
    const point = routePoints[pointIndex];

    activeVehicles.set(sv.id, {
      ...sv,
      lat: point.lat,
      lng: point.lng,
      speed: 15 + Math.random() * 35,
      heading: Math.random() * 360,
      progress,
      routePoints,
    });
  }
}

// Simulate GPS movement
function simulateMovement() {
  const now = new Date();
  // Indian peak hour multiplier
  const hour = now.getHours();
  const istHour = hour;
  let speedMultiplier = 1.0;
  if ((istHour >= 8 && istHour <= 11) || (istHour >= 17 && istHour <= 20)) {
    speedMultiplier = 0.5 + Math.random() * 0.3; // Peak hours: 50-80% speed
  } else if (istHour >= 12 && istHour <= 16) {
    speedMultiplier = 0.7 + Math.random() * 0.3; // Afternoon
  } else {
    speedMultiplier = 1.0 + Math.random() * 0.3; // Off-peak: normal to fast
  }

  const updates: Array<{
    vehicleId: string;
    deliveryId: string | null;
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    progress: number;
    eta: number;
    city: string;
  }> = [];

  for (const [id, vehicle] of activeVehicles) {
    // Advance progress
    vehicle.progress += (0.003 + Math.random() * 0.005) * speedMultiplier;

    if (vehicle.progress >= 1.0) {
      // Reset vehicle with new route
      vehicle.progress = 0;
      const sv = sampleVehicles.find(s => s.id === id);
      if (sv) {
        // Swap pickup/dropoff or create new random points
        const newDropLat = sv.pickupLat + (Math.random() - 0.5) * 0.08;
        const newDropLng = sv.pickupLng + (Math.random() - 0.5) * 0.08;
        vehicle.pickupLat = vehicle.lat;
        vehicle.pickupLng = vehicle.lng;
        vehicle.dropoffLat = newDropLat;
        vehicle.dropoffLng = newDropLng;
        vehicle.routePoints = generateRoutePoints(vehicle.pickupLat, vehicle.pickupLng, newDropLat, newDropLng);
        vehicle.deliveryId = `d-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      }
    }

    const pointIndex = Math.min(
      Math.floor(vehicle.progress * (vehicle.routePoints.length - 1)),
      vehicle.routePoints.length - 1
    );
    const point = vehicle.routePoints[pointIndex];

    vehicle.lat = point.lat + (Math.random() - 0.5) * 0.0005;
    vehicle.lng = point.lng + (Math.random() - 0.5) * 0.0005;
    vehicle.speed = Math.max(5, (15 + Math.random() * 35) * speedMultiplier);

    // Calculate heading
    if (pointIndex < vehicle.routePoints.length - 1) {
      const nextPoint = vehicle.routePoints[pointIndex + 1];
      vehicle.heading = (Math.atan2(nextPoint.lng - point.lng, nextPoint.lat - point.lat) * 180) / Math.PI;
    }

    // Calculate ETA (minutes)
    const remainingDist = (1 - vehicle.progress) * Math.sqrt(
      Math.pow((vehicle.dropoffLat - vehicle.pickupLat) * 111, 2) +
      Math.pow((vehicle.dropoffLng - vehicle.pickupLng) * 85, 2)
    );
    const eta = (remainingDist / Math.max(vehicle.speed, 1)) * 60;

    updates.push({
      vehicleId: id,
      deliveryId: vehicle.deliveryId,
      lat: vehicle.lat,
      lng: vehicle.lng,
      speed: Math.round(vehicle.speed * 10) / 10,
      heading: Math.round(vehicle.heading),
      progress: Math.round(vehicle.progress * 1000) / 1000,
      eta: Math.round(eta),
      city: sampleVehicles.find(s => s.id === id)?.city || 'Unknown',
    });
  }

  return updates;
}

io.on('connection', (socket) => {
  console.log(`[Tracking] Client connected: ${socket.id}`);

  // Send initial state
  const initialUpdates = Array.from(activeVehicles.values()).map((v) => ({
    vehicleId: v.id,
    deliveryId: v.deliveryId,
    lat: v.lat,
    lng: v.lng,
    speed: v.speed,
    heading: v.heading,
    progress: v.progress,
    eta: 10,
    city: sampleVehicles.find(s => s.id === v.id)?.city || 'Unknown',
  }));
  socket.emit('initial-state', { vehicles: initialUpdates });

  // Start simulation on request
  socket.on('start-simulation', () => {
    if (!simulationRunning) {
      simulationRunning = true;
      console.log('[Tracking] Simulation started');
      socket.emit('simulation-status', { running: true });
    }
  });

  socket.on('stop-simulation', () => {
    simulationRunning = false;
    console.log('[Tracking] Simulation stopped');
    socket.emit('simulation-status', { running: false });
  });

  // Manual GPS update from driver
  socket.on('gps-update', (data: { vehicleId: string; lat: number; lng: number; speed: number; heading: number }) => {
    const vehicle = activeVehicles.get(data.vehicleId);
    if (vehicle) {
      vehicle.lat = data.lat;
      vehicle.lng = data.lng;
      vehicle.speed = data.speed;
      vehicle.heading = data.heading;
      io.emit('vehicle-update', {
        vehicleId: data.vehicleId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        heading: data.heading,
        timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Tracking] Client disconnected: ${socket.id}`);
  });
});

// Simulation loop
function startSimulationLoop() {
  if (simulationInterval) clearInterval(simulationInterval);
  simulationInterval = setInterval(() => {
    if (simulationRunning && activeVehicles.size > 0) {
      const updates = simulateMovement();
      io.emit('batch-update', { updates, timestamp: new Date().toISOString() });
    }
  }, 2000);
}

// Initialize
initializeVehicles();
startSimulationLoop();
simulationRunning = true; // Auto-start for demo

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`[Tracking Service] Running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[Tracking] Shutting down...');
  if (simulationInterval) clearInterval(simulationInterval);
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Tracking] Shutting down...');
  if (simulationInterval) clearInterval(simulationInterval);
  httpServer.close(() => process.exit(0));
});