'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { portfolioApi } from '@/lib/api';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user]);

  const loadPortfolio = async () => {
    try {
      const response = await portfolioApi.get();
      setPortfolio(response.data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s an overview of your FutStocks portfolio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Cash Balance</span>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${user.balance.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Portfolio Value</span>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loadingPortfolio ? (
                <LoadingSpinner size="sm" />
              ) : (
                `$${(portfolio?.totalValue || 0).toLocaleString()}`
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Worth</span>
              <span className="text-2xl">💎</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loadingPortfolio ? (
                <LoadingSpinner size="sm" />
              ) : (
                `$${((portfolio?.totalValue || 0) + user.balance).toLocaleString()}`
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total ROI</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className={`text-2xl font-bold ${(portfolio?.totalROI || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {loadingPortfolio ? (
                <LoadingSpinner size="sm" />
              ) : (
                `${(portfolio?.totalROI || 0) >= 0 ? '+' : ''}${(portfolio?.totalROI || 0).toFixed(2)}%`
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/market"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            <div className="text-3xl mb-3">🏪</div>
            <h3 className="text-lg font-bold mb-1">Browse Market</h3>
            <p className="text-blue-100 text-sm">Buy and sell players</p>
          </Link>

          <Link
            href="/portfolio"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <div className="text-3xl mb-3">💼</div>
            <h3 className="text-lg font-bold mb-1">My Portfolio</h3>
            <p className="text-purple-100 text-sm">View your holdings</p>
          </Link>

          <Link
            href="/transactions"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold mb-1">Transactions</h3>
            <p className="text-green-100 text-sm">View trading history</p>
          </Link>

          <Link
            href="/leaderboard"
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6 hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
          >
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-bold mb-1">Leaderboard</h3>
            <p className="text-orange-100 text-sm">See top investors</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
