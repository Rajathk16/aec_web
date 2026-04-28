import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import User from '../../../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    await connectDb();
    return await User.findById(decoded.id);
  } catch {
    return null;
  }
}

export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: user._id,
    name: user.name,
    email: user.email,
    monthlyIncome: user.monthlyIncome,
    createdAt: user.createdAt,
  });
}

export async function PUT(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body.name !== undefined) {
      user.name = String(body.name).trim();
    }
    if (body.monthlyIncome !== undefined) {
      user.monthlyIncome = Number(body.monthlyIncome) || 0;
    }
    if (body.password) {
      user.password = await bcrypt.hash(String(body.password), 10);
    }
    await user.save();

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      monthlyIncome: user.monthlyIncome,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating profile', error: error.message }, { status: 500 });
  }
}
