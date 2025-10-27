const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files (index.html)
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active lobbies
const lobbies = new Map();

// Generate random 4-letter code
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (lobbies.has(code));
  return code;
}

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('createLobby', ({ playerName, bestOf }) => {
    const code = generateCode();
    lobbies.set(code, {
      host: socket.id,
      hostName: playerName,
      guest: null,
      guestName: null,
      bestOf,
      hostWantsRematch: false,
      guestWantsRematch: false
    });
    socket.join(code);
    socket.emit('lobbyCreated', { code });
    console.log(`🎮 Lobby created: ${code} by ${playerName} (${socket.id})`);
  });

  socket.on('joinLobby', ({ code, playerName }) => {
    const lobby = lobbies.get(code);
    
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

    lobby.guest = socket.id;
    lobby.guestName = playerName;
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

  socket.on('makeMove', ({ move }) => {
    console.log(`🎯 Move received: "${move}" from ${socket.id}`);
    
    // Find which lobby this socket is in
    for (const [code, lobby] of lobbies.entries()) {
      if (lobby.host === socket.id || lobby.guest === socket.id) {
        const opponentId = lobby.host === socket.id ? lobby.guest : lobby.host;
        const playerRole = lobby.host === socket.id ? 'Host' : 'Guest';
        
        console.log(`   ${playerRole} move in lobby ${code}`);
        console.log(`   Forwarding to opponent: ${opponentId}`);
        
        // Send move to opponent
        io.to(opponentId).emit('opponentMove', { move });
        break;
      }
    }
  });

  socket.on('requestRematch', () => {
    console.log(`🔄 Rematch requested by ${socket.id}`);
    
    // Find which lobby this socket is in
    for (const [code, lobby] of lobbies.entries()) {
      if (lobby.host === socket.id || lobby.guest === socket.id) {
        const isHost = lobby.host === socket.id;
        const opponentId = isHost ? lobby.guest : lobby.host;
        
        // Mark this player as wanting rematch
        if (isHost) {
          lobby.hostWantsRematch = true;
        } else {
          lobby.guestWantsRematch = true;
        }
        
        console.log(`   Lobby ${code} rematch status: Host=${lobby.hostWantsRematch}, Guest=${lobby.guestWantsRematch}`);
        
        // Notify opponent that this player wants rematch
        io.to(opponentId).emit('opponentWantsRematch');
        
        // If both want rematch, start new game
        if (lobby.hostWantsRematch && lobby.guestWantsRematch) {
          console.log(`   ✅ Both players ready! Starting rematch in ${code}`);
          
          // Reset rematch flags
          lobby.hostWantsRematch = false;
          lobby.guestWantsRematch = false;
          
          // Notify both players to start new game
          io.to(code).emit('rematchAccepted');
        }
        break;
      }
    }
  });

  socket.on('cancelRematch', () => {
    console.log(`❌ Rematch cancelled by ${socket.id}`);
    
    // Find which lobby this socket is in
    for (const [code, lobby] of lobbies.entries()) {
      if (lobby.host === socket.id || lobby.guest === socket.id) {
        const isHost = lobby.host === socket.id;
        const opponentId = isHost ? lobby.guest : lobby.host;
        
        // Mark this player as NOT wanting rematch
        if (isHost) {
          lobby.hostWantsRematch = false;
        } else {
          lobby.guestWantsRematch = false;
        }
        
        // Notify opponent
        io.to(opponentId).emit('opponentCancelledRematch');
        break;
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    
    // Find and clean up lobby
    for (const [code, lobby] of lobbies.entries()) {
      if (lobby.host === socket.id || lobby.guest === socket.id) {
        const opponentId = lobby.host === socket.id ? lobby.guest : lobby.host;
        if (opponentId) {
          console.log(`   Notifying opponent ${opponentId} of disconnect`);
          io.to(opponentId).emit('opponentDisconnected');
        }
        lobbies.delete(code);
        console.log(`🗑️  Lobby ${code} deleted`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Waiting for connections...`);
});