/**
 * Lobby management system for multiplayer games
 */

class LobbyManager {
  constructor() {
    this.lobbies = new Map();
  }

  /**
   * Create a new lobby
   * @param {string} code - Unique lobby code
   * @param {string} hostId - Socket ID of the host
   * @param {string} hostName - Display name of the host
   * @param {number} bestOf - Number of rounds (best of N)
   * @returns {Object} The created lobby object
   */
  createLobby(code, hostId, hostName, bestOf) {
    const lobby = {
      host: hostId,
      hostName: hostName,
      guest: null,
      guestName: null,
      bestOf,
      hostWantsRematch: false,
      guestWantsRematch: false
    };
    this.lobbies.set(code, lobby);
    return lobby;
  }

  /**
   * Get a lobby by its code
   * @param {string} code - Lobby code
   * @returns {Object|undefined} Lobby object or undefined if not found
   */
  getLobby(code) {
    return this.lobbies.get(code);
  }

  /**
   * Add a guest to an existing lobby
   * @param {string} code - Lobby code
   * @param {string} guestId - Socket ID of the guest
   * @param {string} guestName - Display name of the guest
   * @returns {boolean} True if successful, false if lobby not found or full
   */
  addGuest(code, guestId, guestName) {
    const lobby = this.lobbies.get(code);
    if (!lobby || lobby.guest) {
      return false;
    }
    lobby.guest = guestId;
    lobby.guestName = guestName;
    return true;
  }

  /**
   * Find which lobby a socket is in
   * @param {string} socketId - Socket ID to search for
   * @returns {Object|null} Object with {code, lobby, isHost} or null if not found
   */
  findLobbyBySocketId(socketId) {
    for (const [code, lobby] of this.lobbies.entries()) {
      if (lobby.host === socketId) {
        return { code, lobby, isHost: true };
      }
      if (lobby.guest === socketId) {
        return { code, lobby, isHost: false };
      }
    }
    return null;
  }

  /**
   * Set rematch preference for a player
   * @param {string} code - Lobby code
   * @param {boolean} isHost - Whether the player is the host
   * @param {boolean} wantsRematch - Whether they want a rematch
   */
  setRematchPreference(code, isHost, wantsRematch) {
    const lobby = this.lobbies.get(code);
    if (!lobby) return;

    if (isHost) {
      lobby.hostWantsRematch = wantsRematch;
    } else {
      lobby.guestWantsRematch = wantsRematch;
    }
  }

  /**
   * Check if both players want a rematch
   * @param {string} code - Lobby code
   * @returns {boolean} True if both players want rematch
   */
  bothWantRematch(code) {
    const lobby = this.lobbies.get(code);
    return lobby ? lobby.hostWantsRematch && lobby.guestWantsRematch : false;
  }

  /**
   * Reset rematch flags for a lobby
   * @param {string} code - Lobby code
   */
  resetRematchFlags(code) {
    const lobby = this.lobbies.get(code);
    if (lobby) {
      lobby.hostWantsRematch = false;
      lobby.guestWantsRematch = false;
    }
  }

  /**
   * Delete a lobby
   * @param {string} code - Lobby code
   */
  deleteLobby(code) {
    this.lobbies.delete(code);
  }

  /**
   * Get the opponent's socket ID
   * @param {string} code - Lobby code
   * @param {string} socketId - Current player's socket ID
   * @returns {string|null} Opponent's socket ID or null
   */
  getOpponentId(code, socketId) {
    const lobby = this.lobbies.get(code);
    if (!lobby) return null;
    return lobby.host === socketId ? lobby.guest : lobby.host;
  }
}

module.exports = LobbyManager;
