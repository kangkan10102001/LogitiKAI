import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cities = await db.city.findMany({
      include: {
        _count: {
          select: {
            vehicles: true,
            deliveries: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(cities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}