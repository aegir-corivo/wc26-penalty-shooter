// ============================================================
// WC26 PENALTY SHOOTER — A FIFA 94-style penalty shootout game
// ============================================================

// --- CONSTANTS ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GOAL_WIDTH = 300;
const GOAL_HEIGHT = 120;
const GOAL_X = (CANVAS_WIDTH - GOAL_WIDTH) / 2;
const GOAL_Y = 140;
const BALL_RADIUS = 8;
const POWER_MAX = 100;
const POWER_CHARGE_SPEED = 1.8;
const BALL_FLIGHT_SPEED = 8;
const KICK_ROUNDS = 5;
const PENALTY_SPOT_Y = 379;     // Where the ball sits (matches pitch drawing)
const KICKER_START_Y = 550;     // Kicker run-up starting position
const KICKER_BALL_Y = PENALTY_SPOT_Y + 18;  // Kicker stands just behind ball
const KICKER_WALK_SPEED = 2.5;  // Pixels per frame during run-up

// Dive positions: { label, x, y } relative to goal
const DIVE_POSITIONS = {
    'top-left':     { label: 'Q - Top Left',     x: GOAL_X + 40,  y: GOAL_Y + 20 },
    'bottom-left':  { label: 'A - Bottom Left',  x: GOAL_X + 40,  y: GOAL_Y + 90 },
    'center':       { label: 'W - Center',       x: GOAL_X + GOAL_WIDTH / 2, y: GOAL_Y + 55 },
    'top-right':    { label: 'E - Top Right',    x: GOAL_X + GOAL_WIDTH - 40, y: GOAL_Y + 20 },
    'bottom-right': { label: 'D - Bottom Right', x: GOAL_X + GOAL_WIDTH - 40, y: GOAL_Y + 90 },
};

const DIVE_KEYS = {
    'q': 'top-left',
    'a': 'bottom-left',
    'w': 'center',
    'e': 'top-right',
    'd': 'bottom-right',
};

// World Cup 2026 teams (subset)
const TEAMS = [
    { name: 'Brazil',      shirtColor: '#FFDD00', shortsColor: '#003DA5' },
    { name: 'Argentina',   shirtColor: '#75B2E0', shortsColor: '#000000' },
    { name: 'Germany',     shirtColor: '#FFFFFF', shortsColor: '#000000' },
    { name: 'France',      shirtColor: '#003DA5', shortsColor: '#FFFFFF' },
    { name: 'Spain',       shirtColor: '#CC0000', shortsColor: '#003DA5' },
    { name: 'England',     shirtColor: '#FFFFFF', shortsColor: '#003DA5' },
    { name: 'Portugal',    shirtColor: '#CC0000', shortsColor: '#006633' },
    { name: 'Netherlands', shirtColor: '#FF6600', shortsColor: '#000000' },
    { name: 'Italy',       shirtColor: '#003DA5', shortsColor: '#FFFFFF' },
    { name: 'USA',         shirtColor: '#FFFFFF', shortsColor: '#003DA5' },
    { name: 'Mexico',      shirtColor: '#006633', shortsColor: '#FFFFFF' },
    { name: 'Japan',       shirtColor: '#003DA5', shortsColor: '#FFFFFF' },
    { name: 'Canada',      shirtColor: '#CC0000', shortsColor: '#000000' },
    { name: 'Morocco',     shirtColor: '#006633', shortsColor: '#CC0000' },
    { name: 'Australia',   shirtColor: '#FFDD00', shortsColor: '#006633' },
    { name: 'South Korea', shirtColor: '#CC0000', shortsColor: '#FFFFFF' },
];

// --- GAME STATE ---
let state = {};

function initGameState() {
    state = {
        scene: 'title',
        // Team selection
        selectedTeamIndex: 0,
        playerTeam: null,
        aiTeam: null,
        // Shootout state
        round: 1,
        playerScore: 0,
        aiScore: 0,
        playerKicks: [],  // array of true/false (goal or not)
        aiKicks: [],
        playerIsKicker: true,  // player starts as kicker
        // Kick sub-state
        kickState: 'ready',  // ready, aiming, charging, flight, outcome, next
        aimX: 0,        // -1 to 1 (left to right)
        aimY: 0,        // -1 to 1 (down to up)
        power: 0,
        ballX: CANVAS_WIDTH / 2,
        ballY: PENALTY_SPOT_Y,
        ballTargetX: 0,
        ballTargetY: 0,
        ballVisible: true,
        divePosition: null,
        selectedDive: 'center',
        kickResult: null,  // 'goal', 'save', 'miss', 'post'
        stateTimer: 0,
        // AI kick state
        aiShotDirection: null,
        aiShotPower: 0,
        // Keeper animation
        keeperX: GOAL_X + GOAL_WIDTH / 2,
        keeperY: GOAL_Y + GOAL_HEIGHT - 30,
        keeperDiving: false,
        keeperDiveTarget: null,
        // Sudden death
        suddenDeath: false,
        suddenDeathRound: 0,
        // Pause menu
        paused: false,
        pauseSelection: 0,  // 0 = resume, 1 = restart, 2 = main menu
        // Kicker position (for run-up animation)
        kickerY: KICKER_START_Y,
    };
}

function resetKickState() {
    state.kickState = 'ready';
    state.aimX = 0;
    state.aimY = 0;
    state.power = 0;
    state.ballX = CANVAS_WIDTH / 2;
    state.ballY = PENALTY_SPOT_Y;
    state.ballTargetX = 0;
    state.ballTargetY = 0;
    state.ballVisible = true;
    state.divePosition = null;
    state.selectedDive = 'center';
    state.kickResult = null;
    state.stateTimer = 0;
    state.aiShotDirection = null;
    state.aiShotPower = 0;
    state.keeperX = GOAL_X + GOAL_WIDTH / 2;
    state.keeperY = GOAL_Y + GOAL_HEIGHT - 30;
    state.keeperDiving = false;
    state.keeperDiveTarget = null;
    state.kickerY = KICKER_START_Y;
}

// --- INPUT HANDLER ---
const keys = {};
const keysPressed = {};

function initInput() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (!keys[key]) {
            keysPressed[key] = true;
        }
        keys[key] = true;
        e.preventDefault();
    });
    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
        e.preventDefault();
    });
}

function isKeyDown(key) {
    return keys[key] === true;
}

function wasKeyPressed(key) {
    return keysPressed[key] === true;
}

function resetFrameInput() {
    for (const key in keysPressed) {
        keysPressed[key] = false;
    }
}

