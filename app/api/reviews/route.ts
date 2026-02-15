import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { reviewSchema } from '@/lib/validators';

// POST /api/reviews - Create a review for a completed task
export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request.headers.get('authorization'));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    if (!body.taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get task
    const task = await prisma.task.findUnique({
      where: { id: body.taskId },
      include: { review: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify task is completed
    if (task.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed tasks' },
        { status: 400 }
      );
    }

    // Verify user is part of the task
    const isRequester = task.requesterId === user.userId;
    const isProvider = task.providerId === user.userId;

    if (!isRequester && !isProvider) {
      return NextResponse.json(
        { error: 'Not authorized to review this task' },
        { status: 403 }
      );
    }

    // Check if review already exists
    if (task.review) {
      return NextResponse.json(
        { error: 'Task already reviewed' },
        { status: 400 }
      );
    }

    // Determine who is being reviewed
    const receiverId = isRequester ? task.providerId : task.requesterId;

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Cannot review: no provider assigned' },
        { status: 400 }
      );
    }

    // Create review in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create review
      const review = await tx.review.create({
        data: {
          rating: validatedData.rating,
          comment: validatedData.comment,
          taskId: body.taskId,
          giverId: user.userId,
          receiverId,
        },
      });

      // Get current receiver stats
      const receiver = await tx.user.findUnique({
        where: { id: receiverId },
        select: { totalRating: true, reviewCount: true },
      });

      if (!receiver) {
        throw new Error('Receiver not found');
      }

      // Update receiver's reputation
      const newReviewCount = receiver.reviewCount + 1;
      const newTotalRating =
        (receiver.totalRating * receiver.reviewCount + validatedData.rating) /
        newReviewCount;

      await tx.user.update({
        where: { id: receiverId },
        data: {
          totalRating: newTotalRating,
          reviewCount: newReviewCount,
        },
      });

      return review;
    });

    return NextResponse.json({ review: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// GET /api/reviews?userId=xxx - Get reviews for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { receiverId: userId },
      include: {
        giver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
