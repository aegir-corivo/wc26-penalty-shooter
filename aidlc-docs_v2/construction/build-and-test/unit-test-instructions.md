# Unit Test Instructions — WC26 Penalty Shooter v2

## Overview

No automated test framework was set up for this project (per the user's decision to skip PBT and keep the project simple). Testing is manual.

## Manual Verification: Server Modules

### 1. Room Manager Smoke Test
```bash
cd server
node -e "
const rm = require('./room-manager');
const result = rm.createRoom('test1');
console.log('Create room:', result);
const joinResult = rm.joinRoom('test2', result.roomCode);
console.log('Join room:', joinResult);
const room = rm.getRoomByClient('test1');
console.log('Room state:', room);
rm.removeRoom(result.roomCode);
console.log('Room count after cleanup:', rm.getRoomCount());
"
```

Expected:
- Create room returns `{ roomCode: 'XXXXX' }` (5 alphanumeric chars)
- Join room returns `{ success: true, playerRole: 'player2' }`
- Room state shows both players
- Room count returns 0 after cleanup

### 2. Game Logic Smoke Test
```bash
cd server
node -e "
const gl = require('./game-logic');
console.log('Validate kick:', gl.validateKickAction({x: 0.5, y: 0.3}, 0.8));
console.log('Validate dive:', gl.validateDiveAction('top-left'));
console.log('Invalid kick:', gl.validateKickAction({x: 5, y: 0}, 0.8));
console.log('Invalid dive:', gl.validateDiveAction('middle'));
"
```

Expected:
- Valid kick: `true`
- Valid dive: `true`
- Invalid kick: `false`
- Invalid dive: `false`

### 3. Server Startup Test
```bash
cd server
npm start
# Should print: "WC26 Penalty Shooter server running on port 3000"
# Press Ctrl+C to stop
```

## Manual Verification: Client

### 1. Single Player Mode
1. Open `index.html` in browser
2. Press any key → Mode Select appears
3. Select "Single Player" → Team Select appears
4. Choose team, press ENTER → Gameplay starts
5. Play through 5 rounds → Result screen shows
6. Press ENTER → Returns to team select

### 2. Multiplayer Mode (requires server running)
1. Start server: `cd server && npm start`
2. Open `index.html` in two browser tabs
3. Tab 1: Select Multiplayer → Create Room → Note the 5-letter code
4. Tab 2: Select Multiplayer → Join Room → Enter code
5. Both tabs → Team Select → Choose teams
6. Match begins when both have selected
7. Play through rounds — actions resolve after both submit
8. Close one tab → Other tab shows "Opponent disconnected — You win!"