// --- AI CONTROLLER ---
function aiChooseShot() {
    // Random direction: slight bias toward corners
    const x = (Math.random() * 2 - 1) * 0.9;
    const y = (Math.random() * 0.8 - 0.2);  // mostly upper half
    const power = 40 + Math.random() * 50;   // 40-90 range
    return { x, y, power };
}

function aiChooseDive() {
    const positions = Object.keys(DIVE_POSITIONS);
    // Slight center bias
    const rand = Math.random();
    if (rand < 0.3) return 'center';
    return positions[Math.floor(Math.random() * positions.length)];
}

// --- GAME LOGIC ---
function applyAccuracyPenalty(aimX, aimY, power) {
    // Higher power = more random spread
    // At full power, spread is enough to miss the goal from a corner aim
    const spreadFactor = (power / POWER_MAX);
    const spread = spreadFactor * spreadFactor * 0.5;  // quadratic, max ±0.5 at full power
    const noiseX = (Math.random() * 2 - 1) * spread;
    const noiseY = (Math.random() * 2 - 1) * spread * 0.6;
    return {
        x: Math.max(-1.3, Math.min(1.3, aimX + noiseX)),
        y: Math.max(-1.3, Math.min(1.3, aimY + noiseY)),
    };
}

function calculateBallTarget(direction) {
    // Map normalized direction (-1 to 1) to the goal area
    // Small padding so corner aims land just inside the posts
    // Accuracy penalty can push beyond ±1 which goes outside the frame
    const padX = 15;  // small inset from posts
    const padY = 10;  // small inset from crossbar/ground
    const usableWidth = GOAL_WIDTH - padX * 2;
    const usableHeight = GOAL_HEIGHT - padY * 2;

    const targetX = GOAL_X + padX + (usableWidth / 2) + direction.x * (usableWidth / 2);
    // For Y: -1 = bottom of goal, +1 = top (crossbar)
    const targetY = GOAL_Y + padY + usableHeight - ((direction.y + 1) / 2) * usableHeight;

    return { x: targetX, y: targetY };
}

function processKick(ballTargetX, ballTargetY, divePosition) {
    // Check if ball hits the post or crossbar
    const postThreshold = 12;
    const hitLeftPost = Math.abs(ballTargetX - GOAL_X) < postThreshold &&
                        ballTargetY >= GOAL_Y && ballTargetY <= GOAL_Y + GOAL_HEIGHT;
    const hitRightPost = Math.abs(ballTargetX - (GOAL_X + GOAL_WIDTH)) < postThreshold &&
                         ballTargetY >= GOAL_Y && ballTargetY <= GOAL_Y + GOAL_HEIGHT;
    const hitCrossbar = Math.abs(ballTargetY - GOAL_Y) < postThreshold &&
                        ballTargetX >= GOAL_X && ballTargetX <= GOAL_X + GOAL_WIDTH;

    if (hitLeftPost || hitRightPost || hitCrossbar) {
        return 'post';
    }

    // Check if ball is outside the goal frame (wide or over)
    if (ballTargetX < GOAL_X + 5 || ballTargetX > GOAL_X + GOAL_WIDTH - 5 ||
        ballTargetY < GOAL_Y + 5 || ballTargetY > GOAL_Y + GOAL_HEIGHT - 5) {
        return 'miss';
    }

    // Ball is in the goal — check if keeper saves
    if (!divePosition) return 'goal';

    const divePos = DIVE_POSITIONS[divePosition];
    const dx = Math.abs(ballTargetX - divePos.x);
    const dy = Math.abs(ballTargetY - divePos.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Save if within reach (threshold)
    if (distance < 55) {
        return 'save';
    }

    return 'goal';
}

function advanceRound() {
    if (state.playerIsKicker) {
        // After player kicks, AI kicks (switch roles within same round)
        state.playerIsKicker = false;
    } else {
        // After AI kicks (as kicker), advance to next round
        state.playerIsKicker = true;
        if (!state.suddenDeath) {
            state.round++;
        } else {
            state.suddenDeathRound++;
        }
    }
    resetKickState();
}

function checkWinner() {
    const playerKicksTaken = state.playerKicks.length;
    const aiKicksTaken = state.aiKicks.length;
    const playerGoals = state.playerKicks.filter(k => k).length;
    const aiGoals = state.aiKicks.filter(k => k).length;

    if (!state.suddenDeath) {
        // During regular rounds
        const playerKicksLeft = KICK_ROUNDS - playerKicksTaken;
        const aiKicksLeft = KICK_ROUNDS - aiKicksTaken;

        // Check if one team can't catch up
        if (playerGoals > aiGoals + aiKicksLeft) return 'player';
        if (aiGoals > playerGoals + playerKicksLeft) return 'ai';

        // After all kicks taken
        if (playerKicksTaken >= KICK_ROUNDS && aiKicksTaken >= KICK_ROUNDS) {
            if (playerGoals > aiGoals) return 'player';
            if (aiGoals > playerGoals) return 'ai';
            // Tied — enter sudden death
            state.suddenDeath = true;
            state.suddenDeathRound = 0;
            return null;
        }
    } else {
        // Sudden death: both must have kicked same number
        if (playerKicksTaken === aiKicksTaken && playerKicksTaken > KICK_ROUNDS) {
            if (playerGoals > aiGoals) return 'player';
            if (aiGoals > playerGoals) return 'ai';
        }
        // One ahead after kicking in sudden death pair
        if (playerKicksTaken > aiKicksTaken) {
            // Player just kicked, AI hasn't yet this pair
            // Can't decide yet
        } else if (playerKicksTaken === aiKicksTaken && playerKicksTaken > KICK_ROUNDS) {
            if (playerGoals !== aiGoals) {
                return playerGoals > aiGoals ? 'player' : 'ai';
            }
        }
    }
    return null;
}

// --- RENDERER ---
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    switch (state.scene) {
        case 'title': renderTitle(); break;
        case 'team-select': renderTeamSelect(); break;
        case 'gameplay': renderGameplay(); break;
        case 'result': renderResult(); break;
    }
}

function renderTitle() {
    // Sky
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stadium lights effect
    ctx.fillStyle = '#2d2d44';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 200);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WC26', CANVAS_WIDTH / 2, 220);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px monospace';
    ctx.fillText('PENALTY SHOOTER', CANVAS_WIDTH / 2, 290);

    // Subtitle
    ctx.fillStyle = '#88CC88';
    ctx.font = '20px monospace';
    ctx.fillText('FIFA 94 Style', CANVAS_WIDTH / 2, 340);

    // Ball icon (simple)
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, 420, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Pentagon pattern on ball
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, 420, 8, 0, Math.PI * 2);
    ctx.fill();

    // Prompt
    const blink = Math.floor(Date.now() / 500) % 2;
    if (blink) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px monospace';
        ctx.fillText('PRESS ANY KEY TO START', CANVAS_WIDTH / 2, 520);
    }
}

