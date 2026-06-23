import { create } from 'zustand';
import type { Delivery, DeliveryStatus } from '@/types/logistics';

interface DeliveryState {
  deliveries: Delivery[];
  selectedDelivery: Delivery | null;
  statusFilter: DeliveryStatus | 'all';
  cityFilter: string;
  priorityFilter: string;
  isLoading: boolean;
  setDeliveries: (deliveries: Delivery[]) => void;
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  addDelivery: (delivery: Delivery) => void;
  selectDelivery: (delivery: Delivery | null) => void;
  setStatusFilter: (filter: DeliveryStatus | 'all') => void;
  setCityFilter: (filter: string) => void;
  setPriorityFilter: (filter: string) => void;
  setLoading: (loading: boolean) => void;
  getFilteredDeliveries: () => Delivery[];
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  selectedDelivery: null,
  statusFilter: 'all',
  cityFilter: 'all',
  priorityFilter: 'all',
  isLoading: false,

  setDeliveries: (deliveries) => set({ deliveries }),
  
  updateDelivery: (id, updates) => {
    set((state) => ({
      deliveries: state.deliveries.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
      selectedDelivery:
        state.selectedDelivery?.id === id
          ? { ...state.selectedDelivery, ...updates }
          : state.selectedDelivery,
    }));
  },

  addDelivery: (delivery) => {
    set((state) => ({
      deliveries: [delivery, ...state.deliveries],
    }));
  },

  selectDelivery: (delivery) => set({ selectedDelivery: delivery }),

  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setCityFilter: (filter) => set({ cityFilter: filter }),
  setPriorityFilter: (filter) => set({ priorityFilter: filter }),
  setLoading: (loading) => set({ isLoading: loading }),

  getFilteredDeliveries: () => {
    const { deliveries, statusFilter, cityFilter, priorityFilter } = get();
    return deliveries.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (cityFilter !== 'all' && d.pickupCity !== cityFilter && d.dropoffCity !== cityFilter) return false;
      if (priorityFilter !== 'all' && d.priority !== priorityFilter) return false;
      return true;
    });
  },
}));