import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalDeliveries = await db.delivery.count();
    const activeDeliveries = await db.delivery.count({ where: { status: { in: ['assigned', 'in_transit'] } } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deliveredToday = await db.delivery.count({
      where: {
        status: 'delivered',
        actualDelivery: { gte: today },
      },
    });
    
    const failedDeliveries = await db.delivery.count({ where: { status: 'failed' } });
    
    const deliveredRecords = await db.delivery.findMany({
      where: { status: 'delivered', actualTime: { not: null } },
      select: { actualTime: true },
    });
    const avgDeliveryTime = deliveredRecords.length > 0
      ? deliveredRecords.reduce((sum, d) => sum + (d.actualTime || 0), 0) / deliveredRecords.length
      : 0;

    const onTimeDeliveries = await db.delivery.count({
      where: {
        status: 'delivered',
        actualDelivery: { not: null },
        scheduledDelivery: { not: null },
        actualDelivery: { lte: undefined },
      },
    });

    const totalDelivered = await db.delivery.count({ where: { status: 'delivered' } });
    const onTimeRate = totalDelivered > 0 ? Math.round((deliveredToday / Math.max(totalDelivered, 1)) * 100) : 0;

    const totalFleetSize = await db.vehicle.count();
    const activeVehicles = await db.vehicle.count({ where: { status: 'in_transit' } });

    const vehicleRecords = await db.vehicle.findMany({ select: { fuelEfficiency: true, totalKms: true } });
    const avgFuelEfficiency = vehicleRecords.length > 0
      ? vehicleRecords.reduce((sum, v) => sum + v.fuelEfficiency, 0) / vehicleRecords.length
      : 0;

    const totalDistanceToday = await db.delivery.aggregate({
      where: { status: 'delivered', actualDelivery: { gte: today } },
      _sum: { actualDistance: true },
    });

    return NextResponse.json({
      totalDeliveries,
      activeDeliveries,
      deliveredToday,
      failedDeliveries,
      avgDeliveryTime: Math.round(avgDeliveryTime),
      onTimeRate,
      totalFleetSize,
      activeVehicles,
      avgFuelEfficiency: Math.round(avgFuelEfficiency * 10) / 10,
      totalDistanceToday: totalDistanceToday._sum.actualDistance || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}