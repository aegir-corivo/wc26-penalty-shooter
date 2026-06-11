# Services / Orchestration

Since this is a single-file game with no backend, the "service layer" is simply the game loop and state machine that orchestrates the components.

---

## Game Loop (Orchestrator)

The game loop is the central orchestrator. Each frame:

```
1. Read input state
2. Call update function for current scene
3. Call render function for current scene
4. Reset per-frame input
5. Request next animation frame
```

---

## Scene State Machine

Scenes transition linearly with one branch:

```
TITLE → TEAM_SELECT → GAMEPLAY → RESULT
                                    ↓
                              (play again?)
                                    ↓
                              TEAM_SELECT
```

**Transition triggers**:
- TITLE → TEAM_SELECT: Any key press
- TEAM_SELECT → GAMEPLAY: Team confirmed (Enter key)
- GAMEPLAY → RESULT: Shootout winner determined
- RESULT → TEAM_SELECT: Player chooses to play again

---

## Gameplay Sub-States

Within the GAMEPLAY scene, there's a sub-state machine for each kick:

```
READY → AIMING → CHARGING → BALL_FLIGHT → OUTCOME → NEXT_KICK
```

**When player is kicker**:
- READY: Brief pause, show "Round X" indicator
- AIMING: Player uses arrow keys to set direction
- CHARGING: Player holds space to charge power bar
- BALL_FLIGHT: Ball animates toward goal
- OUTCOME: Show goal/save result briefly
- NEXT_KICK: Advance round, swap roles

**When player is goalkeeper**:
- READY: Brief pause, show "Round X" indicator
- AIMING: Player selects dive position (keyboard)
- CHARGING: AI "charges" (brief delay for tension)
- BALL_FLIGHT: Ball animates, keeper dives
- OUTCOME: Show goal/save result briefly
- NEXT_KICK: Advance round, swap roles

---

## Data Flow

No external services. All data flows in-memory:

```
Input → Scene Update → Game State mutation → Renderer reads Game State → Canvas
```
