const express = require('express');
const router = express.Router();
const Expense = require('../models/expenseModel');
const Budget = require('../models/budgetModel');
const authMiddleware = require('../middlewares/authMiddleware');

// Add expense
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { amount, category, description, date } = req.body;
        const userId = req.user.id;

        const expenseDate = date ? new Date(date) : new Date();
        const year = expenseDate.getFullYear();
        const month = expenseDate.getMonth() + 1;

        // Check budget
        const budget = await Budget.findOne({ user: userId, category, year, month });
        if (budget) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 1);
            const existingExpenses = await Expense.find({
                user: userId,
                category,
                date: { $gte: startOfMonth, $lt: endOfMonth }
            });
            const totalSpent = existingExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            if (totalSpent + Number(amount) > budget.monthlyLimit) {
                return res.status(400).json({
                    message: `Adding this expense would exceed your budget limit of ${budget.monthlyLimit} for ${category} in ${month}/${year}. Current spent: ${totalSpent}`
                });
            }
        }

        const expense = new Expense({
            user: userId,
            amount: Number(amount),
            category,
            description,
            date: expenseDate,
        });

        await expense.save();
        res.status(201).json({ message: 'Expense added successfully', expense });
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense', error: error.message });
    }
});

// Get all expenses for user
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
});

// Get expenses by category
router.get('/category/:category', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.params;
        const expenses = await Expense.find({ user: userId, category }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
});

// Edit expense
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { amount, category, description, date } = req.body;

        const expense = await Expense.findOne({ _id: id, user: userId });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (amount !== undefined) expense.amount = Number(amount);
        if (category !== undefined) expense.category = category;
        if (description !== undefined) expense.description = description;
        if (date !== undefined) expense.date = new Date(date);

        await expense.save();
        res.json({ message: 'Expense updated successfully', expense });
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense', error: error.message });
    }
});

// Delete expense
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const expense = await Expense.findOneAndDelete({ _id: id, user: userId });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
});

// Get expense summary
router.get('/summary', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Total spent
        const totalSpentAgg = await Expense.aggregate([
            { $match: { user: userId } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // By category
        const byCategory = await Expense.aggregate([
            { $match: { user: userId } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);

        // Monthly breakdown
        const monthly = await Expense.aggregate([
            { $match: { user: userId } },
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
            totalSpent: totalSpentAgg[0]?.total || 0,
            byCategory,
            monthly
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching summary', error: error.message });
    }
});

module.exports = router;