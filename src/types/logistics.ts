export type UserRole = 'admin' | 'manager' | 'driver';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  city?: string;
  isActive: boolean;
}

export interface City {
  id: string;
  name: string;
  state: string;
  type: 'metro' | 'tier2';
  lat: number;
  lng: number;
  timezone: string;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  vehicleNo: string;
  type: 'truck' | 'van' | 'bike' | 'tempo';
  capacity: number;
  fuelType: string;
  status: 'available' | 'in_transit' | 'maintenance';
  currentLat?: number;
  currentLng?: number;
  lastUpdate?: string;
  totalKms: number;
  fuelEfficiency: number;
  cityId: string;
  city?: City;
  driverId?: string;
  driver?: User;
}

export type DeliveryStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
export type DeliveryPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Delivery {
  id: string;
  trackingNo: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupCity: string;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffCity: string;
  estimatedDistance: number;
  estimatedTime: number;
  actualDistance?: number;
  actualTime?: number;
  scheduledPickup?: string;
  scheduledDelivery?: string;
  actualPickup?: string;
  actualDelivery?: string;
  recipientName: string;
  recipientPhone: string;
  recipientPincode: string;
  weight?: number;
  codAmount?: number;
  remarks?: string;
  currentLat?: number;
  currentLng?: number;
  cityId: string;
  city?: City;
  vehicleId?: string;
  vehicle?: Vehicle;
  driverId?: string;
  driver?: User;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingPoint {
  id: string;
  deliveryId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: string;
}

export interface GPSUpdate {
  vehicleId: string;
  driverId?: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: string;
  deliveryId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface DashboardStats {
  totalDeliveries: number;
  activeDeliveries: number;
  deliveredToday: number;
  failedDeliveries: number;
  avgDeliveryTime: number;
  onTimeRate: number;
  totalFleetSize: number;
  activeVehicles: number;
  avgFuelEfficiency: number;
  totalDistanceToday: number;
}

export interface CityPerformance {
  city: string;
  deliveries: number;
  onTimeRate: number;
  avgTime: number;
  revenue: number;
}

export interface HourlyTrafficPattern {
  hour: number;
  congestionLevel: number; // 0-100
  label: string;
}