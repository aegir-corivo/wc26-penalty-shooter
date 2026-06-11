// Server Game Logic — authoritative match state and outcome resolution

const VALID_DIVE_POSITIONS = ['top-left', 'bottom-left', 'center', 'top-right', 'bottom-right'];
const ACTION_TIMEOUT_MS = 30000; // 30 seconds per action
const ROUNDS_PER_SIDE = 5;

function initMatch(room) {
  const gameState = {
    roomCode: room.code,
    player1: room.player1,
    player2: room.player2,
    round: 1,
    currentKicker: 'player1', // player1 kicks first
    scores: { player1: 0, player2: 0 },
    kicksTaken: { player1: 0, player2: 0 },
    actions: { kicker: null, keeper: null },
    phase: 'waiting_for_actions', // waiting_for_actions | resolving | complete
    winner: null,
    suddenDeath: false
  };
  room.gameState = gameState;
  return gameState;
}

function validateKickAction(direction, power) {
  if (!direction || typeof direction.x !== 'number' || typeof direction.y !== 'number') {
    return false;
  }
  if (direction.x < -1 || direction.x > 1 || direction.y < -1 || direction.y > 1) {
    return false;
  }
  if (typeof power !== 'number' || power < 0 || power > 1) {
    return false;
  }
  return true;
}

function validateDiveAction(position) {
  return VALID_DIVE_POSITIONS.includes(position);
}

function submitAction(gameState, clientId, action) {
  if (gameState.phase !== 'waiting_for_actions') {
    return { valid: false, error: 'Not accepting actions right now' };
  }

  const isKicker = (gameState.currentKicker === 'player1' && clientId === gameState.player1) ||
                   (gameState.currentKicker === 'player2' && clientId === gameState.player2);
  const isKeeper = !isKicker &&
                   ((gameState.currentKicker === 'player1' && clientId === gameState.player2) ||
                    (gameState.currentKicker === 'player2' && clientId === gameState.player1));

  if (!isKicker && !isKeeper) {
    return { valid: false, error: 'You are not a player in this match' };
  }

  if (isKicker) {
    if (action.type !== 'kick_action') {
      return { valid: false, error: 'Kicker must submit kick_action' };
    }
    if (!validateKickAction(action.direction, action.power)) {
      return { valid: false, error: 'Invalid kick action: direction must be {x: -1..1, y: -1..1}, power must be 0..1' };
    }
    if (gameState.actions.kicker !== null) {
      return { valid: false, error: 'Kick action already submitted' };
    }
    gameState.actions.kicker = { direction: action.direction, power: action.power };
  } else {
    if (action.type !== 'dive_action') {
      return { valid: false, error: 'Keeper must submit dive_action' };
    }
    if (!validateDiveAction(action.position)) {
      return { valid: false, error: 'Invalid dive position. Must be one of: ' + VALID_DIVE_POSITIONS.join(', ') };
    }
    if (gameState.actions.keeper !== null) {
      return { valid: false, error: 'Dive action already submitted' };
    }
    gameState.actions.keeper = { position: action.position };
  }

  // Check if both actions are in
  const bothReady = gameState.actions.kicker !== null && gameState.actions.keeper !== null;
  return { valid: true, bothReady };
}

function resolveRound(gameState) {
  gameState.phase = 'resolving';

  const kick = gameState.actions.kicker;
  const dive = gameState.actions.keeper;

  // Apply accuracy penalty (same algorithm as client)
  const adjustedDirection = applyAccuracyPenalty(kick.direction, kick.power);

  // Determine ball target zone from direction
  const ballZone = getBallZone(adjustedDirection);

  // Check if goalkeeper saves
  const goal = !isSave(ballZone, dive.position, adjustedDirection);

  // Check if ball is off-target (missed entirely)
  const missed = isMissed(adjustedDirection);

  const scored = goal && !missed;

  // Update scores
  if (scored) {
    gameState.scores[gameState.currentKicker]++;
  }
  gameState.kicksTaken[gameState.currentKicker]++;

  // Build result
  const result = {
    goal: scored,
    missed: missed,
    kickDirection: adjustedDirection,
    divePosition: dive.position,
    round: gameState.round,
    scores: { ...gameState.scores },
    kicksTaken: { ...gameState.kicksTaken },
    kicker: gameState.currentKicker
  };

  // Advance to next kick
  advanceRound(gameState);

  // Check if match is over
  result.gameOver = gameState.phase === 'complete';
  result.winner = gameState.winner;
  result.suddenDeath = gameState.suddenDeath;

  return result;
}

