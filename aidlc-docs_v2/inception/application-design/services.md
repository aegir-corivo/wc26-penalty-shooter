# Services / Orchestration — v2 (Multiplayer & Hosting)

## System Architecture

```
+-------------------+        WebSocket        +-------------------+
|   CLIENT (Vercel) | <---------------------> |  SERVER (Render)  |
|                   |                         |                   |
|  game.js          |                         |  server.js        |
|  multiplayer.js   |                         |  room-manager.js  |
|  index.html       |                         |  game-logic.js    |
+-------------------+                         +-------------------+
```

---

## Client Scene State Machine (v2)

```
TITLE --> MODE_SELECT --> TEAM_SELECT --> GAMEPLAY --> RESULT
                |                                       |
                +--> LOBBY --> TEAM_SELECT               +--> MODE_SELECT
                     (multiplayer path)                  (play again)
```

### Single-Player Path (unchanged from v1)
```
MODE_SELECT("Single Player") --> TEAM_SELECT --> GAMEPLAY (vs AI) --> RESULT
```

### Multiplayer Path (new)
```
MODE_SELECT("Multiplayer") --> LOBBY --> TEAM_SELECT --> GAMEPLAY (vs human) --> RESULT
```

---

## Multiplayer Game Flow (Detailed)

### Phase 1: Room Setup
1. Player A chooses "Multiplayer" → enters LOBBY scene
2. Player A clicks "Create Room" → client sends `create_room` → server returns room code
3. Player A sees room code, shares with Player B
4. Player B chooses "Multiplayer" → enters LOBBY scene
5. Player B enters room code → client sends `join_room` → server confirms
6. Both players advance to TEAM_SELECT

### Phase 2: Team Selection
1. Both players independently select their team
2. Each selection is sent to server (`select_team`)
3. Server notifies opponent of team choice
4. When both have selected, server sends `match_start`
5. Both clients advance to GAMEPLAY

### Phase 3: Gameplay Loop (per round)
1. Server sends `round_start` with who is kicking
2. **Kicker's client**: shows aiming + power UI, player submits action → `kick_action`
3. **Goalkeeper's client**: shows dive position selector, player submits action → `dive_action`
4. Server waits for both actions (with timeout)
5. Server resolves outcome → broadcasts `round_result` to both clients
6. Both clients animate the result (ball flight, goalkeeper dive)
7. Repeat until shootout is decided

### Phase 4: Match End
1. Server sends `match_over` with winner
2. Both clients show RESULT scene
3. Players can return to MODE_SELECT for another game

---

## Server Orchestration Flow

### Connection Lifecycle
```
Client connects → assign clientId → wait for messages
Client sends create_room → Room Manager creates room → respond with code
Client sends join_room → Room Manager adds to room → notify both players
Client disconnects → Room Manager finds room → forfeit opponent wins → cleanup
```

### Round Resolution Flow
```
round_start sent to both clients
  → wait for kick_action from kicker
  → wait for dive_action from keeper
  → (timeout: 30 seconds per action)
  → resolveRound() → broadcast round_result
  → check if match over → if yes, broadcast match_over
  → if no, send next round_start
```

---

## Data Flow: Multiplayer Mode

```
Player Input → Multiplayer Client → WebSocket → Server
Server → Game Logic (validate + resolve) → WebSocket → Both Clients
Both Clients → Game State update → Renderer → Canvas
```

## Data Flow: Single-Player Mode (unchanged)

```
Player Input → Scene Controller → Game Logic (local) → Game State → Renderer → Canvas
```

---

## Deployment Architecture

```
                    Internet
                       |
          +------------+------------+
          |                         |
    +-----v------+           +-----v------+
    |   Vercel   |           |   Render   |
    |  (Static)  |           | (Node.js)  |
    |            |           |            |
    | index.html |           | server.js  |
    | game.js    |  WebSocket| room-mgr   |
    | multi.js   | <-------> | game-logic |
    +------------+           +------------+
```

- **Vercel**: Serves static files (HTML, JS). Zero server-side logic.
- **Render**: Runs Node.js WebSocket server. Persistent connections. Free tier sufficient for MVP.
- **Connection**: Client JavaScript connects to Render's WebSocket URL (configured via environment or hardcoded for MVP).
