import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import Expense from '../../../models/expenseModel';
import User from '../../../models/userModel';
import jwt from 'jsonwebtoken';

export async function POST(request) {
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

    const { amount, category, description, date } = await request.json();
    if (!amount || !category || !description) {
      return NextResponse.json({ message: 'Amount, category and description are required' }, { status: 400 });
    }

    const expense = await Expense.create({
      user: user._id,
      amount: Number(amount),
      category,
      description,
      date: date ? new Date(date) : new Date(),
    });

    return NextResponse.json({ message: 'Expense added successfully', expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding expense', error: error.message }, { status: 500 });
  }
}