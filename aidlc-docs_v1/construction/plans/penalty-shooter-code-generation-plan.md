# Code Generation Plan — WC26 Penalty Shooter

## Unit Context
- **Unit**: penalty-shooter (single unit — the entire game)
- **Project Type**: Greenfield, single-file browser game
- **Target Directory**: Workspace root (`/Users/aegirmarjonsson/Repos/wc26-penalty-shooter/`)
- **Tech Stack**: Vanilla HTML5 Canvas + JavaScript (no build step)

## File Structure
```
wc26-penalty-shooter/
  index.html     — HTML page with canvas element
  game.js        — All game logic (~600-800 lines)
  README.md      — Updated with play instructions
```

---

## Generation Steps

### Step 1: Create index.html
- [x] Create `index.html` with:
  - Canvas element (800×600)
  - Minimal CSS (black background, centered canvas)
  - Script tag loading `game.js`
  - Page title "WC26 Penalty Shooter"

### Step 2: Game State & Constants
- [x] Define team data (World Cup 2026 nations with kit colors)
- [x] Define game constants (canvas size, positions, speeds, timing)
- [x] Define game state object (scene, scores, teams, kick state, sub-state)
- [x] `initGameState()` and `resetKickState()` functions

### Step 3: Input Handler
- [x] `initInput()` — register keydown/keyup listeners
- [x] `isKeyDown(key)` — check held keys
- [x] `wasKeyPressed(key)` — one-shot key detection
- [x] `resetFrameInput()` — clear per-frame state

### Step 4: AI Controller
- [x] `aiChooseShot()` — random direction + power with reasonable distribution
- [x] `aiChooseDive()` — random position with slight center bias

### Step 5: Game Logic
- [x] `applyAccuracyPenalty(direction, power)` — add random spread based on power
- [x] `processKick(shotDirection, shotPower, divePosition)` — determine goal/save
- [x] `advanceRound()` — swap roles, increment round
- [x] `checkWinner()` — determine if shootout is decided
- [x] `isShootoutOver()` — check if game should end

### Step 6: Renderer — Core Drawing
- [x] `drawPitch()` — green field, white lines, goal frame (behind-kicker perspective)
- [x] `drawPlayer(x, y, kitColors, pose)` — blocky pixel-art player (rectangles)
- [x] `drawBall(x, y, size)` — the ball
- [x] `drawCrowd()` — simple crowd background (colored rectangles)
- [x] `drawGoal()` — goal posts and net from behind-kicker view

### Step 7: Renderer — UI Elements
- [x] `drawPowerBar(power)` — power meter with color gradient
- [x] `drawAimIndicator(direction)` — arrow showing aim direction
- [x] `drawScoreboard()` — round indicator, scores, kick history
- [x] `drawDiveSelector(selectedPosition)` — show 5 dive positions for keeper

### Step 8: Scene — Title Screen
- [x] `updateTitle()` — wait for any key press
- [x] `renderTitle()` — game title, "Press any key to start", retro styling

### Step 9: Scene — Team Selection
- [x] `updateTeamSelect()` — navigate team grid, confirm with Enter
- [x] `renderTeamSelect()` — team grid with kit color preview, highlight selected

### Step 10: Scene — Gameplay (Kicker Mode)
- [x] Handle READY sub-state (brief "Round X" display)
- [x] Handle AIMING sub-state (arrow keys move aim indicator)
- [x] Handle CHARGING sub-state (hold space, power bar fills)
- [x] Handle BALL_FLIGHT sub-state (animate ball toward goal)
- [x] Handle OUTCOME sub-state (show GOAL!/SAVED! text)
- [x] Transition to NEXT_KICK

### Step 11: Scene — Gameplay (Keeper Mode)
- [x] Handle READY sub-state (brief "Round X" display)
- [x] Handle AIMING sub-state (player selects dive position with keys)
- [x] Handle CHARGING sub-state (AI "winds up" — brief delay)
- [x] Handle BALL_FLIGHT sub-state (ball flies, keeper dives)
- [x] Handle OUTCOME sub-state (show GOAL!/SAVED! text)
- [x] Transition to NEXT_KICK

### Step 12: Scene — Result Screen
- [x] `updateResult()` — wait for Enter to replay
- [x] `renderResult()` — show winner, final score, "Press Enter to play again"

### Step 13: Game Loop & Entry Point
- [x] `gameLoop(timestamp)` — update + render dispatch by scene
- [x] `startGame()` — init state, init input, start loop
- [x] Wire up DOMContentLoaded → startGame()

### Step 14: Update README.md
- [x] Add game description, controls, how to run (just open index.html)

### Step 15: Code Generation Summary
- [x] Create `aidlc-docs/construction/penalty-shooter/code/code-summary.md`
- [x] Document files created and their contents

---

## Controls Reference (for implementation)

**Kicker mode:**
- Arrow keys: aim direction
- Space (hold): charge power
- Space (release): shoot

**Keeper mode:**
- Q: dive top-left
- A: dive bottom-left
- W: stay center
- E: dive top-right
- D: dive bottom-right

**Navigation:**
- Arrow keys: navigate menus
- Enter: confirm selection
- Any key: start from title
