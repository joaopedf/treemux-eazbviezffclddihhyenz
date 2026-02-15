import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPaymentIntent } from '@/lib/stripe';

// POST /api/payments/create-intent - Create a payment intent for a task
export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request.headers.get('authorization'));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify user is the requester
    if (task.requesterId !== user.userId) {
      return NextResponse.json(
        { error: 'Not authorized to pay for this task' },
        { status: 403 }
      );
    }

    // Check if payment already exists
    if (task.stripePaymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent already exists for this task' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: task.price,
      currency: task.currency,
      taskId: task.id,
    });

    // Update task with payment intent ID
    await prisma.task.update({
      where: { id: taskId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
