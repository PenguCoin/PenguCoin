'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Market', href: '/market', icon: '🏪' },
  { name: 'Portfolio', href: '/portfolio', icon: '💼' },
  { name: 'Transactions', href: '/transactions', icon: '📊' },
  { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
