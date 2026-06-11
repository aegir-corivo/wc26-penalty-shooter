# Build Instructions — WC26 Penalty Shooter v2

## Prerequisites
- **Node.js**: v18+ (for the server)
- **npm**: Comes with Node.js
- **Modern browser**: Chrome, Firefox, Safari, or Edge (for the client)
- **No build tools needed for the frontend** — it's static HTML/JS

## Build Steps

### 1. Install Server Dependencies
```bash
cd server
npm install
```

This installs the `ws` (WebSocket) library.

### 2. Configure Environment (Optional for Local)
No environment variables required for local development. The server defaults to port 3000.

For production (Render):
```bash
# Render sets PORT automatically
export PORT=3000
```

### 3. Verify Installation
```bash
cd server
node -e "require('./room-manager'); require('./game-logic'); console.log('All modules load OK')"
```

Expected output: `All modules load OK`

### 4. Frontend
The frontend has **zero build step**. The files `index.html`, `game.js`, and `multiplayer.js` are served directly.

## Build Artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| Server runtime | `server/` | Node.js WebSocket server |
| Client static files | Project root | `index.html`, `game.js`, `multiplayer.js` |
| No compiled output | — | Everything runs from source |

## Troubleshooting

### `npm install` fails
- Verify Node.js ≥ 18: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and retry: `rm -rf node_modules && npm install`

### Server won't start
- Check port is available: `lsof -i :3000`
- Check all required files exist: `ls server.js room-manager.js game-logic.js`
