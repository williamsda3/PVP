/**
 * Socket.io event handlers for real-time multiplayer communication
 */

const { generateCode } = require('../utils/codeGenerator');

/**
 * Set up all socket event listeners
 * @param {SocketIO.Server} io - Socket.io server instance
 * @param {LobbyManager} lobbyManager - Lobby management instance
 */
function setupSocketEvents(io, lobbyManager) {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // Handle lobby creation
    socket.on('createLobby', ({ playerName, bestOf }) => {
      const code = generateCode(lobbyManager.lobbies);
      lobbyManager.createLobby(code, socket.id, playerName, bestOf);
      socket.join(code);
      socket.emit('lobbyCreated', { code });
      console.log(`🎮 Lobby created: ${code} by ${playerName} (${socket.id})`);
    });

    // Handle joining a lobby
    socket.on('joinLobby', ({ code, playerName }) => {
      const lobby = lobbyManager.getLobby(code);

      if (!lobby) {
        console.log(`❌ Lobby not found: ${code}`);
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }

      if (lobby.guest) {
        console.log(`❌ Lobby full: ${code}`);
        socket.emit('error', { message: 'Lobby is full' });
        return;
      }

      lobbyManager.addGuest(code, socket.id, playerName);
      socket.join(code);

      console.log(`✅ ${playerName} (${socket.id}) joined lobby ${code}`);
      console.log(`   Host: ${lobby.host}`);
      console.log(`   Guest: ${lobby.guest}`);

      // Notify host
      io.to(lobby.host).emit('opponentJoined', { opponentName: playerName });

      // Send confirmation to guest
      socket.emit('lobbyJoined', {
        opponentName: lobby.hostName,
        isHost: false
      });
    });

    // Handle player moves
    socket.on('makeMove', ({ move }) => {
      console.log(`🎯 Move received: "${move}" from ${socket.id}`);

      const lobbyInfo = lobbyManager.findLobbyBySocketId(socket.id);
      if (lobbyInfo) {
        const { code, lobby, isHost } = lobbyInfo;
        const opponentId = lobbyManager.getOpponentId(code, socket.id);
        const playerRole = isHost ? 'Host' : 'Guest';

        console.log(`   ${playerRole} move in lobby ${code}`);
        console.log(`   Forwarding to opponent: ${opponentId}`);

        // Send move to opponent
        io.to(opponentId).emit('opponentMove', { move });
      }
    });

    // Handle rematch requests
    socket.on('requestRematch', () => {
      console.log(`🔄 Rematch requested by ${socket.id}`);

      const lobbyInfo = lobbyManager.findLobbyBySocketId(socket.id);
      if (lobbyInfo) {
        const { code, lobby, isHost } = lobbyInfo;
        const opponentId = lobbyManager.getOpponentId(code, socket.id);

        // Mark this player as wanting rematch
        lobbyManager.setRematchPreference(code, isHost, true);

        console.log(`   Lobby ${code} rematch status: Host=${lobby.hostWantsRematch}, Guest=${lobby.guestWantsRematch}`);

        // Notify opponent that this player wants rematch
        io.to(opponentId).emit('opponentWantsRematch');

        // If both want rematch, start new game
        if (lobbyManager.bothWantRematch(code)) {
          console.log(`   ✅ Both players ready! Starting rematch in ${code}`);

          // Reset rematch flags
          lobbyManager.resetRematchFlags(code);

          // Notify both players to start new game
          io.to(code).emit('rematchAccepted');
        }
      }
    });

    // Handle rematch cancellation
    socket.on('cancelRematch', () => {
      console.log(`❌ Rematch cancelled by ${socket.id}`);

      const lobbyInfo = lobbyManager.findLobbyBySocketId(socket.id);
      if (lobbyInfo) {
        const { code, isHost } = lobbyInfo;
        const opponentId = lobbyManager.getOpponentId(code, socket.id);

        // Mark this player as NOT wanting rematch
        lobbyManager.setRematchPreference(code, isHost, false);

        // Notify opponent
        io.to(opponentId).emit('opponentCancelledRematch');
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);

      const lobbyInfo = lobbyManager.findLobbyBySocketId(socket.id);
      if (lobbyInfo) {
        const { code } = lobbyInfo;
        const opponentId = lobbyManager.getOpponentId(code, socket.id);

        if (opponentId) {
          console.log(`   Notifying opponent ${opponentId} of disconnect`);
          io.to(opponentId).emit('opponentDisconnected');
        }

        lobbyManager.deleteLobby(code);
        console.log(`🗑️  Lobby ${code} deleted`);
      }
    });
  });
}

module.exports = { setupSocketEvents };
