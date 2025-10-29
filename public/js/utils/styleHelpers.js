/**
 * Utility functions for styling and visual effects
 */

/**
 * Get border color class for a move
 * @param {string} move - The move type
 * @returns {string} Tailwind CSS class
 */
export function getBorderColor(move) {
  switch (move) {
    case 'attack': return 'border-red-500';
    case 'defend': return 'border-blue-500';
    case 'charge': return 'border-yellow-500';
    default: return 'border-purple-500/30';
  }
}

/**
 * Get shadow color class for a move
 * @param {string} move - The move type
 * @returns {string} Tailwind CSS class
 */
export function getShadowColor(move) {
  switch (move) {
    case 'attack': return 'shadow-red-500/50';
    case 'defend': return 'shadow-blue-500/50';
    case 'charge': return 'shadow-yellow-500/50';
    default: return '';
  }
}

/**
 * Get background color class for a move
 * @param {string} move - The move type
 * @returns {string} Tailwind CSS class
 */
export function getMoveColor(move) {
  switch (move) {
    case 'attack': return 'bg-red-500';
    case 'defend': return 'bg-blue-500';
    case 'charge': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
}
