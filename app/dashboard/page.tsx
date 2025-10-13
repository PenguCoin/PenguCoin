'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { portfolioApi, playersApi, leaderboardApi } from '@/lib/api';
import { Player, Transaction, LeaderboardEntry } from '@/lib/types';
import PlayerCard from '@/components/PlayerCard';
import toast from 'react-hot-toast';

type TabType = 'overview' | 'market' | 'inventory' | 'transactions' | 'leaderboard';

export default function DashboardPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buying, setBuying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [portfolioRes, playersRes, transactionsRes, leaderboardRes] = await Promise.all([
        portfolioApi.get(),
        playersApi.getAll({ sort: '-totalROI' }),
        portfolioApi.getTransactions(20),
        leaderboardApi.get(10)
      ]);
      setPortfolio(portfolioRes.data.portfolio);
      setPlayers(playersRes.data.players);
      setTransactions(transactionsRes.data.transactions);
      setLeaderboard(leaderboardRes.data.leaderboard);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleBuy = (player: Player) => {
    setSelectedPlayer(player);
    setQuantity(1);
    setShowBuyModal(true);
  };

  const confirmBuy = async () => {
    if (!selectedPlayer || !user) return;

    const totalCost = selectedPlayer.currentPrice * quantity;
    if (totalCost > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setBuying(true);
    try {
      await portfolioApi.buy({
        playerId: selectedPlayer._id,
        quantity
      });
      toast.success(`Bought ${quantity}x ${selectedPlayer.name}!`);
      setShowBuyModal(false);
      await refreshUser();
      await loadAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to buy player');
    } finally {
      setBuying(false);
    }
  };

  const handleSell = async (holding: any) => {
    if (!user) return;
    const sellAll = window.confirm(`Sell all ${holding.quantity} units of ${holding.player.name}?`);
    if (!sellAll) return;

    try {
      await portfolioApi.sell({
        playerId: holding.player._id,
        quantity: holding.quantity
      });
      toast.success(`Sold ${holding.quantity}x ${holding.player.name}!`);
      await refreshUser();
      await loadAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sell player');
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'all' || p.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalWealth = (portfolio?.totalValue || 0) + user.balance;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome back, {user.username}!
              </h1>
              <p className="text-gray-600 mt-1">Manage your FutStocks portfolio</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Wealth</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ${totalWealth.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '🏠' },
              { id: 'market', label: 'Market', icon: '🏪' },
              { id: 'inventory', label: 'Inventory', icon: '💼' },
              { id: 'transactions', label: 'Transactions', icon: '📊' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all transform ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 transform transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Cash Balance</span>
                  <span className="text-3xl">💰</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  ${user.balance.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transform transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Portfolio Value</span>
                  <span className="text-3xl">📈</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {loadingData ? <LoadingSpinner size="sm" /> : `$${(portfolio?.totalValue || 0).toLocaleString()}`}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 transform transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Holdings Count</span>
                  <span className="text-3xl">💼</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {loadingData ? <LoadingSpinner size="sm" /> : (portfolio?.holdings?.length || 0)}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 transform transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Total ROI</span>
                  <span className="text-3xl">📊</span>
                </div>
                <div className={`text-3xl font-bold ${(portfolio?.totalROI || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {loadingData ? <LoadingSpinner size="sm" /> : `${(portfolio?.totalROI || 0) >= 0 ? '+' : ''}${(portfolio?.totalROI || 0).toFixed(2)}%`}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('market')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="text-4xl mb-2">🏪</div>
                  <div className="font-bold">Browse Market</div>
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="text-4xl mb-2">💼</div>
                  <div className="font-bold">My Inventory</div>
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="text-4xl mb-2">📊</div>
                  <div className="font-bold">Transactions</div>
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="font-bold">Leaderboard</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Player Market</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search players..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Positions</option>
                  <option value="GK">Goalkeeper</option>
                  <option value="DEF">Defender</option>
                  <option value="MID">Midfielder</option>
                  <option value="FWD">Forward</option>
                </select>
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="font-medium">{filteredPlayers.length} players</span>
                  <span className="mx-2">•</span>
                  <span>Balance: ${user.balance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => (
                <PlayerCard key={player._id} player={player} onBuy={handleBuy} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Inventory</h2>
              {portfolio?.holdings && portfolio.holdings.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.holdings.map((holding: any, index: number) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{holding.player.name}</h3>
                        <p className="text-gray-600">{holding.player.team} • {holding.player.position}</p>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span className="text-gray-600">Quantity: <span className="font-semibold">{holding.quantity}</span></span>
                          <span className="text-gray-600">Purchase Price: <span className="font-semibold">${holding.purchasePrice.toLocaleString()}</span></span>
                          <span className="text-gray-600">Current Price: <span className="font-semibold">${holding.player.currentPrice.toLocaleString()}</span></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          ${holding.currentValue.toLocaleString()}
                        </div>
                        <div className={`text-lg font-semibold mb-3 ${holding.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.roi >= 0 ? '+' : ''}{holding.roi.toFixed(2)}% ROI
                        </div>
                        <button
                          onClick={() => handleSell(holding)}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg transition-all transform hover:scale-105"
                        >
                          Sell All
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💼</div>
                  <p className="text-gray-500 text-lg mb-4">Your inventory is empty</p>
                  <button
                    onClick={() => setActiveTab('market')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                  >
                    Browse Market
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600">
                <h2 className="text-2xl font-bold text-white">Transaction History</h2>
              </div>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((txn) => (
                        <tr key={txn._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${txn.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {txn.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{txn.player.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{txn.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${txn.pricePerUnit.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${txn.totalAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-lg">No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600">
                <h2 className="text-2xl font-bold text-white">Top Investors</h2>
              </div>
              {leaderboard.length > 0 ? (
                <div className="p-6 space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-6 rounded-lg transition-all hover:shadow-lg ${
                        entry.userId === user.id
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-3xl font-bold ${index < 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600' : 'text-gray-400'}`}>
                          #{entry.rank}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{entry.username}</div>
                          <div className="text-sm text-gray-600">{entry.holdingsCount} holdings</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${entry.totalWealth.toLocaleString()}</div>
                        <div className={`text-sm font-semibold ${entry.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.totalROI >= 0 ? '+' : ''}{entry.totalROI.toFixed(2)}% ROI
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-gray-500 text-lg">No leaderboard data yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Buy {selectedPlayer.name}
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price per unit:</span>
                <span className="text-xl font-bold">${selectedPlayer.currentPrice.toLocaleString()}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2">
                <span className="text-gray-600 font-medium">Total Cost:</span>
                <span className="text-3xl font-bold text-blue-600">
                  ${(selectedPlayer.currentPrice * quantity).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Balance after: ${(user.balance - (selectedPlayer.currentPrice * quantity)).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBuyModal(false)}
                disabled={buying}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBuy}
                disabled={buying || (selectedPlayer.currentPrice * quantity > user.balance)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buying ? <LoadingSpinner size="sm" /> : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
