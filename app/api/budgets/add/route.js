import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import Budget from '../../../models/budgetModel';
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

    const { category, monthlyLimit, year, month } = await request.json();
    if (!category || !monthlyLimit || !year || !month) {
      return NextResponse.json({ message: 'Category, monthlyLimit, year, and month are required' }, { status: 400 });
    }

    // Check if budget already exists for this user, category, year, month
    const existingBudget = await Budget.findOne({ user: user._id, category, year, month });
    if (existingBudget) {
      return NextResponse.json({ message: 'Budget already exists for this category and month' }, { status: 400 });
    }

    const budget = await Budget.create({
      user: user._id,
      category,
      monthlyLimit: Number(monthlyLimit),
      year: Number(year),
      month: Number(month),
    });

    return NextResponse.json({ message: 'Budget added successfully', budget }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding budget', error: error.message }, { status: 500 });
  }
}