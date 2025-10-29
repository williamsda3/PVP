/**
 * Main server entry point
 * Combat Tactics - Turn-Based Fighting Game Server
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const LobbyManager = require('./socket/lobbyManager');
const { setupSocketEvents } = require('./socket/socketEvents');

// Initialize Express app
const app = express();
app.use(cors());

// Serve static files from public directory (for organized frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Fallback to serve index.html from root for backwards compatibility
app.use(express.static(path.join(__dirname, '..')));

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize lobby manager
const lobbyManager = new LobbyManager();

// Set up socket event handlers
setupSocketEvents(io, lobbyManager);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Waiting for connections...`);
  console.log(`📁 Serving static files from public/ and root directory`);
});
