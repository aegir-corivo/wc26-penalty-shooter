# Components — v2 (Multiplayer & Hosting)

## Overview

The system now has two deployment units: a **client** (browser) and a **server** (Node.js on Render). The client retains most v1 components and adds a networking layer. The server is new.

---

## Client Components

### 1. Game State (existing, modified)

**Purpose**: Central data store for all game state.

**Changes from v1**:
- New `mode` field: `'single'` or `'multi'`
- New `roomCode` field for multiplayer lobby
- New `playerRole` field: which side the local player is (`'player1'` or `'player2'`)
- New `connectionStatus` field: `'disconnected'` | `'connecting'` | `'connected'`
- New `opponentTeam` field populated by server (instead of random selection)

---

### 2. Renderer (existing, modified)

**Purpose**: Draw everything to the HTML5 Canvas.

**Changes from v1**:
- New lobby/room screens (create room, join room, waiting for opponent)
- Connection status indicator overlay
- Role indicator (KICKER / GOALKEEPER) in multiplayer
- "Opponent disconnected" overlay

---

### 3. Input Handler (existing, unchanged)

**Purpose**: Capture and expose keyboard state.

No changes needed — same keyboard input system.

---

### 4. AI Controller (existing, unchanged)

**Purpose**: Make decisions for the computer-controlled role (single-player only).

No changes — only used in single-player mode.

---

### 5. Game Logic (existing, modified)

**Purpose**: Rules engine — determines outcomes and advances state.

**Changes from v1**:
- In multiplayer mode, outcome resolution moves to the server
- Client-side game logic still used for single-player mode
- `processKick` still exists for local play; in multiplayer, server sends the result

---

### 6. Scene Controllers (existing, modified)

**Purpose**: Per-scene update and input handling logic.

**Changes from v1**:
- New scene: `MODE_SELECT` (single player vs multiplayer)
- New scene: `LOBBY` (create/join room, waiting for opponent)
- `GAMEPLAY` scene modified: in multiplayer mode, sends actions to server instead of resolving locally
- `TEAM_SELECT` scene modified: in multiplayer, signals readiness to server after selection

---

### 7. Game Loop (existing, unchanged)

**Purpose**: Main `requestAnimationFrame` loop.

No changes — still drives update → render cycle.

---

### 8. Multiplayer Client (NEW)

**Purpose**: WebSocket communication layer between client and server.

**Responsibilities**:
- Establish WebSocket connection to server
- Send messages: create room, join room, select team, submit action (kick/dive)
- Receive messages: room created, opponent joined, round start, round result, game over, error
- Handle connection lifecycle (connect, disconnect, error)
- Translate server messages into game state updates
- Notify game of opponent disconnect (trigger forfeit)

**File**: `multiplayer.js`

---

## Server Components

### 9. Server Entry Point (NEW)

**Purpose**: HTTP + WebSocket server bootstrap.

**Responsibilities**:
- Start HTTP server (for health checks / Render deployment)
- Upgrade HTTP connections to WebSocket
- Route incoming WebSocket messages to Room Manager
- Handle connection/disconnection events

**File**: `server/server.js`

---

### 10. Room Manager (NEW)

**Purpose**: Manage game rooms — creation, joining, cleanup.

**Responsibilities**:
- Create new rooms with unique codes (4-6 alphanumeric characters)
- Track active rooms and their players
- Handle player joining a room by code
- Remove rooms when games complete or both players disconnect
- Enforce one room per player (no double-joining)
- Expose room state queries (for debugging/health)

**File**: `server/room-manager.js`

---

### 11. Server Game Logic (NEW)

**Purpose**: Authoritative game state management and outcome resolution.

**Responsibilities**:
- Maintain shootout state per room (round, scores, who kicks)
- Receive player actions (kick direction/power, dive position)
- Validate actions are within legal bounds
- Resolve kick outcomes (goal or save) — same logic as client-side `processKick`
- Broadcast results to both players
- Detect winner (after 5 rounds or in sudden death)
- Handle sudden death logic
- Detect timeout (if a player doesn't submit action within time limit)

**File**: `server/game-logic.js`

