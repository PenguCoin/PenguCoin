'use client';

import { useState, useEffect } from 'react';
import { leaderboardApi } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import DashboardNav from '@/components/DashboardNav';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardApi.get(100);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Top investors ranked by total wealth</p>
        </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-12">
          {/* 2nd Place */}
          <div className="flex flex-col items-center order-1">
            <div className="bg-gradient-to-br from-gray-300 to-gray-400 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
              2
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{leaderboard[1].username}</div>
              <div className="text-2xl font-bold text-gray-700">${leaderboard[1].totalWealth.toLocaleString()}</div>
              <div className={`text-sm ${leaderboard[1].totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {leaderboard[1].totalROI >= 0 ? '+' : ''}{leaderboard[1].totalROI.toFixed(1)}% ROI
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center order-2">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-2 animate-pulse">
              1
            </div>
            <div className="text-center">
              <div className="font-bold text-xl">{leaderboard[0].username}</div>
              <div className="text-3xl font-bold text-yellow-600">${leaderboard[0].totalWealth.toLocaleString()}</div>
              <div className={`text-sm ${leaderboard[0].totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {leaderboard[0].totalROI >= 0 ? '+' : ''}{leaderboard[0].totalROI.toFixed(1)}% ROI
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center order-3">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
              3
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{leaderboard[2].username}</div>
              <div className="text-2xl font-bold text-orange-700">${leaderboard[2].totalWealth.toLocaleString()}</div>
              <div className={`text-sm ${leaderboard[2].totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {leaderboard[2].totalROI >= 0 ? '+' : ''}{leaderboard[2].totalROI.toFixed(1)}% ROI
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Wealth</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Portfolio Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cash</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ROI</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Holdings</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry) => (
                <tr key={entry.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`font-bold ${entry.rank <= 3 ? 'text-lg' : 'text-sm'} ${
                        entry.rank === 1 ? 'text-yellow-600' :
                        entry.rank === 2 ? 'text-gray-500' :
                        entry.rank === 3 ? 'text-orange-600' :
                        'text-gray-700'
                      }`}>
                        #{entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">${entry.totalWealth.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${entry.portfolioValue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${entry.cashBalance.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${entry.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.totalROI >= 0 ? '+' : ''}{entry.totalROI.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{entry.holdingsCount} players</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No data available yet</p>
        </div>
      )}
      </div>
    </div>
  );
}
