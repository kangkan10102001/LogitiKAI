'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Package, Search, Filter, MapPin, Clock, Truck, Phone,
  ChevronLeft, ChevronRight, ArrowUpDown, ExternalLink,
} from 'lucide-react';
import { useDeliveryStore } from '@/stores/delivery-store';
import { useAppStore } from '@/stores/app-store';
import type { Delivery, DeliveryStatus, DeliveryPriority } from '@/types/logistics';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  assigned: { label: 'Assigned', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  in_transit: { label: 'In Transit', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

export function DeliveriesView() {
  const {
    deliveries, setDeliveries, statusFilter, setStatusFilter,
    cityFilter, setCityFilter, priorityFilter, setPriorityFilter,
    getFilteredDeliveries, selectDelivery, selectedDelivery, updateDelivery,
  } = useDeliveryStore();
  const { setActiveView } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    async function fetchDeliveries() {
      setLoading(true);
      try {
        const res = await fetch('/api/deliveries');
        const data = await res.json();
        setDeliveries(data);
      } catch (e) {
        console.error('Failed to fetch deliveries', e);
      } finally {
        setLoading(false);
      }
    }
    fetchDeliveries();
  }, [setDeliveries]);

  const filtered = getFilteredDeliveries().filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.trackingNo.toLowerCase().includes(q) ||
      d.recipientName.toLowerCase().includes(q) ||
      d.pickupAddress.toLowerCase().includes(q) ||
      d.dropoffAddress.toLowerCase().includes(q) ||
      d.pickupCity.toLowerCase().includes(q) ||
      d.dropoffCity.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const cities = Array.from(new Set(deliveries.flatMap(d => [d.pickupCity, d.dropoffCity]))).sort();

  const handleStatusChange = async (deliveryId: string, newStatus: DeliveryStatus) => {
    updateDelivery(deliveryId, { status: newStatus });
    try {
      await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      // Optimistic update, API patch is a nice-to-have
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deliveries</h2>
          <p className="text-muted-foreground text-sm">{filtered.length} shipments found</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tracking #, recipient, address..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as DeliveryStatus | 'all'); setPage(0); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cityFilter} onValueChange={(v) => { setCityFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Tracking #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="hidden md:table-cell">Route</TableHead>
                  <TableHead className="hidden lg:table-cell">Recipient</TableHead>
                  <TableHead className="hidden sm:table-cell">Distance</TableHead>
                  <TableHead className="hidden lg:table-cell">Driver</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No deliveries match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((d) => (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => { selectDelivery(d); setShowDetail(true); }}
                    >
                      <TableCell className="font-mono text-xs">{d.trackingNo}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusConfig[d.status]?.className}>
                          {statusConfig[d.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${priorityConfig[d.priority]?.className}`}>
                          {priorityConfig[d.priority]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{d.pickupCity}</div>
                        <div className="text-xs text-muted-foreground">→ {d.dropoffCity}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">{d.recipientName}</div>
                        <div className="text-xs text-muted-foreground">{d.recipientPincode}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{d.estimatedDistance} km</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {d.driver?.name || <span className="text-muted-foreground">Unassigned</span>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">
              Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                if (p >= totalPages) return null;
                return (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)}>
                    {p + 1}
                  </Button>
                );
              })}
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {showDetail && selectedDelivery && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {selectedDelivery.trackingNo}
                </CardTitle>
                <CardDescription>Delivery details & status management</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setShowDetail(false); selectDelivery(null); }}>Close</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="secondary" className={statusConfig[selectedDelivery.status]?.className}>
                    {statusConfig[selectedDelivery.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Quick Actions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['assigned', 'in_transit', 'delivered'] as DeliveryStatus[]).filter(s => s !== selectedDelivery.status).map(s => (
                      <Button key={s} variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleStatusChange(selectedDelivery.id, s)}>
                        Mark {statusConfig[s]?.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <Badge variant="outline" className={priorityConfig[selectedDelivery.priority]?.className}>
                    {priorityConfig[selectedDelivery.priority]?.label}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <div><p className="font-medium text-xs text-muted-foreground">Pickup</p><p className="text-xs">{selectedDelivery.pickupAddress}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <div><p className="font-medium text-xs text-muted-foreground">Dropoff</p><p className="text-xs">{selectedDelivery.dropoffAddress}</p></div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-xs text-muted-foreground">Recipient</p>
                <p>{selectedDelivery.recipientName}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />{selectedDelivery.recipientPhone}
                </div>
                <p className="text-xs text-muted-foreground">Pincode: {selectedDelivery.recipientPincode}</p>
                {selectedDelivery.codAmount && (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">COD: ₹{selectedDelivery.codAmount.toLocaleString('en-IN')}</p>
                )}
                {selectedDelivery.weight && (
                  <p className="text-xs text-muted-foreground">Weight: {selectedDelivery.weight} kg</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}