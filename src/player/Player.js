import * as THREE from 'three';
import { HAMSTER_CHARACTERS, getCharacterMeshColor, calculateFinalStats, getRandomCharacter, getRandomClass } from './HamsterCharacters.js';
import { WeaponManager, getWeaponForClass } from '../weapons/WeaponSystem.js';

export class Player {
  constructor(id, character, combatClass, position, scene, assetLoader = null, camera = null) {
    this.id = id;
    this.character = character;
    this.combatClass = combatClass;
    this.scene = scene;
    this.assetLoader = assetLoader;
    
    // Position and movement (higher spawn for large hamster)
    this.position = position || new THREE.Vector3(0, 40, 0); // Higher for large hamster
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.direction = new THREE.Vector3(0, 0, -1);
    this.rotation = { x: 0, y: 0 };
    
    // Physics properties (missing)
    this.groundCheckRay = new THREE.Raycaster();
    this.isOnGround = true;
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.jumpHeight = 50; // Realistic FPS jump height
    this.gravity = 60; // Strong gravity for snappy, realistic jumps
    this.friction = 0.85;
    this.speed = 250; // LARGE hamster speed (33x faster!)
    this.sprintMultiplier = 2.5; // Even faster when sprinting
    this.isSprinting = false;
    
    // Camera properties - use provided camera or find in scene
    this.camera = camera || scene.children.find(child => child.isCamera) || new THREE.PerspectiveCamera();
    this.cameraRotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.mouseSensitivity = 0.003; // Increased for better responsiveness
    this.cameraDistance = 180; // Default camera distance (zoomable)
    this.minCameraDistance = 80; // Minimum zoom distance
    this.maxCameraDistance = 400; // Maximum zoom distance
    this.mouseSensitivityMultiplier = 2.0; // Default sensitivity multiplier (adjustable in settings)
    
    // Camera view modes
    this.isFrontView = false; // Start in back third-person, toggle to front third-person
    this.lastToggleTime = 0; // Prevent rapid toggling
    
    // Player identification
    this.playerId = id;
    this.playerName = `Player_${id}`;
    
    // Hamster character system (missing)
    this.hamsterCharacter = null;
    this.characterClass = combatClass;
    this.characterMesh = null;
    this.bodyMesh = null;
    
    // Input manager (missing)
    this.inputManager = null; // Will be set up if local player
    
    // Player stats (affected by character and class)
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.isAlive = true;
    this.team = 'red'; // Default team
    this.kills = 0;
    this.deaths = 0;
    this.damage = 1.0;
    this.accuracy = 1.0;
    
    // Create weapon manager with AssetLoader and camera
    this.weaponManager = new WeaponManager(this.scene, this.assetLoader, this.camera);
    
    // Class weapon loadouts
    this.primaryWeapon = null;
    this.secondaryWeapon = null;
    this.currentWeaponSlot = 'primary'; // 'primary' or 'secondary'
    
    // Initialize player with character/class bonuses
    this.initializePlayerStats();
    
    // Create player mesh
    this.createPlayerMesh();
    
    // Setup class weapons and equip default
    this.setupClassWeapons();
  }

  // Add the missing method
  initializePlayerStats() {
    // Apply character-specific stat bonuses
    const character = this.hamsterCharacter;
    const characterClass = this.characterClass;
    
    // Base stats
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.speed = 250; // LARGE hamster speed (matching constructor)
    this.damage = 1.0;
    this.accuracy = 1.0;
    
    // Apply character bonuses if available
    if (character && character.stats) {
      this.maxHealth *= character.stats.health || 1.0;
      this.health = this.maxHealth;
      this.speed *= character.stats.speed || 1.0;
      this.damage *= character.stats.damage || 1.0;
      this.accuracy *= character.stats.accuracy || 1.0;
    }
    
    console.log(`🐹 Player ${this.playerId} initialized with character: ${this.hamsterCharacter?.name || 'Default'}, class: ${this.characterClass}`);
  }

