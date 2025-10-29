/**
 * Utility for generating unique lobby codes
 */

/**
 * Generate a random 4-letter code for lobby identification
 * @param {Map} existingLobbies - Map of existing lobby codes to avoid duplicates
 * @returns {string} A unique 4-character code
 */
function generateCode(existingLobbies) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (existingLobbies.has(code));
  return code;
}

module.exports = { generateCode };
