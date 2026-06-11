# Requirements Document — WC26 Penalty Shooter v2 (Multiplayer & Hosting)

## Intent Analysis

| Field | Value |
|-------|-------|
| **User Request** | Add network multiplayer (1v1 on separate devices) and host the game online. |
| **Request Type** | Enhancement (major feature addition to existing game) |
| **Scope Estimate** | Multiple Components (client refactor + new server component + deployment) |
| **Complexity Estimate** | Complex (real-time networking, game state synchronization, hosting infrastructure, client/server architecture) |

---

## Context: Existing System (v1)

The current game is a single-player HTML5 Canvas penalty shootout with:
- Vanilla JavaScript (`game.js` ~1400 lines) + `index.html`
- No build tools, no dependencies
- Player alternates between kicker and goalkeeper vs AI
- FIFA 94 pixel-art style, 800×600 canvas
- Team selection from WC 2026 nations

---

## Technology Decisions

### Frontend
- **Hosting**: Vercel (static frontend deployment)
- **Stack**: Continue with vanilla HTML5 Canvas + JavaScript
- **Communication**: WebSocket client for real-time multiplayer

### Backend (Multiplayer Server)
- **Runtime**: Node.js with WebSocket library (e.g., `ws`)
- **Hosting**: Separate WebSocket server (Vercel does not support persistent WebSocket connections in serverless functions — server will need a WebSocket-compatible host such as Railway, Render, Fly.io, or a dedicated VPS)
- **Protocol**: WebSocket for low-latency real-time communication

### Architecture Note
The frontend (static files) will be deployed to Vercel. The multiplayer backend (WebSocket server) will be deployed to a platform that supports long-lived connections (Railway, Render, or Fly.io recommended for simplicity). The client connects to the WebSocket server URL configured at build/deploy time.

---

## Functional Requirements

### FR-1: Game Mode Selection
- Title screen presents two modes: **Single Player** (vs AI) and **Multiplayer** (1v1 online)
- Single-player mode remains unchanged from v1
- Multiplayer mode initiates the room/lobby flow

### FR-2: Room System (Lobby)
- **Create Room**: Player creates a game room and receives a short alphanumeric room code (e.g., 4–6 characters)
- **Join Room**: Second player enters the room code to join
- Both players must select their team before the match starts
- Once both players are connected and have selected teams, the match begins automatically
- Room creator sees "Waiting for opponent..." until second player joins

### FR-3: Real-Time Multiplayer Match Flow
- Both players are simultaneously connected throughout the match
- Standard penalty shootout structure: 5 kicks per side, sudden death if tied
- Players alternate roles each round:
  - **Round N (odd)**: Player 1 kicks, Player 2 saves
  - **Round N (even)**: Player 2 kicks, Player 1 saves
- The kicker uses arrow keys + spacebar (same as single-player)
- The goalkeeper selects a dive position (same as single-player)
- Both players submit their actions, then the server resolves the outcome and broadcasts the result

### FR-4: Game State Synchronization
- The server is the **authoritative source** of game state
- Client sends player actions (kick direction/power, dive position) to server
- Server validates actions, resolves outcomes, and broadcasts results to both clients
- Clients render the result animation (ball trajectory, goalkeeper dive) based on server data
- No client can advance the game state unilaterally

### FR-5: Server-Side Validation (Basic Anti-Cheat)
- Server validates that actions are within legal bounds:
  - Kick direction within valid range
  - Power value within valid range (0–1)
  - Dive position is one of the 5 valid positions
  - Actions are submitted at the correct time (correct game phase)
- Invalid actions are rejected; client is notified to resubmit

### FR-6: Disconnect Handling
- If a player disconnects at any point during a match, the opponent wins immediately (forfeit)
- Server notifies the remaining player that they won by forfeit
- Result screen shows "Opponent disconnected — You win!"
- No reconnection mechanism (keeps implementation simple)

### FR-7: Multiplayer Scoreboard & UI
- Same scoreboard as single-player, showing kicks taken and goals scored per team
- Additional indicator showing which role the player currently has (KICKER / GOALKEEPER)
- Connection status indicator (connected/disconnected)
- Opponent's team name and kit colors visible

### FR-8: Single-Player Preservation
- Existing single-player mode (vs AI) remains fully functional
- No changes to AI behavior or single-player game flow
- Mode selection on title screen is the only addition to the single-player path

---

## Non-Functional Requirements

### NFR-1: Latency
- Game should feel responsive with up to ~200ms round-trip latency
- Turn-based nature of penalty shootouts (kick → result) is tolerant of moderate latency
- No real-time physics synchronization needed (server resolves outcome, clients animate)

### NFR-2: Scalability
- Support at least 50 concurrent rooms (100 players) for initial deployment
- Stateless room management (rooms exist only in memory while active, no database needed for MVP)

### NFR-3: Deployment Simplicity
- Frontend: Single `vercel deploy` command for static files
- Backend: Single deployment command to chosen WebSocket host
- No complex CI/CD pipelines needed for MVP
- Environment variable for WebSocket server URL

### NFR-4: Performance
- Client maintains 60fps during multiplayer (same as single-player)
- Server handles room creation, message routing, and validation with minimal overhead

### NFR-5: Browser Compatibility
- Same as v1: modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- WebSocket API supported by all target browsers

---

## Out of Scope (v2)
- Player accounts / authentication
- Persistent statistics or leaderboards
- Spectator mode
- More than 2 players per room
- Chat functionality
- Mobile / touch controls
- Sound effects
- Reconnection after disconnect
- Database or persistent storage
- Automated matchmaking queue
