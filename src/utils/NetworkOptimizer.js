// Network Performance Optimization Utilities
import * as THREE from 'three';

export class NetworkOptimizer {
  constructor() {
    this.lastPosition = new THREE.Vector3();
    this.lastRotation = new THREE.Euler();
    this.lastSentPosition = new THREE.Vector3();
    this.lastSentRotation = new THREE.Euler();
    
    // Optimization settings
    this.positionThreshold = 0.1; // Minimum movement before sending update
    this.rotationThreshold = 0.05; // Minimum rotation before sending update
    this.maxUpdateRate = 100; // Max update rate in ms (10 FPS instead of 20)
    this.lastUpdateTime = 0;
    
    // Compression settings
    this.positionPrecision = 2; // Decimal places for position
    this.rotationPrecision = 3; // Decimal places for rotation
  }

  // Check if we should send a network update
  shouldSendUpdate(position, rotation) {
    const now = Date.now();
    
    // Rate limiting - don't send updates too frequently
    if (now - this.lastUpdateTime < this.maxUpdateRate) {
      return false;
    }
    
    // Check if position has changed significantly
    const positionChanged = position.distanceTo(this.lastSentPosition) > this.positionThreshold;
    
    // Check if rotation has changed significantly
    const rotationChanged = Math.abs(rotation.y - this.lastSentRotation.y) > this.rotationThreshold;
    
    return positionChanged || rotationChanged;
  }

  // Compress player data to reduce packet size
  compressPlayerData(position, rotation) {
    return {
      pos: [
        Math.round(position.x * Math.pow(10, this.positionPrecision)) / Math.pow(10, this.positionPrecision),
        Math.round(position.y * Math.pow(10, this.positionPrecision)) / Math.pow(10, this.positionPrecision),
        Math.round(position.z * Math.pow(10, this.positionPrecision)) / Math.pow(10, this.positionPrecision)
      ],
      rot: [
        Math.round(rotation.x * Math.pow(10, this.rotationPrecision)) / Math.pow(10, this.rotationPrecision),
        Math.round(rotation.y * Math.pow(10, this.rotationPrecision)) / Math.pow(10, this.rotationPrecision),
        Math.round(rotation.z * Math.pow(10, this.rotationPrecision)) / Math.pow(10, this.rotationPrecision)
      ],
      t: Date.now() // Timestamp for interpolation
    };
  }

  // Decompress received player data
  decompressPlayerData(data) {
    return {
      position: {
        x: data.pos[0],
        y: data.pos[1], 
        z: data.pos[2]
      },
      rotation: {
        x: data.rot[0],
        y: data.rot[1],
        z: data.rot[2]
      },
      timestamp: data.t
    };
  }

  // Update tracking data
  updateSentData(position, rotation) {
    this.lastSentPosition.copy(position);
    this.lastSentRotation.copy(rotation);
    this.lastUpdateTime = Date.now();
  }
}

// Client-side prediction and interpolation
export class MovementPredictor {
  constructor() {
    this.serverStates = [];
    this.maxHistoryLength = 10;
    this.interpolationDelay = 100; // ms
  }

  // Add server state for interpolation
  addServerState(state) {
    state.timestamp = state.timestamp || Date.now();
    this.serverStates.push(state);
    
    // Keep only recent states
    if (this.serverStates.length > this.maxHistoryLength) {
      this.serverStates.shift();
    }
    
    // Sort by timestamp
    this.serverStates.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Get interpolated position based on current time
  getInterpolatedState() {
    if (this.serverStates.length < 2) {
      return this.serverStates[0] || null;
    }

    const now = Date.now();
    const targetTime = now - this.interpolationDelay;

    // Find two states to interpolate between
    let state1 = null;
    let state2 = null;

    for (let i = 0; i < this.serverStates.length - 1; i++) {
      if (this.serverStates[i].timestamp <= targetTime && 
          this.serverStates[i + 1].timestamp >= targetTime) {
        state1 = this.serverStates[i];
        state2 = this.serverStates[i + 1];
        break;
      }
    }

    // If no suitable states found, use the most recent
    if (!state1 || !state2) {
      return this.serverStates[this.serverStates.length - 1];
    }

    // Interpolate between states
    const timeDiff = state2.timestamp - state1.timestamp;
    const alpha = timeDiff > 0 ? (targetTime - state1.timestamp) / timeDiff : 0;

    return {
      position: {
        x: this.lerp(state1.position.x, state2.position.x, alpha),
        y: this.lerp(state1.position.y, state2.position.y, alpha),
        z: this.lerp(state1.position.z, state2.position.z, alpha)
      },
      rotation: {
        x: this.lerp(state1.rotation.x, state2.rotation.x, alpha),
        y: this.lerpAngle(state1.rotation.y, state2.rotation.y, alpha),
        z: this.lerp(state1.rotation.z, state2.rotation.z, alpha)
      }
    };
  }

  // Linear interpolation
  lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  // Angle interpolation (handles wrapping)
  lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return a + diff * Math.max(0, Math.min(1, t));
  }

  // Clean up old states
  cleanup() {
    const cutoff = Date.now() - 1000; // Keep states from last second
    this.serverStates = this.serverStates.filter(state => state.timestamp > cutoff);
  }
}

// Lag compensation for shooting
export class LagCompensator {
  constructor() {
    this.playerHistories = new Map();
    this.maxHistoryTime = 500; // Keep 500ms of history
  }

  // Record player position for lag compensation
  recordPlayerState(playerId, position, rotation, timestamp = Date.now()) {
    if (!this.playerHistories.has(playerId)) {
      this.playerHistories.set(playerId, []);
    }

    const history = this.playerHistories.get(playerId);
    history.push({
      position: { ...position },
      rotation: { ...rotation },
      timestamp
    });

    // Clean old history
    this.cleanupHistory(history);
  }

  // Get player position at a specific time for hit validation
  getPlayerStateAtTime(playerId, timestamp) {
    const history = this.playerHistories.get(playerId);
    if (!history || history.length === 0) return null;

    // Find closest state to the timestamp
    let closestState = history[0];
    let minDiff = Math.abs(history[0].timestamp - timestamp);

    for (const state of history) {
      const diff = Math.abs(state.timestamp - timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closestState = state;
      }
    }

    return closestState;
  }

  // Clean up old history
  cleanupHistory(history) {
    const cutoff = Date.now() - this.maxHistoryTime;
    while (history.length > 0 && history[0].timestamp < cutoff) {
      history.shift();
    }
  }

  // Clean up disconnected players
  removePlayer(playerId) {
    this.playerHistories.delete(playerId);
  }
} 