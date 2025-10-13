'use client';

import { Player } from '@/lib/types';
import Image from 'next/image';

interface PlayerCardProps {
  player: Player;
  onBuy?: (player: Player) => void;
  showBuyButton?: boolean;
}

export default function PlayerCard({ player, onBuy, showBuyButton = true }: PlayerCardProps) {
  const positionColors = {
    GK: 'bg-yellow-500',
    DEF: 'bg-blue-500',
    MID: 'bg-green-500',
    FWD: 'bg-red-500'
  };

  const isPositive = player.priceChangePercent >= 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className={`h-2 ${positionColors[player.position]}`}></div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {player.name}
            </h3>
            <p className="text-sm text-gray-600">{player.team}</p>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-bold text-white ${positionColors[player.position]}`}>
            {player.position}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price</span>
            <span className="text-xl font-bold text-gray-900">
              ${player.currentPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Change</span>
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{player.priceChangePercent.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total ROI</span>
            <span className={`text-sm font-semibold ${player.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {player.totalROI >= 0 ? '+' : ''}{player.totalROI.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Popularity</span>
            <span className="text-sm font-medium text-gray-700">
              {player.popularity} investors
            </span>
          </div>
        </div>

        {showBuyButton && onBuy && (
          <button
            onClick={() => onBuy(player)}
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-md transition-all duration-300 transform hover:scale-105"
          >
            Buy Player
          </button>
        )}
      </div>
    </div>
  );
}
