import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import Expense from '../../../models/expenseModel';
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

    const { amount, category, description, date } = await request.json();
    if (!amount || !category || !description) {
      return NextResponse.json({ message: 'Amount, category and description are required' }, { status: 400 });
    }

    const expenseDate = date ? new Date(date) : new Date();
    const year = expenseDate.getFullYear();
    const month = expenseDate.getMonth() + 1; // 1-12

    // Check budget
    const budget = await Budget.findOne({ user: user._id, category, year, month });
    if (budget) {
      // Calculate total expenses for this category in the month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 1);
      const existingExpenses = await Expense.find({
        user: user._id,
        category,
        date: { $gte: startOfMonth, $lt: endOfMonth }
      });
      const totalSpent = existingExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      if (totalSpent + Number(amount) > budget.monthlyLimit) {
        return NextResponse.json({
          message: `Adding this expense would exceed your budget limit of ${budget.monthlyLimit} for ${category} in ${month}/${year}. Current spent: ${totalSpent}`
        }, { status: 400 });
      }
    }

    const expense = await Expense.create({
      user: user._id,
      amount: Number(amount),
      category,
      description,
      date: expenseDate,
    });

    return NextResponse.json({ message: 'Expense added successfully', expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding expense', error: error.message }, { status: 500 });
  }
}