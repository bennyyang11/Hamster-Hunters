import * as THREE from 'three';

export class Weapon {
  constructor(name, config) {
    this.name = name;
    this.damage = config.damage || 25;
    this.fireRate = config.fireRate || 500; // ms between shots
    this.accuracy = config.accuracy || 0.95; // 1.0 = perfect accuracy
    this.range = config.range || 100;
    this.ammoCapacity = config.ammoCapacity || 30;
    this.reloadTime = config.reloadTime || 2000; // ms
    this.weaponType = config.weaponType || 'automatic';
    this.spread = config.spread || 0.02; // Bullet spread
    this.projectileSpeed = config.projectileSpeed || 10000000; // 100x faster - ultra-instantaneous hit
    this.color = config.color || 0xffff00;
    this.pellets = config.pellets || 1; // Number of pellets per shot (for shotguns)
    this.type = config.type || 'Rifle'; // Weapon type
    
    // Current state
    this.currentAmmo = this.ammoCapacity;
    this.isReloading = false;
    this.lastFireTime = 0;
  }

  canFire() {
    const now = Date.now();
    return !this.isReloading && 
           this.currentAmmo > 0 && 
           (now - this.lastFireTime) >= this.fireRate;
  }

  fire(position, direction, accuracy = 1.0) {
    if (!this.canFire()) return null;

    this.lastFireTime = Date.now();
    this.currentAmmo--;

    // Apply weapon accuracy and player accuracy
    const finalAccuracy = this.accuracy * accuracy;
    const baseSpread = this.spread * (1 - finalAccuracy);
    
    // For shotguns, increase spread significantly
    const spreadMultiplier = this.type === 'Shotgun' ? 4.0 : 1.0;
    const spreadAmount = baseSpread * spreadMultiplier;
    
    const shots = [];
    
    // Fire multiple pellets for shotguns
    for (let i = 0; i < this.pellets; i++) {
      // Add random spread for each pellet
      const spreadX = (Math.random() - 0.5) * spreadAmount;
      const spreadY = (Math.random() - 0.5) * spreadAmount;
      
      const finalDirection = direction.clone();
      finalDirection.x += spreadX;
      finalDirection.y += spreadY;
      finalDirection.normalize();

      shots.push({
        position: position.clone(),
        direction: finalDirection,
        damage: this.damage,
        range: this.range,
        speed: this.projectileSpeed,
        weapon: this.name,
        weaponType: this.type,
        pelletIndex: i
      });
    }

    // Return single shot for non-shotguns, array for shotguns
    return this.pellets === 1 ? shots[0] : shots;
  }

  reload() {
    if (this.isReloading || this.currentAmmo === this.ammoCapacity) return false;
    
    this.isReloading = true;
    setTimeout(() => {
      this.currentAmmo = this.ammoCapacity;
      this.isReloading = false;
    }, this.reloadTime);
    
    return true;
  }

  getAmmoStatus() {
    return {
      current: this.currentAmmo,
      capacity: this.ammoCapacity,
      isReloading: this.isReloading
    };
  }
}

// Real weapon configurations based on GLB files
export const WEAPONS = {
  // Assault Rifles
  'ak47': new Weapon('AK-47', {
    damage: 35,
    fireRate: 120,
    accuracy: 0.85,
    range: 100,
    ammoCapacity: 30,
    reloadTime: 2500,
    weaponType: 'rifle',
    spread: 0.03,
    color: 0x444444,
    modelFile: 'low_poly_ak47.glb'
  }),

  'scarh': new Weapon('SCAR-H', {
    damage: 45,
    fireRate: 150,
    accuracy: 0.92,
    range: 120,
    ammoCapacity: 20,
    reloadTime: 2800,
    weaponType: 'rifle',
    spread: 0.02,
    color: 0x654321,
    modelFile: 'low_poly_scarh.glb'
  }),

  'an94': new Weapon('AN-94', {
    damage: 38,
    fireRate: 135,
    accuracy: 0.90,
    range: 110,
    ammoCapacity: 30,
    reloadTime: 2600,
    weaponType: 'rifle',
    spread: 0.025,
    color: 0x2F4F4F,
    modelFile: 'low_poly_an94.glb'
  }),

  // SMGs  
  'mp5': new Weapon('MP5', {
    damage: 25,
    fireRate: 80,
    accuracy: 0.88,
    range: 60,
    ammoCapacity: 30,
    reloadTime: 2000,
    weaponType: 'smg',
    spread: 0.04,
    color: 0x333333,
    modelFile: 'low_poly_mp5.glb'
  }),

  'mini_uzi': new Weapon('Mini UZI', {
    damage: 22,
    fireRate: 70,
    accuracy: 0.82,
    range: 50,
    ammoCapacity: 32,
    reloadTime: 1800,
    weaponType: 'smg',
    spread: 0.05,
    color: 0x1C1C1C,
    modelFile: 'low_poly_mini_uzi.glb'
  }),

  // Shotguns
  'model870': new Weapon('Model 870', {
    damage: 80,
    fireRate: 800,
    accuracy: 0.75,
    range: 40,
    ammoCapacity: 8,
    reloadTime: 3500,
    weaponType: 'shotgun',
    spread: 0.15,
    color: 0x8B4513,
    modelFile: 'low_poly_model870.glb'
  }),

  'spas12': new Weapon('SPAS-12', {
    damage: 85,
    fireRate: 750,
    accuracy: 0.78,
    range: 45,
    ammoCapacity: 8,
    reloadTime: 3200,
    weaponType: 'shotgun',
    spread: 0.12,
    color: 0x654321,
    modelFile: 'low_poly_spas12.glb'
  }),

  // Precision Rifles
  'aug_a1': new Weapon('AUG A1', {
    damage: 50,
    fireRate: 180,
    accuracy: 0.95,
    range: 150,
    ammoCapacity: 30,
    reloadTime: 3000,
    weaponType: 'precision',
    spread: 0.01,
    color: 0x2E8B57,
    modelFile: 'lowpoly_aug_a1.glb'
  })
};

