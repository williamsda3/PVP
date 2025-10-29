# Combat Tactics - Turn-Based Fighting Game

A strategic turn-based fighting game with local and online multiplayer support.

## Project Structure

This project has been refactored into a modular architecture for better maintainability and scalability.

### Backend Structure (`/server`)

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
- **LobbyManager**: Handles lobby creation, player joining, and lobby lifecycle
- **SocketEvents**: Manages all real-time multiplayer communication
- **CodeGenerator**: Generates unique 4-letter lobby codes

### Frontend Structure (`/public`)

```
public/
├── index.html               # Main HTML entry (backwards compatible)
├── css/
│   └── animations.css       # Combat animations and visual effects
└── js/
    ├── game-engine/         # Core game logic (modular, ready for future use)
    │   ├── Player.js
    │   ├── CombatResolver.js
    │   ├── AI.js
    │   └── constants.js
    ├── components/          # UI components (modular, ready for future use)
    │   └── Icons.js
    └── utils/              # Helper utilities (modular, ready for future use)
        ├── styleHelpers.js
        └── socketManager.js
```

**Frontend Modules (prepared for future migration):**
- **Game Engine**: Player, CombatResolver, AI classes
- **Constants**: MOVES, GAME_STATES, GAME_MODES enums
- **Style Helpers**: Tailwind CSS class generators
- **Socket Manager**: Multiplayer connection manager

### Root Files

- `index.html` - Main game interface (uses external CSS)
- `server.js` - Legacy server file (kept for reference, use `server/index.js`)
- `package.json` - Updated to use `server/index.js`

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

## Benefits of Modular Structure

### For Debugging
- Error stack traces now point to specific files and line numbers
- Easier to isolate and test individual components
- Cleaner console logs with module names

### For Scaling
- Each module has a single responsibility
- Easy to add new features without touching unrelated code
- Game engine can be extracted to NPM package if needed

### For Team Development
- Multiple developers can work on different modules simultaneously
- Clear separation of concerns (backend logic, game engine, UI)
- Easier code reviews with smaller, focused files

### For Testing
- Unit tests can be written for individual modules
- Game logic (Player, CombatResolver, AI) is isolated and testable
- Mock socket connections for integration tests

## Future Improvements

The modular game engine and components in `/public/js` are ready for:
- Migration to a full React app with build tooling (Vite/CRA)
- TypeScript conversion for type safety
- Unit test suite with Jest/Vitest
- Component-based architecture using ES6 modules

## Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: React (via CDN), Tailwind CSS
- **Real-time**: Socket.io for multiplayer
- **Deployment**: Render-ready
