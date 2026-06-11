# Requirements Clarification Questions — Multiplayer & Hosting

Please answer the following questions to help clarify the requirements for adding network multiplayer and hosting to the WC26 Penalty Shooter.

## Question 1
What multiplayer mode should be supported?

A) Real-time 1v1 only — both players take turns simultaneously connected (one kicks, the other saves, in real-time)
B) Asynchronous 1v1 — players take their turns at different times (submit actions, opponent plays later)
C) Both real-time and asynchronous options
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
How should players find each other for a match?

A) Room codes — one player creates a room with a code and shares it with the other player to join
B) Matchmaking queue — players join a queue and are automatically paired
C) Both room codes and matchmaking queue
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Where do you want to host this game?

A) AWS (e.g., EC2, ECS, Lambda, or App Runner for the backend; S3+CloudFront for the frontend)
B) A simple VPS/cloud server (e.g., DigitalOcean, Linode, Railway)
C) Serverless platform (e.g., Vercel/Netlify for frontend, serverless WebSockets for backend)
D) Self-hosted (you provide your own server)
E) No preference — pick what makes sense for a simple real-time game
F) Other (please describe after [Answer]: tag below)

[Answer]: C Vercel

## Question 4
What backend technology do you prefer for the multiplayer server?

A) Node.js with WebSockets (matches the existing JavaScript frontend)
B) Python (FastAPI/Flask with WebSockets)
C) Go (lightweight, high-performance WebSocket server)
D) No preference — pick what makes sense given the existing JavaScript stack
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
What should happen when a player disconnects during a match?

A) The disconnected player forfeits (opponent wins immediately)
B) Give a grace period (e.g., 30 seconds) to reconnect, then forfeit
C) Pause the game and wait indefinitely for reconnection
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
Should the existing single-player mode (vs AI) be preserved?

A) Yes — keep single-player as a separate mode alongside multiplayer
B) No — replace single-player entirely with multiplayer
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
What level of security and anti-cheat do you need?

A) Basic — server validates game state to prevent obvious manipulation
B) Minimal — trust the clients, no server-side validation (faster to build)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 9: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)
D) Other (please describe after [Answer]: tag below)

[Answer]: C
