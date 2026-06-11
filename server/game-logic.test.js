const assert = require('node:assert/strict');
const test = require('node:test');

const gameLogic = require('./game-logic');

function createStartedMatch() {
  const room = {
    code: 'TEST1',
    player1: 'client_1',
    player2: 'client_2'
  };

  return gameLogic.initMatch(room);
}

test('accepts low shots after the kicker changes in multiplayer', () => {
  const gameState = createStartedMatch();

  assert.deepEqual(
    gameLogic.submitAction(gameState, 'client_1', {
      type: 'kick_action',
      direction: { x: 0, y: 0 },
      power: 0.5
    }),
    { valid: true, bothReady: false }
  );
  assert.deepEqual(
    gameLogic.submitAction(gameState, 'client_2', {
      type: 'dive_action',
      position: 'center'
    }),
    { valid: true, bothReady: true }
  );

  gameLogic.resolveRound(gameState);

  assert.equal(gameState.currentKicker, 'player2');
  assert.deepEqual(
    gameLogic.submitAction(gameState, 'client_2', {
      type: 'kick_action',
      direction: { x: 0, y: -0.2 },
      power: 0.5
    }),
    { valid: true, bothReady: false }
  );
  assert.deepEqual(
    gameLogic.submitAction(gameState, 'client_1', {
      type: 'dive_action',
      position: 'center'
    }),
    { valid: true, bothReady: true }
  );
});