function renderTeamSelect() {
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SELECT YOUR TEAM', CANVAS_WIDTH / 2, 50);

    // Team grid (4 columns, 4 rows)
    const cols = 4;
    const cellWidth = 180;
    const cellHeight = 110;
    const startX = (CANVAS_WIDTH - cols * cellWidth) / 2;
    const startY = 80;

    for (let i = 0; i < TEAMS.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * cellWidth;
        const y = startY + row * cellHeight;
        const team = TEAMS[i];
        const isSelected = i === state.selectedTeamIndex;

        // Selection highlight
        if (isSelected) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 5, y + 5, cellWidth - 10, cellHeight - 10);
        }

        // Cell background
        ctx.fillStyle = isSelected ? '#333' : '#222';
        ctx.fillRect(x + 8, y + 8, cellWidth - 16, cellHeight - 16);

        // Kit preview (mini player)
        const kitX = x + cellWidth / 2;
        const kitY = y + 45;
        // Shirt
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(kitX - 12, kitY - 15, 24, 20);
        // Shorts
        ctx.fillStyle = team.shortsColor;
        ctx.fillRect(kitX - 10, kitY + 5, 20, 12);
        // Head
        ctx.fillStyle = '#DDA87A';
        ctx.fillRect(kitX - 5, kitY - 22, 10, 8);

        // Team name
        ctx.fillStyle = isSelected ? '#FFD700' : '#CCCCCC';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(team.name, x + cellWidth / 2, y + cellHeight - 15);
    }

    // Instructions
    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Arrow Keys to Select  |  ENTER to Confirm', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
}

function renderGameplay() {
    drawPitch();
    drawCrowd();
    drawGoal();

    // Draw keeper (inside goal area)
    const keeperTeam = state.playerIsKicker ? state.aiTeam : state.playerTeam;
    drawPlayer(state.keeperX, state.keeperY, keeperTeam, state.keeperDiving ? 'dive' : 'stand');

    // Draw ball BEFORE kicker if ball is at/near penalty spot (initial position)
    // Draw ball AFTER kicker if ball is in flight (moving toward goal)
    const ballInFlight = state.kickState === 'flight' || state.kickState === 'outcome';

    if (state.ballVisible && !ballInFlight) {
        drawBall(state.ballX, state.ballY);
    }

    // Draw kicker
    const kickerTeam = state.playerIsKicker ? state.playerTeam : state.aiTeam;
    const kickerPose = (state.kickState === 'flight' || state.kickState === 'outcome') ? 'kick' : 'stand';
    drawPlayer(CANVAS_WIDTH / 2, state.kickerY, kickerTeam, kickerPose);

    // Draw ball AFTER kicker if in flight (so ball is visible flying toward goal)
    if (state.ballVisible && ballInFlight) {
        drawBall(state.ballX, state.ballY);
    }

    // UI overlays based on sub-state
    if (state.kickState === 'aiming' && state.playerIsKicker) {
        drawAimIndicator(state.aimX, state.aimY);
    }
    if (state.kickState === 'charging' && state.playerIsKicker) {
        drawAimIndicator(state.aimX, state.aimY);
        drawPowerBar(state.power);
    }
    if (state.kickState === 'aiming' && !state.playerIsKicker) {
        drawDiveSelector(state.selectedDive);
    }

    // Scoreboard always visible
    drawScoreboard();

    // Outcome text
    if (state.kickState === 'outcome') {
        ctx.font = 'bold 56px monospace';
        ctx.textAlign = 'center';
        if (state.kickResult === 'goal') {
            ctx.fillStyle = '#00FF00';
            ctx.fillText('GOAL!', CANVAS_WIDTH / 2, 350);
        } else if (state.kickResult === 'save') {
            ctx.fillStyle = '#FF4444';
            ctx.fillText('SAVED!', CANVAS_WIDTH / 2, 350);
        } else if (state.kickResult === 'post') {
            ctx.fillStyle = '#FFAA00';
            ctx.fillText('POST!', CANVAS_WIDTH / 2, 350);
        } else {
            ctx.fillStyle = '#FF8800';
            ctx.fillText('MISS!', CANVAS_WIDTH / 2, 350);
        }
    }

    // Ready state — show round info
    if (state.kickState === 'ready') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(CANVAS_WIDTH / 2 - 200, 270, 400, 80);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        const roundLabel = state.suddenDeath ? `SUDDEN DEATH` : `Round ${state.round} of ${KICK_ROUNDS}`;
        ctx.fillText(roundLabel, CANVAS_WIDTH / 2, 300);
        const roleLabel = state.playerIsKicker ? 'You are KICKING' : 'You are the KEEPER';
        ctx.fillStyle = state.playerIsKicker ? '#88FF88' : '#88BBFF';
        ctx.font = '22px monospace';
        ctx.fillText(roleLabel, CANVAS_WIDTH / 2, 335);
    }

    // ESC hint
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('ESC = Menu', CANVAS_WIDTH - 10, CANVAS_HEIGHT - 8);

    // Pause menu overlay
    if (state.paused) {
        renderPauseMenu();
    }
}

function renderPauseMenu() {
    // Dim overlay
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Menu box
    const menuW = 320;
    const menuH = 220;
    const menuX = CANVAS_WIDTH / 2 - menuW / 2;
    const menuY = CANVAS_HEIGHT / 2 - menuH / 2;

    ctx.fillStyle = '#222';
    ctx.fillRect(menuX, menuY, menuW, menuH);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(menuX, menuY, menuW, menuH);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, menuY + 45);

    // Menu options
    const options = ['Resume', 'Restart Match', 'Main Menu'];
    for (let i = 0; i < options.length; i++) {
        const optY = menuY + 90 + i * 45;
        const isSelected = i === state.pauseSelection;

        if (isSelected) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(menuX + 20, optY - 18, menuW - 40, 30);
            ctx.fillStyle = '#000';
        } else {
            ctx.fillStyle = '#CCC';
        }

        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(options[i], CANVAS_WIDTH / 2, optY + 2);
    }

    // Controls hint
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.fillText('↑↓ Navigate  |  ENTER Select  |  ESC Close', CANVAS_WIDTH / 2, menuY + menuH - 15);
}