  // Setup class weapons and equip primary
  setupClassWeapons() {
    console.log(`🔫 Setting up weapons for class: "${this.characterClass}"`);
    
    // Define class weapon loadouts
    const classWeapons = {
      'Tactical Chewer': { primary: 'scarh', secondary: 'model870' },
      'Fluff \'n\' reload': { primary: 'ak47', secondary: 'mp5' },
      'Squeak or be Squeakened': { primary: 'mini_uzi', secondary: 'spas12' },
      'Guns and Whiskers': { primary: 'aug_a1', secondary: 'an94' }
    };
    
    console.log(`🔍 Available classes:`, Object.keys(classWeapons));
    console.log(`🔍 Looking for class: "${this.characterClass}"`);
    console.log(`🔍 Class found:`, classWeapons[this.characterClass] ? 'YES' : 'NO');
    
    const weapons = classWeapons[this.characterClass] || { primary: 'ak47', secondary: 'mp5' };
    this.primaryWeapon = weapons.primary;
    this.secondaryWeapon = weapons.secondary;
    
    console.log(`🔫 Selected weapons:`, weapons);
    console.log(`🔫 Class weapons: Primary=${this.primaryWeapon}, Secondary=${this.secondaryWeapon}`);
    
    // Equip primary weapon by default
    this.switchToWeapon('primary');
  }

  switchToWeapon(slot) {
    if (!this.weaponManager) {
      console.log('⚠️ No weapon manager available');
      return;
    }
    
    console.log(`🔄 Switch request: ${slot}`);
    console.log(`🔄 Current slot: ${this.currentWeaponSlot}`);
    console.log(`🔄 Primary weapon: ${this.primaryWeapon}`);
    console.log(`🔄 Secondary weapon: ${this.secondaryWeapon}`);
    
    let weaponName = null;
    
    if (slot === 'primary') {
      weaponName = this.primaryWeapon;
      this.currentWeaponSlot = 'primary';
    } else if (slot === 'secondary') {
      weaponName = this.secondaryWeapon;
      this.currentWeaponSlot = 'secondary';
    }
    
    console.log(`🔄 Switching to weapon: ${weaponName} (${slot})`);
    
    if (weaponName) {
      try {
        const success = this.weaponManager.equipWeapon(weaponName);
        if (success) {
          console.log(`🔫 Switched to ${slot} weapon: ${weaponName}`);
          
          // Set up hamster reference for weapon attachment
          this.weaponManager.setHamsterReference(this);
        } else {
          console.log(`⚠️ Failed to switch to ${weaponName} - weapon not found`);
        }
      } catch (error) {
        console.log(`⚠️ Failed to switch to ${weaponName}:`, error);
      }
    }
  }

  switchWeapon(weaponType) {
    // Legacy method - redirect to new system
    if (this.weaponManager) {
      try {
        const success = this.weaponManager.equipWeapon(weaponType);
        if (success) {
          console.log(`🔫 Switched to ${weaponType}`);
        } else {
          console.log(`⚠️ Failed to switch to ${weaponType} - weapon not found`);
        }
      } catch (error) {
        console.log(`⚠️ Failed to switch to ${weaponType}:`, error);
      }
    }
  }

