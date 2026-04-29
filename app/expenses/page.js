'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';

export default function Expenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: '',
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense._id);
    setEditForm({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: new Date(expense.date).toISOString().split('T')[0],
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`/api/expenses/${editingExpense}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(editForm.amount),
          category: editForm.category,
          description: editForm.description,
          date: editForm.date,
        }),
      });

      if (response.ok) {
        setEditingExpense(null);
        // Reload expenses
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update expense');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        setExpenses(expenses.filter(exp => exp._id !== id));
      } else {
        setError('Failed to delete expense');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
          router.push('/auth/login');
          return;
        }

        const url = filter === 'all' ? '/api/expenses/all' : `/api/expenses/category/${filter.replace(/\s+/g, '-')}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setExpenses(data);
        } else {
          setError('Failed to fetch expenses');
        }
      } catch (error) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [filter, router]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">All Expenses</h1>
              <p className="text-gray-600">View and manage all your expenses.</p>
            </div>
            <Button onClick={() => router.push('/add-expense')} className="shadow-md">
              Add Expense
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="filter" className="text-sm font-medium text-gray-700">
              Filter by category:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">
                Total: {formatAmount(totalAmount)}
              </span>
              <span className="text-sm text-gray-500">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all' ? 'You haven\'t added any expenses yet.' : `No expenses found in ${filter} category.`}
              </p>
              <Button onClick={() => router.push('/add-expense')} className="shadow-md">
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <div key={expense._id} className="p-6 hover:bg-gray-50">
                  {editingExpense === expense._id ? (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          value={editForm.amount}
                          onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                          required
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            name="category"
                            value={editForm.category}
                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Input
                        label="Description"
                        name="description"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        required
                      />
                      <Input
                        label="Date"
                        name="date"
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                          Save
                        </Button>
                        <Button type="button" onClick={() => setEditingExpense(null)} className="bg-gray-600 hover:bg-gray-700">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {expense.description}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {expense.category} • {formatDate(expense.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-red-600">
                              -{formatAmount(expense.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button onClick={() => handleEdit(expense)} className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1">
                          Edit
                        </Button>
                        <Button onClick={() => handleDelete(expense._id)} className="bg-red-600 hover:bg-red-700 text-sm px-3 py-1">
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}