function renderResult() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const winner = state.playerScore > state.aiScore ? state.playerTeam : state.aiTeam;
    const isPlayerWin = state.playerScore > state.aiScore;

    // Trophy / celebration
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isPlayerWin ? 'YOU WIN!' : 'YOU LOSE!', CANVAS_WIDTH / 2, 150);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`${winner.name} wins!`, CANVAS_WIDTH / 2, 220);

    // Final score
    ctx.font = '28px monospace';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText(`${state.playerTeam.name}  ${state.playerScore} - ${state.aiScore}  ${state.aiTeam.name}`, CANVAS_WIDTH / 2, 300);

    // Kick history
    ctx.font = '18px monospace';
    ctx.fillStyle = '#888';
    let historyY = 360;
    ctx.fillText('--- Kick History ---', CANVAS_WIDTH / 2, historyY);
    historyY += 30;

    const maxKicks = Math.max(state.playerKicks.length, state.aiKicks.length);
    for (let i = 0; i < maxKicks; i++) {
        const pKick = i < state.playerKicks.length ? (state.playerKicks[i] ? '⚽' : '✗') : ' ';
        const aKick = i < state.aiKicks.length ? (state.aiKicks[i] ? '⚽' : '✗') : ' ';
        ctx.fillStyle = '#AAA';
        ctx.fillText(`${pKick}   Round ${i + 1}   ${aKick}`, CANVAS_WIDTH / 2, historyY);
        historyY += 25;
    }

    // Replay prompt
    const blink = Math.floor(Date.now() / 500) % 2;
    if (blink) {
        ctx.fillStyle = '#88FF88';
        ctx.font = '22px monospace';
        ctx.fillText('PRESS ENTER TO PLAY AGAIN', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
    }
}

// --- DRAWING HELPERS ---
function drawPitch() {
    // Dark background (stadium surround)
    ctx.fillStyle = '#1a3d1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Pitch geometry — perspective from behind the kicker looking at goal
    // The goal line is at the "far" end, the kicker at the "near" end
    const goalLineY = 270;       // Where the goal line is drawn
    const pitchBottom = CANVAS_HEIGHT + 10;
    const pitchTopLeft = 100;    // X edges at goal line (wider for proper field look)
    const pitchTopRight = CANVAS_WIDTH - 100;
    const pitchBotLeft = -60;    // X edges at bottom (wider due to perspective)
    const pitchBotRight = CANVAS_WIDTH + 60;

    // Helper: get X bounds at a given Y (perspective interpolation)
    function getXAtY(y) {
        const t = (y - goalLineY) / (pitchBottom - goalLineY);
        const left = pitchTopLeft + t * (pitchBotLeft - pitchTopLeft);
        const right = pitchTopRight + t * (pitchBotRight - pitchTopRight);
        return { left, right };
    }

    // Draw pitch grass with mowing stripes
    const numStripes = 12;
    for (let i = 0; i < numStripes; i++) {
        const t1 = i / numStripes;
        const t2 = (i + 1) / numStripes;
        const y1 = goalLineY + t1 * (pitchBottom - goalLineY);
        const y2 = goalLineY + t2 * (pitchBottom - goalLineY);
        const b1 = getXAtY(y1);
        const b2 = getXAtY(y2);

        ctx.fillStyle = i % 2 === 0 ? '#2D8C2D' : '#3A9E3A';
        ctx.beginPath();
        ctx.moveTo(b1.left, y1);
        ctx.lineTo(b1.right, y1);
        ctx.lineTo(b2.right, y2);
        ctx.lineTo(b2.left, y2);
        ctx.closePath();
        ctx.fill();
    }

    // Fill area behind goal line (where the goal sits)
    ctx.fillStyle = '#2D8C2D';
    ctx.fillRect(pitchTopLeft - 20, goalLineY - 50, pitchTopRight - pitchTopLeft + 40, 50);

    // --- PITCH MARKINGS ---
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;

    // Goal line — runs the full width of the pitch at the top
    ctx.beginPath();
    ctx.moveTo(pitchTopLeft, goalLineY);
    ctx.lineTo(pitchTopRight, goalLineY);
    ctx.stroke();

    // --- PENALTY AREA (18-yard box) ---
    // In real football the penalty area is roughly 40m wide on a 68m pitch ≈ 59%
    // We use perspective: narrower at the goal line, wider at the bottom edge
    const box18BottomT = 0.42;  // Depth as fraction of visible pitch
    const box18Y = goalLineY + box18BottomT * (pitchBottom - goalLineY);
    // Width: ~60% of pitch width at each Y level
    const box18WidthFractionTop = 0.60;
    const box18WidthFractionBot = 0.60;

    const topWidth = pitchTopRight - pitchTopLeft;
    const box18Bounds = getXAtY(box18Y);
    const botWidth = box18Bounds.right - box18Bounds.left;

    const box18TopLeft = pitchTopLeft + topWidth * (1 - box18WidthFractionTop) / 2;
    const box18TopRight = pitchTopRight - topWidth * (1 - box18WidthFractionTop) / 2;
    const box18BotLeft = box18Bounds.left + botWidth * (1 - box18WidthFractionBot) / 2;
    const box18BotRight = box18Bounds.right - botWidth * (1 - box18WidthFractionBot) / 2;

    // Left side
    ctx.beginPath();
    ctx.moveTo(box18TopLeft, goalLineY);
    ctx.lineTo(box18BotLeft, box18Y);
    ctx.stroke();
    // Bottom
    ctx.beginPath();
    ctx.moveTo(box18BotLeft, box18Y);
    ctx.lineTo(box18BotRight, box18Y);
    ctx.stroke();
    // Right side
    ctx.beginPath();
    ctx.moveTo(box18TopRight, goalLineY);
    ctx.lineTo(box18BotRight, box18Y);
    ctx.stroke();

    // --- GOAL AREA (6-yard box) ---
    // In real football the goal area is ~18m wide on 68m ≈ 27%
    const box6BottomT = 0.16;
    const box6Y = goalLineY + box6BottomT * (pitchBottom - goalLineY);
    const box6WidthFractionTop = 0.30;
    const box6WidthFractionBot = 0.30;

    const box6Bounds = getXAtY(box6Y);
    const box6BotWidth = box6Bounds.right - box6Bounds.left;

    const box6TopLeft = pitchTopLeft + topWidth * (1 - box6WidthFractionTop) / 2;
    const box6TopRight = pitchTopRight - topWidth * (1 - box6WidthFractionTop) / 2;
    const box6BotLeft = box6Bounds.left + box6BotWidth * (1 - box6WidthFractionBot) / 2;
    const box6BotRight = box6Bounds.right - box6BotWidth * (1 - box6WidthFractionBot) / 2;

    // Left side
    ctx.beginPath();
    ctx.moveTo(box6TopLeft, goalLineY);
    ctx.lineTo(box6BotLeft, box6Y);
    ctx.stroke();
    // Bottom
    ctx.beginPath();
    ctx.moveTo(box6BotLeft, box6Y);
    ctx.lineTo(box6BotRight, box6Y);
    ctx.stroke();
    // Right side
    ctx.beginPath();
    ctx.moveTo(box6TopRight, goalLineY);
    ctx.lineTo(box6BotRight, box6Y);
    ctx.stroke();

    // --- PENALTY MARK ---
    const penSpotT = 0.32;
    const penSpotY = goalLineY + penSpotT * (pitchBottom - goalLineY);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, penSpotY, 4, 0, Math.PI * 2);
    ctx.fill();

    // --- PENALTY ARC (D shape) ---
    // Endpoints touch the penalty area bottom line, arc bulges downward (toward kicker)
    const arcRadius = 55;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, box18Y, arcRadius, 0, Math.PI);
    ctx.stroke();
}

