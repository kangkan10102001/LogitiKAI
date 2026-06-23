import { create } from 'zustand';
import type { User, UserRole, Notification } from '@/types/logistics';

interface AuthState {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  notifications: Notification[];
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const defaultAdmin: User = {
  id: 'u-admin-001',
  email: 'admin@logistikai.in',
  name: 'Kangkan Patowary',
  phone: '+91 98765 43210',
  role: 'admin',
  city: 'Delhi',
  isActive: true,
};

const defaultManager: User = {
  id: 'u-mgr-001',
  email: 'manager@logistikai.in',
  name: 'Priya Patel',
  phone: '+91 87654 32109',
  role: 'manager',
  city: 'Mumbai',
  isActive: true,
};

const defaultDriver: User = {
  id: 'u-drv-001',
  email: 'driver@logistikai.in',
  name: 'Suresh Kumar',
  phone: '+91 76543 21098',
  role: 'driver',
  city: 'Bangalore',
  isActive: true,
};

const roleUserMap: Record<UserRole, User> = {
  admin: defaultAdmin,
  manager: defaultManager,
  driver: defaultDriver,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: defaultAdmin,
  currentRole: 'admin',
  isAuthenticated: true,
  notifications: [],

  login: (user: User) => set({ currentUser: user, isAuthenticated: true, currentRole: user.role }),
  
  logout: () => set({ currentUser: null, isAuthenticated: false, notifications: [] }),
  
  switchRole: (role: UserRole) => {
    const user = roleUserMap[role];
    set({ currentRole: role, currentUser: user });
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
    }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),
}));