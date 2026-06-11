# Component Dependencies — v2 (Multiplayer & Hosting)

## Dependency Matrix

| Component | Depends On | Depended On By |
|-----------|-----------|----------------|
| Game State | — | Scene Controllers, Renderer, Multiplayer Client, Game Logic |
| Renderer | Game State | Game Loop |
| Input Handler | — | Scene Controllers |
| AI Controller | — | Scene Controllers (single-player only) |
| Game Logic | Game State | Scene Controllers (single-player), Server Game Logic (shared rules) |
| Scene Controllers | Game State, Input Handler, AI Controller, Multiplayer Client, Game Logic | Game Loop |
| Game Loop | Scene Controllers, Renderer, Input Handler | — |
| Multiplayer Client | — | Scene Controllers |
| Server Entry Point | Room Manager | — |
| Room Manager | — | Server Entry Point, Server Game Logic |
| Server Game Logic | Room Manager | Server Entry Point |

---

## Communication Patterns

### Client Internal (in-process, function calls)
```
Scene Controllers --calls--> Game Logic (single-player)
Scene Controllers --calls--> Multiplayer Client (multiplayer)
Scene Controllers --reads/writes--> Game State
Renderer --reads--> Game State
Game Loop --calls--> Scene Controllers, Renderer
```

### Client ↔ Server (WebSocket messages)
```
Multiplayer Client --WebSocket--> Server Entry Point
Server Entry Point --WebSocket--> Multiplayer Client

Message types:
  Client→Server: create_room, join_room, select_team, kick_action, dive_action
  Server→Client: room_created, room_joined, opponent_joined, match_start,
                 round_start, round_result, match_over, opponent_disconnected, error
```

### Server Internal (in-process, function calls)
```
Server Entry Point --calls--> Room Manager (room operations)
Server Entry Point --calls--> Server Game Logic (action processing)
Server Game Logic --reads--> Room Manager (get room/player info)
```

---

## Data Flow Diagram

### Multiplayer Kick Resolution
```
+----------+     kick_action      +-----------+     resolveRound()    +------------+
| Kicker   | ------------------> |  Server   | --------------------> | Game Logic  |
| Client   |                     |  Entry    |                       | (server)    |
+----------+                     +-----------+                       +------------+
                                      ^                                    |
+----------+     dive_action          |          round_result              |
| Keeper   | -------------------------+  <---------------------------------+
| Client   |                          |
+----------+  <--- round_result ------+
```

### Single-Player Kick Resolution (unchanged)
```
+----------+     processKick()    +------------+
| Scene    | ------------------> |  Game Logic | --> Game State update
| Controller|                    |  (local)    |
+----------+                     +------------+
```

---

## File Structure (v2)

```
wc26-penalty-shooter/
  index.html           -- Canvas + script tags
  game.js              -- Core game (state, renderer, input, AI, scenes, loop)
  multiplayer.js       -- WebSocket client (connect, send, receive)
  server/
    server.js          -- HTTP + WebSocket server entry point
    room-manager.js    -- Room creation, joining, cleanup
    game-logic.js      -- Server-side game state and outcome resolution
    package.json       -- Node.js dependencies (ws library)
  vercel.json          -- Vercel deployment config (optional)
  README.md            -- Updated with multiplayer instructions
```

---

## Shared Logic Note

The kick resolution algorithm (comparing ball trajectory to dive position) exists in two places:
1. **Client** `game.js` — used for single-player mode (unchanged from v1)
2. **Server** `server/game-logic.js` — authoritative for multiplayer mode

This duplication is intentional to keep the single-player mode dependency-free (no server required). The server implementation is the authoritative version for multiplayer.
