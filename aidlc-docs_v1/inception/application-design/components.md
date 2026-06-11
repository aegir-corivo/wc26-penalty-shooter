# Game Components

All components live in a single `game.js` file. These are logical groupings of functions and state, not separate classes or modules.

---

## 1. Game State

**Purpose**: Central data store for all game state.

**Responsibilities**:
- Track current scene (title, team-select, gameplay, result)
- Track shootout progress (round, scores, kick history)
- Track which role the player controls this kick (kicker or keeper)
- Store selected teams and their kit colors
- Store current kick state (aiming, power, ball position, goalkeeper position)

---

## 2. Renderer

**Purpose**: Draw everything to the HTML5 Canvas.

**Responsibilities**:
- Clear and redraw each frame
- Draw pitch, goal, crowd background (procedural)
- Draw kicker sprite (colored rectangles based on team kit)
- Draw goalkeeper sprite (colored rectangles based on team kit)
- Draw ball
- Draw UI elements: power bar, aim indicator, scoreboard
- Draw scene-specific screens (title, team select, result)

---

## 3. Input Handler

**Purpose**: Capture and expose keyboard state.

**Responsibilities**:
- Listen for keydown/keyup events
- Track which keys are currently held
- Provide `isKeyDown(key)` and `wasKeyPressed(key)` queries
- Reset per-frame key state (for one-shot presses)

---

## 4. AI Controller

**Purpose**: Make decisions for the computer-controlled role.

**Responsibilities**:
- When AI is kicker: choose random shot direction and power
- When AI is goalkeeper: choose random dive position (slight center bias)
- Introduce slight delay/timing variation for realism

---

## 5. Game Logic

**Purpose**: Rules engine — determines outcomes and advances state.

**Responsibilities**:
- Process a kick: compare ball trajectory with goalkeeper dive → goal or save
- Apply accuracy penalty based on power level
- Advance rounds, check for winner after 5 rounds
- Handle sudden death logic
- Determine who kicks next (alternating player/AI roles)

---

## 6. Scene Controllers

**Purpose**: Per-scene update and input handling logic.

**Responsibilities**:
- **Title scene**: Wait for key press to start
- **Team select scene**: Navigate team list, confirm selection
- **Gameplay scene**: Handle kicking/keeping input, trigger AI, animate kick sequence
- **Result scene**: Show winner, wait for replay input

---

## 7. Game Loop

**Purpose**: Main `requestAnimationFrame` loop that drives the game.

**Responsibilities**:
- Call update logic for current scene
- Call renderer for current scene
- Reset per-frame input state
- Maintain consistent frame timing
