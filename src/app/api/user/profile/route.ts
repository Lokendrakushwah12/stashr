import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectDB();

    // Build update object
    const updateData: { name: string; image?: string | null } = { name: name.trim() };
    if (image !== undefined) {
      updateData.image = image === null ? null : (typeof image === 'string' ? image : undefined);
    }

    // Update user in the users collection
    const usersCollection = mongoose.connection.collection('users');
    await usersCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      { $set: updateData }
    );

    return NextResponse.json({ 
      user: { 
        name: name.trim(),
        email: session.user.email,
        image: updateData.image ?? session.user.image
      } 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

