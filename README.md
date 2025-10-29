# Combat Tactics - Turn-Based Fighting Game

A strategic turn-based fighting game with local and online multiplayer support.

## Project Structure

The backend has been refactored into a clean modular architecture for better maintainability, debugging, and scalability.

### Backend Structure (`/server`) ✅ Fully Modularized

```
server/
├── index.js                  # Main server entry point
├── socket/
│   ├── lobbyManager.js      # Lobby management system
│   └── socketEvents.js      # Socket.io event handlers
└── utils/
    └── codeGenerator.js     # Lobby code generation utility
```

**Key Backend Modules:**
- **LobbyManager**: Handles lobby creation, player joining, rematch logic, and lobby lifecycle
- **SocketEvents**: Manages all real-time multiplayer communication events
- **CodeGenerator**: Generates unique 4-letter lobby codes

**Benefits of Modular Backend:**
- Each module has a single responsibility
- Error stack traces point to specific files (e.g., `lobbyManager.js:45`)
- Easy to test individual components
- Simple to extend (add tournaments, rankings, etc.)

### Frontend Structure

```
/
├── index.html               # Main game (monolithic for simplicity)
└── public/
    ├── css/
    │   └── animations.css   # Extracted combat animations
    └── js/                  # Reserved for future modularization
```

**Frontend Status:**
- Currently monolithic (all React code in index.html)
- CSS animations extracted for cleaner code
- Works seamlessly with CDN-based React
- Ready for future React build tooling migration

### Root Files

- `index.html` - Main game interface (all React code, references external CSS)
- `server.js` - Legacy server file (kept for reference)
- `package.json` - Updated to use modular `server/index.js`

## Running the Application

### Development

```bash
npm install
npm start
```

Server will run on `http://localhost:3001`

### Production (Render)

The application is configured to work seamlessly on Render:
- Build Command: `npm install`
- Start Command: `npm start`
- The server automatically detects the environment and serves files correctly

## Game Modes

1. **vs Computer** - Play against AI opponent
2. **vs Friend (Local)** - Hot-seat multiplayer on same device
3. **vs Friend (Online)** - Real-time multiplayer via Socket.io

## Benefits of Backend Modularization

### For Debugging
- Error stack traces show specific files: `lobbyManager.js:45` instead of `server.js:45`
- Each module handles one concern - easier to isolate bugs
- Cleaner console logs showing which module logged what

### For Scaling
- Adding tournaments? Create `server/socket/tournamentManager.js`
- Adding leaderboards? Create `server/socket/rankingManager.js`
- Adding chat? Create `server/socket/chatManager.js`
- Each feature is self-contained and doesn't touch other code

### For Team Development
- Multiple developers can work on different socket events without conflicts
- Clear ownership: lobby logic lives in `lobbyManager.js`, that's it
- Smaller files = faster code reviews

### For Testing
- Each module can be unit tested independently
- Mock dependencies easily (inject fake lobby manager into socket events)
- Integration tests can test specific flows

## Future Improvements

### Frontend Modularization (When Ready)
When you're ready to adopt a build process (Vite/Webpack):
- Migrate to ES6 modules with proper bundling
- Extract game engine (Player, CombatResolver, AI) into separate files
- Component-based architecture
- TypeScript for type safety

### Other Potential Enhancements
- Unit test suite with Jest/Vitest
- CI/CD with GitHub Actions
- Database integration for persistent lobbies
- Spectator mode
- Replay system

## Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: React (via CDN), Tailwind CSS
- **Real-time**: Socket.io for multiplayer
- **Deployment**: Render-ready
