import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { findMatchingUsers } from '@/lib/matching';
import { prisma } from '@/lib/prisma';

// POST /api/matching/providers - Find best matching providers for a task
export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request.headers.get('authorization'));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, limit = 10 } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.requesterId !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized to view matches for this task' },
        { status: 403 }
      );
    }

    // Find matching users
    const matches = await findMatchingUsers(taskId, limit);

    // Fetch user details
    const userIds = matches.map((m) => m.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        skills: true,
        totalRating: true,
        reviewCount: true,
        completedTasks: true,
        address: true,
      },
    });

    // Combine users with their match scores
    const usersWithScores = users.map((user) => {
      const match = matches.find((m) => m.userId === user.id);
      return {
        ...user,
        skills: user.skills ? JSON.parse(user.skills) : [],
        matchScore: match?.score || 0,
      };
    });

    // Sort by match score
    usersWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ providers: usersWithScores });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to find matching providers' },
      { status: 500 }
    );
  }
}
