'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    monthlyIncome: '',
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  useEffect(() => {
    const loadProfile = async () => {
      const stored = JSON.parse(localStorage.getItem('user'));
      if (!stored || !stored.token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${stored.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unable to fetch profile');
        }

        const profile = await response.json();
        setUser(profile);
        setFormData({
          name: profile.name || '',
          monthlyIncome: profile.monthlyIncome ?? 0,
        });
      } catch (err) {
        setError(err.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem('user'));
    if (!stored || !stored.token) {
      router.push('/auth/login');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${stored.token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          monthlyIncome: Number(formData.monthlyIncome) || 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Unable to update profile');
      }

      const updated = await response.json();
      setUser(updated);
      localStorage.setItem('user', JSON.stringify({ ...stored, ...updated }));
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Update your personal details and monthly income.</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} className="shadow-md">
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Account Details</h2>
              <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Name:</span> {user?.name}</p>
              <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Email:</span> {user?.email}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Joined:</span> {new Date(user?.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Monthly Income</h2>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(user?.monthlyIncome)}</p>
              <p className="text-sm text-gray-600 mt-1">This value is used to calculate your monthly budget and balance.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Monthly Income (₹)"
              name="monthlyIncome"
              type="number"
              value={formData.monthlyIncome}
              onChange={handleChange}
              min="0"
              required
            />

            <div className="flex gap-4 flex-wrap">
              <Button type="button" onClick={() => router.push('/dashboard')} className="flex-1 bg-gray-500 hover:bg-gray-600">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
