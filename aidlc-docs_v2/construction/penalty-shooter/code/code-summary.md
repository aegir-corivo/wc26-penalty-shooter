# Code Summary — WC26 Penalty Shooter v2

## Files Created

| File | Purpose |
|------|---------|
| `multiplayer.js` | WebSocket client module — connect, send/receive messages, room/game actions |
| `server/package.json` | Node.js project config with ws dependency |
| `server/server.js` | HTTP + WebSocket server entry point, message routing, connection lifecycle |
| `server/room-manager.js` | Room CRUD — create, join, leave, team selection, cleanup |
| `server/game-logic.js` | Server-side match state, action validation, outcome resolution |
| `server/.gitignore` | Ignores node_modules/ |
| `server/render.yaml` | Render deployment blueprint |
| `vercel.json` | Vercel static site config |

## Files Modified

| File | Changes |
|------|---------|
| `game.js` | Added: multiplayer state fields, MODE_SELECT scene, LOBBY scene, multiplayer message handler, multiplayer-aware gameplay (sends actions to server), updated result screen for multiplayer |
| `index.html` | Added multiplayer.js script tag |
| `README.md` | Complete rewrite with multiplayer instructions, local dev, deployment |

## WebSocket Protocol Summary

### Client → Server
- `create_room` — Create a new game room
- `join_room` { roomCode } — Join existing room by code
- `select_team` { teamId } — Select team (team name string)
- `kick_action` { direction: {x, y}, power } — Submit kick (kicker role)
- `dive_action` { position } — Submit dive (keeper role)

### Server → Client
- `room_created` { roomCode } — Room created successfully
- `room_joined` { roomCode, playerRole } — Joined room as player2
- `opponent_joined` — Opponent entered your room
- `opponent_team_selected` { teamId } — Opponent picked their team
- `match_start` { playerRole, opponentTeam, kickerRole } — Both ready, match begins
- `round_start` { round, kickerRole, scores, suddenDeath } — New round begins
- `waiting_for_opponent` — Your action received, waiting for other player
- `round_result` { goal, missed, kickDirection, divePosition, scores, ... } — Round resolved
- `match_over` { winner, scores } — Match complete
- `opponent_disconnected` — Opponent left, you win by forfeit
- `error` { message } — Error message

## Architecture

```
[Browser] ←→ multiplayer.js ←→ WebSocket ←→ server.js ←→ room-manager.js
                                                       ←→ game-logic.js
```

- Frontend served by Vercel (static)
- Backend on Render (Node.js, persistent WebSocket connections)
- Server is authoritative for multiplayer game state
- Single-player mode has no server dependency (unchanged from v1)