function drawGoal() {
    // Goal sits on the goal line (y=270 in the pitch)
    // GOAL_Y=140, GOAL_HEIGHT=120, so bottom of goal = 260, which is above goal line
    // This is the "logical" goal area for game mechanics
    // Render the goal so crossbar is clearly visible above the ad board

    // Net background (dark area inside goal)
    ctx.fillStyle = 'rgba(20, 20, 20, 0.7)';
    ctx.fillRect(GOAL_X + 5, GOAL_Y + 5, GOAL_WIDTH - 10, GOAL_HEIGHT - 5);

    // Diamond mesh net pattern
    ctx.strokeStyle = 'rgba(160, 160, 160, 0.35)';
    ctx.lineWidth = 0.6;
    const meshSize = 12;
    for (let mx = GOAL_X + 8; mx < GOAL_X + GOAL_WIDTH - 5; mx += meshSize) {
        for (let my = GOAL_Y + 8; my < GOAL_Y + GOAL_HEIGHT; my += meshSize) {
            ctx.beginPath();
            ctx.moveTo(mx, my - meshSize / 2);
            ctx.lineTo(mx + meshSize / 2, my);
            ctx.lineTo(mx, my + meshSize / 2);
            ctx.lineTo(mx - meshSize / 2, my);
            ctx.closePath();
            ctx.stroke();
        }
    }

    // Back of goal (depth) — slightly inset
    const depthOffset = 12;
    ctx.strokeStyle = 'rgba(200,200,200,0.3)';
    ctx.lineWidth = 2;
    // Back crossbar
    ctx.beginPath();
    ctx.moveTo(GOAL_X + depthOffset, GOAL_Y - depthOffset + 2);
    ctx.lineTo(GOAL_X + GOAL_WIDTH - depthOffset, GOAL_Y - depthOffset + 2);
    ctx.stroke();
    // Back left post
    ctx.beginPath();
    ctx.moveTo(GOAL_X + depthOffset, GOAL_Y - depthOffset + 2);
    ctx.lineTo(GOAL_X + depthOffset, GOAL_Y + GOAL_HEIGHT - 4);
    ctx.stroke();
    // Back right post
    ctx.beginPath();
    ctx.moveTo(GOAL_X + GOAL_WIDTH - depthOffset, GOAL_Y - depthOffset + 2);
    ctx.lineTo(GOAL_X + GOAL_WIDTH - depthOffset, GOAL_Y + GOAL_HEIGHT - 4);
    ctx.stroke();

    // Depth connectors (top corners)
    ctx.strokeStyle = 'rgba(200,200,200,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(GOAL_X, GOAL_Y);
    ctx.lineTo(GOAL_X + depthOffset, GOAL_Y - depthOffset + 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(GOAL_X + GOAL_WIDTH, GOAL_Y);
    ctx.lineTo(GOAL_X + GOAL_WIDTH - depthOffset, GOAL_Y - depthOffset + 2);
    ctx.stroke();

    // Side netting
    ctx.strokeStyle = 'rgba(160,160,160,0.2)';
    ctx.lineWidth = 0.5;
    for (let y = GOAL_Y; y <= GOAL_Y + GOAL_HEIGHT; y += meshSize) {
        ctx.beginPath();
        ctx.moveTo(GOAL_X, y);
        ctx.lineTo(GOAL_X + depthOffset, y - depthOffset + 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(GOAL_X + GOAL_WIDTH, y);
        ctx.lineTo(GOAL_X + GOAL_WIDTH - depthOffset, y - depthOffset + 2);
        ctx.stroke();
    }

    // Front frame — posts and crossbar (main visible structure)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';

    // Left post
    ctx.beginPath();
    ctx.moveTo(GOAL_X, GOAL_Y);
    ctx.lineTo(GOAL_X, GOAL_Y + GOAL_HEIGHT);
    ctx.stroke();

    // Right post
    ctx.beginPath();
    ctx.moveTo(GOAL_X + GOAL_WIDTH, GOAL_Y);
    ctx.lineTo(GOAL_X + GOAL_WIDTH, GOAL_Y + GOAL_HEIGHT);
    ctx.stroke();

    // Crossbar (the most important visible element!)
    ctx.beginPath();
    ctx.moveTo(GOAL_X - 2, GOAL_Y);
    ctx.lineTo(GOAL_X + GOAL_WIDTH + 2, GOAL_Y);
    ctx.stroke();

    ctx.lineCap = 'butt';

    // Post highlights (slight 3D shine)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(GOAL_X - 2, GOAL_Y + 5);
    ctx.lineTo(GOAL_X - 2, GOAL_Y + GOAL_HEIGHT);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(GOAL_X + GOAL_WIDTH + 2, GOAL_Y + 5);
    ctx.lineTo(GOAL_X + GOAL_WIDTH + 2, GOAL_Y + GOAL_HEIGHT);
    ctx.stroke();
}

function drawCrowd() {
    // Crowd sits above the goal (above GOAL_Y=140)
    // Ad board between crowd and goal
    const adY = 95;
    const adH = 38;

    // Advertising board
    ctx.fillStyle = '#EEEEFF';
    ctx.fillRect(60, adY, CANVAS_WIDTH - 120, adH);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, adY, CANVAS_WIDTH - 120, adH);
    // Ad text
    ctx.fillStyle = '#003DA5';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WORLD CUP 2026', CANVAS_WIDTH / 2 - 120, adY + 25);
    ctx.fillStyle = '#CC0000';
    ctx.fillText('★ FIFA ★', CANVAS_WIDTH / 2 + 140, adY + 25);

    // Crowd stands (above ad board, from y=0 to adY)
    const crowdTop = 0;
    const crowdBottom = adY;
    const rowH = 10;
    const specW = 8;

    for (let row = 0; row < Math.ceil((crowdBottom - crowdTop) / rowH); row++) {
        const y = crowdTop + row * rowH;
        // Stand row background
        ctx.fillStyle = row % 3 === 0 ? '#3D2D5C' : row % 3 === 1 ? '#4A3670' : '#352850';
        ctx.fillRect(0, y, CANVAS_WIDTH, rowH);

        // Spectators
        for (let x = 1; x < CANVAS_WIDTH; x += specW + 1) {
            const seed = (x * 13 + row * 29) % 100;
            const skins = ['#DDA87A', '#C68E5B', '#8B5E3C', '#F5D0A9', '#A0724A'];
            ctx.fillStyle = skins[seed % skins.length];
            ctx.fillRect(x + 2, y, 4, 4);
            const shirts = ['#CC2222', '#2222CC', '#CCCC22', '#22CC22', '#FF6600',
                '#CC22CC', '#FFFFFF', '#FF3366', '#22CCCC', '#FF9900', '#6633CC', '#226622'];
            ctx.fillStyle = shirts[(seed + row * 3) % shirts.length];
            ctx.fillRect(x + 1, y + 4, 6, 5);
        }
    }
}

function drawPlayer(x, y, team, pose) {
    if (!team) return;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 24, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (pose === 'dive') {
        const diveDir = x < CANVAS_WIDTH / 2 ? -1 : x > CANVAS_WIDTH / 2 ? 1 : 0;
        // Stretched arms (gloves)
        ctx.fillStyle = '#FFAA00';
        ctx.fillRect(x - 26 + diveDir * 36, y - 10, 12, 8);
        // Torso horizontal
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(x - 16 + diveDir * 6, y - 6, 32, 14);
        ctx.fillStyle = darkenColor(team.shirtColor, 25);
        ctx.fillRect(x - 16 + diveDir * 6, y + 4, 32, 4);
        // Shorts
        ctx.fillStyle = team.shortsColor;
        ctx.fillRect(x - 8 + diveDir * 6, y + 8, 20, 10);
        // Trailing legs + socks
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(x - 14 + diveDir * -6, y + 10, 8, 12);
        ctx.fillStyle = '#111';
        ctx.fillRect(x - 14 + diveDir * -6, y + 20, 8, 4);
        // Head
        ctx.fillStyle = '#DDA87A';
        ctx.fillRect(x - 22 + diveDir * 32, y - 12, 9, 9);
        ctx.fillStyle = '#222';
        ctx.fillRect(x - 22 + diveDir * 32, y - 14, 9, 3);
    } else if (pose === 'kick') {
        // Supporting leg + boot
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(x - 5, y + 6, 6, 14);
        ctx.fillStyle = '#111';
        ctx.fillRect(x - 6, y + 18, 8, 5);
        // Kicking leg (extended)
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(x + 4, y - 2, 6, 14);
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 4, y + 10, 8, 5);
        // Shorts
        ctx.fillStyle = team.shortsColor;
        ctx.fillRect(x - 8, y - 6, 16, 11);
        // Torso
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(x - 10, y - 28, 20, 22);
        ctx.fillStyle = darkenColor(team.shirtColor, 20);
        ctx.fillRect(x - 10, y - 28, 20, 3);
        // Sleeves
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(x - 13, y - 24, 4, 10);
        ctx.fillRect(x + 10, y - 24, 4, 10);
        // Arms (skin)
        ctx.fillStyle = '#DDA87A';
        ctx.fillRect(x - 14, y - 16, 3, 8);
        ctx.fillRect(x + 12, y - 28, 3, 8);
        // Head
        ctx.fillStyle = '#DDA87A';
        ctx.fillRect(x - 5, y - 38, 10, 10);
        ctx.fillStyle = '#222';
        ctx.fillRect(x - 5, y - 40, 10, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 1, y - 34, 2, 2);
    } else {
        // Standing — FIFA 94 style, facing slightly away
        // Legs + socks
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(x - 5, y + 4, 5, 16);
        ctx.fillRect(x + 1, y + 4, 5, 16);
        // Boots
        ctx.fillStyle = '#111';
        ctx.fillRect(x - 6, y + 18, 7, 5);
        ctx.fillRect(x + 0, y + 18, 7, 5);
        // Shorts
        ctx.fillStyle = team.shortsColor;
        ctx.fillRect(x - 8, y - 6, 16, 11);
        // Torso
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(x - 10, y - 28, 20, 23);
        // Collar detail
        ctx.fillStyle = darkenColor(team.shirtColor, 25);
        ctx.fillRect(x - 10, y - 28, 20, 3);
        // Sleeves
        ctx.fillStyle = team.shirtColor;
        ctx.fillRect(x - 13, y - 22, 4, 10);
        ctx.fillRect(x + 10, y - 22, 4, 10);
        // Arms (skin)
        ctx.fillStyle = '#DDA87A';
        ctx.fillRect(x - 13, y - 14, 3, 8);
        ctx.fillRect(x + 11, y - 14, 3, 8);
        // Head
        ctx.fillStyle = '#DDA87A';
        ctx.fillRect(x - 5, y - 38, 10, 10);
        // Hair
        ctx.fillStyle = '#222';
        ctx.fillRect(x - 5, y - 40, 10, 4);
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x - 2, y - 34, 2, 2);
        ctx.fillRect(x + 2, y - 34, 2, 2);
    }
}

