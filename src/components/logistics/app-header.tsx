'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UserRole } from '@/types/logistics';

const roleColors: Record<UserRole, string> = {
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  manager: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  driver: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  driver: 'Driver',
};

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { currentUser, currentRole, switchRole, notifications, markNotificationRead } = useAuthStore();
  const { socketConnected } = useAppStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-md px-4 lg:px-6">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => useAppStore.getState().toggleSidebar()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deliveries, vehicles, drivers..."
            className="pl-9 bg-background/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Socket Status */}
        <div className="flex items-center gap-1.5 text-xs">
          {socketConnected ? (
            <><Wifi className="h-3.5 w-3.5 text-green-500" /><span className="text-green-600 dark:text-green-400 hidden sm:inline">Live</span></>
          ) : (
            <><WifiOff className="h-3.5 w-3.5 text-red-500" /><span className="text-red-600 dark:text-red-400 hidden sm:inline">Offline</span></>
          )}
        </div>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="max-h-72">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">No notifications yet</div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className={`p-3 cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                    onClick={() => markNotificationRead(n.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User / Role Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">{currentUser?.name || 'User'}</p>
                <p className="text-[11px] text-muted-foreground">{roleLabels[currentRole]}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(['admin', 'manager', 'driver'] as UserRole[]).map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => switchRole(role)}
                className="flex items-center justify-between"
              >
                <span>{roleLabels[role]}</span>
                {currentRole === role && <Badge className={`text-[10px] ${roleColors[role]}`}>Active</Badge>}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="p-2 text-[11px] text-muted-foreground">
              Role switching is for demo purposes. In production, each role has its own auth.
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}