import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // City performance
    const cities = await db.city.findMany({
      include: {
        deliveries: {
          where: { status: 'delivered' },
          select: { actualTime: true, actualDistance: true, estimatedTime: true, estimatedDistance: true },
        },
        _count: {
          select: {
            deliveries: true,
            vehicles: true,
          },
        },
      },
    });

    const cityPerformance = cities.map((city) => {
      const delivered = city.deliveries;
      const onTime = delivered.filter(
        (d) => d.actualTime && d.estimatedTime && d.actualTime <= d.estimatedTime * 1.2
      ).length;
      const avgTime = delivered.length > 0
        ? delivered.reduce((s, d) => s + (d.actualTime || 0), 0) / delivered.length
        : 0;
      const avgDist = delivered.length > 0
        ? delivered.reduce((s, d) => s + (d.actualDistance || 0), 0) / delivered.length
        : 0;

      return {
        city: city.name,
        state: city.state,
        type: city.type,
        totalDeliveries: city._count.deliveries,
        deliveredCount: delivered.length,
        onTimeRate: delivered.length > 0 ? Math.round((onTime / delivered.length) * 100) : 0,
        avgTime: Math.round(avgTime),
        avgDistance: Math.round(avgDist * 10) / 10,
        revenue: Math.round(delivered.length * avgDist * 12),
        vehicles: city._count.vehicles,
      };
    });

    // Status distribution
    const statusCounts = await db.delivery.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Priority distribution
    const priorityCounts = await db.delivery.groupBy({
      by: ['priority'],
      _count: { priority: true },
    });

    // Vehicle type distribution
    const vehicleTypeCounts = await db.vehicle.groupBy({
      by: ['type'],
      _count: { type: true },
    });

    // Hourly delivery pattern (simulated for Indian traffic)
    const hourlyPattern = Array.from({ length: 24 }, (_, h) => {
      let congestion: number;
      if (h >= 8 && h <= 11) congestion = 65 + Math.random() * 25; // Morning peak
      else if (h >= 17 && h <= 20) congestion = 70 + Math.random() * 25; // Evening peak
      else if (h >= 12 && h <= 16) congestion = 40 + Math.random() * 20; // Afternoon
      else if (h >= 21 || h <= 5) congestion = 10 + Math.random() * 15; // Night
      else congestion = 30 + Math.random() * 20; // Early morning
      return {
        hour: h,
        congestion: Math.round(congestion),
        label: `${String(h).padStart(2, '0')}:00`,
      };
    });

    // Weekly trend
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyTrend = days.map((day, i) => ({
      day,
      deliveries: Math.floor(40 + Math.random() * 30 + (i < 5 ? 20 : -10)),
      onTime: Math.floor(75 + Math.random() * 20),
      avgTime: Math.floor(35 + Math.random() * 25),
    }));

    return NextResponse.json({
      cityPerformance,
      statusDistribution: statusCounts.map((s) => ({ status: s.status, count: s._count.status })),
      priorityDistribution: priorityCounts.map((p) => ({ priority: p.priority, count: p._count.priority })),
      vehicleTypeDistribution: vehicleTypeCounts.map((v) => ({ type: v.type, count: v._count.type })),
      hourlyPattern,
      weeklyTrend,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}