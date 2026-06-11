// WC26 Penalty Shooter — Multiplayer WebSocket Server

const http = require('http');
const { WebSocketServer } = require('ws');
const roomManager = require('./room-manager');
const gameLogic = require('./game-logic');

const PORT = process.env.PORT || 3000;

// Client tracking
const clients = new Map(); // clientId -> ws
let nextClientId = 1;

// Create HTTP server (for health checks)
const httpServer = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      rooms: roomManager.getRoomCount(),
      clients: clients.size
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Create WebSocket server
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  const clientId = 'client_' + nextClientId++;
  clients.set(clientId, ws);
  console.log(`[${clientId}] Connected. Total clients: ${clients.size}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(clientId, message);
    } catch (err) {
      sendToClient(clientId, { type: 'error', message: 'Invalid JSON message' });
    }
  });

  ws.on('close', () => {
    handleDisconnect(clientId);
  });

  ws.on('error', (err) => {
    console.error(`[${clientId}] WebSocket error:`, err.message);
  });
});

function handleMessage(clientId, message) {
  switch (message.type) {
    case 'create_room':
      handleCreateRoom(clientId);
      break;
    case 'join_room':
      handleJoinRoom(clientId, message.roomCode);
      break;
    case 'select_team':
      handleSelectTeam(clientId, message.teamId);
      break;
    case 'kick_action':
      handleGameAction(clientId, message);
      break;
    case 'dive_action':
      handleGameAction(clientId, message);
      break;
    default:
      sendToClient(clientId, { type: 'error', message: 'Unknown message type: ' + message.type });
  }
}

function handleCreateRoom(clientId) {
  const { roomCode } = roomManager.createRoom(clientId);
  console.log(`[${clientId}] Created room ${roomCode}`);
  sendToClient(clientId, { type: 'room_created', roomCode });
}

function handleJoinRoom(clientId, roomCode) {
  if (!roomCode) {
    sendToClient(clientId, { type: 'error', message: 'Room code is required' });
    return;
  }

  const result = roomManager.joinRoom(clientId, roomCode);
  if (!result.success) {
    sendToClient(clientId, { type: 'error', message: result.error });
    return;
  }

  const room = roomManager.getRoomByClient(clientId);
  console.log(`[${clientId}] Joined room ${room.code}`);

  // Notify the joining player
  sendToClient(clientId, {
    type: 'room_joined',
    roomCode: room.code,
    playerRole: 'player2'
  });

  // Notify player 1 that opponent joined
  sendToClient(room.player1, { type: 'opponent_joined' });
}

function handleSelectTeam(clientId, teamId) {
  if (!teamId) {
    sendToClient(clientId, { type: 'error', message: 'Team ID is required' });
    return;
  }

  const result = roomManager.setTeamSelection(clientId, teamId);
  if (result.error) {
    sendToClient(clientId, { type: 'error', message: result.error });
    return;
  }

  const room = result.room;

  // Notify opponent of team selection
  const opponentId = room.player1 === clientId ? room.player2 : room.player1;
  if (opponentId) {
    sendToClient(opponentId, { type: 'opponent_team_selected', teamId });
  }

  // If both players have selected teams, start the match
  if (result.bothReady) {
    console.log(`[Room ${room.code}] Both teams selected. Starting match.`);
    const gameState = gameLogic.initMatch(room);

    // Send match_start to both players
    sendToClient(room.player1, {
      type: 'match_start',
      playerRole: 'player1',
      opponentTeam: room.player2Team,
      kickerRole: gameState.currentKicker
    });
    sendToClient(room.player2, {
      type: 'match_start',
      playerRole: 'player2',
      opponentTeam: room.player1Team,
      kickerRole: gameState.currentKicker
    });

    // Send first round_start
    sendRoundStart(room);
  }
}

function handleGameAction(clientId, message) {
  const room = roomManager.getRoomByClient(clientId);
  if (!room || !room.gameState) {
    sendToClient(clientId, { type: 'error', message: 'Not in an active game' });
    return;
  }

  const result = gameLogic.submitAction(room.gameState, clientId, message);
  if (!result.valid) {
    sendToClient(clientId, { type: 'error', message: result.error });
    return;
  }

  if (result.bothReady) {
    // Both actions received — resolve the round
    const roundResult = gameLogic.resolveRound(room.gameState);
    console.log(`[Room ${room.code}] Round ${roundResult.round} resolved: ${roundResult.goal ? 'GOAL' : 'SAVE/MISS'} (${roundResult.scores.player1}-${roundResult.scores.player2})`);

    // Broadcast result to both players
    sendToClient(room.player1, { type: 'round_result', ...roundResult });
    sendToClient(room.player2, { type: 'round_result', ...roundResult });

    if (roundResult.gameOver) {
      console.log(`[Room ${room.code}] Match over. Winner: ${roundResult.winner}`);
      sendToClient(room.player1, {
        type: 'match_over',
        winner: roundResult.winner,
        scores: roundResult.scores
      });
      sendToClient(room.player2, {
        type: 'match_over',
        winner: roundResult.winner,
        scores: roundResult.scores
      });
      // Clean up room
      roomManager.removeRoom(room.code);
    } else {
      // Send next round start after a brief delay (let clients animate)
      setTimeout(() => {
        // Verify room still exists (player might disconnect during animation)
        const stillExists = roomManager.getRoom(room.code);
        if (stillExists && stillExists.gameState) {
          sendRoundStart(stillExists);
        }
      }, 2000);
    }
  } else {
    // Notify the player that we're waiting for opponent
    sendToClient(clientId, { type: 'waiting_for_opponent' });
  }
}

function sendRoundStart(room) {
  const gs = room.gameState;
  const msg = {
    type: 'round_start',
    round: gs.round,
    kickerRole: gs.currentKicker,
    scores: { ...gs.scores },
    suddenDeath: gs.suddenDeath
  };
  sendToClient(room.player1, msg);
  sendToClient(room.player2, msg);
}

function handleDisconnect(clientId) {
  console.log(`[${clientId}] Disconnected.`);

  // Find and notify opponent
  const opponentId = roomManager.leaveCurrentRoom(clientId);
  if (opponentId) {
    sendToClient(opponentId, { type: 'opponent_disconnected' });
  }

  clients.delete(clientId);
  console.log(`Total clients: ${clients.size}`);
}

function sendToClient(clientId, message) {
  const ws = clients.get(clientId);
  if (ws && ws.readyState === 1) { // WebSocket.OPEN === 1
    ws.send(JSON.stringify(message));
  }
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`WC26 Penalty Shooter server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
});
