/**
 * Format currency values
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get position color class
 */
export const getPositionColor = (position: string): string => {
  const colors = {
    'GK': 'text-yellow-600 bg-yellow-100',
    'DEF': 'text-blue-600 bg-blue-100',
    'MID': 'text-green-600 bg-green-100',
    'FWD': 'text-red-600 bg-red-100'
  };
  return colors[position as keyof typeof colors] || 'text-gray-600 bg-gray-100';
};

/**
 * Get position full name
 */
export const getPositionName = (position: string): string => {
  const names = {
    'GK': 'Goalkeeper',
    'DEF': 'Defender',
    'MID': 'Midfielder',
    'FWD': 'Forward'
  };
  return names[position as keyof typeof names] || position;
};

/**
 * Calculate time ago from date
 */
export const timeAgo = (date: string | Date): string => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';

  return 'just now';
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Get ROI color class
 */
export const getROIColor = (roi: number): string => {
  if (roi >= 10) return 'text-green-700';
  if (roi >= 5) return 'text-green-600';
  if (roi > 0) return 'text-green-500';
  if (roi === 0) return 'text-gray-500';
  if (roi >= -5) return 'text-red-500';
  if (roi >= -10) return 'text-red-600';
  return 'text-red-700';
};
