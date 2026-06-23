import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const vehicles = await db.vehicle.findMany({
      include: {
        city: true,
        driver: true,
        deliveries: {
          where: { status: 'in_transit' },
          select: { id: true, trackingNo: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}