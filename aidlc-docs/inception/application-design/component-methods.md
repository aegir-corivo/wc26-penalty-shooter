# Component Methods

All functions exist at the top level in `game.js`. Grouped by logical component.

---

## Game State

```
initGameState() → void
  Initialize/reset all game state to defaults.

resetKickState() → void
  Reset kick-specific state (aim, power, ball pos) for a new kick.

getCurrentScene() → string
  Return current scene name.

setScene(sceneName) → void
  Transition to a new scene.
```

---

## Renderer

```
render() → void
  Master render function — dispatches to scene-specific render.

renderTitle() → void
  Draw title screen (game name, "press any key").

renderTeamSelect() → void
  Draw team selection grid with kit previews.

renderGameplay() → void
  Draw pitch, goal, players, ball, UI overlays.

renderResult() → void
  Draw winner announcement and replay prompt.

drawPitch() → void
  Draw green pitch, white lines, goal posts.

drawPlayer(x, y, kitColors, pose) → void
  Draw a player sprite at position with kit colors and pose (standing/kicking/diving).

drawBall(x, y) → void
  Draw the ball at given position.

drawPowerBar(power) → void
  Draw the power meter UI element.

drawAimIndicator(direction) → void
  Draw the aim arrow/cursor.

drawScoreboard() → void
  Draw current shootout score and round indicator.
```

---

## Input Handler

```
initInput() → void
  Register keydown/keyup event listeners.

isKeyDown(key) → boolean
  Check if key is currently held down.

wasKeyPressed(key) → boolean
  Check if key was pressed this frame (one-shot).

resetFrameInput() → void
  Clear one-shot key presses at end of frame.
```

---

## AI Controller

```
aiChooseShot() → { direction: {x, y}, power: number }
  AI decides where and how hard to kick.

aiChooseDive() → string
  AI decides which position to dive to (one of 5 positions).
```

---

## Game Logic

```
processKick(shotDirection, shotPower, divePosition) → { goal: boolean, savedBy: string|null }
  Determine if the kick results in a goal or save.

applyAccuracyPenalty(direction, power) → direction
  Add random spread to shot direction based on power level.

advanceRound() → void
  Move to next kick, swap player/AI roles, check for winner.

checkWinner() → string|null
  After 5 rounds (or in sudden death), check if there's a winner.

isShootoutOver() → boolean
  Determine if the shootout has concluded.
```

---

## Scene Controllers

```
updateTitle() → void
  Handle title screen logic (wait for key press).

updateTeamSelect() → void
  Handle team selection input (navigate, confirm).

updateGameplay() → void
  Handle gameplay input and state transitions (aiming, charging, kicking, diving).

updateResult() → void
  Handle result screen logic (wait for replay input).
```

---

## Game Loop

```
gameLoop(timestamp) → void
  Main loop: update → render → schedule next frame.

startGame() → void
  Entry point: init state, init input, start loop.
```
