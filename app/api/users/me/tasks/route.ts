import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/users/me/tasks - Get current user's tasks
export async function GET(request: Request) {
  try {
    const authUser = getUserFromRequest(request.headers.get('authorization'));

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'requested' or 'providing'

    let tasks;

    if (type === 'requested') {
      tasks = await prisma.task.findMany({
        where: { requesterId: authUser.userId },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              totalRating: true,
              reviewCount: true,
            },
          },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (type === 'providing') {
      tasks = await prisma.task.findMany({
        where: { providerId: authUser.userId },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              totalRating: true,
              reviewCount: true,
            },
          },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Return both
      const requested = await prisma.task.findMany({
        where: { requesterId: authUser.userId },
        include: {
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

      const providing = await prisma.task.findMany({
        where: { providerId: authUser.userId },
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
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ requested, providing });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
