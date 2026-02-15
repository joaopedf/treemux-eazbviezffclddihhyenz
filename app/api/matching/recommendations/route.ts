import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getPersonalizedTasks } from '@/lib/matching';
import { prisma } from '@/lib/prisma';

// GET /api/matching/recommendations - Get personalized task recommendations
export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request.headers.get('authorization'));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recommended task IDs with scores
    const recommendations = await getPersonalizedTasks(user.userId, limit);

    // Fetch full task details
    const taskIds = recommendations.map((r) => r.taskId);
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
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

    // Combine tasks with their match scores
    const tasksWithScores = tasks.map((task) => {
      const rec = recommendations.find((r) => r.taskId === task.id);
      return {
        ...task,
        matchScore: rec?.score || 0,
      };
    });

    // Sort by match score
    tasksWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ recommendations: tasksWithScores });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
