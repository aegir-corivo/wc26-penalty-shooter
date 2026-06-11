# Requirements Document — WC26 Penalty Shooter

## Intent Analysis

| Field | Value |
|-------|-------|
| **User Request** | Build a soccer penalty shootout video game for the browser with FIFA 94-style graphics. Player alternates between penalty taker and goalkeeper. Minimal scope for a 4-hour workshop. |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | Single Component (browser game, no backend) |
| **Complexity Estimate** | Moderate (game loop, sprite rendering, state management, AI opponent) |

---

## Technology Decision

**Stack**: Vanilla HTML5 Canvas + JavaScript (ES Modules)

**Rationale for a 4-hour workshop**:
- Zero dependencies, no `npm install`, no build step
- Open `index.html` in browser to run — instant iteration
- Canvas API is well-suited for retro pixel-art graphics
- Single file or small set of files — easy to reason about
- No framework abstractions to learn

---

## Functional Requirements

### FR-1: Game Structure
- Standard penalty shootout: 5 kicks per side
- If tied after 5 rounds, sudden death (one kick each until a winner)
- Player alternates each kick between controlling the **penalty taker** and the **goalkeeper**
- AI controls whichever role the player is not controlling

### FR-2: Penalty Taking (Player as Kicker)
- Arrow keys to aim direction (left/right and slightly up/down)
- Hold **spacebar** to charge a power bar (visible on screen)
- Release spacebar to shoot
- Higher power = faster shot but **less accuracy** (random spread increases with power)
- Visual indicator of aim direction shown before shooting

### FR-3: Goalkeeping (Player as Goalkeeper)
- Player selects a dive position before the AI kicks:
  - Top-left, Bottom-left, Center, Top-right, Bottom-right (5 positions)
- Input via keyboard (e.g., numpad or mapped keys)
- Goalkeeper dives to chosen position on AI kick
- Save occurs if dive position matches (or is close to) the ball's trajectory

### FR-4: AI Opponent
- When AI is kicker: randomized shot direction/power with reasonable distribution
- When AI is goalkeeper: randomized dive choice with slight bias toward center
- No difficulty levels for MVP — single balanced difficulty

### FR-5: Team Selection
- Pre-game screen to choose from **World Cup 2026 participating nations**
- Each team has a distinct kit color (shirt/shorts rendered on sprites)
- Opponent team randomly selected from remaining pool
- Minimum: 8–12 teams for variety (can expand later)

### FR-6: Visual Style
- **FIFA 94 aesthetic**: low-resolution pixel-art sprites, limited color palette
- Behind-the-kicker camera perspective (looking at the goal)
- Visible elements: goal, goalkeeper, kicker, ball, pitch markings, crowd (simple)
- Scoreboard showing current shootout progress (kicks taken, goals scored)

### FR-7: Game Flow
1. Title screen → Team selection → Coin toss (who kicks first)
2. Penalty round loop (alternate kicker/keeper)
3. After 5 rounds: check winner or enter sudden death
4. Result screen (winner announcement)
5. Option to play again

---

## Non-Functional Requirements

### NFR-1: Performance
- Smooth 60fps on modern browsers (Chrome, Firefox, Safari, Edge)
- No external asset loading beyond initial page load (inline or bundled sprites)

### NFR-2: Simplicity
- No build tools required — open `index.html` to play
- Entire game in a small set of `.js` and `.html` files
- Sprite art can be drawn procedurally on canvas (no external image files needed for MVP)

### NFR-3: Responsiveness
- Fixed canvas size (e.g., 640×480 or 800×600) — no responsive scaling needed for MVP
- Keyboard-only controls (no touch/mobile support for MVP)

### NFR-4: Browser Compatibility
- Modern evergreen browsers only (no IE support)
- ES Module support assumed

---

## Out of Scope (MVP)
- Sound effects / music
- Mobile / touch controls
- Online multiplayer
- Player statistics / persistence
- Difficulty levels
- Animations beyond basic sprite frames (walk-up, kick, dive)
- Controller / gamepad support
