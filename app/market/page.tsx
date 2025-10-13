'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { playersApi, portfolioApi } from '@/lib/api';
import { Player } from '@/lib/types';
import PlayerCard from '@/components/PlayerCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import DashboardNav from '@/components/DashboardNav';
import toast from 'react-hot-toast';

export default function MarketPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('-totalROI');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buying, setBuying] = useState(false);

  const fetchPlayers = async () => {
    try {
      const response = await playersApi.getAll({ sort: sortBy });
      setPlayers(response.data.players);
    } catch (error) {
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...players];

    // Filter by position
    if (filter !== 'all') {
      result = result.filter(p => p.position === filter);
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === '-totalROI') {
      result.sort((a, b) => b.totalROI - a.totalROI);
    } else if (sortBy === 'totalROI') {
      result.sort((a, b) => a.totalROI - b.totalROI);
    } else if (sortBy === '-currentPrice') {
      result.sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (sortBy === 'currentPrice') {
      result.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sortBy === '-popularity') {
      result.sort((a, b) => b.popularity - a.popularity);
    }

    setFilteredPlayers(result);
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, filter, sortBy, searchQuery]);

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
      await fetchPlayers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to buy player');
    } finally {
      setBuying(false);
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Player Market</h1>
          <p className="text-gray-600">Browse and invest in football players</p>
        </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Positions</option>
              <option value="GK">Goalkeeper</option>
              <option value="DEF">Defender</option>
              <option value="MID">Midfielder</option>
              <option value="FWD">Forward</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="-totalROI">Highest ROI</option>
              <option value="totalROI">Lowest ROI</option>
              <option value="-currentPrice">Highest Price</option>
              <option value="currentPrice">Lowest Price</option>
              <option value="-popularity">Most Popular</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <div className="font-medium">{filteredPlayers.length} players found</div>
              <div className="text-xs">Your balance: ${user?.balance.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlayers.map((player) => (
          <PlayerCard key={player._id} player={player} onBuy={handleBuy} />
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No players found</p>
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-2xl font-bold mb-4">Buy {selectedPlayer.name}</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price per unit:</span>
                <span className="text-lg font-semibold">${selectedPlayer.currentPrice.toLocaleString()}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600 font-medium">Total Cost:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${(selectedPlayer.currentPrice * quantity).toLocaleString()}
                </span>
              </div>

              <div className="text-sm text-gray-500">
                Balance after purchase: ${(user!.balance - (selectedPlayer.currentPrice * quantity)).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBuyModal(false)}
                disabled={buying}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBuy}
                disabled={buying || (selectedPlayer.currentPrice * quantity > user!.balance)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buying ? <LoadingSpinner size="sm" /> : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
