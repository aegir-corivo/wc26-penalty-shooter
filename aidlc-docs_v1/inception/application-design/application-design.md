# Application Design — WC26 Penalty Shooter

## Summary

A single-file (`game.js`) browser game with no dependencies. All code organized as logical function groups sharing a central game state object. The game loop drives a simple scene state machine (title → team-select → gameplay → result).

---

## Architecture Overview

```
+-----------------------------------------------------------+
|                      GAME LOOP                             |
|  requestAnimationFrame → update → render → repeat         |
+-----------------------------------------------------------+
        |                    |                    |
        v                    v                    v
+---------------+   +-----------------+   +-------------+
| INPUT HANDLER |   | SCENE           |   | RENDERER    |
| (keyboard)    |-->| CONTROLLERS     |-->| (canvas)    |
+---------------+   +-----------------+   +-------------+
                       |         |
                       v         v
              +------------+ +---------------+
              | GAME LOGIC | | AI CONTROLLER |
              +------------+ +---------------+
                       |
                       v
              +----------------+
              |   GAME STATE   |
              | (central data) |
              +----------------+
```

---

## Components (7 logical groups)

| # | Component | Purpose |
|---|-----------|---------|
| 1 | Game State | Central data store (scene, scores, kick state, teams) |
| 2 | Renderer | Draws everything to Canvas (procedural pixel-art style) |
| 3 | Input Handler | Captures keyboard state, exposes queries |
| 4 | AI Controller | Makes kicking/diving decisions for computer |
| 5 | Game Logic | Rules engine (kick outcomes, accuracy, rounds, winner) |
| 6 | Scene Controllers | Per-scene update logic (title, team-select, gameplay, result) |
| 7 | Game Loop | requestAnimationFrame orchestrator |

---

## Scene State Machine

```
TITLE → TEAM_SELECT → GAMEPLAY → RESULT → (replay?) → TEAM_SELECT
```

## Gameplay Sub-States (per kick)

```
READY → AIMING → CHARGING → BALL_FLIGHT → OUTCOME → NEXT_KICK
```

---

## Key Design Decisions

1. **Single file** — easy to follow top-to-bottom in a workshop
2. **No classes** — plain functions and a state object
3. **No event system** — direct function calls
4. **Procedural rendering** — Canvas rectangles/shapes = FIFA 94 blocky aesthetic
5. **No build step** — open index.html and play
6. **State machine** — simple string-based scene/sub-state tracking

---

## File Structure

```
wc26-penalty-shooter/
  index.html     — Canvas element + script tag
  game.js        — All game code (~500-800 lines)
  README.md      — How to run
```

---

## Detailed Artifacts

- [components.md](components.md) — Component definitions and responsibilities
- [component-methods.md](component-methods.md) — Method signatures
- [services.md](services.md) — Orchestration and state machines
- [component-dependency.md](component-dependency.md) — Dependencies and data flow
