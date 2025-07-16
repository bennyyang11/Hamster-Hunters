export class GameMode {
  constructor(name, description, maxPlayers = 8) {
    this.name = name;
    this.description = description;
    this.maxPlayers = maxPlayers;
    this.isActive = false;
    this.timeLimit = 300; // 5 minutes default
    this.scoreLimit = 25; // Default score limit
  }

  start() {
    this.isActive = true;
    this.startTime = Date.now();
    console.log(`🎮 ${this.name} started!`);
  }

  end() {
    this.isActive = false;
    console.log(`🏁 ${this.name} ended!`);
  }

  update() {
    // Override in subclasses
  }

  checkWinConditions() {
    // Override in subclasses
    return false;
  }

  getRemainingTime() {
    if (!this.isActive) return 0;
    const elapsed = (Date.now() - this.startTime) / 1000;
    return Math.max(0, this.timeLimit - elapsed);
  }
}

export class HamsterHavoc extends GameMode {
  constructor() {
    super('Hamster Havoc', 'Team Deathmatch - Red vs Blue hamsters!', 8);
    this.teams = {
      red: { score: 0, players: [] },
      blue: { score: 0, players: [] }
    };
    this.scoreLimit = 50; // First to 50 kills wins
  }

  addPlayer(player) {
    // Balance teams
    const redCount = this.teams.red.players.length;
    const blueCount = this.teams.blue.players.length;
    
    const team = redCount <= blueCount ? 'red' : 'blue';
    player.team = team;
    this.teams[team].players.push(player.id);
    
    console.log(`🐹 ${player.character} joined ${team} team!`);
    return team;
  }

  removePlayer(playerId) {
    ['red', 'blue'].forEach(team => {
      const index = this.teams[team].players.indexOf(playerId);
      if (index > -1) {
        this.teams[team].players.splice(index, 1);
      }
    });
  }

  onKill(killer, victim) {
    if (killer.team && killer.team !== victim.team) {
      this.teams[killer.team].score++;
      console.log(`🎯 ${killer.team} team: ${this.teams[killer.team].score}/${this.scoreLimit}`);
    }
  }

  checkWinConditions() {
    for (const [team, data] of Object.entries(this.teams)) {
      if (data.score >= this.scoreLimit) {
        console.log(`🏆 ${team.toUpperCase()} TEAM WINS!`);
        return { winner: team, score: data.score };
      }
    }
    
    // Check time limit
    if (this.getRemainingTime() <= 0) {
      const redScore = this.teams.red.score;
      const blueScore = this.teams.blue.score;
      
      if (redScore > blueScore) {
        return { winner: 'red', score: redScore };
      } else if (blueScore > redScore) {
        return { winner: 'blue', score: blueScore };
      } else {
        return { winner: 'tie', score: redScore };
      }
    }
    
    return null;
  }

  getGameState() {
    return {
      mode: this.name,
      teams: this.teams,
      timeRemaining: this.getRemainingTime(),
      scoreLimit: this.scoreLimit
    };
  }
}

export class LastHamStanding extends GameMode {
  constructor() {
    super('Last Ham Standing', 'Battle Royale - Last hamster standing wins!', 12);
    this.playZone = {
      center: { x: 0, z: 0 },
      radius: 25,
      shrinkRate: 0.5 // radius per second
    };
    this.shrinkTimer = 60; // Start shrinking after 1 minute
  }

  update() {
    if (!this.isActive) return;
    
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    if (elapsed > this.shrinkTimer) {
      this.playZone.radius = Math.max(5, this.playZone.radius - this.shrinkRate * 0.016); // 60fps
    }
  }

  isInPlayZone(position) {
    const distance = Math.sqrt(
      Math.pow(position.x - this.playZone.center.x, 2) +
      Math.pow(position.z - this.playZone.center.z, 2)
    );
    return distance <= this.playZone.radius;
  }

  getGameState() {
    return {
      mode: this.name,
      playZone: this.playZone,
      timeRemaining: this.getRemainingTime()
    };
  }
}

export class NutsOfFury extends GameMode {
  constructor() {
    super('Nuts of Fury', 'Gun Game - Progress through weapons to win!', 8);
    this.weaponProgression = [
      'Acorn Shooter',
      'Sunflower Blaster', 
      'Pellet Rifle',
      'Hamster Cannon',
      'Nuclear Nut'
    ];
    this.playerProgress = new Map();
  }

  addPlayer(player) {
    this.playerProgress.set(player.id, 0); // Start with first weapon
  }

  removePlayer(playerId) {
    this.playerProgress.delete(playerId);
  }

  onKill(killer, victim) {
    const killerProgress = this.playerProgress.get(killer.id) || 0;
    this.playerProgress.set(killer.id, killerProgress + 1);
    
    console.log(`🔫 ${killer.character} advanced to weapon ${killerProgress + 1}!`);
  }

  checkWinConditions() {
    for (const [playerId, progress] of this.playerProgress.entries()) {
      if (progress >= this.weaponProgression.length) {
        return { winner: playerId, weapon: this.weaponProgression[progress - 1] };
      }
    }
    return null;
  }

  getCurrentWeapon(playerId) {
    const progress = this.playerProgress.get(playerId) || 0;
    return this.weaponProgression[Math.min(progress, this.weaponProgression.length - 1)];
  }

  getGameState() {
    return {
      mode: this.name,
      weaponProgression: this.weaponProgression,
      playerProgress: Object.fromEntries(this.playerProgress),
      timeRemaining: this.getRemainingTime()
    };
  }
} 