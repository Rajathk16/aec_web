import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import Expense from '../../../models/expenseModel';
import User from '../../../models/userModel';
import jwt from 'jsonwebtoken';

export async function PATCH(request, { params }) {
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

    const { id } = params;
    const { amount, category, description, date } = await request.json();

    const expense = await Expense.findOne({ _id: id, user: user._id });
    if (!expense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    // Update fields if provided
    if (amount !== undefined) expense.amount = Number(amount);
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = new Date(date);

    await expense.save();

    return NextResponse.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating expense', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = params;

    const expense = await Expense.findOneAndDelete({ _id: id, user: user._id });
    if (!expense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting expense', error: error.message }, { status: 500 });
  }
}