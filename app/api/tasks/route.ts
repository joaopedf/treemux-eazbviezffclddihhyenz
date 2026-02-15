import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { taskSchema } from '@/lib/validators';

// GET /api/tasks - List tasks with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    // Simple location filtering (in production, use spatial queries)
    let tasks = await prisma.task.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            totalRating: true,
            reviewCount: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            totalRating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by location if provided
    if (latitude && longitude && radius) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const rad = parseFloat(radius);

      tasks = tasks.filter((task) => {
        const distance = calculateDistance(
          lat,
          lon,
          task.latitude,
          task.longitude
        );
        return distance <= rad;
      });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request.headers.get('authorization'));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        price: validatedData.price,
        currency: validatedData.currency,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        address: validatedData.address,
        radius: validatedData.radius,
        scheduledAt: validatedData.scheduledAt
          ? new Date(validatedData.scheduledAt)
          : null,
        deadline: validatedData.deadline
          ? new Date(validatedData.deadline)
          : null,
        requesterId: user.userId,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            totalRating: true,
            reviewCount: true,
          },
        },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
