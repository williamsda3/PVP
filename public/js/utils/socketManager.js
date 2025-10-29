/**
 * Socket.io connection manager for multiplayer functionality
 * Handles connection, event listening, and cleanup
 */

export class SocketManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.eventHandlers = {};
  }

  /**
   * Initialize socket connection
   * @returns {boolean} True if initialization succeeded
   */
  init() {
    if (this.socket) return true;

    if (typeof window.io === 'undefined') {
      console.error('Socket.io not loaded');
      return false;
    }

    // Use same URL as the page for production, localhost for development
    const SERVER_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : window.location.origin;

    try {
      this.socket = window.io(SERVER_URL);
      this._setupDefaultHandlers();
      return true;
    } catch (err) {
      console.error('Failed to initialize socket:', err);
      return false;
    }
  }

  /**
   * Set up default connection handlers
   */
  _setupDefaultHandlers() {
    this.socket.on('connect', () => {
      this.connected = true;
      console.log('✅ Connected to server');
      this._triggerHandler('connect');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this._triggerHandler('connect_error', error);
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('❌ Disconnected from server');
      this._triggerHandler('disconnect');
    });
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);

    // Also register with socket if it exists
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  /**
   * Remove an event handler
   * @param {string} event - Event name
   * @param {Function} handler - Handler function to remove
   */
  off(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    }

    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Emit an event to the server
   * @param {string} event - Event name
   * @param {Object} data - Data to send
   */
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not initialized, cannot emit event:', event);
    }
  }

  /**
   * Trigger all handlers for an event
   * @param {string} event - Event name
   * @param {*} data - Data to pass to handlers
   */
  _triggerHandler(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(data));
    }
  }

  /**
   * Disconnect and clean up
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.eventHandlers = {};
  }

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
