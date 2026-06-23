'use client';

import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  MapPin,
  Package,
  Truck,
  BarChart3,
  Smartphone,
  Building2,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import type { UserRole } from '@/types/logistics';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'] },
  { id: 'tracking', label: 'Live Tracking', icon: MapPin, roles: ['admin', 'manager', 'driver'], badge: 'LIVE' },
  { id: 'deliveries', label: 'Deliveries', icon: Package, roles: ['admin', 'manager'] },
  { id: 'fleet', label: 'Fleet Management', icon: Truck, roles: ['admin', 'manager'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'manager'] },
  { id: 'driver-view', label: 'Driver App', icon: Smartphone, roles: ['driver'] },
  { id: 'cities', label: 'Cities', icon: Building2, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager'] },
];

export function AppSidebar() {
  const { currentRole } = useAuthStore();
  const { activeView, setActiveView, sidebarOpen, setSidebarOpen, isMobile } = useAppStore();

  const filteredItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar border-r flex flex-col transition-transform duration-300 ease-in-out no-theme-transition',
          'lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[var(--logistics-blue)] to-[var(--logistics-green)] flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">LogistiKAI</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">India&apos;s Smart Logistics</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3 logistics-scroll">
          <nav className="px-3 space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70'
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={isActive ? 'secondary' : 'outline'}
                      className={cn(
                        'text-[10px] px-1.5 py-0',
                        item.badge === 'LIVE' && !isActive && 'text-green-600 border-green-300 dark:text-green-400 dark:border-green-700'
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <div className="h-2 w-2 rounded-full bg-green-500 status-pulse" />
            <span className="text-xs text-muted-foreground">System Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}