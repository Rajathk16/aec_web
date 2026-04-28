import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import Expense from '../../../models/expenseModel';
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

    const expenses = await Expense.find({ user: user._id }).sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching expenses', error: error.message }, { status: 500 });
  }
}