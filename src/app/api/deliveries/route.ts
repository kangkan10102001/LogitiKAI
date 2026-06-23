import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const deliveries = await db.delivery.findMany({
      include: {
        city: true,
        vehicle: { include: { driver: true, city: true } },
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(deliveries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
  }
}