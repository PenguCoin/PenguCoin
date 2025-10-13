'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { portfolioApi, playersApi, leaderboardApi } from '@/lib/api';
import { Player, Transaction, LeaderboardEntry } from '@/lib/types';
import toast from 'react-hot-toast';

type TabType = 'squad' | 'players' | 'transfers' | 'inbox';

interface TransactionLog {
  id: string;
  type: 'BUY' | 'SELL';
  playerName: string;
  amount: number;
  timestamp: Date;
}

export default function DashboardPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('squad');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modal states
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedHolding, setSelectedHolding] = useState<any>(null);
  const [buying, setBuying] = useState(false);
  const [selling, setSelling] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');

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
        portfolioApi.getTransactions(50),
        leaderboardApi.get(20)
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

  const handleBuyClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowBuyModal(true);
  };

  const handleSellClick = (holding: any) => {
    setSelectedHolding(holding);
    setShowSellModal(true);
  };

  const confirmBuy = async () => {
    if (!selectedPlayer || !user) return;

    const totalCost = selectedPlayer.currentPrice;
    if (totalCost > user.balance) {
      toast.error('Insufficient funds!');
      return;
    }

    setBuying(true);
    try {
      await portfolioApi.buy({
        playerId: selectedPlayer._id,
        quantity: 1
      });

      // Add to transaction log
      const newLog: TransactionLog = {
        id: Date.now().toString(),
        type: 'BUY',
        playerName: selectedPlayer.name,
        amount: selectedPlayer.currentPrice,
        timestamp: new Date()
      };
      setTransactionLogs(prev => [newLog, ...prev].slice(0, 10));

      toast.success(`✅ ${selectedPlayer.name} signed successfully!`);
      setShowBuyModal(false);
      setSelectedPlayer(null);
      await refreshUser();
      await loadAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sign player');
    } finally {
      setBuying(false);
    }
  };

  const confirmSell = async () => {
    if (!selectedHolding || !user) return;

    setSelling(true);
    try {
      await portfolioApi.sell({
        playerId: selectedHolding.player._id,
        quantity: selectedHolding.quantity
      });

      // Add to transaction log
      const saleAmount = selectedHolding.player.currentPrice * selectedHolding.quantity;
      const newLog: TransactionLog = {
        id: Date.now().toString(),
        type: 'SELL',
        playerName: selectedHolding.player.name,
        amount: saleAmount,
        timestamp: new Date()
      };
      setTransactionLogs(prev => [newLog, ...prev].slice(0, 10));

      toast.success(`✅ ${selectedHolding.player.name} sold for £${(saleAmount / 1000000).toFixed(1)}M`);
      setShowSellModal(false);
      setSelectedHolding(null);
      await refreshUser();
      await loadAllData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sell player');
    } finally {
      setSelling(false);
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter === 'all' || p.position === positionFilter;

    let matchesPrice = true;
    if (priceRangeFilter === 'low') matchesPrice = p.currentPrice < 3000;
    else if (priceRangeFilter === 'medium') matchesPrice = p.currentPrice >= 3000 && p.currentPrice < 4500;
    else if (priceRangeFilter === 'high') matchesPrice = p.currentPrice >= 4500;

    // Filter out players already in squad
    const notInSquad = !portfolio?.holdings?.some((h: any) => h.player._id === p._id);

    return matchesSearch && matchesPosition && matchesPrice && notInSquad;
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `£${(amount / 1000000).toFixed(1)}M`;
    }
    return `£${(amount / 1000).toFixed(0)}K`;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalWealth = (portfolio?.totalValue || 0) + user.balance;
  const clubRank = leaderboard.findIndex(e => e.userId === user.id) + 1;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col" style={{ background: 'var(--bg-tertiary)', borderRight: '2px solid var(--border-color)' }}>
        {/* Club Badge */}
        <div className="p-6 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border-color)' }}>
              ⚽
            </div>
            <div>
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user.username} FC</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Est. 2024</div>
            </div>
          </div>
        </div>

        {/* Manager Info */}
        <div className="p-4 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Manager</div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.username}</div>
        </div>

        {/* Club Finances */}
        <div className="p-4 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Club Finances</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Transfer Budget</span>
              <span className={`text-sm font-bold ${user.balance < 1000 ? 'text-red-600' : ''}`} style={{ color: user.balance >= 1000 ? 'var(--accent-success)' : undefined }}>
                {formatCurrency(user.balance)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Squad Value</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(portfolio?.totalValue || 0)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Worth</span>
              <span className="text-base font-bold" style={{ color: 'var(--accent-primary)' }}>{formatCurrency(totalWealth)}</span>
            </div>
          </div>
        </div>

        {/* League Position */}
        <div className="p-4 border-b-2" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>League Standing</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold" style={{ color: 'var(--accent-primary)' }}>{clubRank || '-'}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>of {leaderboard.length}</span>
          </div>
        </div>

        {/* Squad Info */}
        <div className="p-4 flex-1">
          <div className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Squad</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Players</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{portfolio?.holdings?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg. ROI</span>
              <span className={`text-sm font-semibold ${(portfolio?.totalROI || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(portfolio?.totalROI || 0) >= 0 ? '+' : ''}{(portfolio?.totalROI || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {transactionLogs.length > 0 && (
          <div className="p-4 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Recent Activity</div>
            <div className="space-y-1">
              {transactionLogs.slice(0, 3).map(log => (
                <div key={log.id} className="text-xs flex items-center gap-2">
                  <span className={log.type === 'BUY' ? 'text-red-600' : 'text-green-600'}>
                    {log.type === 'BUY' ? '−' : '+'}
                  </span>
                  <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{log.playerName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={async () => {
              const { logout } = useAuth();
              await logout();
              router.push('/login');
            }}
            className="w-full px-4 py-2 text-sm font-semibold rounded transition-all hover:shadow-md"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          >
            Exit to Main Menu
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="h-16 flex items-center justify-between px-6" style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)' }}>
          <div className="flex gap-2">
            {[
              { id: 'squad', label: 'My Squad', icon: '👥' },
              { id: 'players', label: 'Player List', icon: '📋' },
              { id: 'transfers', label: 'Transfer Market', icon: '💰' },
              { id: 'inbox', label: 'League Table', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className="px-5 py-2 text-sm font-semibold transition-all rounded-lg"
                style={{
                  background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  border: activeTab === tab.id ? 'none' : '1px solid transparent'
                }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Balance Display */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Balance:</span>
            <span className="text-lg font-bold" style={{ color: user.balance < 1000 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
              {formatCurrency(user.balance)}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--bg-secondary)' }}>
          {activeTab === 'squad' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Squad</h1>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {portfolio?.holdings?.length || 0} Players • Total Value: {formatCurrency(portfolio?.totalValue || 0)}
                  </p>
                </div>
              </div>

              {portfolio?.holdings && portfolio.holdings.length > 0 ? (
                <div className="rounded-lg overflow-hidden shadow-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Player</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Pos</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Club</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Purchase</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Value</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>ROI</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.holdings.map((holding: any, index: number) => (
                        <tr
                          key={index}
                          className="transition-colors"
                          style={{ borderBottom: '1px solid var(--border-color)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td className="px-4 py-3">
                            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{holding.player.name}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 text-xs font-bold rounded" style={{
                              background: 'var(--bg-secondary)',
                              color: 'var(--accent-primary)',
                              border: '1px solid var(--border-color)'
                            }}>
                              {holding.player.position}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{holding.player.team}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{holding.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(holding.purchasePrice)}</td>
                          <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'var(--accent-success)' }}>{formatCurrency(holding.currentValue)}</td>
                          <td className="px-4 py-3 text-right text-sm font-bold" style={{
                            color: holding.roi >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
                          }}>
                            {holding.roi >= 0 ? '+' : ''}{holding.roi.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleSellClick(holding)}
                              className="px-4 py-1.5 text-xs font-bold rounded transition-all hover:shadow-md"
                              style={{ background: 'var(--accent-danger)', color: 'white' }}
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
                <div className="rounded-lg p-12 text-center shadow-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Players in Squad</p>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Build your squad from the transfer market</p>
                  <button
                    onClick={() => setActiveTab('transfers')}
                    className="px-6 py-3 text-sm font-bold rounded-lg transition-all hover:shadow-lg"
                    style={{ background: 'var(--accent-success)', color: 'white' }}
                  >
                    Go to Transfer Market
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'players' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>All Players</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Complete player database</p>
              </div>

              <div className="rounded-lg overflow-hidden shadow-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Player</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Pos</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Club</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Value</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr
                        key={player._id}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid var(--border-color)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{player.name}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 text-xs font-bold rounded" style={{
                            background: 'var(--bg-secondary)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--border-color)'
                          }}>
                            {player.position}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{player.team}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'var(--accent-success)' }}>{formatCurrency(player.currentPrice)}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold" style={{
                          color: player.totalROI >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
                        }}>
                          {player.totalROI >= 0 ? '+' : ''}{player.totalROI.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Transfer Market</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Available Budget: <span className="font-bold" style={{ color: 'var(--accent-success)' }}>{formatCurrency(user.balance)}</span>
                </p>
              </div>

              {/* Filters */}
              <div className="rounded-lg p-4 shadow-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <div className="grid grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search players..."
                    className="px-3 py-2 text-sm rounded-lg"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg font-semibold"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="all">All Positions</option>
                    <option value="GK">Goalkeeper</option>
                    <option value="DEF">Defender</option>
                    <option value="MID">Midfielder</option>
                    <option value="FWD">Forward</option>
                  </select>
                  <select
                    value={priceRangeFilter}
                    onChange={(e) => setPriceRangeFilter(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg font-semibold"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under £3M</option>
                    <option value="medium">£3M - £4.5M</option>
                    <option value="high">Over £4.5M</option>
                  </select>
                  <div className="text-sm flex items-center font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {filteredPlayers.length} players available
                  </div>
                </div>
              </div>

              {filteredPlayers.length > 0 ? (
                <div className="rounded-lg overflow-hidden shadow-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Player</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Pos</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Current Club</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Transfer Fee</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>ROI</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map((player) => {
                        const canAfford = user.balance >= player.currentPrice;
                        return (
                          <tr
                            key={player._id}
                            className="transition-colors"
                            style={{ borderBottom: '1px solid var(--border-color)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <td className="px-4 py-3">
                              <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{player.name}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-1 text-xs font-bold rounded" style={{
                                background: 'var(--bg-secondary)',
                                color: 'var(--accent-primary)',
                                border: '1px solid var(--border-color)'
                              }}>
                                {player.position}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{player.team}</td>
                            <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'var(--accent-success)' }}>{formatCurrency(player.currentPrice)}</td>
                            <td className="px-4 py-3 text-right text-sm font-bold" style={{
                              color: player.totalROI >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
                            }}>
                              {player.totalROI >= 0 ? '+' : ''}{player.totalROI.toFixed(1)}%
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleBuyClick(player)}
                                disabled={!canAfford}
                                className="px-4 py-1.5 text-xs font-bold rounded transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: canAfford ? 'var(--accent-success)' : 'var(--bg-secondary)',
                                  color: canAfford ? 'white' : 'var(--text-muted)',
                                  border: !canAfford ? '1px solid var(--border-color)' : 'none'
                                }}
                              >
                                {canAfford ? 'Buy' : 'Insufficient Funds'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg p-12 text-center shadow-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Players Found</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>League Table</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manager Rankings</p>
              </div>

              <div className="rounded-lg overflow-hidden shadow-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Pos</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Manager</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Wealth</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Players</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => {
                      const isCurrentUser = entry.userId === user.id;
                      return (
                        <tr
                          key={entry.userId}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: isCurrentUser ? 'rgba(39, 174, 96, 0.1)' : 'transparent',
                            fontWeight: isCurrentUser ? 'bold' : 'normal'
                          }}
                        >
                          <td className="px-4 py-3 text-center">
                            <span className={`text-lg font-bold ${entry.rank <= 3 ? 'text-yellow-600' : ''}`} style={{ color: entry.rank > 3 ? 'var(--text-secondary)' : undefined }}>
                              {entry.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold" style={{ color: isCurrentUser ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                            {entry.username} {isCurrentUser && '(You)'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold" style={{ color: 'var(--accent-success)' }}>
                            {formatCurrency(entry.totalWealth)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {entry.holdingsCount}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold" style={{
                            color: entry.totalROI >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
                          }}>
                            {entry.totalROI >= 0 ? '+' : ''}{entry.totalROI.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedPlayer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="max-w-lg w-full rounded-xl p-6 shadow-2xl" style={{ background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)' }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Confirm Transfer</h3>

            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{selectedPlayer.name}</div>
              <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{selectedPlayer.team} • {selectedPlayer.position}</div>
              <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current ROI:</span>
                <span className={`text-sm font-bold ${selectedPlayer.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedPlayer.totalROI >= 0 ? '+' : ''}{selectedPlayer.totalROI.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Transfer Fee:</span>
                <span className="text-xl font-bold" style={{ color: 'var(--accent-danger)' }}>{formatCurrency(selectedPlayer.currentPrice)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Current Balance:</span>
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(user.balance)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Balance After:</span>
                <span className="text-lg font-bold" style={{ color: user.balance - selectedPlayer.currentPrice < 1000 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                  {formatCurrency(user.balance - selectedPlayer.currentPrice)}
                </span>
              </div>
            </div>

            {user.balance < selectedPlayer.currentPrice && (
              <div className="mb-4 p-3 rounded-lg" style={{ background: '#fee', border: '1px solid #fcc' }}>
                <p className="text-sm font-semibold text-red-700">⚠️ Insufficient funds for this transfer</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBuyModal(false);
                  setSelectedPlayer(null);
                }}
                disabled={buying}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-all"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmBuy}
                disabled={buying || user.balance < selectedPlayer.currentPrice}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent-success)', color: 'white' }}
              >
                {buying ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedHolding && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="max-w-lg w-full rounded-xl p-6 shadow-2xl" style={{ background: 'var(--bg-tertiary)', border: '2px solid var(--border-color)' }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Confirm Sale</h3>

            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{selectedHolding.player.name}</div>
              <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{selectedHolding.player.team} • {selectedHolding.player.position}</div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Quantity</div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedHolding.quantity}</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Purchased</div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(selectedHolding.purchasePrice)}</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>ROI</div>
                  <div className={`text-sm font-bold ${selectedHolding.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedHolding.roi >= 0 ? '+' : ''}{selectedHolding.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Sale Price:</span>
                <span className="text-xl font-bold" style={{ color: 'var(--accent-success)' }}>
                  +{formatCurrency(selectedHolding.player.currentPrice * selectedHolding.quantity)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Current Balance:</span>
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(user.balance)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Balance After:</span>
                <span className="text-lg font-bold" style={{ color: 'var(--accent-success)' }}>
                  {formatCurrency(user.balance + (selectedHolding.player.currentPrice * selectedHolding.quantity))}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSellModal(false);
                  setSelectedHolding(null);
                }}
                disabled={selling}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-all"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSell}
                disabled={selling}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-all hover:shadow-lg disabled:opacity-50"
                style={{ background: 'var(--accent-danger)', color: 'white' }}
              >
                {selling ? 'Processing...' : 'Confirm Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
