// Multiplayer Client — WebSocket communication layer
// This module handles all network communication with the multiplayer server.

const Multiplayer = (() => {
  let ws = null;
  let connectionStatus = 'disconnected'; // disconnected | connecting | connected
  let messageHandler = null;
  let disconnectHandler = null;

  function connect(serverUrl) {
    if (ws && ws.readyState <= 1) {
      // Already connected or connecting
      return;
    }

    connectionStatus = 'connecting';

    try {
      ws = new WebSocket(serverUrl);
    } catch (err) {
      connectionStatus = 'disconnected';
      if (disconnectHandler) disconnectHandler('Failed to connect');
      return;
    }

    ws.onopen = () => {
      connectionStatus = 'connected';
      console.log('[Multiplayer] Connected to server');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (messageHandler) messageHandler(message);
      } catch (err) {
        console.error('[Multiplayer] Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      connectionStatus = 'disconnected';
      ws = null;
      console.log('[Multiplayer] Disconnected from server');
      if (disconnectHandler) disconnectHandler('Connection closed');
    };

    ws.onerror = (err) => {
      console.error('[Multiplayer] WebSocket error:', err);
      // onclose will fire after onerror
    };
  }

  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
    }
    connectionStatus = 'disconnected';
  }

  function send(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn('[Multiplayer] Cannot send — not connected');
    }
  }

  function createRoom() {
    send({ type: 'create_room' });
  }

  function joinRoom(roomCode) {
    send({ type: 'join_room', roomCode: roomCode.toUpperCase().trim() });
  }

  function sendTeamSelection(teamId) {
    send({ type: 'select_team', teamId });
  }

  function sendKickAction(direction, power) {
    send({
      type: 'kick_action',
      direction: { x: direction.x, y: direction.y },
      power
    });
  }

  function sendDiveAction(position) {
    send({ type: 'dive_action', position });
  }

  function onMessage(handler) {
    messageHandler = handler;
  }

  function onDisconnect(handler) {
    disconnectHandler = handler;
  }

  function getConnectionStatus() {
    return connectionStatus;
  }

  function isConnected() {
    return connectionStatus === 'connected';
  }

  return {
    connect,
    disconnect,
    createRoom,
    joinRoom,
    sendTeamSelection,
    sendKickAction,
    sendDiveAction,
    onMessage,
    onDisconnect,
    getConnectionStatus,
    isConnected
  };
})();
