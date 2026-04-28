'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  useEffect(() => {
    const loadData = async () => {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (!stored?.token) {
        router.push('/auth/login');
        return;
      }

      try {
        const [profileRes, expensesRes] = await Promise.all([
          fetch('/api/user/profile', {
            headers: { Authorization: `Bearer ${stored.token}` },
          }),
          fetch('/api/expenses/all', {
            headers: { Authorization: `Bearer ${stored.token}` },
          }),
        ]);

        if (!profileRes.ok) {
          throw new Error('Unable to load profile');
        }
        if (!expensesRes.ok) {
          throw new Error('Unable to load expenses');
        }

        const profileData = await profileRes.json();
        const expenseData = await expensesRes.json();
        setProfile(profileData);
        setExpenses(Array.isArray(expenseData) ? expenseData : []);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  const monthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  });

  const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const thisMonthTotal = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const uniqueCategories = new Set(expenses.map((expense) => expense.category));
  const monthlyIncome = Number(profile?.monthlyIncome || 0);
  const currentBalance = monthlyIncome - totalExpense;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back{profile?.name ? `, ${profile.name}` : ''}! Here&apos;s your financial overview.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="shadow-md" onClick={() => router.push('/profile')}>
              Profile
            </Button>
            <Button className="shadow-md bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push('/add-expense')}>
              Add Expense
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</p>
            <p className="text-sm text-gray-500 mt-2">Your income for budgeting this month.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Balance</h3>
            <p className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(currentBalance)}</p>
            <p className="text-sm text-gray-500 mt-2">Income minus total expenses.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(thisMonthTotal)}</p>
            <p className="text-sm text-gray-500 mt-2">Expenses recorded in the current month.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <p className="text-3xl font-bold text-purple-600">{uniqueCategories.size}</p>
            <p className="text-sm text-gray-500 mt-2">Unique expense categories used.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
              <p className="text-gray-500">Your most recent transaction history.</p>
            </div>
            <Button onClick={() => router.push('/expenses')} className="shadow-md">
              View All
            </Button>
          </div>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses added yet</h3>
              <p className="text-gray-500 mb-6">Add your first expense to start tracking your spending.</p>
              <Button onClick={() => router.push('/add-expense')} className="shadow-md">
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                      <p className="text-sm text-gray-500 mt-1">{expense.category} • {new Date(expense.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <p className="text-xl font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
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