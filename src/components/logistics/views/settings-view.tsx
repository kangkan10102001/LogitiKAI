'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useAppStore } from '@/stores/app-store';
import {
  Settings, Bell, Map, Shield, Globe, Smartphone,
  Volume2, Moon, Sun, Monitor, Info,
} from 'lucide-react';
import { useTheme } from 'next-themes';

export function SettingsView() {
  const { currentUser, currentRole } = useAuthStore();
  const { socketConnected } = useAppStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm">Configure your LogistiKAI platform</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />Profile & Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
              {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div>
              <p className="font-semibold">{currentUser?.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
              <Badge variant="secondary" className="mt-1 capitalize">{currentRole}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <Sun className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm font-medium">Light</p>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <Moon className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm font-medium">Dark</p>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <Monitor className="h-6 w-6 mx-auto mb-1" />
              <p className="text-sm font-medium">System</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Delivery status updates', desc: 'Get notified when delivery status changes', defaultChecked: true },
            { label: 'GPS alerts', desc: 'Vehicle speed and geofence alerts', defaultChecked: true },
            { label: 'Peak hour warnings', desc: 'Alerts before traffic peak hours in your city', defaultChecked: true },
            { label: 'Failed delivery alerts', desc: 'Immediate notification on delivery failures', defaultChecked: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* GPS & Tracking */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Map className="h-4 w-4" />GPS & Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Real-time GPS</p>
              <p className="text-xs text-muted-foreground">Live vehicle tracking via Socket.IO</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Badge variant={socketConnected ? 'default' : 'secondary'} className="text-xs">
                {socketConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Traffic-Aware Routing</p>
              <p className="text-xs text-muted-foreground">Auto-adjust routes based on Indian traffic patterns</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">GPS Update Frequency</p>
              <p className="text-xs text-muted-foreground">How often to poll vehicle location</p>
            </div>
            <Badge variant="outline" className="text-xs">2 sec</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Region */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />Region & Locale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Region</p>
            <Badge variant="outline">India</Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Timezone</p>
            <Badge variant="outline">IST (UTC+5:30)</Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Distance Unit</p>
            <Badge variant="outline">Kilometers</Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Currency</p>
            <Badge variant="outline">INR (₹)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}