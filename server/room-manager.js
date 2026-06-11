// Room Manager — handles room creation, joining, and cleanup

const rooms = new Map(); // roomCode -> Room
const clientRooms = new Map(); // clientId -> roomCode

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  let code;
  do {
    code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (rooms.has(code));
  return code;
}

function createRoom(clientId) {
  // Remove client from any existing room first
  leaveCurrentRoom(clientId);

  const roomCode = generateRoomCode();
  const room = {
    code: roomCode,
    player1: clientId,
    player2: null,
    player1Team: null,
    player2Team: null,
    gameState: null,
    createdAt: Date.now()
  };
  rooms.set(roomCode, room);
  clientRooms.set(clientId, roomCode);
  return { roomCode };
}

function joinRoom(clientId, roomCode) {
  const code = roomCode.toUpperCase().trim();
  const room = rooms.get(code);

  if (!room) {
    return { success: false, error: 'Room not found' };
  }
  if (room.player2 !== null) {
    return { success: false, error: 'Room is full' };
  }
  if (room.player1 === clientId) {
    return { success: false, error: 'You are already in this room' };
  }

  // Remove client from any existing room first
  leaveCurrentRoom(clientId);

  room.player2 = clientId;
  clientRooms.set(clientId, code);
  return { success: true, playerRole: 'player2' };
}

function getRoom(roomCode) {
  return rooms.get(roomCode) || null;
}

function getRoomByClient(clientId) {
  const code = clientRooms.get(clientId);
  if (!code) return null;
  return rooms.get(code) || null;
}

function removeRoom(roomCode) {
  const room = rooms.get(roomCode);
  if (room) {
    if (room.player1) clientRooms.delete(room.player1);
    if (room.player2) clientRooms.delete(room.player2);
    rooms.delete(roomCode);
  }
}

function leaveCurrentRoom(clientId) {
  const code = clientRooms.get(clientId);
  if (!code) return null;

  const room = rooms.get(code);
  if (!room) {
    clientRooms.delete(clientId);
    return null;
  }

  // Determine opponent
  let opponentId = null;
  if (room.player1 === clientId) {
    opponentId = room.player2;
  } else if (room.player2 === clientId) {
    opponentId = room.player1;
  }

  // Remove the room entirely
  removeRoom(code);
  return opponentId;
}

function setTeamSelection(clientId, teamId) {
  const room = getRoomByClient(clientId);
  if (!room) return { error: 'Not in a room' };

  if (room.player1 === clientId) {
    room.player1Team = teamId;
  } else if (room.player2 === clientId) {
    room.player2Team = teamId;
  } else {
    return { error: 'Not a player in this room' };
  }

  const bothReady = room.player1Team !== null && room.player2Team !== null;
  return { bothReady, room };
}

function getRoomCount() {
  return rooms.size;
}

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  getRoomByClient,
  removeRoom,
  leaveCurrentRoom,
  setTeamSelection,
  generateRoomCode,
  getRoomCount
};
