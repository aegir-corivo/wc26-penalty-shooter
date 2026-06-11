# Code Generation Plan — WC26 Penalty Shooter v2 (Multiplayer & Hosting)

## Unit Context
- **Unit**: Penalty Shooter v2 (single unit — client + server)
- **Stories**: Add multiplayer mode, room system, real-time gameplay, hosting config
- **Dependencies**: Existing game.js (v1), Node.js ecosystem (ws library)
- **Target Locations**:
  - Client code: Workspace root (`/Users/aegirmarjonsson/Repos/wc26-penalty-shooter/`)
  - Server code: `server/` subdirectory
  - Documentation: `aidlc-docs_v2/construction/penalty-shooter/code/`

---

## Generation Steps

### Step 1: Server — package.json and project setup
- [x] Create `server/package.json` with dependencies (ws, uuid) and scripts (start, dev)
- [x] Create `server/.gitignore` (node_modules)

### Step 2: Server — Room Manager (server/room-manager.js)
- [x] Implement RoomManager class/module
- [x] `createRoom(clientId)` — generates 5-char alphanumeric code, stores room
- [x] `joinRoom(clientId, roomCode)` — validates room exists and isn't full, adds player 2
- [x] `getRoom(roomCode)` / `getRoomByClient(clientId)` — lookup helpers
- [x] `removeRoom(roomCode)` — cleanup
- [x] `setTeamSelection(clientId, teamId)` — records selection, returns bothReady flag
- [x] `generateRoomCode()` — unique code generation with collision check

### Step 3: Server — Game Logic (server/game-logic.js)
- [x] Implement server-side match state management
- [x] `initMatch(room)` — initializes round, scores, kicker assignment
- [x] `submitAction(gameState, clientId, action)` — validates and records action
- [x] `resolveRound(gameState)` — compares kick vs dive, updates scores, checks winner
- [x] `validateKickAction(direction, power)` — bounds checking
- [x] `validateDiveAction(position)` — valid position check
- [x] `checkWinner(gameState)` — after-round winner detection + sudden death
- [x] Accuracy penalty logic (same algorithm as client v1)

### Step 4: Server — Entry Point (server/server.js)
- [x] Create HTTP server + WebSocket upgrade handler
- [x] `handleConnection(ws)` — assign client ID, register message/close handlers
- [x] `handleMessage(clientId, message)` — parse JSON, route to room manager or game logic
- [x] `handleDisconnect(clientId)` — find room, notify opponent, forfeit, cleanup
- [x] Message routing: create_room, join_room, select_team, kick_action, dive_action
- [x] Broadcast helpers: send to specific client, send to room
- [x] Health check endpoint (GET /)
- [x] Start listening on PORT env var (default 3000)

### Step 5: Client — Multiplayer Client (multiplayer.js)
- [x] Create `multiplayer.js` with WebSocket client module
- [x] `connect(serverUrl)` — establish connection, handle open/close/error events
- [x] `disconnect()` — close connection cleanly
- [x] `createRoom()` / `joinRoom(code)` — send room messages
- [x] `sendTeamSelection(teamId)` — send team choice
- [x] `sendKickAction(direction, power)` / `sendDiveAction(position)` — send game actions
- [x] `onMessage(handler)` — register incoming message callback
- [x] `onDisconnect(handler)` — register disconnect callback
- [x] `getConnectionStatus()` — return current state
- [x] Export module functions for use by game.js

### Step 6: Client — Modify game.js (new scenes + multiplayer integration)
- [x] Add new game state fields: mode, roomCode, playerRole, connectionStatus, opponentTeam, waitingForOpponent, waitingForResult
- [x] Add MODE_SELECT scene (updateModeSelect + renderModeSelect)
- [x] Add LOBBY scene (updateLobby + renderLobby) — create/join room UI, room code display, waiting state
- [x] Modify TITLE scene — transition to MODE_SELECT instead of directly to TEAM_SELECT
- [x] Modify TEAM_SELECT scene — in multiplayer mode, send team selection to server
- [x] Modify GAMEPLAY scene — in multiplayer mode:
  - Send kick/dive actions to server instead of resolving locally
  - Wait for server round_result before animating
  - Show "Waiting for opponent..." while other player acts
- [x] Add multiplayer message handler (receives server messages, updates game state)
- [x] Add opponent disconnect handling (show forfeit screen)
- [x] Add PAUSE_MENU modifications for multiplayer (no pause in multiplayer, or disconnect option)

### Step 7: Client — Update index.html
- [x] Add `<script src="multiplayer.js"></script>` before game.js
- [x] (Optional) Add meta tag or config for WebSocket server URL

### Step 8: Deployment — Vercel configuration
- [x] Create `vercel.json` (if needed for SPA routing or headers)
- [x] Ensure static files (index.html, game.js, multiplayer.js) are served correctly

### Step 9: Deployment — Render configuration
- [x] Create `server/render.yaml` or document Render web service setup
- [x] Ensure PORT environment variable is used
- [x] Document the deployment steps for Render

### Step 10: Update README.md
- [x] Add multiplayer section with instructions
- [x] Document how to run server locally for development
- [x] Document deployment steps (Vercel for frontend, Render for backend)
- [x] Update "How to Play" with multiplayer instructions

### Step 11: Generate code summary documentation
- [x] Create `aidlc-docs_v2/construction/penalty-shooter/code/code-summary.md`
- [x] Document all created/modified files with purposes
- [x] Document WebSocket protocol reference
- [x] Document deployment architecture

---

## Traceability

| Step | Requirements Covered |
|------|---------------------|
| 1 | Server setup (FR-4) |
| 2 | FR-2 Room System |
| 3 | FR-3 Match Flow, FR-4 State Sync, FR-5 Validation |
| 4 | FR-4 State Sync, FR-6 Disconnect |
| 5 | FR-3 Match Flow (client networking) |
| 6 | FR-1 Mode Selection, FR-2 Room System, FR-3 Match Flow, FR-7 UI, FR-8 Single-Player |
| 7 | Client integration |
| 8 | NFR-3 Deployment Simplicity |
| 9 | NFR-3 Deployment Simplicity |
| 10 | Documentation |
| 11 | Documentation |

