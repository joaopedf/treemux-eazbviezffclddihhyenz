import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// POST /api/payments/webhook - Handle Stripe webhook events
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      case 'charge.refunded':
        const refund = event.data.object as Stripe.Charge;
        await handleRefund(refund);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const taskId = paymentIntent.metadata.taskId;

  if (!taskId) {
    console.error('No taskId in payment intent metadata');
    return;
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      paymentStatus: 'paid',
    },
  });

  console.log(`Payment succeeded for task ${taskId}`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const taskId = paymentIntent.metadata.taskId;

  if (!taskId) {
    console.error('No taskId in payment intent metadata');
    return;
  }

  console.log(`Payment failed for task ${taskId}`);
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent;

  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    console.error('No payment intent ID in charge');
    return;
  }

  const task = await prisma.task.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (task) {
    await prisma.task.update({
      where: { id: task.id },
      data: {
        paymentStatus: 'refunded',
      },
    });

    console.log(`Refund processed for task ${task.id}`);
  }
}
