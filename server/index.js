import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Game state
const players = new Map();
const gameState = {
  maxPlayers: 8,
  gameMode: 'Hamster Havoc',
  mapSize: 50,
  currentMode: null // Will be set when game starts
};

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🐹 Hamster joined the battle: ${socket.id}`);

  // Initialize new player (will be updated when they join with selection)
  const newPlayer = {
    id: socket.id,
    position: { x: 0, y: 1, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    health: 100,
    kills: 0,
    deaths: 0,
    character: 'Hammy Ali', // Will be set by client
    class: 'Tactical Chewer', // Will be set by client
    team: 'red', // Will be set by client
    gameMode: 'hamster_havoc', // Will be set by client
    isAlive: true,
    lastUpdate: Date.now()
  };

  players.set(socket.id, newPlayer);

  // Send initial game state to new player
  socket.emit('gameState', {
    players: Array.from(players.values()),
    gameState: gameState,
    yourId: socket.id
  });

  // Notify other players about new player
  socket.broadcast.emit('playerJoined', newPlayer);

  // Handle player joining with full selection data
  socket.on('playerJoin', (data) => {
    const player = players.get(socket.id);
    if (player) {
      // Update player with selection data
      player.character = data.character;
      player.class = data.character; // Use character as class for now
      player.gameMode = data.gameMode;
      player.team = data.team;
      player.rotation = data.rotation;
      player.lastUpdate = Date.now();
      
      // Set spawn position based on game mode and team
      player.position = getSpawnPosition(player.gameMode, player.team);
      
      console.log(`🎮 ${socket.id} joined ${data.gameMode} as ${data.character} on team ${data.team}`);
      console.log(`📍 Spawned at (${player.position.x.toFixed(1)}, ${player.position.z.toFixed(1)}) - ${player.gameMode} ${player.team || 'solo'}`);
      
      // Send spawn position back to the joining player
      socket.emit('spawnPosition', {
        position: player.position,
        team: player.team,
        gameMode: player.gameMode
      });
      
      // Notify all players about the updated player info
      io.emit('playerUpdated', {
        id: socket.id,
        character: player.character,
        class: player.class, // Also include class explicitly
        team: player.team,
        gameMode: player.gameMode,
        position: player.position  // Include spawn position
      });
    }
  });

  // Handle player movement updates (optimized for compressed data)
  socket.on('playerMove', (data) => {
    const player = players.get(socket.id);
    if (player && player.isAlive) {
      // Handle both compressed and uncompressed data
      let position, rotation;
      
      if (data.pos && data.rot) {
        // Compressed data format
        position = {
          x: data.pos[0],
          y: data.pos[1],
          z: data.pos[2]
        };
        rotation = {
          x: data.rot[0],
          y: data.rot[1],
          z: data.rot[2]
        };
      } else {
        // Legacy uncompressed format
        position = data.position;
        rotation = data.rotation;
      }
      
      player.position = position;
      player.rotation = rotation;
      player.lastUpdate = Date.now();
      
      // Broadcast compressed data to other players
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        pos: [position.x, position.y, position.z],
        rot: [rotation.x, rotation.y, rotation.z],
        t: data.t || Date.now()
      });
    }
  });

  // Handle heartbeat to keep players active
  socket.on('heartbeat', () => {
    const player = players.get(socket.id);
    if (player) {
      player.lastUpdate = Date.now();
    }
  });

  // Handle shooting
  socket.on('playerShoot', (data) => {
    const player = players.get(socket.id);
    if (player && player.isAlive) {
      // Broadcast shooting event
      socket.broadcast.emit('playerShot', {
        id: socket.id,
        position: data.position,
        direction: data.direction,
        weapon: data.weapon,
        timestamp: data.timestamp
      });

      // Check for hits (simplified hit detection)
      checkHit(socket.id, data);
    }
  });

  // Handle reload
  socket.on('playerReload', () => {
    const player = players.get(socket.id);
    if (player && player.isAlive) {
      // Just acknowledge the reload - ammo is managed client-side
      socket.emit('reloadComplete');
    }
  });

  // Handle damage
  socket.on('playerDamage', (data) => {
    const targetPlayer = players.get(data.targetId);
    const shooterPlayer = players.get(socket.id);
    
    if (targetPlayer && shooterPlayer && targetPlayer.isAlive && shooterPlayer.isAlive) {
      targetPlayer.health -= data.damage;
      
      if (targetPlayer.health <= 0) {
        targetPlayer.health = 0;
        targetPlayer.isAlive = false;
        targetPlayer.deaths++;
        shooterPlayer.kills++;
        
        // Notify about kill
        io.emit('playerKilled', {
          killer: shooterPlayer.id,
          victim: targetPlayer.id,
          killerName: shooterPlayer.character,
          victimName: targetPlayer.character
        });
        
        // Respawn after delay
        setTimeout(() => {
          respawnPlayer(targetPlayer.id);
        }, 3000);
      }
      
      // Send health update
      io.to(data.targetId).emit('healthUpdate', targetPlayer.health);
    }
  });

  // Handle chat messages
  socket.on('chatMessage', (data) => {
    const player = players.get(socket.id);
    if (player) {
      io.emit('chatMessage', {
        player: player.character,
        message: data.message,
        timestamp: Date.now()
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🐹 Hamster left the battle: ${socket.id}`);
    players.delete(socket.id);
    socket.broadcast.emit('playerLeft', socket.id);
  });
});

