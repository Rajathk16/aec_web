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

    // Total spent
    const totalSpent = await Expense.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // By category
    const byCategory = await Expense.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    // Monthly breakdown (last 12 months)
    const monthly = await Expense.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const summary = {
      totalSpent: totalSpent[0]?.total || 0,
      byCategory,
      monthly
    };

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching summary', error: error.message }, { status: 500 });
  }
}