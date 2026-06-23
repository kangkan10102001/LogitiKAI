import { create } from 'zustand';
import type { Vehicle, GPSUpdate, DashboardStats, CityPerformance } from '@/types/logistics';

interface FleetState {
  vehicles: Vehicle[];
  gpsUpdates: Map<string, GPSUpdate>;
  stats: DashboardStats | null;
  cityPerformance: CityPerformance[];
  selectedVehicleId: string | null;
  cityFilter: string;
  statusFilter: string;
  isLoading: boolean;
  setVehicles: (vehicles: Vehicle[]) => void;
  updateVehiclePosition: (vehicleId: string, lat: number, lng: number, speed: number) => void;
  updateVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
  addGPSUpdate: (update: GPSUpdate) => void;
  setStats: (stats: DashboardStats) => void;
  setCityPerformance: (data: CityPerformance[]) => void;
  selectVehicle: (vehicleId: string | null) => void;
  setCityFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setLoading: (loading: boolean) => void;
  getFilteredVehicles: () => Vehicle[];
}

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: [],
  gpsUpdates: new Map(),
  stats: null,
  cityPerformance: [],
  selectedVehicleId: null,
  cityFilter: 'all',
  statusFilter: 'all',
  isLoading: false,

  setVehicles: (vehicles) => set({ vehicles }),

  updateVehiclePosition: (vehicleId, lat, lng, speed) => {
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, currentLat: lat, currentLng: lng, lastUpdate: new Date().toISOString() }
          : v
      ),
    }));
  },

  updateVehicleStatus: (vehicleId, status) => {
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === vehicleId ? { ...v, status } : v
      ),
    }));
  },

  addGPSUpdate: (update) => {
    const { gpsUpdates } = get();
    const newMap = new Map(gpsUpdates);
    newMap.set(update.vehicleId, update);
    set({ gpsUpdates: newMap });
  },

  setStats: (stats) => set({ stats }),
  setCityPerformance: (data) => set({ cityPerformance: data }),
  selectVehicle: (vehicleId) => set({ selectedVehicleId: vehicleId }),
  setCityFilter: (filter) => set({ cityFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setLoading: (loading) => set({ isLoading: loading }),

  getFilteredVehicles: () => {
    const { vehicles, cityFilter, statusFilter } = get();
    return vehicles.filter((v) => {
      if (cityFilter !== 'all' && v.cityId !== cityFilter) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      return true;
    });
  },
}));