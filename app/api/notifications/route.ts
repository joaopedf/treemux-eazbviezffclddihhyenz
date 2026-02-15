import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// Simple in-memory notification store (in production, use Redis or database)
const notifications = new Map<string, Array<any>>();

// GET /api/notifications - Get user notifications
export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request.headers.get('authorization'));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userNotifications = notifications.get(user.userId) || [];

    return NextResponse.json({ notifications: userNotifications });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a notification (internal use)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, message, data } = body;

    if (!userId || !type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = {
      id: Math.random().toString(36).substring(7),
      type,
      message,
      data,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const userNotifications = notifications.get(userId) || [];
    userNotifications.unshift(notification);

    // Keep only last 50 notifications
    if (userNotifications.length > 50) {
      userNotifications.length = 50;
    }

    notifications.set(userId, userNotifications);

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// Helper function to send notifications
export async function sendNotification(
  userId: string,
  type: string,
  message: string,
  data?: any
) {
  const notification = {
    id: Math.random().toString(36).substring(7),
    type,
    message,
    data,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const userNotifications = notifications.get(userId) || [];
  userNotifications.unshift(notification);

  if (userNotifications.length > 50) {
    userNotifications.length = 50;
  }

  notifications.set(userId, userNotifications);
}
