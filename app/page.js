'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/Button';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Expense Tracker
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Take control of your finances with our simple and intuitive expense tracking solution.
          </p>
        </div>
        <Button onClick={handleGetStarted} className="text-lg px-8 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
          Get Started
        </Button>
      </div>
    </div>
  );
}
