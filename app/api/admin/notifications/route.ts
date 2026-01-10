import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin, isAdminOrVendor } from '@/lib/auth';

// GET - Fetch all notifications for admin
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdminOrVendor(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: any = {};
    if (unreadOnly) {
      query.read = false;
    }

    // Fetch notifications, sorted by newest first
    const notifications = await db
      .collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Get unread count
    const unreadCount = await db.collection('notifications').countDocuments({ read: false });

    return NextResponse.json({
      notifications: notifications.map(notif => ({
        ...notif,
        _id: notif._id.toString(),
        createdAt: notif.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error: any) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdminOrVendor(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    const { db } = await connectToDatabase();
    const { ObjectId } = await import('mongodb');

    if (markAllAsRead) {
      // Mark all notifications as read
      await db.collection('notifications').updateMany(
        { read: false },
        { $set: { read: true, readAt: new Date() } }
      );
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    } else if (notificationId) {
      // Mark specific notification as read
      await db.collection('notifications').updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { read: true, readAt: new Date() } }
      );
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdminOrVendor(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const { ObjectId } = await import('mongodb');

    await db.collection('notifications').deleteOne({ _id: new ObjectId(notificationId) });

    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error: any) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification', details: error.message },
      { status: 500 }
    );
  }
}