// Helper function to check hits
function checkHit(shooterId, shotData) {
  // Simple hit detection - in a real game, this would be more sophisticated
  const shooter = players.get(shooterId);
  if (!shooter) return;

  players.forEach((player, id) => {
    if (id !== shooterId && player.isAlive) {
      const distance = Math.sqrt(
        Math.pow(player.position.x - shotData.position.x, 2) +
        Math.pow(player.position.y - shotData.position.y, 2) +
        Math.pow(player.position.z - shotData.position.z, 2)
      );

      // Simple hit check - if player is close to shot line
      if (distance < 2) {
        const baseDamage = shotData.damage || 25;
        const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4)); // ±20% variation
        const isHeadshot = Math.random() > 0.9;
        const finalDamage = isHeadshot ? damage * 2 : damage;
        
        io.to(shooterId).emit('hitConfirm', {
          targetId: id,
          damage: finalDamage,
          isHeadshot: isHeadshot,
          weapon: shotData.weapon
        });
      }
    }
  });
}

// Helper function to get spawn position based on game mode and team
function getSpawnPosition(gameMode, team) {
  if (gameMode === 'hamster_havoc' || gameMode === 'hamster-havoc') {
    // Team-based spawns for team deathmatch - user specified coordinates
    if (team === 'wheel-warriors') {
      // The Wheel Warriors spawn point
      return {
        x: -2105.83,
        y: 40.00,
        z: -3224.46
      };
    } else if (team === 'cheek-stuffers') {
      // The Cheek Stuffers spawn point
      return {
        x: 319.04,
        y: 40.00,
        z: 3942.67
      };
    }
  }
  
  // Specific spawn points for solo modes (Last Ham Standing, Nuts of Fury)
  if (gameMode === 'last-ham-standing' || gameMode === 'nuts-of-fury') {
    const soloSpawnPoints = [
      { x: -494.34, y: 40.00, z: -2074.55 },
      { x: -1983.87, y: 40.00, z: -1179.90 },
      { x: -2047.21, y: 40.00, z: -2781.79 },
      { x: -749.93, y: 40.00, z: 1902.28 },  // Fixed typo from -749:93
      { x: 32.74, y: 40.00, z: 3471.90 },
      { x: 1061.00, y: 40.00, z: 1883.49 }
    ];
    
    // Randomly select one of the 6 spawn points
    const randomSpawn = soloSpawnPoints[Math.floor(Math.random() * soloSpawnPoints.length)];
    return randomSpawn;
  }
  
  // Default random spawns for other modes
  const spawnAreas = [
    // Multiple spawn points around the map for better distribution
    { x: (Math.random() - 0.5) * 15, z: (Math.random() - 0.5) * 15 }, // Center area
    { x: -15 + Math.random() * 10, z: -15 + Math.random() * 10 },      // Northwest
    { x: 5 + Math.random() * 10, z: -15 + Math.random() * 10 },        // Northeast  
    { x: -15 + Math.random() * 10, z: 5 + Math.random() * 10 },        // Southwest
    { x: 5 + Math.random() * 10, z: 5 + Math.random() * 10 }           // Southeast
  ];
  
  const chosenArea = spawnAreas[Math.floor(Math.random() * spawnAreas.length)];
  return {
    x: chosenArea.x,
    y: 3,
    z: chosenArea.z
  };
}

// Helper function to respawn player
function respawnPlayer(playerId) {
  const player = players.get(playerId);
  if (player) {
    player.health = 100;
    player.isAlive = true;
    
    // Get appropriate spawn position based on game mode and team
    player.position = getSpawnPosition(player.gameMode, player.team);
    
    console.log(`🐹 ${playerId} respawned at (${player.position.x.toFixed(1)}, ${player.position.z.toFixed(1)}) - ${player.gameMode} ${player.team || 'solo'}`);
    
    io.to(playerId).emit('respawn', player);
    io.emit('playerRespawned', {
      id: playerId,
      position: player.position
    });
  }
}

// Game loop for cleanup and updates
setInterval(() => {
  const now = Date.now();
  const timeoutMs = 300000; // 5 minutes timeout (much longer for testing)
  
  // Remove inactive players
  players.forEach((player, id) => {
    if (now - player.lastUpdate > timeoutMs) {
      players.delete(id);
      io.emit('playerLeft', id);
      console.log(`🐹 Removed inactive hamster: ${id}`);
    }
  });
  
  // Send periodic game state update
  io.emit('gameStateUpdate', {
    playerCount: players.size,
    players: Array.from(players.values()).map(p => ({
      id: p.id,
      character: p.character,
      kills: p.kills,
      deaths: p.deaths,
      team: p.team,
      isAlive: p.isAlive
    }))
  });
}, 5000);

server.listen(PORT, () => {
  console.log(`🐹 Hamster Hunter server running on port ${PORT}`);
  console.log(`🔫 Ready for epic hamster warfare!`);
}); 