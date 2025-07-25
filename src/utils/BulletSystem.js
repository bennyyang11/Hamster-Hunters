// Bullet system for Hamster Hunter
import * as THREE from 'three';

export class BulletSystem {
  constructor(scene, assetLoader) {
    this.scene = scene;
    this.assetLoader = assetLoader;
    this.bullets = [];
    this.bulletModel = null;
    this.maxBullets = 100; // Bullet pooling for performance
    this.bulletSpeed = 10000; // Ultra-fast bullets for competitive gameplay (5x faster)
    this.bulletLifetime = 10.0; // Bullets can travel much farther (10 seconds)
    
    // Player collision tracking for multiplayer
    this.otherPlayers = new Map(); // Will store other player positions and hitboxes
    
    console.log('🔫 Bullet system initialized');
    this.loadBulletModel();
  }

  async loadBulletModel() {
    try {
      console.log('📦 Loading bullet model...');
      this.bulletModel = await this.assetLoader.loadWeaponModel('bullet', '/assets/models/weapons/bullet.glb');
      console.log('✅ Bullet model loaded successfully');
    } catch (error) {
      console.warn('⚠️ Could not load bullet model, using fallback:', error);
      this.createFallbackBullet();
    }
  }

  createFallbackBullet() {
    // Create a larger, more visible bullet for long-distance combat
    const geometry = new THREE.SphereGeometry(0.5, 12, 8); // Much bigger and more detailed
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, // Bright red for visibility
      emissive: 0x440000 // Slight glow effect
    });
    this.bulletModel = new THREE.Mesh(geometry, material);
    console.log('🔴 Using enhanced visibility bullet geometry');
  }

  fireBullet(startPosition, direction, weaponType = 'rifle') {
    if (!this.bulletModel) {
      console.warn('⚠️ Bullet model not ready');
      return;
    }

    // Create bullet instance
    const bulletMesh = this.bulletModel.clone();
    
    // Adjust bullet size based on weapon type
    const bulletScale = this.getBulletScale(weaponType);
    bulletMesh.scale.setScalar(bulletScale);
    
    // Position the bullet
    bulletMesh.position.copy(startPosition);
    
    // Add slight offset so bullet doesn't start inside the weapon
    const offset = direction.clone().multiplyScalar(2);
    bulletMesh.position.add(offset);
    
    // Rotate bullet to face direction of travel
    bulletMesh.lookAt(bulletMesh.position.clone().add(direction));
    
    // Add to scene
    this.scene.add(bulletMesh);
    
    // Store bullet data
    const bullet = {
      mesh: bulletMesh,
      velocity: direction.clone().multiplyScalar(this.bulletSpeed),
      lifetime: this.bulletLifetime,
      age: 0,
      weaponType: weaponType,
      startPosition: startPosition.clone(),
      direction: direction.clone()
    };
    
    this.bullets.push(bullet);
    
    // Add bullet trail effect
    this.addBulletTrail(bullet);
    
    console.log(`🔫 Fired ${weaponType} bullet! Active bullets: ${this.bullets.length}`);
    console.log(`🔫 Bullet start: (${startPosition.x.toFixed(1)}, ${startPosition.y.toFixed(1)}, ${startPosition.z.toFixed(1)})`);
    console.log(`🔫 Bullet direction: (${direction.x.toFixed(3)}, ${direction.y.toFixed(3)}, ${direction.z.toFixed(3)})`);
    console.log(`🚀 Bullet speed: ${this.bulletSpeed}, Max distance: ${this.bulletSpeed * this.bulletLifetime} units`);
    
    // Clean up old bullets if too many
    if (this.bullets.length > this.maxBullets) {
      this.removeBullet(0);
    }
    
    return bullet;
  }

  getBulletScale(weaponType) {
    const scaleMap = {
      'SMG': 0.8,            // MP5, UZI - small, fast bullets
      'Assault Rifle': 1.2,  // AK47, AN94 - medium bullets
      'Battle Rifle': 1.8,   // SCAR-H - large, powerful bullets
      'Shotgun': 0.6,        // Model 870, SPAS-12 - pellets (smaller per pellet)
      'rifle': 1.5,          // Fallback compatibility
      'smg': 1.0,            // Fallback compatibility
      'shotgun': 2.0,        // Fallback compatibility  
      'precision': 2.5,      // Fallback compatibility
      'default': 1.2
    };
    
    return scaleMap[weaponType] || scaleMap.default;
  }

  addBulletTrail(bullet) {
    // Create a more visible trail effect for long-distance shooting
    const trailGeometry = new THREE.CylinderGeometry(0.1, 0.2, 3, 8); // Bigger, more visible trail
    const trailMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00, // Bright yellow for better visibility
      transparent: true, 
      opacity: 0.8 
    });
    
    const trail = new THREE.Mesh(trailGeometry, trailMaterial);
    trail.position.copy(bullet.mesh.position);
    trail.lookAt(bullet.mesh.position.clone().sub(bullet.velocity.clone().normalize()));
    
    this.scene.add(trail);
    bullet.trail = trail;
    
    // Trail lasts longer for long-distance visibility
    setTimeout(() => {
      if (trail.parent) {
        this.scene.remove(trail);
      }
    }, 1000); // Trail visible for 1 second
  }

  update(deltaTime) {
    // Update all bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      // Update position
      const movement = bullet.velocity.clone().multiplyScalar(deltaTime);
      bullet.mesh.position.add(movement);
      
      // Update age
      bullet.age += deltaTime;
      
      // Check for collisions with other players FIRST (highest priority)
      if (this.checkPlayerCollisions(bullet)) {
        console.log('🎯 💥 BULLET HIT PLAYER! Removing bullet.');
        this.removeBullet(i);
        continue;
      }
      
      // Check for collisions with map/environment
      if (this.checkBulletCollision(bullet)) {
        this.createBulletImpact(bullet);
        this.removeBullet(i);
        continue;
      }
      
      // Remove old bullets
      if (bullet.age >= bullet.lifetime) {
        this.removeBullet(i);
        continue;
      }
      
      // Remove bullets that are too far from origin (much higher limit for long-distance combat)
      if (bullet.mesh.position.length() > 10000) { // Allow bullets to travel 10,000 units
        console.log(`🌌 Bullet traveled too far: ${bullet.mesh.position.length().toFixed(1)} units`);
        this.removeBullet(i);
        continue;
      }
    }
  }

  checkBulletCollision(bullet) {
    // Very lenient ground collision - only stop bullets if they go way below ground
    if (bullet.mesh.position.y <= -50) { // Much lower ground level - bullets can fly over terrain
      console.log(`💥 Bullet hit ground at Y=${bullet.mesh.position.y.toFixed(1)}`);
      return true;
    }
    
    // Could add more sophisticated collision detection here (player vs player, etc.)
    return false;
  }

  createBulletImpact(bullet) {
    // Create impact effect
    const impactGeometry = new THREE.RingGeometry(0.5, 1.5, 8);
    const impactMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x888888, 
      transparent: true, 
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const impact = new THREE.Mesh(impactGeometry, impactMaterial);
    impact.position.copy(bullet.mesh.position);
    impact.rotation.x = -Math.PI / 2; // Lay flat on ground
    
    this.scene.add(impact);
    
    // Fade out impact
    const fadeOut = () => {
      if (impact.material.opacity > 0) {
        impact.material.opacity -= 0.02;
        requestAnimationFrame(fadeOut);
      } else {
        this.scene.remove(impact);
      }
    };
    fadeOut();
    
    console.log('💥 Bullet impact!');
  }

  removeBullet(index) {
    const bullet = this.bullets[index];
    if (bullet) {
      // Remove from scene
      this.scene.remove(bullet.mesh);
      
      // Remove trail if it exists
      if (bullet.trail && bullet.trail.parent) {
        this.scene.remove(bullet.trail);
      }
      
      // Remove from array
      this.bullets.splice(index, 1);
    }
  }

  // Get bullet count for debugging
  getBulletCount() {
    return this.bullets.length;
  }

  // Clear all bullets (useful for level transitions)
  clearAllBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.removeBullet(i);
    }
    console.log('🧹 All bullets cleared');
  }

  // Register other players for collision detection
  setOtherPlayers(otherPlayersMap) {
    this.otherPlayers = otherPlayersMap;
  }

  // Add a single other player for collision detection
  addOtherPlayer(playerId, playerData) {
    this.otherPlayers.set(playerId, playerData);
  }

  // Remove a player from collision detection
  removeOtherPlayer(playerId) {
    if (this.otherPlayers.has(playerId)) {
      this.otherPlayers.delete(playerId);
      console.log(`🔫 Removed player ${playerId} from bullet collision detection`);
    }
  }

  // Clear all other players (for game reset)
  clearAllOtherPlayers() {
    const playerCount = this.otherPlayers.size;
    this.otherPlayers.clear();
    console.log(`🔫 Cleared ${playerCount} players from bullet collision detection`);
  }

  // Check if bullet hits any other players
  checkPlayerCollisions(bullet) {
    if (!this.otherPlayers || this.otherPlayers.size === 0) {
      return false;
    }

    const bulletPos = bullet.mesh.position;
    const bulletRadius = 5; // Bullet collision radius

    for (const [playerId, playerData] of this.otherPlayers) {
      // Skip local player - never hit yourself!
      if (playerId === 'local_player' || 
          playerData?.mesh?.userData?.isLocalPlayer === true ||
          !playerData || !playerData.position || !playerData.mesh) {
        continue;
      }

      const playerPos = playerData.position;
      
      // Calculate distance to player
      const distance = bulletPos.distanceTo(playerPos);
      
      // Large hamster hitbox (scaled to match the 75x scale)
      const playerHitboxRadius = 60; // Adjusted for large hamster size
      
      if (distance <= (bulletRadius + playerHitboxRadius)) {
        console.log(`🎯 BULLET HIT OTHER PLAYER! Distance: ${distance.toFixed(1)}, Player: ${playerId}`);
        console.log(`🔍 Bullet: (${bulletPos.x.toFixed(1)}, ${bulletPos.y.toFixed(1)}, ${bulletPos.z.toFixed(1)})`);
        console.log(`🐹 Player: (${playerPos.x.toFixed(1)}, ${playerPos.y.toFixed(1)}, ${playerPos.z.toFixed(1)})`);
        
        // Create hit effect at collision point
        this.createPlayerHitEffect(bulletPos, playerPos);
        
        return true; // Hit detected
      }
    }

    return false; // No hit
  }

  // Create visual effect when bullet hits a player
  createPlayerHitEffect(bulletPos, playerPos) {
    // Create small explosion effect at hit point
    const effectGeometry = new THREE.SphereGeometry(2, 8, 6);
    const effectMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff4444, 
      transparent: true, 
      opacity: 0.8 
    });
    const effectMesh = new THREE.Mesh(effectGeometry, effectMaterial);
    
    // Position effect at collision point
    effectMesh.position.lerpVectors(bulletPos, playerPos, 0.5);
    this.scene.add(effectMesh);
    
    // Animate and remove effect
    let scale = 1;
    let opacity = 0.8;
    const animate = () => {
      scale += 0.2;
      opacity -= 0.04;
      
      effectMesh.scale.setScalar(scale);
      effectMaterial.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(effectMesh);
        effectGeometry.dispose();
        effectMaterial.dispose();
      }
    };
    animate();
  }
} 