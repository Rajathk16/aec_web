import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import Budget from '../../../models/budgetModel';
import User from '../../../models/userModel';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await connectDb();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const budgets = await Budget.find({ user: user._id }).sort({ year: -1, month: -1 });
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching budgets', error: error.message }, { status: 500 });
  }
}