  createPlayerMesh() {
    console.log(`🐹 Creating player mesh for ${this.playerId}...`);
    
    // Try to use the loaded hamster model first
    const hamsterModel = this.assetLoader?.getModel("hamster");
    
    if (hamsterModel) {
      // Use the loaded hamster.glb model
      this.bodyMesh = hamsterModel.clone();
      console.log('✅ Using loaded hamster.glb model');
      
      // Scale the hamster to LARGE size for epic hamster warfare!
      this.bodyMesh.scale.set(75.0, 75.0, 75.0); // LARGE hamster! (25x bigger than original!)
      
      // Position the model
      this.bodyMesh.position.copy(this.position);
      this.bodyMesh.castShadow = true;
      this.bodyMesh.receiveShadow = true;
      
      // Ensure the hamster faces forward
      this.bodyMesh.rotation.y = Math.PI;
      
    } else {
      // Fallback: Create a better-looking hamster with geometric shapes
      console.log('⚠️ Hamster model not found, using fallback geometry');
      
      // Create hamster-like player body with character-specific color
      const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
      const characterColor = getCharacterMeshColor(this.character);
      const bodyMaterial = new THREE.MeshLambertMaterial({ 
        color: characterColor
      });
      
      this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
      this.bodyMesh.position.copy(this.position);
      this.bodyMesh.castShadow = true;
      this.bodyMesh.receiveShadow = true;
      
      // Create hamster ears
      const earGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const earMaterial = new THREE.MeshLambertMaterial({ color: 0xffb366 });
      
      this.leftEar = new THREE.Mesh(earGeometry, earMaterial);
      this.leftEar.position.set(-0.15, 0.5, 0.1);
      this.bodyMesh.add(this.leftEar);
      
      this.rightEar = new THREE.Mesh(earGeometry, earMaterial);
      this.rightEar.position.set(0.15, 0.5, 0.1);
      this.bodyMesh.add(this.rightEar);
      
      // Create hamster tail
      const tailGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);
      const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xff8c42 });
      
      this.tail = new THREE.Mesh(tailGeometry, tailMaterial);
      this.tail.position.set(0, -0.3, -0.3);
      this.tail.rotation.x = Math.PI / 6;
      this.bodyMesh.add(this.tail);
    }
    
    // Always add the body to scene (third-person view)
    this.scene.add(this.bodyMesh);
    console.log('🐹 Player mesh added to scene for third-person view');
  }

  setupCamera() {
    // Configure camera for extended view distance
    this.camera.near = 0.1;
    this.camera.far = 5000; // Extended view distance for large maps
    this.camera.updateProjectionMatrix();
    
    // Position camera for third-person view (behind and above the hamster)
    this.cameraOffset = new THREE.Vector3(0, 3, 5); // Behind and above
    this.updateCamera();
    console.log('📷 Third-person camera setup completed with extended view distance');
  }

  updateCamera() {
    if (this.playerId !== 'local_player') return;
    
    // Calculate camera position based on mouse rotation
    const yaw = this.cameraRotation.y; // Horizontal mouse rotation
    const pitch = this.cameraRotation.x; // Vertical mouse rotation
    
    // Camera settings for third-person view (with zoom support)
    const cameraDistance = this.cameraDistance; // Use dynamic zoom distance
    const cameraHeight = 100; // Fixed height above hamster
    
    if (this.isFrontView) {
      // Front third-person view: camera in front of hamster, looking at it
      const offsetX = -Math.sin(yaw) * cameraDistance; // Opposite direction for front view
      const offsetZ = -Math.cos(yaw) * cameraDistance; // Opposite direction for front view
      
      this.camera.position.set(
        this.position.x + offsetX,
        this.position.y + cameraHeight,
        this.position.z + offsetZ
      );
      
      // Look at the hamster (center point)
      const lookAtTarget = new THREE.Vector3(
        this.position.x,
        this.position.y + 45, // Look at hamster's center
        this.position.z
      );
      
      this.camera.lookAt(lookAtTarget);
    } else {
      // Back third-person view: camera behind and above hamster
      const offsetX = Math.sin(yaw) * cameraDistance;
      const offsetZ = Math.cos(yaw) * cameraDistance;
      
      this.camera.position.set(
        this.position.x + offsetX,
        this.position.y + cameraHeight,
        this.position.z + offsetZ
      );
      
      // Look-at target changes based on pitch angle (proper third-person)
      const lookDistance = 200;
      const lookAtTarget = new THREE.Vector3(
        this.position.x - Math.sin(yaw) * Math.cos(pitch) * lookDistance,
        this.position.y + 45 - (Math.sin(pitch) * lookDistance), // Pitch affects look angle
        this.position.z - Math.cos(yaw) * Math.cos(pitch) * lookDistance
      );
      
      this.camera.lookAt(lookAtTarget);
    }
    
    // Hamster always faces the direction you're looking/moving (same for both camera views)
    if (this.bodyMesh) {
      this.bodyMesh.rotation.y = yaw + Math.PI; // Face forward direction
    }
    
    // Always show hamster body in both third-person views
    if (this.bodyMesh) {
      this.bodyMesh.visible = true;
    }
  }

  update(deltaTime) {
    if (!this.isAlive) return;
    
    // Game loop running smoothly
    
    this.handleInput(deltaTime);
    this.updateMovement(deltaTime);
    this.updateCamera();
    this.checkGroundCollision();
    
    // Update weapon manager
    if (this.weaponManager) {
      this.weaponManager.update(deltaTime);
    }
    
    // Update mesh position for other players
    if (this.bodyMesh && this.playerId !== 'local_player') {
      this.bodyMesh.position.copy(this.position);
      this.bodyMesh.rotation.y = this.rotation.y;
    }
    
    // Network sync
    if (this.playerId === 'local_player') {
      this.networkSync();
    }
  }

  handleInput(deltaTime) {
    if (this.playerId !== 'local_player') return;
    
    // Check if input manager is available
    if (!this.inputManager) {
      console.warn('⚠️ InputManager not available for player');
      return;
    }
    
    // Mouse look - apply mouse rotation with adjustable sensitivity
    const mouseDelta = this.inputManager.getMouseDelta();
    if (Math.abs(mouseDelta.x) > 0.001 || Math.abs(mouseDelta.y) > 0.001) {
      const sensitivity = this.mouseSensitivityMultiplier * 1.0; // Use multiplier with base sensitivity
      this.cameraRotation.y -= mouseDelta.x * sensitivity; // Horizontal rotation (adjustable)
      this.cameraRotation.x += mouseDelta.y * sensitivity; // Vertical rotation (adjustable)
      
      // Debug log sensitivity changes (remove this later)
      if (Math.random() < 0.001) { // Only log occasionally to avoid spam
        console.log(`🖱️ Current sensitivity: ${sensitivity.toFixed(3)} (multiplier: ${this.mouseSensitivityMultiplier.toFixed(1)}x)`);
      }
      
      // Clamp vertical rotation
      this.cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraRotation.x));
    }
    
    // Movement
    const movement = this.inputManager.getMovementVector();
    this.isSprinting = this.inputManager.isSprintPressed();
    
    // Movement input received
    
    // Calculate movement direction based on camera rotation
    const yaw = this.cameraRotation.y;
    const moveDirection = new THREE.Vector3();
    
    if (movement.x !== 0 || movement.z !== 0) {
      // Forward/backward movement (W/S keys) - fixed direction
      const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      // Strafe movement (A/D keys)  
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      
      // Combine forward and strafe movement (W = forward, S = backward)
      moveDirection.addScaledVector(forward, movement.z); // W=forward, S=backward
      moveDirection.addScaledVector(right, movement.x);
      moveDirection.normalize();
      
      const moveSpeed = this.speed * (this.isSprinting ? this.sprintMultiplier : 1);
      
      // Set velocity for smooth movement
      this.velocity.x = moveDirection.x * moveSpeed;
      this.velocity.z = moveDirection.z * moveSpeed;
      
    } else {
      // Apply friction when not moving
      this.velocity.x *= this.friction;
      this.velocity.z *= this.friction;
      
      // Stop very slow movement to prevent sliding
      if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
      if (Math.abs(this.velocity.z) < 0.1) this.velocity.z = 0;
    }
    
    // Jumping (FPS-style jumps)
    if (this.inputManager.isJumpPressed() && this.isOnGround && !this.isJumping) {
      this.velocity.y = this.jumpHeight;
      this.isJumping = true;
      this.isOnGround = false;
      console.log(`🦘 Hamster jumping! Height: ${this.jumpHeight}, Current Y: ${this.position.y.toFixed(1)}`);
    }
    
    // Shooting
    if (this.inputManager.isShootPressed()) {
      this.shoot();
    }
    
    // Reloading
    if (this.inputManager.isReloadPressed()) {
      this.reload();
    }

    // Camera view toggle (T key)
    const now = Date.now();
    if (this.inputManager.isThirdPersonTogglePressed() && (now - this.lastToggleTime) > 300) {
      this.isFrontView = !this.isFrontView;
      this.lastToggleTime = now;
      console.log(`📷 Camera view toggled: ${this.isFrontView ? 'FRONT THIRD-PERSON' : 'BACK THIRD-PERSON'}`);
    }

    // Weapon switching (1 and 2 keys)
    if (this.inputManager.isPrimaryWeaponPressed()) {
      if (this.currentWeaponSlot !== 'primary') {
        this.switchToWeapon('primary');
      }
    }
    
    if (this.inputManager.isSecondaryWeaponPressed()) {
      if (this.currentWeaponSlot !== 'secondary') {
        this.switchToWeapon('secondary');
      }
    }

    // Camera zoom (scroll wheel) - works in both third person views
    const scrollDelta = this.inputManager.getScrollDelta();
    if (scrollDelta !== 0) {
      const zoomSpeed = 0.1;
      this.cameraDistance += scrollDelta * zoomSpeed;
      
      // Clamp camera distance between min and max
      this.cameraDistance = Math.max(this.minCameraDistance, Math.min(this.maxCameraDistance, this.cameraDistance));
    }
  }

  updateMovement(deltaTime) {
    // Apply gravity (downward force)
    this.velocity.y -= this.gravity * deltaTime;
    
    // Apply velocity to position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Update body mesh position to match player position
    if (this.bodyMesh) {
      this.bodyMesh.position.copy(this.position);
    }
    
    // No artificial boundaries - let the hamster explore the entire map freely!
    // (In a real game, collision detection with map geometry would handle boundaries)
    
    // Ground collision (adjusted for large hamster)
    const groundLevel = 40; // Higher ground level for large hamster
    if (this.position.y < groundLevel) {
      this.position.y = groundLevel;
      this.velocity.y = 0;
      this.isOnGround = true;
      this.isJumping = false;
    }
  }

  checkGroundCollision() {
    // Simple ground check - in a real game, this would be more sophisticated
    this.groundCheckRay.set(this.position, new THREE.Vector3(0, -1, 0));
    
    // Check if we're close to the ground (adjusted for large hamster)
    const groundLevel = 40;
    this.isOnGround = this.position.y <= groundLevel + 2;
  }

  shoot() {
    // Get direction directly from camera to match crosshair exactly
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    const direction = cameraDirection.normalize();
    
    // Get player accuracy from character stats
    const playerAccuracy = this.finalStats?.accuracy || 1.0;
    
    // Calculate bullet start position from weapon barrel instead of player center
    const weaponOffsetLocal = new THREE.Vector3(0.3, 0.1, -0.5); // Local offset to weapon barrel
    
    // Rotate weapon offset based on camera Y rotation (yaw)
    const yaw = this.cameraRotation.y;
    const weaponOffset = new THREE.Vector3(
      weaponOffsetLocal.x * Math.cos(yaw) - weaponOffsetLocal.z * Math.sin(yaw),
      weaponOffsetLocal.y,
      weaponOffsetLocal.x * Math.sin(yaw) + weaponOffsetLocal.z * Math.cos(yaw)
    );
    
    const bulletStartPosition = this.position.clone().add(weaponOffset);
    
    // DEBUG: Log player position when firing
    console.log(`🔫 PLAYER POSITION when firing: (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}, ${this.position.z.toFixed(1)})`);
    console.log(`🔫 BULLET START POSITION: (${bulletStartPosition.x.toFixed(1)}, ${bulletStartPosition.y.toFixed(1)}, ${bulletStartPosition.z.toFixed(1)})`);
    
    // Fire using weapon manager
    const shot = this.weaponManager.fire(bulletStartPosition, direction, playerAccuracy);
    
    if (shot) {
      // Send shot to server
      if (this.socket) {
        this.socket.emit('playerShoot', {
          position: shot.position,
          direction: shot.direction,
          damage: shot.damage,
          weapon: shot.weapon,
          timestamp: Date.now()
        });
      }
      
      // Update UI
      this.updateUI();
    }
  }

  reload() {
    const reloaded = this.weaponManager.reload();
    
    if (reloaded && this.socket) {
      // Send reload to server
      this.socket.emit('playerReload');
    }
    
    // Update UI
    this.updateUI();
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
    this.updateUI();
  }

  die() {
    this.isAlive = false;
    // Death logic here
    console.log(`${this.character} has been eliminated!`);
  }

  respawn() {
    this.health = this.maxHealth;
    this.isAlive = true;
    this.position.set(0, 1, 0); // Reset position
    this.velocity.set(0, 0, 0);
    
    // Reset to primary weapon
    this.switchToWeapon('primary');
    
    this.updateUI();
  }

  networkSync() {
    const now = Date.now();
    if (now - this.lastNetworkUpdate > this.networkUpdateRate) {
      this.lastNetworkUpdate = now;
      
      if (this.socket) {
        this.socket.emit('playerMove', {
          position: this.position.clone(),
          rotation: this.cameraRotation.clone()
        });
      }
    }
  }

  updateUI() {
    // UI is now handled by React components, no need for DOM manipulation
    // This method is kept for compatibility but does nothing
    // UI updates are handled automatically through the React weapon stats system
  }

  // Update this player from network data
  updateFromNetwork(data) {
    if (this.playerId === 'local_player') return;
    
    // Smoothly interpolate position
    this.position.lerp(data.position, 0.1);
    this.rotation.copy(data.rotation);
  }

  // Remove player from scene
  destroy() {
    if (this.bodyMesh) {
      this.scene.remove(this.bodyMesh);
    }
  }
} 