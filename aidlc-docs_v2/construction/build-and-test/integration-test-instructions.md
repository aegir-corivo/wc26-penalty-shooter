# Integration Test Instructions — WC26 Penalty Shooter v2

## Purpose
Test the complete client ↔ server flow to ensure multiplayer works end-to-end.

## Setup Integration Test Environment

### 1. Start the Server
```bash
cd server
npm install
npm start
```
Server runs on `ws://localhost:3000`.

### 2. Open Client
Open `index.html` in browser. The client connects to `ws://localhost:3000` by default.

## Test Scenarios

### Scenario 1: Room Creation and Joining
1. **Tab 1**: Select Multiplayer → Create Room
2. **Verify**: 5-letter room code appears, "Waiting for opponent..." shows
3. **Tab 2**: Select Multiplayer → Join Room → Enter code from Tab 1
4. **Verify**: Both tabs advance to Team Select
5. **Expected**: Server logs show `Created room XXXXX` and `Joined room XXXXX`

### Scenario 2: Full Match Flow
1. Complete Scenario 1
2. Both tabs select a team and press ENTER
3. **Verify**: Match starts, one player sees "You are KICKING", other sees "You are the KEEPER"
4. Kicker aims and shoots (arrow keys + space)
5. Keeper selects dive position and confirms (Q/A/W/E/D + space)
6. **Verify**: Both tabs show the result animation (GOAL/SAVE/MISS)
7. Roles swap for next round
8. Continue until shootout ends
9. **Verify**: Both tabs show result screen with correct winner

### Scenario 3: Disconnect Handling
1. Start a match (complete Scenario 2 first few rounds)
2. Close Tab 2 (simulate disconnect)
3. **Verify**: Tab 1 shows "Opponent disconnected — You win!"
4. **Verify**: Server logs show disconnect and cleanup

### Scenario 4: Invalid Room Code
1. **Tab 1**: Select Multiplayer → Join Room → Enter "ZZZZZ" (non-existent)
2. **Verify**: Error message "Room not found" appears in lobby

### Scenario 5: Full Room
1. Create room and join with two tabs
2. **Tab 3**: Try to join same room code
3. **Verify**: Error message "Room is full" appears

### Scenario 6: Server Validation
1. Start a match
2. Open browser DevTools console on the kicker's tab
3. Try sending invalid action:
   ```javascript
   // This should be rejected by server
   Multiplayer.sendKickAction({x: 5, y: 5}, 2.0);
   ```
4. **Verify**: Server rejects with error message (invalid bounds)

## Health Check Verification
```bash
curl http://localhost:3000/
```
Expected response:
```json
{"status":"ok","rooms":0,"clients":0}
```
