'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function Budgets() {
  const router = useRouter();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    monthlyLimit: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [adding, setAdding] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/budgets/all', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      } else {
        setError('Failed to fetch budgets');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/budgets/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          category: formData.category,
          monthlyLimit: parseFloat(formData.monthlyLimit),
          year: parseInt(formData.year),
          month: parseInt(formData.month),
        }),
      });

      if (response.ok) {
        loadBudgets();
        setFormData({
          category: '',
          monthlyLimit: '',
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add budget');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setAdding(false);
    }
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading budgets...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budgets</h1>
          <p className="text-gray-600">Set and manage your monthly spending limits.</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Budget</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Monthly Limit"
                name="monthlyLimit"
                type="number"
                step="0.01"
                value={formData.monthlyLimit}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Month"
                name="month"
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit" disabled={adding} className="w-full md:w-auto">
              {adding ? 'Adding...' : 'Add Budget'}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Your Budgets</h2>
          </div>
          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
              <p className="text-gray-500">Add your first budget above.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {budgets.map((budget) => (
                <div key={budget._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {budget.category}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {budget.month}/{budget.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        {formatAmount(budget.monthlyLimit)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}