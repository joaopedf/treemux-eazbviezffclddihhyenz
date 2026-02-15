import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getNotifications, createNotification } from '@/lib/notifications';

// GET /api/notifications - Get user notifications
export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request.headers.get('authorization'));

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userNotifications = getNotifications(user.userId);

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

    const notification = createNotification(userId, type, message, data);

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
