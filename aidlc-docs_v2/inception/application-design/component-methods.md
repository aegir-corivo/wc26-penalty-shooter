# Component Methods — v2 (Multiplayer & Hosting)

## Client: Multiplayer Client (multiplayer.js)

```
connect(serverUrl) → void
  Establish WebSocket connection to the multiplayer server.

disconnect() → void
  Close WebSocket connection cleanly.

createRoom() → void
  Send "create_room" message to server. Response triggers room code display.

joinRoom(roomCode) → void
  Send "join_room" message with room code. Response triggers lobby → game transition.

sendTeamSelection(teamId) → void
  Notify server of team selection. Game starts when both players have selected.

sendKickAction(direction, power) → void
  Send kick action to server (when local player is kicker).

sendDiveAction(position) → void
  Send dive action to server (when local player is goalkeeper).

onMessage(handler) → void
  Register callback for incoming server messages.

onDisconnect(handler) → void
  Register callback for connection loss.

getConnectionStatus() → string
  Return current connection state: 'disconnected' | 'connecting' | 'connected'.
```

---

## Client: Scene Controllers (modified scenes)

```
updateModeSelect() → void
  Handle mode selection input (single player vs multiplayer).

renderModeSelect() → void
  Draw mode selection screen.

updateLobby() → void
  Handle lobby input (create room, enter room code, wait for opponent).

renderLobby() → void
  Draw lobby screen (room code display, input field, waiting state).
```

---

## Client: Game State (new fields)

```
Game state additions:
  mode: 'single' | 'multi'
  roomCode: string | null
  playerRole: 'player1' | 'player2' | null
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  opponentTeam: object | null
  waitingForOpponent: boolean
  waitingForResult: boolean
```

---

## Server: Entry Point (server/server.js)

```
startServer(port) → void
  Initialize HTTP server, attach WebSocket upgrade handler, start listening.

handleConnection(ws) → void
  Called when a new WebSocket client connects. Assign client ID, register event handlers.

handleMessage(clientId, message) → void
  Route incoming messages to appropriate handler (room manager or game logic).

handleDisconnect(clientId) → void
  Clean up client state, notify opponent if in a room, trigger forfeit if in game.
```

---

## Server: Room Manager (server/room-manager.js)

```
createRoom(clientId) → { roomCode: string }
  Create a new room, assign the client as player 1, return room code.

joinRoom(clientId, roomCode) → { success: boolean, error?: string }
  Add client to existing room as player 2. Fail if room doesn't exist or is full.

getRoom(roomCode) → Room | null
  Retrieve room by code.

getRoomByClient(clientId) → Room | null
  Find room that a client is currently in.

removeRoom(roomCode) → void
  Delete room and clean up all references.

setTeamSelection(clientId, teamId) → { bothReady: boolean }
  Record team selection. Return whether both players have selected.

generateRoomCode() → string
  Generate a unique 5-character alphanumeric code.
```

---

## Server: Game Logic (server/game-logic.js)

```
initMatch(room) → GameState
  Initialize a new match state (round 1, scores 0-0, player 1 kicks first).

submitAction(gameState, clientId, action) → { valid: boolean, error?: string }
  Validate and record a player's action (kick or dive).

resolveRound(gameState) → RoundResult
  Once both actions received: resolve kick outcome, update scores, advance round.
  Returns: { goal: boolean, kickDirection, divePosition, roundNumber, scores, gameOver, winner }

validateKickAction(direction, power) → boolean
  Check direction is within bounds, power is 0-1.

validateDiveAction(position) → boolean
  Check position is one of: 'top-left', 'bottom-left', 'center', 'top-right', 'bottom-right'.

checkWinner(gameState) → string | null
  After round resolution, check if shootout is decided or enters sudden death.

handleTimeout(gameState, clientId) → RoundResult
  If a player doesn't act within time limit, resolve as miss/random.
```

---

## WebSocket Message Protocol

### Client → Server Messages

```json
{ "type": "create_room" }
{ "type": "join_room", "roomCode": "ABC12" }
{ "type": "select_team", "teamId": "brazil" }
{ "type": "kick_action", "direction": { "x": 0.3, "y": 0.7 }, "power": 0.85 }
{ "type": "dive_action", "position": "top-left" }
```

### Server → Client Messages

```json
{ "type": "room_created", "roomCode": "ABC12" }
{ "type": "room_joined", "playerRole": "player2", "opponentTeam": null }
{ "type": "opponent_joined" }
{ "type": "opponent_team_selected", "teamId": "germany" }
{ "type": "match_start", "kickerRole": "player1" }
{ "type": "round_start", "round": 1, "kickerRole": "player1" }
{ "type": "waiting_for_opponent" }
{ "type": "round_result", "goal": true, "kickDirection": {...}, "divePosition": "center", "scores": {"player1": 1, "player2": 0} }
{ "type": "match_over", "winner": "player1", "scores": {"player1": 3, "player2": 2} }
{ "type": "opponent_disconnected" }
{ "type": "error", "message": "Room not found" }
```

