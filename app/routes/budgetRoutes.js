const express = require('express');
const router = express.Router();
const Budget = require('../models/budgetModel');
const authMiddleware = require('../middlewares/authMiddleware');

// Add budget
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { category, monthlyLimit, year, month } = req.body;
        const userId = req.user.id;

        if (!category || !monthlyLimit || !year || !month) {
            return res.status(400).json({ message: 'Category, monthlyLimit, year, and month are required' });
        }

        const existingBudget = await Budget.findOne({ user: userId, category, year, month });
        if (existingBudget) {
            return res.status(400).json({ message: 'Budget already exists for this category and month' });
        }

        const budget = new Budget({
            user: userId,
            category,
            monthlyLimit: Number(monthlyLimit),
            year: Number(year),
            month: Number(month),
        });

        await budget.save();
        res.status(201).json({ message: 'Budget added successfully', budget });
    } catch (error) {
        res.status(500).json({ message: 'Error adding budget', error: error.message });
    }
});

// Get all budgets
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const budgets = await Budget.find({ user: userId }).sort({ year: -1, month: -1 });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets', error: error.message });
    }
});

module.exports = router;