function applyAccuracyPenalty(direction, power) {
  // Higher power = more random spread
  const spread = power * 0.3;
  const adjustedX = direction.x + (Math.random() - 0.5) * spread;
  const adjustedY = direction.y + (Math.random() - 0.5) * spread * 0.5;

  return {
    x: Math.max(-1.2, Math.min(1.2, adjustedX)),
    y: Math.max(-0.2, Math.min(1.2, adjustedY))
  };
}

function isMissed(direction) {
  // Ball goes off target if direction is too extreme
  return Math.abs(direction.x) > 1.0 || direction.y > 1.0 || direction.y < -1.0;
}

function getBallZone(direction) {
  // Map continuous direction to one of 5 zones
  const x = direction.x;
  const y = direction.y;

  if (Math.abs(x) < 0.25 && Math.abs(y) < 0.4) return 'center';
  if (x < -0.25 && y >= 0) return 'top-left';
  if (x < -0.25 && y < 0) return 'bottom-left';
  if (x >= 0.25 && y >= 0) return 'top-right';
  if (x >= 0.25 && y < 0) return 'bottom-right';
  return 'center';
}

function isSave(ballZone, divePosition, direction) {
  // Exact match = save
  if (ballZone === divePosition) return true;

  // Near-match: adjacent zones have a chance of save
  const adjacentZones = {
    'top-left': ['bottom-left', 'center'],
    'bottom-left': ['top-left', 'center'],
    'center': ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    'top-right': ['bottom-right', 'center'],
    'bottom-right': ['top-right', 'center']
  };

  if (adjacentZones[divePosition] && adjacentZones[divePosition].includes(ballZone)) {
    // 20% chance of save on adjacent zone
    return Math.random() < 0.2;
  }

  return false;
}

function advanceRound(gameState) {
  // Reset actions for next round
  gameState.actions = { kicker: null, keeper: null };

  // Check if we can determine a winner
  const winner = checkWinner(gameState);
  if (winner) {
    gameState.phase = 'complete';
    gameState.winner = winner;
    return;
  }

  // Swap kicker
  if (gameState.currentKicker === 'player1') {
    gameState.currentKicker = 'player2';
  } else {
    gameState.currentKicker = 'player1';
    gameState.round++;
  }

  gameState.phase = 'waiting_for_actions';
}

function checkWinner(gameState) {
  const s = gameState.scores;
  const k = gameState.kicksTaken;

  if (!gameState.suddenDeath) {
    // Regular rounds: each player gets ROUNDS_PER_SIDE kicks
    const p1Done = k.player1 >= ROUNDS_PER_SIDE;
    const p2Done = k.player2 >= ROUNDS_PER_SIDE;

    if (p1Done && p2Done) {
      // Both have taken all kicks
      if (s.player1 !== s.player2) {
        return s.player1 > s.player2 ? 'player1' : 'player2';
      }
      // Tied — enter sudden death
      gameState.suddenDeath = true;
      return null;
    }

    // Check if one player has an insurmountable lead
    const p1Remaining = ROUNDS_PER_SIDE - k.player1;
    const p2Remaining = ROUNDS_PER_SIDE - k.player2;

    // Player 1 can't catch up
    if (s.player2 - s.player1 > p1Remaining) return 'player2';
    // Player 2 can't catch up
    if (s.player1 - s.player2 > p2Remaining) return 'player1';

    return null;
  } else {
    // Sudden death: after each pair of kicks, check for winner
    // Both must have taken the same number of kicks in sudden death
    const sdKicks1 = k.player1 - ROUNDS_PER_SIDE;
    const sdKicks2 = k.player2 - ROUNDS_PER_SIDE;

    if (sdKicks1 === sdKicks2 && sdKicks1 > 0) {
      // Both have taken equal sudden death kicks — check scores
      if (s.player1 !== s.player2) {
        return s.player1 > s.player2 ? 'player1' : 'player2';
      }
    }

    // After one player kicks in sudden death, if the other can't equalize
    if (sdKicks1 > sdKicks2) {
      // Player 1 just kicked. If player 1 scored and player 2 must score to stay alive
      // We don't decide yet — let player 2 kick
    }
    if (sdKicks2 > sdKicks1) {
      // Player 2 just kicked. If scores differ, player 1 wins (already had their kick)
      // Actually this means the pair is incomplete — wait for both
    }

    return null;
  }
}

function getActionTimeoutMs() {
  return ACTION_TIMEOUT_MS;
}

module.exports = {
  initMatch,
  submitAction,
  resolveRound,
  validateKickAction,
  validateDiveAction,
  checkWinner,
  getActionTimeoutMs,
  VALID_DIVE_POSITIONS
};
