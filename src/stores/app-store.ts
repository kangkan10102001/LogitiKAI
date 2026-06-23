import { create } from 'zustand';

interface AppState {
  activeView: string;
  sidebarOpen: boolean;
  isMobile: boolean;
  socketConnected: boolean;
  simulationRunning: boolean;
  selectedCity: string;
  setActiveView: (view: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setIsMobile: (mobile: boolean) => void;
  setSocketConnected: (connected: boolean) => void;
  setSimulationRunning: (running: boolean) => void;
  setSelectedCity: (city: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeView: 'dashboard',
  sidebarOpen: true,
  isMobile: false,
  socketConnected: false,
  simulationRunning: false,
  selectedCity: 'all',

  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  setSocketConnected: (connected) => set({ socketConnected: connected }),
  setSimulationRunning: (running) => set({ simulationRunning: running }),
  setSelectedCity: (city) => set({ selectedCity: city }),
}));