// Utility: darken a hex color
function darkenColor(hex, amount) {
    if (hex.startsWith('rgb')) return hex;
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return `rgb(${r},${g},${b})`;
}

function drawBall(x, y) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + BALL_RADIUS + 2, BALL_RADIUS * 0.7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ball
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Pentagon panel
    ctx.fillStyle = '#222';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * Math.PI / 180;
        const px = x + Math.cos(angle) * 3.5;
        const py = y + Math.sin(angle) * 3.5;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function drawPowerBar(power) {
    const barWidth = 200;
    const barHeight = 20;
    const barX = CANVAS_WIDTH / 2 - barWidth / 2;
    const barY = CANVAS_HEIGHT - 60;

    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Fill (green → yellow → red)
    const fillWidth = (power / POWER_MAX) * barWidth;
    const r = Math.min(255, power * 5.1);
    const g = Math.max(0, 255 - power * 2.55);
    ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
    ctx.fillRect(barX, barY, fillWidth, barHeight);

    // Border
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Label
    ctx.fillStyle = '#FFF';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POWER (hold SPACE)', CANVAS_WIDTH / 2, barY - 8);
}

function drawAimIndicator(aimX, aimY) {
    // Draw crosshair on goal showing aim direction
    const targetX = GOAL_X + (GOAL_WIDTH / 2) + aimX * (GOAL_WIDTH / 2 - 20);
    const targetY = GOAL_Y + GOAL_HEIGHT - 10 - ((aimY + 1) / 2) * (GOAL_HEIGHT - 20);

    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    // Crosshair
    ctx.beginPath();
    ctx.moveTo(targetX - 12, targetY);
    ctx.lineTo(targetX + 12, targetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(targetX, targetY - 12);
    ctx.lineTo(targetX, targetY + 12);
    ctx.stroke();
    // Circle
    ctx.beginPath();
    ctx.arc(targetX, targetY, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Instructions (positioned at bottom, below power bar area, clear of kicker)
    ctx.fillStyle = '#FFF';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Arrow Keys to Aim  |  SPACE to Shoot', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);
}

function drawDiveSelector(selected) {
    // Show 5 dive positions on the goal
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(GOAL_X - 20, GOAL_Y - 30, GOAL_WIDTH + 40, GOAL_HEIGHT + 60);

    for (const [key, pos] of Object.entries(DIVE_POSITIONS)) {
        const isSelected = key === selected;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSelected ? 18 : 12, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#FFD700' : '#666';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#FFF' : '#999';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Labels
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText('Q:TL  A:BL  W:Center  E:TR  D:BR', CANVAS_WIDTH / 2, GOAL_Y + GOAL_HEIGHT + 25);
    ctx.fillText('Press SPACE to confirm dive', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);
}

function drawScoreboard() {
    const boardWidth = 350;
    const boardX = CANVAS_WIDTH / 2 - boardWidth / 2;
    const boardY = 5;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(boardX, boardY, boardWidth, 35);

    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';

    const pName = state.playerTeam ? state.playerTeam.name : '???';
    const aName = state.aiTeam ? state.aiTeam.name : '???';
    ctx.fillText(`${pName}  ${state.playerScore} - ${state.aiScore}  ${aName}`, CANVAS_WIDTH / 2, boardY + 23);
}

// --- SCENE CONTROLLERS ---
function updateTitle() {
    // Start title music on first frame
    AudioEngine.playTrack('title');

    // Wait for any key
    for (const key in keysPressed) {
        if (keysPressed[key]) {
            AudioEngine.init(); // Ensure audio context is started on user gesture
            AudioEngine.playSfx('confirm');
            state.scene = 'team-select';
            return;
        }
    }
}

function updateTeamSelect() {
    AudioEngine.playTrack('team-select');
    const cols = 4;

    if (wasKeyPressed('arrowright')) {
        state.selectedTeamIndex = (state.selectedTeamIndex + 1) % TEAMS.length;
        AudioEngine.playSfx('select');
    }
    if (wasKeyPressed('arrowleft')) {
        state.selectedTeamIndex = (state.selectedTeamIndex - 1 + TEAMS.length) % TEAMS.length;
        AudioEngine.playSfx('select');
    }
    if (wasKeyPressed('arrowdown')) {
        state.selectedTeamIndex = (state.selectedTeamIndex + cols) % TEAMS.length;
        AudioEngine.playSfx('select');
    }
    if (wasKeyPressed('arrowup')) {
        state.selectedTeamIndex = (state.selectedTeamIndex - cols + TEAMS.length) % TEAMS.length;
        AudioEngine.playSfx('select');
    }

    if (wasKeyPressed('enter')) {
        state.playerTeam = TEAMS[state.selectedTeamIndex];
        // Pick random AI team (different from player)
        let aiIndex;
        do {
            aiIndex = Math.floor(Math.random() * TEAMS.length);
        } while (aiIndex === state.selectedTeamIndex);
        state.aiTeam = TEAMS[aiIndex];

        // Reset scores and start gameplay
        state.round = 1;
        state.playerScore = 0;
        state.aiScore = 0;
        state.playerKicks = [];
        state.aiKicks = [];
        state.playerIsKicker = true;
        state.suddenDeath = false;
        state.suddenDeathRound = 0;
        resetKickState();
        state.scene = 'gameplay';
        AudioEngine.playSfx('confirm');
        AudioEngine.playSfx('whistle');
    }
}

function updateGameplay() {
    AudioEngine.playTrack('gameplay');
    // Pause menu toggle
    if (wasKeyPressed('escape')) {
        state.paused = !state.paused;
        state.pauseSelection = 0;
        return;
    }

    // Handle pause menu input
    if (state.paused) {
        if (wasKeyPressed('arrowup')) {
            state.pauseSelection = (state.pauseSelection - 1 + 3) % 3;
            AudioEngine.playSfx('select');
        }
        if (wasKeyPressed('arrowdown')) {
            state.pauseSelection = (state.pauseSelection + 1) % 3;
            AudioEngine.playSfx('select');
        }
        if (wasKeyPressed('enter')) {
            switch (state.pauseSelection) {
                case 0: // Resume
                    state.paused = false;
                    break;
                case 1: // Restart match
                    state.paused = false;
                    state.round = 1;
                    state.playerScore = 0;
                    state.aiScore = 0;
                    state.playerKicks = [];
                    state.aiKicks = [];
                    state.playerIsKicker = true;
                    state.suddenDeath = false;
                    state.suddenDeathRound = 0;
                    resetKickState();
                    break;
                case 2: // Main menu
                    state.paused = false;
                    state.scene = 'title';
                    AudioEngine.playSfx('confirm');
                    break;
            }
        }
        return;
    }

    state.stateTimer++;

    switch (state.kickState) {
        case 'ready':
            // Kicker walks up to the ball
            if (state.kickerY > KICKER_BALL_Y) {
                state.kickerY -= KICKER_WALK_SPEED;
            }
            if (state.stateTimer > 90 && state.kickerY <= KICKER_BALL_Y) {
                state.kickerY = KICKER_BALL_Y;
                state.kickState = 'aiming';
                state.stateTimer = 0;
            }
            break;

        case 'aiming':
            if (state.playerIsKicker) {
                // Player aims
                if (isKeyDown('arrowleft'))  state.aimX = Math.max(-1, state.aimX - 0.025);
                if (isKeyDown('arrowright')) state.aimX = Math.min(1, state.aimX + 0.025);
                if (isKeyDown('arrowup'))    state.aimY = Math.min(1, state.aimY + 0.025);
                if (isKeyDown('arrowdown'))  state.aimY = Math.max(-1, state.aimY - 0.025);

                if (wasKeyPressed(' ')) {
                    state.kickState = 'charging';
                    state.stateTimer = 0;
                }
            } else {
                // Player is keeper — choose dive position
                if (wasKeyPressed('q')) state.selectedDive = 'top-left';
                if (wasKeyPressed('a')) state.selectedDive = 'bottom-left';
                if (wasKeyPressed('w')) state.selectedDive = 'center';
                if (wasKeyPressed('e')) state.selectedDive = 'top-right';
                if (wasKeyPressed('d')) state.selectedDive = 'bottom-right';

                if (wasKeyPressed(' ')) {
                    state.divePosition = state.selectedDive;
                    // AI decides shot
                    const aiShot = aiChooseShot();
                    state.aiShotDirection = applyAccuracyPenalty(aiShot.x, aiShot.y, aiShot.power);
                    state.aiShotPower = aiShot.power;
                    state.kickState = 'charging';
                    state.stateTimer = 0;
                    AudioEngine.playSfx('kick');
                }
            }
            break;

        case 'charging':
            if (state.playerIsKicker) {
                // Power bar charges while space held
                if (isKeyDown(' ')) {
                    state.power = Math.min(POWER_MAX, state.power + POWER_CHARGE_SPEED);
                } else {
                    // Released — kick!
                    AudioEngine.playSfx('kick');
                    const direction = applyAccuracyPenalty(state.aimX, state.aimY, state.power);
                    const target = calculateBallTarget(direction);
                    state.ballTargetX = target.x;
                    state.ballTargetY = target.y;

                    // AI keeper dives
                    state.divePosition = aiChooseDive();
                    state.keeperDiveTarget = DIVE_POSITIONS[state.divePosition];

                    state.kickState = 'flight';
                    state.stateTimer = 0;
                }
            } else {
                // AI is winding up (brief delay for drama)
                if (state.stateTimer > 45) {
                    const target = calculateBallTarget(state.aiShotDirection);
                    state.ballTargetX = target.x;
                    state.ballTargetY = target.y;
                    state.keeperDiveTarget = DIVE_POSITIONS[state.divePosition];
                    state.kickState = 'flight';
                    state.stateTimer = 0;
                }
            }
            break;

        case 'flight':
            // Animate ball toward target
            const dx = state.ballTargetX - state.ballX;
            const dy = state.ballTargetY - state.ballY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < BALL_FLIGHT_SPEED) {
                state.ballX = state.ballTargetX;
                state.ballY = state.ballTargetY;
            } else {
                state.ballX += (dx / dist) * BALL_FLIGHT_SPEED;
                state.ballY += (dy / dist) * BALL_FLIGHT_SPEED;
            }

            // Animate keeper dive
            if (state.keeperDiveTarget && !state.keeperDiving) {
                state.keeperDiving = true;
            }
            if (state.keeperDiving && state.keeperDiveTarget) {
                const kdx = state.keeperDiveTarget.x - state.keeperX;
                const kdy = state.keeperDiveTarget.y - state.keeperY;
                const kDist = Math.sqrt(kdx * kdx + kdy * kdy);
                if (kDist > 5) {
                    state.keeperX += (kdx / kDist) * 6;
                    state.keeperY += (kdy / kDist) * 6;
                }
            }

            // Check if ball reached target
            if (dist < BALL_FLIGHT_SPEED) {
                // Determine result
                state.kickResult = processKick(state.ballTargetX, state.ballTargetY, state.divePosition);

                // Play outcome SFX
                if (state.kickResult === 'goal') AudioEngine.playSfx('goal');
                else if (state.kickResult === 'save') AudioEngine.playSfx('save');
                else if (state.kickResult === 'post') AudioEngine.playSfx('post');
                else AudioEngine.playSfx('miss');

                // Record result
                if (state.playerIsKicker) {
                    const scored = state.kickResult === 'goal';
                    state.playerKicks.push(scored);
                    if (scored) state.playerScore++;
                } else {
                    const scored = state.kickResult === 'goal';
                    state.aiKicks.push(scored);
                    if (scored) state.aiScore++;
                }

                state.kickState = 'outcome';
                state.stateTimer = 0;
            }
            break;

        case 'outcome':
            if (state.stateTimer > 90) {
                // Check if shootout is over
                const winner = checkWinner();
                if (winner) {
                    AudioEngine.playSfx('whistle');
                    state.scene = 'result';
                } else {
                    state.kickState = 'next';
                    state.stateTimer = 0;
                }
            }
            break;

        case 'next':
            advanceRound();
            // kickState is reset by advanceRound via resetKickState
            break;
    }
}

function updateResult() {
    AudioEngine.playTrack('result');
    if (wasKeyPressed('enter')) {
        AudioEngine.playSfx('confirm');
        state.scene = 'team-select';
        state.selectedTeamIndex = 0;
    }
}

// --- GAME LOOP ---
function gameLoop() {
    // Global mute toggle (M key works in any scene)
    if (wasKeyPressed('m')) {
        AudioEngine.toggleMute();
        const muteBtn = document.getElementById('mute-btn');
        const muted = AudioEngine.isMuted();
        muteBtn.textContent = muted ? '🔇' : '🔊';
        muteBtn.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
    }

    // Update
    switch (state.scene) {
        case 'title': updateTitle(); break;
        case 'team-select': updateTeamSelect(); break;
        case 'gameplay': updateGameplay(); break;
        case 'result': updateResult(); break;
    }

    // Render
    render();

    // Mute indicator (always visible in corner)
    if (AudioEngine.isMuted()) {
        ctx.fillStyle = '#FF4444';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('🔇 MUTED (M)', 10, CANVAS_HEIGHT - 8);
    } else {
        ctx.fillStyle = '#666';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('M = Mute', 10, CANVAS_HEIGHT - 8);
    }

    // Reset frame input
    resetFrameInput();

    // Next frame
    requestAnimationFrame(gameLoop);
}

// --- ENTRY POINT ---
function startGame() {
    initGameState();
    initInput();
    // Initialize audio on first user interaction (browsers require gesture)
    const initAudioOnce = () => {
        AudioEngine.init();
        document.removeEventListener('keydown', initAudioOnce);
        document.removeEventListener('click', initAudioOnce);
    };
    document.addEventListener('keydown', initAudioOnce);
    document.addEventListener('click', initAudioOnce);

    // Mute button
    const muteBtn = document.getElementById('mute-btn');
    muteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        AudioEngine.init();
        const muted = AudioEngine.toggleMute();
        muteBtn.textContent = muted ? '🔇' : '🔊';
        muteBtn.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
    });

    requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', startGame);
