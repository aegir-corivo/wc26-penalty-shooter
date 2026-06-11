# WC26 Penalty Shooter ⚽

A FIFA 94-style penalty shootout game with single-player (vs AI) and online multiplayer (1v1) modes.

## How to Play

### Single Player
1. Open `index.html` in your browser
2. Press any key on the title screen
3. Select "Single Player" mode
4. Choose your team with arrow keys, press ENTER
5. Alternate between kicking and saving!

### Multiplayer (1v1 Online)
1. Open `index.html` in your browser (both players)
2. Select "Multiplayer" mode
3. One player creates a room and shares the 5-letter code
4. The other player joins using the code
5. Both select teams, then the match begins!

### Controls

**As Kicker:**
- Arrow keys — aim direction
- Hold SPACE — charge power (higher = faster but less accurate)
- Release SPACE — shoot

**As Goalkeeper:**
- Q — dive top-left
- A — dive bottom-left
- W — dive center
- E — dive top-right
- D — dive bottom-right
- SPACE — confirm dive

---

## Running Locally

### Frontend Only (Single Player)
Just open `index.html` in any modern browser. No build tools needed.

### With Multiplayer Server

1. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000` by default.

3. **Open the game:**
   Open `index.html` in your browser. The game connects to `ws://localhost:3000` by default.

4. **Configure server URL (optional):**
   To point at a different server, set `window.MULTIPLAYER_SERVER_URL` before the game loads:
   ```html
   <script>window.MULTIPLAYER_SERVER_URL = 'wss://your-server.onrender.com';</script>
   ```

---

## Deployment

### Frontend → Vercel
```bash
# From project root
npx vercel
```
Serves `index.html`, `game.js`, and `multiplayer.js` as static files.

### Backend → Render
1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Point to the `server/` directory
4. Build command: `npm install`
5. Start command: `npm start`
6. Render assigns a public URL (e.g., `wss://wc26-penalty-shooter-server.onrender.com`)

**Important:** Update `WS_SERVER_URL` in `game.js` (or set `window.MULTIPLAYER_SERVER_URL` in your HTML) to point to your Render server URL before deploying the frontend.

---

## Project Structure

```
wc26-penalty-shooter/
├── index.html          — Game HTML page (canvas + scripts)
├── game.js             — Game logic, renderer, scenes, game loop
├── multiplayer.js      — WebSocket client module
├── vercel.json         — Vercel deployment config
├── README.md           — This file
└── server/
    ├── package.json    — Server dependencies
    ├── server.js       — HTTP + WebSocket entry point
    ├── room-manager.js — Room creation, joining, cleanup
    ├── game-logic.js   — Server-side match state + outcome resolution
    ├── render.yaml     — Render deployment blueprint
    └── .gitignore      — Ignores node_modules
```

---

## Tech Stack
- **Frontend**: Vanilla HTML5 Canvas + JavaScript (no dependencies)
- **Backend**: Node.js + [ws](https://github.com/websockets/ws) library
- **Hosting**: Vercel (frontend) + Render (backend)
