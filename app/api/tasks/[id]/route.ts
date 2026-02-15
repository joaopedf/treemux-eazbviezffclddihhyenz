import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { updateTaskStatusSchema } from '@/lib/validators';

// GET /api/tasks/[id] - Get single task
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            totalRating: true,
            reviewCount: true,
            avatar: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            totalRating: true,
            reviewCount: true,
            avatar: true,
          },
        },
        review: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update task status or assign provider
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request.headers.get('authorization'));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = await params;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Handle task acceptance (assign provider)
    if (body.action === 'accept') {
      if (task.status !== 'open') {
        return NextResponse.json(
          { error: 'Task is not available' },
          { status: 400 }
        );
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          providerId: user.userId,
          status: 'assigned',
        },
        include: {
          requester: true,
          provider: true,
        },
      });

      return NextResponse.json({ task: updatedTask });
    }

    // Handle status updates
    if (body.status) {
      const validatedData = updateTaskStatusSchema.parse(body);

      // Verify user has permission to update status
      const isRequester = task.requesterId === user.userId;
      const isProvider = task.providerId === user.userId;

      if (!isRequester && !isProvider) {
        return NextResponse.json(
          { error: 'Not authorized to update this task' },
          { status: 403 }
        );
      }

      const updateData: any = { status: validatedData.status };

      // Set completedAt when task is completed
      if (validatedData.status === 'completed') {
        updateData.completedAt = new Date();

        // Update provider's completed tasks count
        if (task.providerId) {
          await prisma.user.update({
            where: { id: task.providerId },
            data: {
              completedTasks: { increment: 1 },
            },
          });
        }
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          requester: true,
          provider: true,
        },
      });

      return NextResponse.json({ task: updatedTask });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Cancel/delete task
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request.headers.get('authorization'));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Only requester can delete task
    if (task.requesterId !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this task' },
        { status: 403 }
      );
    }

    await prisma.task.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ message: 'Task cancelled successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