export class WeaponManager {
  constructor(scene, assetLoader = null, camera = null, bulletSystem = null) {
    this.scene = scene;
    this.assetLoader = assetLoader;
    this.camera = camera;
    this.bulletSystem = bulletSystem;
    this.currentWeapon = null;
    this.currentWeaponKey = null; // Store weapon key for asset lookup
    this.weaponMesh = null;
    this.muzzleFlash = null;
    this.projectiles = [];
    this.hamsterRef = null; // Reference to hamster for weapon attachment
    this.weaponAttachPoint = null; // Weapon attachment point on hamster
    
    console.log('🔫 Enhanced Weapon Manager with bullet system initialized');
  }

  equipWeapon(weaponName) {
    console.log(`🔄 equipWeapon called with: "${weaponName}"`);
    console.log(`🔄 Current weapon: ${this.currentWeapon ? this.currentWeapon.name : 'None'}`);
    
    if (WEAPONS[weaponName]) {
      this.currentWeapon = WEAPONS[weaponName];
      this.currentWeaponKey = weaponName; // Store the original key for asset lookup
      console.log(`🔫 Found weapon config for: ${this.currentWeapon.name}`);
      this.createWeaponMesh();
      console.log(`🔫 Equipped ${this.currentWeapon.name} (${weaponName})`);
      return true;
    }
    console.warn(`⚠️ Weapon ${weaponName} not found in WEAPONS config`);
    console.log(`⚠️ Available weapons:`, Object.keys(WEAPONS));
    return false;
  }

  setHamsterReference(hamster) {
    this.hamsterRef = hamster;
    console.log('🐹 Hamster reference set for weapon attachment');
  }

  async createWeaponMesh() {
    // Remove previous weapon mesh
    if (this.weaponMesh) {
      if (this.weaponMesh.parent) {
        this.weaponMesh.parent.remove(this.weaponMesh);
      }
    }

    if (!this.currentWeapon) return;

    // First, try to get already loaded weapon model
    // Use the stored weapon key to match AssetLoader storage format
    const weaponKey = this.currentWeaponKey || this.currentWeapon.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-');
    
    console.log(`🔍 Looking for weapon: ${this.currentWeapon.name} with key: ${weaponKey}`);
    console.log(`🔍 Available weapon keys:`, this.assetLoader?.weaponModels ? Array.from(this.assetLoader.weaponModels.keys()) : 'No weaponModels');
    
    try {
      if (this.assetLoader && this.assetLoader.weaponModels && this.assetLoader.weaponModels.has(weaponKey)) {
        // Use already loaded weapon model
        const weaponModel = this.assetLoader.weaponModels.get(weaponKey);
        
        // Create a regular clone and ensure clean state
        this.weaponMesh = weaponModel.clone();
        
        // IMPORTANT: Reset all transformations immediately after cloning
        this.weaponMesh.scale.set(1, 1, 1);
        this.weaponMesh.position.set(0, 0, 0);
        this.weaponMesh.rotation.set(0, 0, 0);
        
        // Also reset the matrix to ensure no inherited transforms
        this.weaponMesh.matrix.identity();
        this.weaponMesh.updateMatrix();
        
        console.log(`✅ Using cached weapon model for ${this.currentWeapon.name}`);
        console.log(`🔍 Clean weapon mesh scale: ${this.weaponMesh.scale.x}, ${this.weaponMesh.scale.y}, ${this.weaponMesh.scale.z}`);
      } else if (this.assetLoader && this.currentWeapon.modelFile) {
        // Try to load the weapon model from GLB file
        console.log(`📦 Loading weapon model: ${this.currentWeapon.modelFile}`);
        const weaponModel = await this.assetLoader.loadWeaponModel(
          weaponKey,
          `/assets/models/weapons/${this.currentWeapon.modelFile}`
        );
        
        if (weaponModel) {
          this.weaponMesh = weaponModel.clone();
          console.log(`✅ Loaded 3D model for ${this.currentWeapon.name}`);
        } else {
          throw new Error('Model loading failed');
        }
      } else {
        throw new Error('No asset loader or model file');
      }
    } catch (error) {
      console.warn(`⚠️ Could not load weapon model: ${error.message}, using fallback`);
      this.weaponMesh = this.createFallbackWeaponMesh();
    }

    if (!this.weaponMesh) return;

    // Configure weapon for hamster attachment
    this.configureWeaponForHamster();
    
    // Attach weapon to hamster or camera
    this.attachWeapon();
  }

