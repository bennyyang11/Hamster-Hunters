// Test Dummy for Hamster Hunter - For testing bullets and hitboxes
import * as THREE from 'three';

export class TestDummy {
  constructor(scene, assetLoader, position = new THREE.Vector3(0, 40, 0), showHitbox = false) {
    this.scene = scene;
    this.assetLoader = assetLoader;
    this.position = position;
    this.mesh = null;
    this.hitbox = null;
    this.health = 100;
    this.maxHealth = 100;
    this.isActive = false;
    this.showHitbox = showHitbox; // Debug option to visualize hitbox
    
    console.log('🎯 Test dummy initialized');
    this.createTestDummy();
  }

  async createTestDummy() {
    try {
      console.log('📦 Loading test dummy hamster model...');
      
      // Load the hamster model
      const hamsterModel = await this.assetLoader.loadWeaponModel('test_hamster', '/hamster.glb');
      
      if (hamsterModel) {
        // Clone the model for the test dummy
        this.mesh = hamsterModel.clone();
        
        // Position the dummy at the center of the map
        this.mesh.position.copy(this.position);
        
        // Scale it appropriately (same as player hamster)
        this.mesh.scale.setScalar(75); // Same scale as player hamster
        
        // Add a slight rotation for better visibility
        this.mesh.rotation.y = Math.PI / 4; // 45 degree rotation
        
        // Get the actual bounding box of the hamster model to align hitbox properly
        this.mesh.updateMatrixWorld();
        const modelBoundingBox = new THREE.Box3().setFromObject(this.mesh);
        const modelSize = modelBoundingBox.getSize(new THREE.Vector3());
        const modelCenter = modelBoundingBox.getCenter(new THREE.Vector3());
        
        console.log(`🐹 Hamster model size: ${modelSize.x.toFixed(1)} × ${modelSize.y.toFixed(1)} × ${modelSize.z.toFixed(1)}`);
        console.log(`🐹 Hamster model center: (${modelCenter.x.toFixed(1)}, ${modelCenter.y.toFixed(1)}, ${modelCenter.z.toFixed(1)})`);
        console.log(`🐹 Hamster model bounds: min(${modelBoundingBox.min.y.toFixed(1)}) max(${modelBoundingBox.max.y.toFixed(1)})`);
        
        // Create hitbox that covers the hamster body and head precisely
        // Model bounds often include extra space, so be more conservative
        const hitboxWidth = modelSize.x * 0.6;   // 60% of model width
        const hitboxHeight = modelSize.y * 0.65; // 65% of model height (tighter to actual hamster)
        const hitboxDepth = modelSize.z * 0.6;   // 60% of model depth
        
        // Create hitbox geometry - aligned with model bounds
        const hitboxGeometry = new THREE.BoxGeometry(hitboxWidth, hitboxHeight, hitboxDepth);
        const hitboxMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xff0000, 
          transparent: true, 
          opacity: this.showHitbox ? 0.3 : 0.0, // Visible in debug mode
          wireframe: this.showHitbox
        });
        
        this.hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
        // Position hitbox slightly lower than model center to focus on hamster body/head area
        const hitboxCenter = modelCenter.clone();
        hitboxCenter.y = modelCenter.y - (modelSize.y * 0.1); // Lower by 10% of model height
        this.hitbox.position.copy(hitboxCenter);
        
                                   console.log(`📦 Created precise hitbox: ${hitboxWidth.toFixed(1)}×${hitboxHeight.toFixed(1)}×${hitboxDepth.toFixed(1)} units`);
          console.log(`📦 Model center: (${modelCenter.x.toFixed(1)}, ${modelCenter.y.toFixed(1)}, ${modelCenter.z.toFixed(1)})`);
          console.log(`📦 Hitbox positioned at: (${hitboxCenter.x.toFixed(1)}, ${hitboxCenter.y.toFixed(1)}, ${hitboxCenter.z.toFixed(1)})`);
        
        // Mark as non-collidable for collision system
        this.mesh.userData.isTestDummy = true;
        this.mesh.userData.skipCollision = true;
        this.hitbox.userData.isTestDummy = true;
        this.hitbox.userData.skipCollision = true;
        
        // Add to scene
        this.scene.add(this.mesh);
        this.scene.add(this.hitbox);
        
        // Add floating health indicator
        this.createHealthIndicator();
        
        // Add target indicator for better visibility
        this.createTargetIndicator();
        
        this.isActive = true;
        console.log('✅ Test dummy created successfully at position:', this.position);
        
        // Add gentle bobbing animation
        this.startBobbingAnimation();
        
      } else {
        console.error('❌ Failed to load hamster model for test dummy');
        this.createFallbackDummy();
      }
    } catch (error) {
      console.error('❌ Error creating test dummy:', error);
      this.createFallbackDummy();
    }
  }

  createFallbackDummy() {
    console.log('🎯 Creating fallback test dummy...');
    
    // Create a simple orange sphere as fallback
    const geometry = new THREE.SphereGeometry(25, 16, 12);
    const material = new THREE.MeshLambertMaterial({ color: 0xffa500 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    
    // Create precise hitbox for fallback dummy - proportional to visual sphere
    const visualRadius = 25;
    const hitboxRadius = visualRadius * 0.8; // 80% of visual size for precision
    const hitboxGeometry = new THREE.SphereGeometry(hitboxRadius, 8, 6);
    const hitboxMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: this.showHitbox ? 0.3 : 0.0, // Visible in debug mode
      wireframe: this.showHitbox
    });
    this.hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
    this.hitbox.position.copy(this.position);
    
    console.log(`📦 Created precise fallback hitbox: ${hitboxRadius.toFixed(1)} unit radius sphere`);
    console.log(`📦 Fallback hitbox positioned at: (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}, ${this.position.z.toFixed(1)})`);
    
    // Mark as non-collidable for collision system
    this.mesh.userData.isTestDummy = true;
    this.mesh.userData.skipCollision = true;
    this.hitbox.userData.isTestDummy = true;
    this.hitbox.userData.skipCollision = true;
    
    this.scene.add(this.mesh);
    this.scene.add(this.hitbox);
    this.createHealthIndicator();
    this.createTargetIndicator();
    this.isActive = true;
    
    console.log('🟠 Fallback test dummy created');
  }

  createHealthIndicator() {
    // Create floating health bar above dummy
    const barWidth = 50;
    const barHeight = 8;
    
    // Background bar (red)
    const bgGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    this.healthBarBg = new THREE.Mesh(bgGeometry, bgMaterial);
    
    // Health bar (green)
    const healthGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
    const healthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    this.healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
    
    // Position above dummy
    const healthBarHeight = this.position.y + 60;
    this.healthBarBg.position.set(this.position.x, healthBarHeight, this.position.z);
    this.healthBar.position.set(this.position.x, healthBarHeight + 0.1, this.position.z);
    
    // Make bars always face camera
    this.healthBarBg.lookAt(0, healthBarHeight, 100);
    this.healthBar.lookAt(0, healthBarHeight, 100);
    
    this.scene.add(this.healthBarBg);
    this.scene.add(this.healthBar);

    // Add "TEST DUMMY" label
    this.createLabel();
  }

  createLabel() {
    // Create a simple text label (using a plane with text-like appearance)
    const labelGeometry = new THREE.PlaneGeometry(60, 12);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    this.label = new THREE.Mesh(labelGeometry, labelMaterial);
    
    // Position above health bar
    const labelHeight = this.position.y + 75;
    this.label.position.set(this.position.x, labelHeight, this.position.z);
    this.label.lookAt(0, labelHeight, 100);
    
    this.scene.add(this.label);
  }

  createTargetIndicator() {
    // Create target crosshairs around the dummy for better aiming
    const crosshairMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6600, 
      transparent: true, 
      opacity: 0.8 
    });
    
    // Vertical crosshair
    const vGeometry = new THREE.PlaneGeometry(2, 80);
    this.verticalCrosshair = new THREE.Mesh(vGeometry, crosshairMaterial);
    this.verticalCrosshair.position.copy(this.position);
    this.verticalCrosshair.position.z -= 5; // Slightly behind dummy
    
    // Horizontal crosshair
    const hGeometry = new THREE.PlaneGeometry(80, 2);
    this.horizontalCrosshair = new THREE.Mesh(hGeometry, crosshairMaterial);
    this.horizontalCrosshair.position.copy(this.position);
    this.horizontalCrosshair.position.z -= 5; // Slightly behind dummy
    
    // Target circles
    const ringGeometry1 = new THREE.RingGeometry(25, 27, 32);
    const ringGeometry2 = new THREE.RingGeometry(35, 37, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff3300, 
      transparent: true, 
      opacity: 0.6,
      side: THREE.DoubleSide 
    });
    
    this.targetRing1 = new THREE.Mesh(ringGeometry1, ringMaterial);
    this.targetRing1.position.copy(this.position);
    this.targetRing1.position.z -= 3;
    this.targetRing1.rotation.x = Math.PI / 2;
    
    this.targetRing2 = new THREE.Mesh(ringGeometry2, ringMaterial);
    this.targetRing2.position.copy(this.position);
    this.targetRing2.position.z -= 3;
    this.targetRing2.rotation.x = Math.PI / 2;
    
    // Add all target indicators to scene
    this.scene.add(this.verticalCrosshair);
    this.scene.add(this.horizontalCrosshair);
    this.scene.add(this.targetRing1);
    this.scene.add(this.targetRing2);
    
    console.log('🎯 Target indicator created for better aiming');
  }

  // Add visual debugging method 
  addDebugMarker() {
    // Create a bright marker at the dummy's exact position
    const markerGeometry = new THREE.SphereGeometry(5, 8, 6);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: false
    });
    this.debugMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    this.debugMarker.position.copy(this.position);
    this.debugMarker.position.y += 50; // Above the dummy
    this.scene.add(this.debugMarker);
    
    console.log(`🔍 Debug marker added at: (${this.position.x}, ${this.position.y + 50}, ${this.position.z})`);
  }

  startBobbingAnimation() {
    if (!this.mesh) return;
    
    const originalY = this.position.y;
    let time = 0;
    
    const animate = () => {
      if (!this.isActive) return;
      
      time += 0.02;
      const bobOffset = Math.sin(time) * 2; // 2 unit bobbing range
      this.mesh.position.y = originalY + bobOffset;
      
      // Also rotate slowly
      this.mesh.rotation.y += 0.005;
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  // Toggle hitbox visibility for debugging
  toggleHitboxVisibility() {
    this.showHitbox = !this.showHitbox;
    if (this.hitbox) {
      this.hitbox.material.opacity = this.showHitbox ? 0.3 : 0.0;
      this.hitbox.material.wireframe = this.showHitbox;
      console.log(`🔍 Hitbox visibility: ${this.showHitbox ? 'ON' : 'OFF'}`);
      if (this.showHitbox) {
        console.log(`🔍 Hitbox position: (${this.hitbox.position.x.toFixed(1)}, ${this.hitbox.position.y.toFixed(1)}, ${this.hitbox.position.z.toFixed(1)})`);
        if (this.mesh) {
          console.log(`🔍 Model position: (${this.mesh.position.x.toFixed(1)}, ${this.mesh.position.y.toFixed(1)}, ${this.mesh.position.z.toFixed(1)})`);
        }
      }
    }
  }

  // Enable hitbox visibility for debugging head shots
  enableHitboxDebug() {
    this.showHitbox = true;
    if (this.hitbox) {
      this.hitbox.material.opacity = 0.5; // More visible for debugging
      this.hitbox.material.wireframe = true;
      console.log('🔍 DEBUG MODE: Hitbox now visible for head shot debugging');
      console.log(`🔍 Aim for the RED BOX to hit the dummy`);
      
      // Show hitbox boundaries
      const hitboxBounds = new THREE.Box3().setFromObject(this.hitbox);
      console.log(`🔍 Hitbox Y boundaries: ${hitboxBounds.min.y.toFixed(1)} (bottom) to ${hitboxBounds.max.y.toFixed(1)} (top)`);
      console.log(`🔍 Hitbox height: ${(hitboxBounds.max.y - hitboxBounds.min.y).toFixed(1)} units`);
    }
  }

  // Check if a bullet hits this dummy - using ray-based collision for accurate long-distance shots
  checkBulletHit(bulletPosition, bulletDirection = null, bulletRadius = 5, bulletSpeed = 50) {
    if (!this.isActive || !this.hitbox) {
      return false;
    }
    
    // Use precise hitbox for collision detection
    if (this.hitbox) {
      // Create a ray from bullet position in the direction it's traveling
      if (bulletDirection) {
        // Ray-based collision detection for moving bullets
        const raycaster = new THREE.Raycaster();
        raycaster.set(bulletPosition, bulletDirection.normalize());
        
        // Check intersection with the hitbox
        const intersects = raycaster.intersectObject(this.hitbox);
        
        if (intersects.length > 0) {
          // Check if intersection is within reasonable bullet travel distance
          const intersection = intersects[0];
          const distanceToHit = intersection.distance;
          
                     // Allow hits within bullet speed range (accounts for frame rate variations)
           if (distanceToHit <= bulletSpeed * 1.2) {
            console.log(`🎯 RAY HIT! Bullet intersected test dummy at distance ${distanceToHit.toFixed(1)}`);
            console.log(`🔍 Bullet: (${bulletPosition.x.toFixed(1)}, ${bulletPosition.y.toFixed(1)}, ${bulletPosition.z.toFixed(1)})`);
            console.log(`🎯 Hit Point: (${intersection.point.x.toFixed(1)}, ${intersection.point.y.toFixed(1)}, ${intersection.point.z.toFixed(1)})`);
            this.takeDamage(25);
            return true;
          }
        }
      }
      
             // Fallback: Check if bullet is close to the hitbox (for stationary or slow bullets)
       const boundingBox = new THREE.Box3().setFromObject(this.hitbox);
       
       // Expand bounding box slightly for bullet radius only
       const expansion = bulletRadius + 3; // Minimal expansion for precise hit detection
       boundingBox.expandByScalar(expansion);
      
      const hit = boundingBox.containsPoint(bulletPosition);
      
      if (hit) {
        console.log(`🎯 PROXIMITY HIT! Bullet within expanded hitbox`);
        console.log(`🔍 Bullet: (${bulletPosition.x.toFixed(1)}, ${bulletPosition.y.toFixed(1)}, ${bulletPosition.z.toFixed(1)})`);
        console.log(`📦 Expanded BBox: min(${boundingBox.min.x.toFixed(1)}, ${boundingBox.min.y.toFixed(1)}, ${boundingBox.min.z.toFixed(1)}) max(${boundingBox.max.x.toFixed(1)}, ${boundingBox.max.y.toFixed(1)}, ${boundingBox.max.z.toFixed(1)})`);
        this.takeDamage(25);
        return true;
      }
      
      // Only log misses occasionally to avoid console spam
      if (Math.random() < 0.1) {
        console.log('🚫 Miss - bullet ray/proximity missed dummy hitbox');
      }
      return false;
      
          } else {
       // Fallback to distance-based detection
       const distance = bulletPosition.distanceTo(this.position);
       const hitRadius = 20; // Precise hit radius for competitive gameplay
      
      const hit = distance <= hitRadius;
      
      if (hit) {
        console.log('🎯 HIT! (fallback distance detection)');
        this.takeDamage(25);
        return true;
      }
      return false;
    }
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    console.log(`🎯 💥 TEST DUMMY HIT! Damage: ${damage}, Health: ${this.health}/${this.maxHealth}`);
    
    // Update health bar
    this.updateHealthBar();
    
    // Create hit effect
    this.createHitEffect();
    
    // Shake the dummy briefly
    this.createShakeEffect();
    
    // Reset health if it reaches 0
    if (this.health <= 0) {
      console.log('💀 Test dummy defeated! Resetting in 2 seconds...');
      setTimeout(() => {
        this.health = this.maxHealth;
        this.updateHealthBar();
        console.log('♻️ Test dummy health reset - ready for more target practice!');
      }, 2000);
    }
  }

  createShakeEffect() {
    if (!this.mesh) return;
    
    const originalPosition = this.position.clone();
    let shakeTime = 0;
    const shakeDuration = 0.2; // 200ms shake
    const shakeIntensity = 3;
    
    const shake = () => {
      shakeTime += 0.016; // ~60fps
      
      if (shakeTime < shakeDuration) {
        // Apply random shake offset
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeZ = (Math.random() - 0.5) * shakeIntensity;
        
        this.mesh.position.x = originalPosition.x + shakeX;
        this.mesh.position.z = originalPosition.z + shakeZ;
        
        requestAnimationFrame(shake);
      } else {
        // Reset to original position
        this.mesh.position.copy(originalPosition);
      }
    };
    
    shake();
  }

  updateHealthBar() {
    if (!this.healthBar) return;
    
    const healthPercent = this.health / this.maxHealth;
    
    // Update health bar width by scaling
    this.healthBar.scale.x = healthPercent;
    
    // Keep health bar centered by adjusting position
    const barWidth = 50;
    const healthBarOffset = (barWidth * (1 - healthPercent)) / 2;
    this.healthBar.position.x = this.position.x - healthBarOffset;
    
    // Change color based on health with clear transitions
    if (healthPercent > 0.7) {
      this.healthBar.material.color.setHex(0x00ff00); // Bright Green
    } else if (healthPercent > 0.4) {
      this.healthBar.material.color.setHex(0xffaa00); // Orange
    } else {
      this.healthBar.material.color.setHex(0xff0000); // Bright Red
    }
    
    console.log(`💊 Health bar updated: ${this.health}/${this.maxHealth} (${(healthPercent * 100).toFixed(1)}%)`);
  }

  createHitEffect() {
    console.log('💥 Creating hit effect on test dummy!');
    
    // Create multiple hit effects for better visibility
    
    // 1. Large red flash sphere
    const flashGeometry = new THREE.SphereGeometry(45, 12, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0.8 
    });
    const flashEffect = new THREE.Mesh(flashGeometry, flashMaterial);
    flashEffect.position.copy(this.position);
    this.scene.add(flashEffect);
    
    // 2. Bright yellow spark effect
    const sparkGeometry = new THREE.SphereGeometry(20, 8, 6);
    const sparkMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00, 
      transparent: true, 
      opacity: 1.0 
    });
    const sparkEffect = new THREE.Mesh(sparkGeometry, sparkMaterial);
    sparkEffect.position.copy(this.position);
    sparkEffect.position.y += 10; // Slightly higher
    this.scene.add(sparkEffect);
    
    // 3. Impact ring effect
    const ringGeometry = new THREE.RingGeometry(30, 50, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const ringEffect = new THREE.Mesh(ringGeometry, ringMaterial);
    ringEffect.position.copy(this.position);
    ringEffect.rotation.x = Math.PI / 2; // Horizontal ring
    this.scene.add(ringEffect);
    
    // Animate all effects
    let time = 0;
    const animateEffects = () => {
      time += 0.05;
      
      // Flash effect - quick fade
      flashEffect.material.opacity = Math.max(0, 0.8 - time * 4);
      flashEffect.scale.setScalar(1 + time * 0.5);
      
      // Spark effect - quick bright flash
      sparkEffect.material.opacity = Math.max(0, 1.0 - time * 6);
      sparkEffect.scale.setScalar(1 + time * 2);
      
      // Ring effect - expanding ring
      ringEffect.material.opacity = Math.max(0, 0.9 - time * 3);
      ringEffect.scale.setScalar(1 + time * 3);
      
      if (time < 0.5) {
        requestAnimationFrame(animateEffects);
      } else {
        // Clean up
        this.scene.remove(flashEffect);
        this.scene.remove(sparkEffect);
        this.scene.remove(ringEffect);
        console.log('✨ Hit effect cleanup completed');
      }
    };
    
    animateEffects();
  }

  destroy() {
    this.isActive = false;
    
    if (this.mesh) this.scene.remove(this.mesh);
    if (this.hitbox) this.scene.remove(this.hitbox);
    if (this.healthBar) this.scene.remove(this.healthBar);
    if (this.healthBarBg) this.scene.remove(this.healthBarBg);
    if (this.label) this.scene.remove(this.label);
    if (this.verticalCrosshair) this.scene.remove(this.verticalCrosshair);
    if (this.horizontalCrosshair) this.scene.remove(this.horizontalCrosshair);
    if (this.targetRing1) this.scene.remove(this.targetRing1);
    if (this.targetRing2) this.scene.remove(this.targetRing2);
    if (this.debugMarker) this.scene.remove(this.debugMarker);
    
    console.log('🎯 Test dummy destroyed');
  }
} 