import React from 'react';
import Link from 'next/link';
import Button from './Button';

const Navbar = ({ onLogout }) => {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold tracking-tight hover:text-gray-300">
          Expense Tracker
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
          <Link href="/expenses" className="hover:text-gray-300">Expenses</Link>
          <Link href="/budgets" className="hover:text-gray-300">Budgets</Link>
          <Link href="/add-expense" className="hover:text-gray-300">Add Expense</Link>
          <Button onClick={onLogout} variant="danger" className="shadow-md">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;