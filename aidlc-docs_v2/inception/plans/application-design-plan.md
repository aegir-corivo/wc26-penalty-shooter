# Application Design Plan — Multiplayer & Hosting

## Plan Steps

- [x] Identify new components needed (server-side)
- [x] Define WebSocket message protocol (client ↔ server)
- [x] Design client-side networking layer (additions to game.js or separate file)
- [x] Define server component methods and responsibilities
- [x] Design room management and matchmaking flow
- [x] Define game state synchronization approach
- [x] Map component dependencies (client ↔ server ↔ existing game logic)
- [x] Generate components.md
- [x] Generate component-methods.md
- [x] Generate services.md
- [x] Generate component-dependency.md
- [x] Generate application-design.md (consolidated)
- [x] Validate design completeness

---

## Design Questions

## Question 1
For the **server-side code**, how would you like it structured?

A) Single file (server.js) — keeps it simple, similar to how game.js is one file
B) Multiple files with clear separation (e.g., server.js, room-manager.js, game-logic.js)
C) No preference — pick what makes sense for maintainability
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
Should the **client multiplayer code** be added to the existing `game.js`, or kept in a separate file?

A) Add to game.js — keep the single-file approach from v1
B) Separate file (e.g., multiplayer.js) — keeps networking isolated from game logic
C) No preference — pick what makes sense
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
For the WebSocket server hosting, which platform do you prefer? (Vercel can't do persistent WebSockets, so the server needs a separate host)

A) Railway (simple Node.js deploys, free tier available, WebSocket support)
B) Render (free tier, auto-deploy from Git, WebSocket support)
C) Fly.io (edge deployment, generous free tier, WebSocket support)
D) No preference — pick the simplest option
E) Other (please describe after [Answer]: tag below)

[Answer]: B