  configureWeaponForHamster() {
    console.log(`🔧 Configuring ${this.currentWeapon.name} for hamster attachment`);
    console.log(`🔧 Before scaling - weapon scale: ${this.weaponMesh.scale.x}, ${this.weaponMesh.scale.y}, ${this.weaponMesh.scale.z}`);
    
    // Weapon-specific scaling for optimal hamster attachment
    const weaponScales = {
      'ak47': 1.05,       // AK-47 made 3x bigger (0.35 * 3)
      'scarh': 0.2,       // SCAR-H is good at current size
      'an94': 0.25,       // AN-94 slightly bigger than default
      'aug_a1': 0.22,     // AUG A1 slightly bigger than default
      'mp5': 0.18,        // MP5 is smaller, keep it proportional
      'mini_uzi': 0.16,   // Mini UZI should be smallest
      'spas12': 0.28,     // SPAS-12 was almost right, make it a bit bigger
      'model870': 0.2,    // Model 870 is good at current size
      'default': 0.2      // Fallback for any missing weapons
    };
    
    const weaponScale = weaponScales[this.currentWeaponKey] || weaponScales['default'];
    this.weaponMesh.scale.setScalar(weaponScale);
    
    console.log(`🔧 After scaling - weapon scale: ${this.weaponMesh.scale.x}, ${this.weaponMesh.scale.y}, ${this.weaponMesh.scale.z}`);
    
    // Position weapon at optimal hamster attachment point
    this.weaponMesh.position.set(0.3, 0.05, 0.1); // Right side, slightly forward
    
    // Rotate weapon to point forward (not across chest)
    this.weaponMesh.rotation.set(-0.1, 0, 0.1); // Minimal rotation to point forward
    
    console.log(`🔧 Configured ${this.currentWeapon.name} for hamster attachment (scale: ${weaponScale}) - Ready for combat!`);
  }

  attachWeapon() {
    if (this.hamsterRef && this.hamsterRef.bodyMesh) {
      // Remove weapon from any previous parent first
      if (this.weaponMesh.parent) {
        this.weaponMesh.parent.remove(this.weaponMesh);
      }
      
      // Attach to hamster body
      this.hamsterRef.bodyMesh.add(this.weaponMesh);
      console.log(`🐹 Weapon attached to hamster body - Position: (${this.weaponMesh.position.x}, ${this.weaponMesh.position.y}, ${this.weaponMesh.position.z}), Scale: ${this.weaponMesh.scale.x}`);
      console.log(`🐹 Hamster position: (${this.hamsterRef.position.x}, ${this.hamsterRef.position.y}, ${this.hamsterRef.position.z})`);
      
      // Ensure weapon is visible with original materials
      this.weaponMesh.visible = true;
      this.weaponMesh.traverse((child) => {
        if (child.isMesh) {
          child.visible = true;
          // Keep original materials from GLB file
        }
      });
    } else {
      console.log(`⚠️ Cannot attach weapon - hamsterRef: ${!!this.hamsterRef}, bodyMesh: ${!!(this.hamsterRef && this.hamsterRef.bodyMesh)}`);
      
      if (this.camera) {
        // Fallback: attach to camera for first-person view
        this.weaponMesh.position.set(5, -8, -15); // Adjusted for camera view
        this.weaponMesh.scale.setScalar(8); // Smaller for camera view
        this.camera.add(this.weaponMesh);
        console.log('📷 Weapon attached to camera (fallback)');
      } else {
        // Last resort: add to scene
        this.scene.add(this.weaponMesh);
        console.log('🌍 Weapon added to scene (last resort)');
      }
    }
  }

