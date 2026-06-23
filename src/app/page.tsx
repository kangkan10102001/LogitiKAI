'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { AppSidebar } from '@/components/logistics/app-sidebar';
import { AppHeader } from '@/components/logistics/app-header';
import { DashboardView } from '@/components/logistics/views/dashboard-view';
import { TrackingView } from '@/components/logistics/views/tracking-view';
import { DeliveriesView } from '@/components/logistics/views/deliveries-view';
import { FleetView } from '@/components/logistics/views/fleet-view';
import { AnalyticsView } from '@/components/logistics/views/analytics-view';
import { DriverView } from '@/components/logistics/views/driver-view';
import { CitiesView } from '@/components/logistics/views/cities-view';
import { SettingsView } from '@/components/logistics/views/settings-view';
import { useAppStore } from '@/stores/app-store';
import { useAuthStore } from '@/stores/auth-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Truck } from 'lucide-react';
import { useTheme } from 'next-themes';

function AppContent() {
  const { activeView, sidebarOpen, setIsMobile, setSidebarOpen } = useAppStore();
  const { currentRole, addNotification } = useAuthStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMobile(isMobile);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, setIsMobile, setSidebarOpen]);

  // Add some demo notifications
  useEffect(() => {
    const timer1 = setTimeout(() => {
      addNotification({
        title: 'Peak Hour Alert',
        message: 'Mumbai traffic congestion at 78%. Route optimization active for 12 deliveries.',
        type: 'warning',
      });
    }, 3000);
    const timer2 = setTimeout(() => {
      addNotification({
        title: 'Delivery Completed',
        message: 'LK2026000043 delivered in Bangalore - Koramangala to Whitefield.',
        type: 'success',
      });
    }, 8000);
    const timer3 = setTimeout(() => {
      addNotification({
        title: 'New Assignment',
        message: 'Urgent COD delivery assigned in Delhi NCR region.',
        type: 'info',
      });
    }, 15000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, [addNotification]);

  // Auto-switch to driver-view for driver role
  useEffect(() => {
    if (currentRole === 'driver' && activeView !== 'tracking' && activeView !== 'driver-view') {
      useAppStore.getState().setActiveView('driver-view');
    }
  }, [currentRole, activeView]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'tracking': return <TrackingView />;
      case 'deliveries': return <DeliveriesView />;
      case 'fleet': return <FleetView />;
      case 'analytics': return <AnalyticsView />;
      case 'driver-view': return <DriverView />;
      case 'cities': return <CitiesView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  const isDriverMode = currentRole === 'driver';
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden bg-background ${isDriverMode ? '' : ''}`}>
      {/* Sidebar - hidden in driver mode on mobile */}
      {!isDriverMode && <AppSidebar />}

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isDriverMode ? '' : 'lg:ml-0'}`}>
        {!isDriverMode && <AppHeader />}
        {/* Driver mode: minimal top bar with theme toggle and role switcher */}
        {isDriverMode && (
          <div className="flex items-center justify-between px-4 py-2 border-b bg-card/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[var(--logistics-blue)] to-[var(--logistics-green)] flex items-center justify-center">
                <Truck className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">LogistiKAI</span>
              <span className="text-[10px] text-muted-foreground">Driver</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button
                variant="outline" size="sm" className="h-8 text-xs"
                onClick={() => useAuthStore.getState().switchRole('admin')}
              >
                Switch to Admin
              </Button>
            </div>
          </div>
        )}
        <main className={`flex-1 overflow-y-auto logistics-scroll ${isDriverMode ? '' : 'p-4 lg:p-6'}`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function LogisticsApp() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AppContent />
    </ThemeProvider>
  );
}