'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { portfolioApi } from '@/lib/api';
import { Portfolio, Transaction } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import DashboardNav from '@/components/DashboardNav';
import toast from 'react-hot-toast';

export default function PortfolioPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<any>(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [selling, setSelling] = useState(false);
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [portfolioRes, transactionsRes] = await Promise.all([
        portfolioApi.get(),
        portfolioApi.getTransactions(20)
      ]);
      setPortfolio(portfolioRes.data.portfolio);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = (holding: any) => {
    setSelectedHolding(holding);
    setSellQuantity(1);
    setShowSellModal(true);
  };

  const confirmSell = async () => {
    if (!selectedHolding) return;

    setSelling(true);
    try {
      await portfolioApi.sell({
        playerId: selectedHolding.player._id,
        quantity: sellQuantity
      });
      toast.success(`Sold ${sellQuantity}x ${selectedHolding.player.name}!`);
      setShowSellModal(false);
      await refreshUser();
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sell player');
    } finally {
      setSelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalWealth = portfolio ? portfolio.totalValue + (user?.balance || 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Portfolio</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Total Wealth</div>
          <div className="text-2xl font-bold text-gray-900">${totalWealth.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Portfolio Value</div>
          <div className="text-2xl font-bold text-blue-600">${portfolio?.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Cash Balance</div>
          <div className="text-2xl font-bold text-green-600">${user?.balance.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">Total ROI</div>
          <div className={`text-2xl font-bold ${(portfolio?.totalROI || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(portfolio?.totalROI || 0) >= 0 ? '+' : ''}{portfolio?.totalROI.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`pb-4 px-1 ${activeTab === 'holdings' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Holdings
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-4 px-1 ${activeTab === 'transactions' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Transaction History
          </button>
        </div>
      </div>

      {/* Holdings */}
      {activeTab === 'holdings' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {portfolio && portfolio.holdings && portfolio.holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {portfolio.holdings.map((holding, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{holding.player.name}</div>
                        <div className="text-sm text-gray-500">{holding.player.team}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{holding.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${holding.purchasePrice.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${holding.player.currentPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${holding.currentValue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${holding.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.roi >= 0 ? '+' : ''}{holding.roi.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSell(holding)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No holdings yet</p>
              <button
                onClick={() => router.push('/market')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Go to Market
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((txn) => (
                    <tr key={txn._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${txn.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{txn.player.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{txn.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${txn.pricePerUnit.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${txn.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No transactions yet</p>
            </div>
          )}
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedHolding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Sell {selectedHolding.player.name}</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Current price:</span>
                <span className="font-semibold">${selectedHolding.player.currentPrice.toLocaleString()}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Max: {selectedHolding.quantity})</label>
                <input
                  type="number"
                  min="1"
                  max={selectedHolding.quantity}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(Math.min(selectedHolding.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-between pt-4 border-t">
                <span className="font-medium">Total Revenue:</span>
                <span className="text-2xl font-bold text-green-600">${(selectedHolding.player.currentPrice * sellQuantity).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSellModal(false)} disabled={selling} className="flex-1 px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
              <button onClick={confirmSell} disabled={selling} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                {selling ? <LoadingSpinner size="sm" /> : 'Confirm Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
