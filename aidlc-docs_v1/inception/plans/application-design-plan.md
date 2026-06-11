# Application Design Plan

## Plan Overview
Design the game's component architecture — what modules exist, what they do, and how they talk to each other.

## Design Steps

- [x] Define core game components and responsibilities
- [x] Define component methods (public interfaces)
- [x] Define services / orchestration layer (game loop, state machine)
- [x] Define component dependencies and data flow
- [x] Validate design completeness

---

## Clarifying Questions

Please answer these to guide the component design:

## Question 1
How should the game code be organized?

A) Single file — everything in one `game.js` (simplest for workshop, easy to follow top-to-bottom)
B) Few modules — split into 3-5 ES Module files by concern (e.g., `main.js`, `renderer.js`, `gameState.js`, `input.js`, `ai.js`)
C) Many modules — fine-grained separation (one file per class/component)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should game scenes/screens be managed?

A) Simple state variable — a single `currentScene` string with if/else in the game loop
B) Scene objects — each screen (title, team-select, gameplay, result) is an object with `update()` and `render()` methods
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
How should the pixel-art sprites be created?

A) Procedural — draw everything with Canvas API calls (rectangles, circles, lines) at runtime. No image files needed.
B) Sprite sheet — create a small PNG sprite sheet with pre-drawn pixel art, loaded at startup
C) Mix — simple shapes drawn procedurally, key sprites (players, ball) as embedded base64 images
D) Other (please describe after [Answer]: tag below)

[Answer]: C. Are you capable of creating nice png sprites?

