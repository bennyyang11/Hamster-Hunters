// Weapon configuration system for Hamster Hunter
export const WEAPON_STATS = {
  // SMGs - High rate of fire, lower damage
  'mini_uzi': {
    name: 'Mini UZI',
    model: '/assets/models/weapons/low_poly_mini_uzi.glb',
    damage: 22,
    fireRate: 80, // ms between shots (750 RPM)
    range: 30,
    accuracy: 0.7,
    mobility: 0.9,
    ammo: 32,
    reloadTime: 2.0,
    type: 'SMG',
    pellets: 1
  },
  'mp5': {
    name: 'MP5',
    model: '/assets/models/weapons/low_poly_mp5.glb',
    damage: 28,
    fireRate: 100, // ms between shots (600 RPM)
    range: 35,
    accuracy: 0.8,
    mobility: 0.8,
    ammo: 30,
    reloadTime: 2.2,
    type: 'SMG',
    pellets: 1
  },
  
  // Assault Rifles - Balanced rate of fire and damage
  'ak47': {
    name: 'AK-47',
    model: '/assets/models/weapons/low_poly_ak47.glb',
    damage: 35,
    fireRate: 150, // ms between shots (400 RPM)
    range: 60,
    accuracy: 0.7,
    mobility: 0.6,
    ammo: 30,
    reloadTime: 2.5,
    type: 'Assault Rifle',
    pellets: 1
  },
  'an94': {
    name: 'AN-94',
    model: '/assets/models/weapons/low_poly_an94.glb',
    damage: 33,
    fireRate: 130, // ms between shots (460 RPM)
    range: 65,
    accuracy: 0.8,
    mobility: 0.6,
    ammo: 30,
    reloadTime: 2.4,
    type: 'Assault Rifle',
    pellets: 1
  },
  
  // Precision/Tactical - Slow rate of fire, high damage
  'scar_h': {
    name: 'SCAR-H',
    model: '/assets/models/weapons/low_poly_scarh.glb',
    damage: 55,
    fireRate: 300, // ms between shots (200 RPM)
    range: 80,
    accuracy: 0.9,
    mobility: 0.5,
    ammo: 20,
    reloadTime: 2.8,
    type: 'Battle Rifle',
    pellets: 1
  },
  'aug_a1': {
    name: 'AUG A1',
    model: '/assets/models/weapons/lowpoly_aug_a1.glb',
    damage: 38,
    fireRate: 120, // ms between shots (500 RPM)
    range: 55,
    accuracy: 0.85,
    mobility: 0.7,
    ammo: 30,
    reloadTime: 2.3,
    type: 'Assault Rifle',
    pellets: 1
  },
  
  // Shotguns - Very slow rate of fire, multiple pellets, devastating close range
  'spas12': {
    name: 'SPAS-12',
    model: '/assets/models/weapons/low_poly_spas12.glb',
    damage: 25, // per pellet
    fireRate: 800, // ms between shots (75 RPM)
    range: 20,
    accuracy: 0.5,
    mobility: 0.4,
    ammo: 8,
    reloadTime: 3.0,
    type: 'Shotgun',
    pellets: 8 // 8 pellets per shot
  },
  'model870': {
    name: 'Model 870',
    model: '/assets/models/weapons/low_poly_model870.glb',
    damage: 30, // per pellet
    fireRate: 1200, // ms between shots (50 RPM)
    range: 25,
    accuracy: 0.6,
    mobility: 0.4,
    ammo: 6,
    reloadTime: 3.5,
    type: 'Shotgun',
    pellets: 6 // 6 pellets per shot
  }
};

// Class loadouts configuration
export const CLASS_LOADOUTS = {
  'tactical_chewer': {
    name: 'Tactical Chewer',
    description: 'Precision and tactical warfare specialist',
    primary: 'mp5',
    secondary: 'scar_h',
    specialAbility: 'Enhanced accuracy and reduced recoil',
    color: '#4CAF50',
    icon: '🎯',
    stats: {
      accuracy: 1.2,
      mobility: 1.1,
      damage: 1.0,
      reload: 0.9
    }
  },
  'fluff_n_reload': {
    name: 'Fluff \'n\' Reload',
    description: 'Mixed assault and shotgun specialist',
    primary: 'an94',
    secondary: 'spas12',
    specialAbility: 'Faster reload times and increased damage at close range',
    color: '#FF9800',
    icon: '🔄',
    stats: {
      accuracy: 1.0,
      mobility: 1.0,
      damage: 1.2,
      reload: 1.3
    }
  },
  'squeak_or_be_squeakened': {
    name: 'Squeak or be Squeakened',
    description: 'Precision rifle and shotgun specialist',
    primary: 'spas12',
    secondary: 'model870',
    specialAbility: 'Enhanced accuracy and close-range damage',
    color: '#F44336',
    icon: '💥',
    stats: {
      accuracy: 1.1,
      mobility: 0.8,
      damage: 1.3,
      reload: 1.0
    }
  },
  'guns_and_whiskers': {
    name: 'Guns and Whiskers',
    description: 'High mobility SMG specialist',
    primary: 'mini_uzi',
    secondary: 'aug_a1',
    specialAbility: 'Enhanced mobility and faster movement',
    color: '#2196F3',
    icon: '⚡',
    stats: {
      accuracy: 1.0,
      mobility: 1.4,
      damage: 0.9,
      reload: 1.1
    }
  }
};

// Get weapon stats with class bonuses applied
export function getWeaponWithClassBonus(weaponId, classId) {
  const weapon = { ...WEAPON_STATS[weaponId] };
  const classStats = CLASS_LOADOUTS[classId].stats;
  
  // Apply class bonuses
  weapon.damage = Math.round(weapon.damage * classStats.damage);
  weapon.accuracy = Math.min(1.0, weapon.accuracy * classStats.accuracy);
  weapon.reloadTime = weapon.reloadTime / classStats.reload;
  
  return weapon;
}

// Get all weapons for a class
export function getClassWeapons(classId) {
  const loadout = CLASS_LOADOUTS[classId];
  return {
    primary: getWeaponWithClassBonus(loadout.primary, classId),
    secondary: getWeaponWithClassBonus(loadout.secondary, classId)
  };
}

// Get random class
export function getRandomClass() {
  const classes = Object.keys(CLASS_LOADOUTS);
  return classes[Math.floor(Math.random() * classes.length)];
} 