# Component Dependencies

## Dependency Matrix

| Component | Depends On | Depended On By |
|-----------|-----------|----------------|
| Game Loop | All components | None (entry point) |
| Scene Controllers | Game State, Input Handler, AI Controller, Game Logic, Renderer | Game Loop |
| Renderer | Game State | Scene Controllers, Game Loop |
| Input Handler | None | Scene Controllers |
| AI Controller | None | Scene Controllers |
| Game Logic | Game State | Scene Controllers |
| Game State | None | All components |

## Data Flow Diagram

```
+-----------------------------------------------------------+
|                      GAME LOOP                             |
|  (orchestrates update/render cycle each frame)            |
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

## Communication Patterns

- **Game Loop → Scene Controllers**: Calls `update()` for current scene each frame
- **Game Loop → Renderer**: Calls `render()` for current scene each frame
- **Scene Controllers → Input Handler**: Queries key state to determine player actions
- **Scene Controllers → AI Controller**: Requests AI decisions when AI's turn
- **Scene Controllers → Game Logic**: Calls logic functions to process kicks, check winners
- **Game Logic → Game State**: Reads and mutates game state (scores, rounds, etc.)
- **Renderer → Game State**: Reads game state to know what to draw
- **Input Handler → Scene Controllers**: Provides key state (passive — queried, not pushed)

## Key Design Decisions

1. **No event system** — direct function calls, simple and debuggable
2. **Game State is a plain object** — no getters/setters, mutated directly by game logic
3. **Renderer is read-only** — never mutates game state, only reads it
4. **Input Handler is passive** — stores state, queried by scene controllers
5. **Single-threaded** — all runs in one requestAnimationFrame callback