  createFallbackWeaponMesh() {
    // Create different shapes based on weapon type
    const weaponName = this.currentWeapon.name.toLowerCase();
    
    if (weaponName.includes('rifle') || weaponName.includes('assault')) {
      // Rifle-like shape
      const group = new THREE.Group();
      
      // Barrel
      const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
      const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
      barrel.rotation.z = Math.PI / 2;
      barrel.position.x = 0.3;
      group.add(barrel);
      
      // Stock
      const stockGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.1);
      const stockMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const stock = new THREE.Mesh(stockGeometry, stockMaterial);
      stock.position.x = -0.2;
      group.add(stock);
      
      return group;
    } else if (weaponName.includes('cannon')) {
      // Cannon-like shape
      const group = new THREE.Group();
      
      const cannonGeometry = new THREE.CylinderGeometry(0.05, 0.03, 0.4, 8);
      const cannonMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
      const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
      cannon.rotation.z = Math.PI / 2;
      group.add(cannon);
      
      return group;
    } else {
      // Default pistol-like shape
      const weaponGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.3);
      const weaponMaterial = new THREE.MeshPhongMaterial({ color: this.currentWeapon.color });
      return new THREE.Mesh(weaponGeometry, weaponMaterial);
    }
  }

  fire(position, direction, playerAccuracy = 1.0) {
    if (!this.currentWeapon) return null;

    const shot = this.currentWeapon.fire(position, direction, playerAccuracy);
    
    if (shot) {
      this.createMuzzleFlash(position);
      
      // Handle multiple pellets for shotguns
      if (Array.isArray(shot)) {
        // Shotgun - fire multiple pellets
        if (this.bulletSystem) {
          shot.forEach((pellet, index) => {
            this.bulletSystem.fireBullet(pellet.position, pellet.direction, this.currentWeapon.weaponType);
          });
          console.log(`🔫 Fired ${this.currentWeapon.name} with ${shot.length} pellets!`);
        }
      } else {
        // Single bullet
        if (this.bulletSystem) {
          this.bulletSystem.fireBullet(shot.position, shot.direction, this.currentWeapon.weaponType);
          console.log(`🔫 Fired ${this.currentWeapon.name} bullet!`);
        }
      }
      
      return shot;
    }
    
    return null;
  }

  createMuzzleFlash(position) {
    // Create muzzle flash effect
    const flashGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      transparent: true,
      opacity: 0.8
    });
    
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(position);
    flash.position.add(new THREE.Vector3(0, 0, -0.5)); // In front of player
    
    this.scene.add(flash);
    this.muzzleFlash = flash; // Store the flash object
    
    // Remove flash after short time
    setTimeout(() => {
      this.scene.remove(flash);
      this.muzzleFlash = null; // Clear the reference
    }, 50);
  }

  reload() {
    if (this.currentWeapon) {
      return this.currentWeapon.reload();
    }
    return false;
  }

  getCurrentWeapon() {
    return this.currentWeapon;
  }

  getAmmoStatus() {
    if (this.currentWeapon) {
      return this.currentWeapon.getAmmoStatus();
    }
    return { current: 0, capacity: 0, isReloading: false };
  }

  update(deltaTime) {
    // Update weapon position/animation
    if (this.weaponMesh) {
      // Simple weapon sway - add to base rotation instead of overriding
      const baseYRotation = Math.PI/2 + Math.PI; // 90 + 180 = 270 degrees to point forward
      const swayAmount = Math.sin(Date.now() * 0.001) * 0.02;
      this.weaponMesh.rotation.y = baseYRotation + swayAmount;
    }
  }

  updateCameraViewMode(isFrontView) {
    // Weapon stays attached to hamster in both front and back third-person views
    // No changes needed since we're always in third-person mode
    console.log(`🔫 Camera view changed to ${isFrontView ? 'front' : 'back'} third-person, weapon remains attached to hamster`);
  }

  // Method to refresh weapon with loaded GLB models
  refreshWeaponWithLoadedAssets() {
    if (this.currentWeapon) {
      console.log(`🔄 Refreshing weapon ${this.currentWeapon.name} with loaded GLB assets`);
      this.createWeaponMesh();
    }
  }
}

export function getRandomWeapon() {
  const weaponNames = Object.keys(WEAPONS);
  const randomIndex = Math.floor(Math.random() * weaponNames.length);
  return weaponNames[randomIndex];
}

export function getWeaponForClass(className) {
  const classWeapons = {
    'Tactical Chewer': 'scarh',
    'Fluff \'n\' reload': 'ak47', 
    'Squeak or be Squeakened': 'mini_uzi',
    'Guns and Whiskers': 'aug_a1'
  };
  
  return classWeapons[className] || 'ak47';
} 