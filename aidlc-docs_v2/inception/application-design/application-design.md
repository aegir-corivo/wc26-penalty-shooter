# Application Design — WC26 Penalty Shooter v2 (Multiplayer & Hosting)

## Summary

The v2 architecture adds a **Node.js WebSocket server** (hosted on Render) alongside the existing **static client** (hosted on Vercel). The client gains a new `multiplayer.js` file for networking, while `game.js` is extended with new scenes (mode select, lobby) and multiplayer-aware gameplay logic. The server handles room management, game state synchronization, and outcome resolution.

---

## Architecture Overview

```
+-----------------------------------------------------------+
|                    CLIENT (Vercel)                         |
+-----------------------------------------------------------+
|                                                           |
|  game.js (modified)           multiplayer.js (new)        |
|  +------------------+        +---------------------+      |
|  | Game State       |        | WebSocket Client    |      |
|  | Renderer         |<------>| connect/disconnect  |      |
|  | Input Handler    |        | send/receive msgs   |      |
|  | AI Controller    |        +---------------------+      |
|  | Game Logic       |                 |                   |
|  | Scene Controllers|                 | WebSocket         |
|  | Game Loop        |                 |                   |
|  +------------------+                 |                   |
+---------------------------------------|-------------------+
                                        |
                                        v
+-----------------------------------------------------------+
|                    SERVER (Render)                         |
+-----------------------------------------------------------+
|                                                           |
|  server.js            room-manager.js    game-logic.js    |
|  +--------------+     +-------------+   +-------------+  |
|  | HTTP + WS    |---->| Room CRUD   |   | Match State |  |
|  | Connection   |---->| Player Mgmt |   | Validation  |  |
|  | Routing      |     | Code Gen    |   | Resolution  |  |
|  +--------------+     +-------------+   +-------------+  |
|                                                           |
+-----------------------------------------------------------+
```

---

## Components (11 total: 8 client + 3 server)

| # | Component | Location | Status |
|---|-----------|----------|--------|
| 1 | Game State | game.js | Modified (new fields for multiplayer) |
| 2 | Renderer | game.js | Modified (new screens) |
| 3 | Input Handler | game.js | Unchanged |
| 4 | AI Controller | game.js | Unchanged |
| 5 | Game Logic | game.js | Modified (multiplayer delegates to server) |
| 6 | Scene Controllers | game.js | Modified (new scenes + multiplayer gameplay) |
| 7 | Game Loop | game.js | Unchanged |
| 8 | Multiplayer Client | multiplayer.js | **New** |
| 9 | Server Entry Point | server/server.js | **New** |
| 10 | Room Manager | server/room-manager.js | **New** |
| 11 | Server Game Logic | server/game-logic.js | **New** |

---

## Key Design Decisions

1. **Separate multiplayer.js** — networking isolated from game logic; game.js stays readable
2. **Multi-file server** — clear separation of concerns (entry point, rooms, game logic)
3. **Server-authoritative** — server resolves all outcomes in multiplayer; clients animate
4. **Duplicated kick logic** — client has local copy for single-player, server has authoritative copy for multiplayer
5. **No database** — rooms exist in memory only (MVP scale)
6. **Room codes** — simple alphanumeric codes for lobby; no matchmaking queue
7. **Immediate forfeit** — disconnect = loss, no reconnection complexity
8. **Render hosting** — free tier, WebSocket support, Git auto-deploy

---

## Scene State Machine (v2)

```
TITLE --> MODE_SELECT --> [Single Player] --> TEAM_SELECT --> GAMEPLAY (AI) --> RESULT
                    |                                                            |
                    +--> [Multiplayer] --> LOBBY --> TEAM_SELECT --> GAMEPLAY --> RESULT
                                                                   (network)     |
                                                                                 v
                                                                           MODE_SELECT
```

---

## Deployment

| Component | Platform | URL Pattern |
|-----------|----------|-------------|
| Frontend (static) | Vercel | `https://wc26-penalty-shooter.vercel.app` |
| Backend (WebSocket) | Render | `wss://wc26-penalty-server.onrender.com` |

---

## Detailed Artifacts

- [components.md](components.md) — Full component definitions and responsibilities
- [component-methods.md](component-methods.md) — Method signatures + WebSocket protocol
- [services.md](services.md) — Orchestration flows and deployment architecture
- [component-dependency.md](component-dependency.md) — Dependencies, data flow, file structure
