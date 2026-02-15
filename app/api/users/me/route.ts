import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/users/me - Get current user profile
export async function GET(request: Request) {
  try {
    const authUser = getUserFromRequest(request.headers.get('authorization'));

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        skills: true,
        latitude: true,
        longitude: true,
        address: true,
        totalRating: true,
        reviewCount: true,
        completedTasks: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        skills: user.skills ? JSON.parse(user.skills) : [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/me - Update current user profile
export async function PATCH(request: Request) {
  try {
    const authUser = getUserFromRequest(request.headers.get('authorization'));

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const updateData: any = {};

    if (body.name) updateData.name = body.name;
    if (body.phone) updateData.phone = body.phone;
    if (body.bio) updateData.bio = body.bio;
    if (body.avatar) updateData.avatar = body.avatar;
    if (body.skills) updateData.skills = JSON.stringify(body.skills);
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;
    if (body.address) updateData.address = body.address;

    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        bio: true,
        skills: true,
        latitude: true,
        longitude: true,
        address: true,
        totalRating: true,
        reviewCount: true,
        completedTasks: true,
      },
    });

    return NextResponse.json({
      user: {
        ...user,
        skills: user.skills ? JSON.parse(user.skills) : [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
