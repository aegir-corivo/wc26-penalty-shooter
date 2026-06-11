# WC26 Penalty Shooter ⚽

A FIFA 94-style penalty shootout browser game. Built with vanilla HTML5 Canvas and JavaScript — no dependencies, no build step.

## How to Play

1. Open `index.html` in your browser
2. Press any key to start
3. Select your team using arrow keys, press Enter to confirm
4. Take turns as the penalty taker and goalkeeper

## Controls

### As Penalty Taker
- **Arrow Keys** — Aim direction (crosshair moves on goal)
- **Space (hold)** — Charge power (higher power = less accuracy)
- **Space (release)** — Shoot!

### As Goalkeeper
- **Q** — Dive top-left
- **A** — Dive bottom-left
- **W** — Stay center
- **E** — Dive top-right
- **D** — Dive bottom-right
- **Space** — Confirm dive position

### Menu
- **Arrow Keys** — Navigate
- **Enter** — Confirm selection

## Rules

- Standard 5 kicks per side
- You alternate between kicker and goalkeeper each kick
- If tied after 5 rounds, sudden death begins
- Higher shot power = faster ball but more random spread

## Tech Stack

- Vanilla HTML5 Canvas (800×600)
- Single `game.js` file (~600 lines)
- No frameworks, no build tools, no dependencies
- Just open the HTML file and play
