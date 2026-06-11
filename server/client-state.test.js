const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadGameStateHarness() {
  const gameSource = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
  const noop = () => {};
  const canvasContext = new Proxy({}, { get: () => noop });
  const context = {
    window: {
      location: {
        protocol: 'file:',
        hostname: ''
      }
    },
    document: {
      getElementById: () => ({
        getContext: () => canvasContext,
        addEventListener: noop,
        setAttribute: noop
      }),
      addEventListener: noop,
      removeEventListener: noop
    },
    requestAnimationFrame: noop,
    console
  };

  vm.createContext(context);
  vm.runInContext(
    `${gameSource}
initGameState();
state.mode = 'multi';
state.playerRole = 'player1';
handleMultiplayerMessage({
  type: 'round_start',
  round: 3,
  kickerRole: 'player1',
  scores: { player1: 2, player2: 1 },
  suddenDeath: false
});
result = {
  round: state.round,
  multiRound: state.multiRound,
  playerIsKicker: state.playerIsKicker
};`,
    context
  );

  return context.result;
}

test('multiplayer round_start updates the displayed round state', () => {
  const state = loadGameStateHarness();

  assert.equal(state.round, 3);
  assert.equal(state.multiRound, 3);
  assert.equal(state.playerIsKicker, true);
});
