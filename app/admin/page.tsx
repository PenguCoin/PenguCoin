'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { adminApi, playersApi } from '@/lib/api';
import { Player } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'players' | 'stats' | 'matchweek'>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Player form
  const [playerForm, setPlayerForm] = useState({
    name: '',
    team: '',
    position: 'FWD' as 'GK' | 'DEF' | 'MID' | 'FWD',
    price: 1000,
    imageUrl: ''
  });

  // Stats form
  const [statsForm, setStatsForm] = useState({
    playerId: '',
    matchweek: 1,
    goals: 0,
    assists: 0,
    cleanSheet: false,
    yellowCards: 0,
    redCards: 0,
    minutesPlayed: 0,
    rating: 0
  });

  // Matchweek form
  const [matchweekForm, setMatchweekForm] = useState({
    weekNumber: 1,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.isAdmin) {
      toast.error('Access denied: Admin only');
      router.push('/market');
      return;
    }
    fetchPlayers();
  }, [user, router]);

  const fetchPlayers = async () => {
    try {
      const response = await playersApi.getAll();
      setPlayers(response.data.players);
    } catch (error) {
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.createPlayer(playerForm);
      toast.success('Player created successfully!');
      setPlayerForm({ name: '', team: '', position: 'FWD', price: 1000, imageUrl: '' });
      await fetchPlayers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create player');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statsForm.playerId) {
      toast.error('Please select a player');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.updatePlayerStats(statsForm.playerId, {
        matchweek: statsForm.matchweek,
        goals: statsForm.goals,
        assists: statsForm.assists,
        cleanSheet: statsForm.cleanSheet,
        yellowCards: statsForm.yellowCards,
        redCards: statsForm.redCards,
        minutesPlayed: statsForm.minutesPlayed,
        rating: statsForm.rating
      });
      toast.success('Stats updated successfully!');
      await fetchPlayers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update stats');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMatchweek = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.createMatchweek(matchweekForm);
      toast.success('Matchweek created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create matchweek');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('players')}
            className={`pb-4 px-1 ${activeTab === 'players' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Create Player
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-4 px-1 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Update Stats
          </button>
          <button
            onClick={() => setActiveTab('matchweek')}
            className={`pb-4 px-1 ${activeTab === 'matchweek' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Manage Matchweek
          </button>
        </div>
      </div>

      {/* Create Player Tab */}
      {activeTab === 'players' && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">Create New Player</h2>
          <form onSubmit={handleCreatePlayer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
              <input
                type="text"
                required
                value={playerForm.name}
                onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Erling Haaland"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <input
                type="text"
                required
                value={playerForm.team}
                onChange={(e) => setPlayerForm({ ...playerForm, team: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Manchester City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={playerForm.position}
                onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="GK">Goalkeeper</option>
                <option value="DEF">Defender</option>
                <option value="MID">Midfielder</option>
                <option value="FWD">Forward</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Price ($)</label>
              <input
                type="number"
                required
                min="50"
                value={playerForm.price}
                onChange={(e) => setPlayerForm({ ...playerForm, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
              <input
                type="text"
                value={playerForm.imageUrl}
                onChange={(e) => setPlayerForm({ ...playerForm, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Create Player'}
            </button>
          </form>
        </div>
      )}

      {/* Update Stats Tab */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">Update Player Stats</h2>
          <form onSubmit={handleUpdateStats} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Player</label>
              <select
                required
                value={statsForm.playerId}
                onChange={(e) => setStatsForm({ ...statsForm, playerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a player...</option>
                {players.map(player => (
                  <option key={player._id} value={player._id}>
                    {player.name} ({player.team})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matchweek</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={statsForm.matchweek}
                  onChange={(e) => setStatsForm({ ...statsForm, matchweek: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                <input
                  type="number"
                  min="0"
                  value={statsForm.goals}
                  onChange={(e) => setStatsForm({ ...statsForm, goals: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assists</label>
                <input
                  type="number"
                  min="0"
                  value={statsForm.assists}
                  onChange={(e) => setStatsForm({ ...statsForm, assists: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minutes Played</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={statsForm.minutesPlayed}
                  onChange={(e) => setStatsForm({ ...statsForm, minutesPlayed: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={statsForm.rating}
                  onChange={(e) => setStatsForm({ ...statsForm, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yellow Cards</label>
                <input
                  type="number"
                  min="0"
                  value={statsForm.yellowCards}
                  onChange={(e) => setStatsForm({ ...statsForm, yellowCards: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Red Cards</label>
                <input
                  type="number"
                  min="0"
                  value={statsForm.redCards}
                  onChange={(e) => setStatsForm({ ...statsForm, redCards: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={statsForm.cleanSheet}
                  onChange={(e) => setStatsForm({ ...statsForm, cleanSheet: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Clean Sheet</label>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Update Stats & Prices'}
            </button>
          </form>
        </div>
      )}

      {/* Matchweek Tab */}
      {activeTab === 'matchweek' && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">Create New Matchweek</h2>
          <form onSubmit={handleCreateMatchweek} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Week Number</label>
              <input
                type="number"
                required
                min="1"
                value={matchweekForm.weekNumber}
                onChange={(e) => setMatchweekForm({ ...matchweekForm, weekNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={matchweekForm.startDate}
                onChange={(e) => setMatchweekForm({ ...matchweekForm, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={matchweekForm.endDate}
                onChange={(e) => setMatchweekForm({ ...matchweekForm, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {submitting ? <LoadingSpinner size="sm" /> : 'Create Matchweek'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
