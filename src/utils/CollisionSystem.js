// Collision system for Hamster Hunter - Prevents walking through walls, houses, fences, etc.
import * as THREE from 'three';

export class CollisionSystem {
  constructor(scene) {
    this.scene = scene;
    this.collisionObjects = [];
    this.playerRadius = 40; // Large hamster collision radius (scaled for 75x hamster)
    this.raycastDistance = this.playerRadius + 10; // Ray distance for collision detection
    this.raycaster = new THREE.Raycaster();
    this.isInitialized = false;
    
    console.log('🚧 Collision system initialized');
    console.log('🎮 Press C in-game to debug collision system');
  }

  // Initialize collision detection by finding all collidable objects in the scene
  initializeCollisionObjects() {
    this.collisionObjects = [];
    let meshCount = 0;
    let skippedCount = 0;
    
    // Find the Nuketown map and register its meshes for collision
    this.scene.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        if (this.isCollidableObject(child)) {
          this.collisionObjects.push(child);
          
          // Log first few objects for debugging
          if (this.collisionObjects.length <= 10) {
            const bbox = new THREE.Box3().setFromObject(child);
            const size = bbox.getSize(new THREE.Vector3());
            console.log(`🔍 Collision object ${this.collisionObjects.length}: "${child.name || 'unnamed'}" - Size: ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)}`);
          }
        } else {
          skippedCount++;
        }
      }
    });
    
    console.log(`🚧 Scanned ${meshCount} total meshes in scene`);
    console.log(`🚧 Found ${this.collisionObjects.length} collidable objects`);
    console.log(`🚧 Skipped ${skippedCount} non-collidable objects`);
    
    // Debug: Log some object names
    if (this.collisionObjects.length > 0) {
      console.log(`🏠 Sample collision objects:`, 
        this.collisionObjects.slice(0, 5).map(obj => obj.name || 'unnamed')
      );
    } else {
      console.warn('⚠️ No collision objects found! This might indicate a problem with mesh detection.');
    }
    
    this.isInitialized = true;
  }

  // Determine if an object should have collision detection
  isCollidableObject(mesh) {
    // Skip certain objects that shouldn't have collision
    if (!mesh.visible || !mesh.geometry) return false;
    
    // Skip bullet objects, players, weapons, and other game objects first
    if (mesh.userData && (
      mesh.userData.isBullet ||
      mesh.userData.isPlayer ||
      mesh.userData.isWeapon ||
      mesh.userData.isTestDummy ||
      mesh.userData.skipCollision
    )) return false;
    
    // Calculate object size once
    const bbox = new THREE.Box3().setFromObject(mesh);
    const size = bbox.getSize(new THREE.Vector3());
    
    // Include ground/terrain objects for ground collision detection
    const meshName = (mesh.name || '').toLowerCase();
    if (meshName && (
      meshName.includes('ground') ||
      meshName.includes('terrain') ||
      meshName.includes('floor') ||
      meshName.includes('surface') ||
      meshName.includes('road') ||
      meshName.includes('pavement') ||
      meshName.includes('concrete') ||
      meshName.includes('base') ||
      meshName.includes('platform')
    )) {
      return true;
    }
    
    // Include large horizontal objects that could be ground
    if (size.x > 200 && size.z > 200 && size.y < 100) {
      // Large, flat objects are likely ground/terrain
      return true;
    }
    
    // Skip very small decorative objects (but allow ground/terrain)
    if ((size.x < 30 && size.y < 30 && size.z < 30) && 
        !(meshName && (meshName.includes('ground') || meshName.includes('terrain') || meshName.includes('floor')))) {
      return false;
    }
    
    // Skip only very obvious non-collision objects
    if (mesh.name && (
      mesh.name.includes('Sky') ||
      mesh.name.includes('Light') ||
      mesh.name.includes('Camera')
    )) return false;
    
    // Include most other solid objects (houses, walls, fences, etc.)
    return true;
  }

  // Check if movement from current position to new position is valid
  checkMovement(currentPosition, newPosition, playerHeight = 100) {
    if (!this.isInitialized || this.collisionObjects.length === 0) {
      return newPosition; // No collision objects, allow movement
    }

    // Calculate movement direction and distance
    const movement = new THREE.Vector3().subVectors(newPosition, currentPosition);
    const movementDistance = movement.length();
    
    // If no movement, return current position
    if (movementDistance < 0.1) return currentPosition;
    
    // Normalize movement direction
    const movementDirection = movement.normalize();
    
    // Create multiple rays for better collision detection (capsule-like detection)
    const rayOrigins = [
      // Center ray at player height
      new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z),
      // Lower ray (at feet level)
      new THREE.Vector3(currentPosition.x, currentPosition.y - playerHeight * 0.3, currentPosition.z),
      // Upper ray (at chest level)  
      new THREE.Vector3(currentPosition.x, currentPosition.y + playerHeight * 0.2, currentPosition.z),
      // Side rays for wider detection
      new THREE.Vector3(currentPosition.x - this.playerRadius * 0.5, currentPosition.y, currentPosition.z),
      new THREE.Vector3(currentPosition.x + this.playerRadius * 0.5, currentPosition.y, currentPosition.z),
      new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z - this.playerRadius * 0.5),
      new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z + this.playerRadius * 0.5)
    ];

    let canMove = true;
    let validPosition = newPosition.clone();

    // Check each ray for collisions
    for (let i = 0; i < rayOrigins.length; i++) {
      this.raycaster.set(rayOrigins[i], movementDirection);
      
      const intersects = this.raycaster.intersectObjects(this.collisionObjects, false);
      
      if (intersects.length > 0) {
        const closestIntersection = intersects[0];
        
        // If collision is closer than our desired movement distance + player radius
        if (closestIntersection.distance < movementDistance + this.playerRadius) {
          canMove = false;
          
          // Calculate a safe position just before the collision
          const safeDistance = Math.max(0, closestIntersection.distance - this.playerRadius - 5);
          const safePosition = currentPosition.clone().add(
            movementDirection.clone().multiplyScalar(safeDistance)
          );
          
          // Use the most restrictive safe position
          if (safeDistance < validPosition.distanceTo(currentPosition)) {
            validPosition = safePosition;
          }
          
          // Debug collision (log occasionally to avoid spam)
          if (Math.random() < 0.1) {
            console.log(`🚧 Collision detected with: ${closestIntersection.object.name || 'unnamed object'}`);
            console.log(`📏 Distance: ${closestIntersection.distance.toFixed(1)}, Safe distance: ${safeDistance.toFixed(1)}`);
          }
          
          break; // Stop checking rays if we found a collision
        }
      }
    }

    return canMove ? newPosition : validPosition;
  }

  // Check for ground collision (separate from wall collision)
  checkGroundCollision(position, playerHeight = 100) {
    if (!this.isInitialized) {
      // Always return spawn-safe ground level when not initialized
      return 40;
    }

    // Cast ray downward from slightly above player position
    const rayOrigin = new THREE.Vector3(position.x, position.y + 5, position.z);
    this.raycaster.set(rayOrigin, new THREE.Vector3(0, -1, 0));
    this.raycaster.far = 200; // Reasonable ray distance to find ground
    
    const intersects = this.raycaster.intersectObjects(this.collisionObjects, false);
    
    if (intersects.length > 0) {
      const groundHit = intersects[0];
      const groundY = groundHit.point.y;
      
      // Only use detected ground if it's reasonable (not too far above current position)
      if (groundY <= position.y + 50 && groundY >= 30) {
        return groundY + 5; // Small offset to stand on ground
      }
    }
    
    // If no reasonable ground found, use safe default
    return 40;
  }

  // Add collision object manually (for dynamic objects)
  addCollisionObject(mesh) {
    if (this.isCollidableObject(mesh) && !this.collisionObjects.includes(mesh)) {
      this.collisionObjects.push(mesh);
      console.log(`🚧 Added collision object: ${mesh.name || 'unnamed'}`);
    }
  }

  // Remove collision object
  removeCollisionObject(mesh) {
    const index = this.collisionObjects.indexOf(mesh);
    if (index > -1) {
      this.collisionObjects.splice(index, 1);
      console.log(`🚧 Removed collision object: ${mesh.name || 'unnamed'}`);
    }
  }

  // Debug: Visualize collision objects (for development)
  debugVisualization() {
    console.log(`🔍 Collision System Debug:`);
    console.log(`📊 Total collision objects: ${this.collisionObjects.length}`);
    console.log(`🎯 Player radius: ${this.playerRadius}`);
    console.log(`📏 Raycast distance: ${this.raycastDistance}`);
    
    // Show bounding boxes of collision objects (optional)
    this.collisionObjects.forEach((obj, index) => {
      if (index < 10) { // Only show first 10 to avoid spam
        const bbox = new THREE.Box3().setFromObject(obj);
        const size = bbox.getSize(new THREE.Vector3());
        console.log(`📦 Object ${index}: ${obj.name || 'unnamed'} - Size: ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)}`);
      }
    });
  }

  // Refresh collision objects (call when scene changes)
  refresh() {
    console.log('🔄 Refreshing collision system...');
    this.initializeCollisionObjects();
  }
} 