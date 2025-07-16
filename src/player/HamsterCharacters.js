export class HamsterCharacter {
  constructor(name, description, stats, color) {
    this.name = name;
    this.description = description;
    this.stats = stats;
    this.color = color;
    this.abilities = [];
  }

  getSpeedMultiplier() {
    return this.stats.speed || 1.0;
  }

  getHealthMultiplier() {
    return this.stats.health || 1.0;
  }

  getDamageMultiplier() {
    return this.stats.damage || 1.0;
  }

  getAccuracyMultiplier() {
    return this.stats.accuracy || 1.0;
  }

  getJumpMultiplier() {
    return this.stats.jump || 1.0;
  }
}

// Character Roster
export const HAMSTER_CHARACTERS = {
  'Hammy Ali': new HamsterCharacter(
    'Hammy Ali',
    'The fastest hamster in the cage! Float like a butterfly, sting like a bee.',
    {
      speed: 1.3,      // 30% faster
      health: 0.9,     // 10% less health
      damage: 1.0,     // Normal damage
      accuracy: 1.1,   // 10% better accuracy
      jump: 1.2        // 20% higher jumps
    },
    0xFFD700 // Gold
  ),

  'Mike Nibbson': new HamsterCharacter(
    'Mike Nibbson',
    'The heavyweight champion! Packs a serious punch in his tiny paws.',
    {
      speed: 0.8,      // 20% slower
      health: 1.4,     // 40% more health
      damage: 1.5,     // 50% more damage
      accuracy: 0.9,   // 10% less accuracy
      jump: 0.8        // 20% lower jumps
    },
    0x8B0000 // Dark red
  ),

  'Chewbacca': new HamsterCharacter(
    'Chewbacca',
    'The furry tank! This wookie hamster can take a beating and keep going.',
    {
      speed: 0.9,      // 10% slower
      health: 1.6,     // 60% more health
      damage: 1.1,     // 10% more damage
      accuracy: 0.8,   // 20% less accuracy
      jump: 0.9        // 10% lower jumps
    },
    0x8B4513 // Saddle brown
  ),

  'Ham Solo': new HamsterCharacter(
    'Ham Solo',
    'The lone wolf sniper! Never misses his shot and always works alone.',
    {
      speed: 1.0,      // Normal speed
      health: 1.0,     // Normal health
      damage: 1.3,     // 30% more damage
      accuracy: 1.5,   // 50% better accuracy
      jump: 1.0        // Normal jump
    },
    0x2F4F4F // Dark slate gray
  ),

  'Lil Gnawz X': new HamsterCharacter(
    'Lil Gnawz X',
    'The rapid-fire specialist! Shoots fast and moves even faster.',
    {
      speed: 1.2,      // 20% faster
      health: 0.8,     // 20% less health
      damage: 0.8,     // 20% less damage per shot
      accuracy: 0.9,   // 10% less accuracy
      jump: 1.3        // 30% higher jumps
    },
    0x00FF00 // Lime green
  ),

  'Kanye Nibbles': new HamsterCharacter(
    'Kanye Nibbles',
    'The versatile all-rounder! Balanced stats with occasional bursts of genius.',
    {
      speed: 1.0,      // Normal speed
      health: 1.1,     // 10% more health
      damage: 1.1,     // 10% more damage
      accuracy: 1.0,   // Normal accuracy
      jump: 1.1        // 10% higher jumps
    },
    0xFF1493 // Deep pink
  )
};

// Character Classes
export const HAMSTER_CLASSES = {
  'Tactical Chewer': {
    name: 'Tactical Chewer',
    description: 'Stealth and precision focused',
    bonuses: {
      speed: 1.1,
      accuracy: 1.2,
      stealthTime: 3000 // 3 seconds of stealth after kill
    },
    startingWeapon: 'Silenced Acorn Gun',
    color: 0x006400 // Dark green
  },

  'Fluff \'n\' Reload': {
    name: 'Fluff \'n\' Reload',
    description: 'Heavy weapons specialist',
    bonuses: {
      damage: 1.3,
      health: 1.2,
      reloadSpeed: 1.5 // 50% faster reload
    },
    startingWeapon: 'Hamster Cannon',
    color: 0x8B0000 // Dark red
  },

  'Squeak or be Squeakened': {
    name: 'Squeak or be Squeakened',
    description: 'Assault class',
    bonuses: {
      speed: 1.2,
      damage: 1.1,
      jumpHeight: 1.3
    },
    startingWeapon: 'Assault Acorns',
    color: 0xFF4500 // Orange red
  },

  'Guns and Whiskers': {
    name: 'Guns and Whiskers',
    description: 'Support/medic class',
    bonuses: {
      health: 1.4,
      healingRate: 2.0, // Can heal teammates
      accuracy: 1.1
    },
    startingWeapon: 'Healing Pellets',
    color: 0x1E90FF // Dodger blue
  }
};

export function getRandomCharacter() {
  const characters = Object.keys(HAMSTER_CHARACTERS);
  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters[randomIndex];
}

export function getRandomClass() {
  const classes = Object.keys(HAMSTER_CLASSES);
  const randomIndex = Math.floor(Math.random() * classes.length);
  return classes[randomIndex];
}

export function calculateFinalStats(characterName, className) {
  const character = HAMSTER_CHARACTERS[characterName];
  const characterClass = HAMSTER_CLASSES[className];
  
  if (!character || !characterClass) {
    return null;
  }

  return {
    speed: (character.stats.speed || 1.0) * (characterClass.bonuses.speed || 1.0),
    health: (character.stats.health || 1.0) * (characterClass.bonuses.health || 1.0),
    damage: (character.stats.damage || 1.0) * (characterClass.bonuses.damage || 1.0),
    accuracy: (character.stats.accuracy || 1.0) * (characterClass.bonuses.accuracy || 1.0),
    jump: (character.stats.jump || 1.0) * (characterClass.bonuses.jumpHeight || 1.0),
    reloadSpeed: characterClass.bonuses.reloadSpeed || 1.0,
    healingRate: characterClass.bonuses.healingRate || 0,
    stealthTime: characterClass.bonuses.stealthTime || 0
  };
}

export function getCharacterMeshColor(characterName) {
  const character = HAMSTER_CHARACTERS[characterName];
  return character ? character.color : 0xff8c42; // Default orange
}

export function getClassColor(className) {
  const characterClass = HAMSTER_CLASSES[className];
  return characterClass ? characterClass.color : 0x808080; // Default gray
} 