// Simple in-memory notification store (in production, use Redis or database)
const notifications = new Map<string, Array<any>>();

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

export function getNotifications(userId: string) {
  return notifications.get(userId) || [];
}

export function createNotification(
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

  return notification;
}
