// Simple collision system for Hamster Hunter - Only handles horizontal wall collision
import * as THREE from 'three';

export class SimpleCollisionSystem {
  constructor(scene) {
    this.scene = scene;
    this.wallObjects = [];
    this.playerRadius = 30; // Slightly smaller radius for better movement
    this.raycaster = new THREE.Raycaster();
    this.isInitialized = false;
    
    console.log('🚧 Simple collision system initialized (horizontal only)');
  }

  // Initialize wall collision detection by finding solid objects
  initializeWallObjects() {
    this.wallObjects = [];
    let meshCount = 0;
    
    // Find solid objects for wall collision (exclude ground)
    this.scene.traverse((child) => {
      if (child.isMesh) {
        meshCount++;
        if (this.isWallObject(child)) {
          this.wallObjects.push(child);
          
          // Log first few objects for debugging
          if (this.wallObjects.length <= 5) {
            console.log(`🚧 Wall object ${this.wallObjects.length}: "${child.name || 'unnamed'}"`);
          }
        }
      }
    });
    
    console.log(`🚧 Scanned ${meshCount} meshes, found ${this.wallObjects.length} wall objects`);
    this.isInitialized = true;
  }

  // Determine if an object should block horizontal movement
  isWallObject(mesh) {
    // Skip non-visible or non-geometry objects
    if (!mesh.visible || !mesh.geometry) return false;
    
    // Skip game objects
    if (mesh.userData && (
      mesh.userData.isBullet ||
      mesh.userData.isPlayer ||
      mesh.userData.isWeapon ||
      mesh.userData.isTestDummy ||
      mesh.userData.skipCollision
    )) return false;
    
    // Calculate object size
    const bbox = new THREE.Box3().setFromObject(mesh);
    const size = bbox.getSize(new THREE.Vector3());
    
    // Skip ground/floor objects (large horizontal objects)
    const meshName = (mesh.name || '').toLowerCase();
    if (meshName && (
      meshName.includes('ground') ||
      meshName.includes('terrain') ||
      meshName.includes('floor') ||
      meshName.includes('road') ||
      meshName.includes('pavement')
    )) {
      return false; // Don't use ground objects for wall collision
    }
    
    // Skip very large flat objects (likely ground)
    if (size.x > 500 && size.z > 500 && size.y < 50) {
      return false;
    }
    
    // Skip very small decorative objects
    if (size.x < 20 && size.y < 20 && size.z < 20) {
      return false;
    }
    
    // Include solid vertical objects (walls, buildings, fences)
    if (size.y > 30) { // Has significant height - likely a wall/building
      return true;
    }
    
    // Include medium-sized objects that could be obstacles
    if (size.x > 30 || size.z > 30) {
      return true;
    }
    
    return false;
  }

  // Check if horizontal movement is valid (only X and Z movement)
  checkHorizontalMovement(currentPosition, newPosition) {
    if (!this.isInitialized || this.wallObjects.length === 0) {
      return newPosition; // No wall objects, allow movement
    }

    // Only check horizontal movement (ignore Y changes)
    const horizontalCurrent = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z);
    const horizontalNew = new THREE.Vector3(newPosition.x, currentPosition.y, newPosition.z);
    
    // Calculate horizontal movement direction and distance
    const movement = new THREE.Vector3().subVectors(horizontalNew, horizontalCurrent);
    const movementDistance = movement.length();
    
    // If no horizontal movement, return new position (allow vertical movement)
    if (movementDistance < 0.1) {
      return newPosition;
    }
    
    // Normalize movement direction
    const movementDirection = movement.normalize();
    
    // Create rays around the player for better collision detection
    const rayOrigins = [
      // Center ray
      new THREE.Vector3(horizontalCurrent.x, horizontalCurrent.y, horizontalCurrent.z),
      // Front/back rays
      new THREE.Vector3(horizontalCurrent.x, horizontalCurrent.y, horizontalCurrent.z - this.playerRadius * 0.5),
      new THREE.Vector3(horizontalCurrent.x, horizontalCurrent.y, horizontalCurrent.z + this.playerRadius * 0.5),
      // Left/right rays
      new THREE.Vector3(horizontalCurrent.x - this.playerRadius * 0.5, horizontalCurrent.y, horizontalCurrent.z),
      new THREE.Vector3(horizontalCurrent.x + this.playerRadius * 0.5, horizontalCurrent.y, horizontalCurrent.z)
    ];

    // Check each ray for wall collisions
    for (let i = 0; i < rayOrigins.length; i++) {
      this.raycaster.set(rayOrigins[i], movementDirection);
      this.raycaster.far = movementDistance + this.playerRadius;
      
      const intersects = this.raycaster.intersectObjects(this.wallObjects, false);
      
      if (intersects.length > 0) {
        const closestIntersection = intersects[0];
        
        // If collision is closer than our desired movement + player radius
        if (closestIntersection.distance < movementDistance + this.playerRadius) {
          // Block horizontal movement but allow vertical (Y) movement
          return new THREE.Vector3(currentPosition.x, newPosition.y, currentPosition.z);
        }
      }
    }

    // No collision detected - allow movement
    return newPosition;
  }

  // Add wall object manually
  addWallObject(mesh) {
    if (this.isWallObject(mesh) && !this.wallObjects.includes(mesh)) {
      this.wallObjects.push(mesh);
      console.log(`🚧 Added wall object: ${mesh.name || 'unnamed'}`);
    }
  }

  // Remove wall object
  removeWallObject(mesh) {
    const index = this.wallObjects.indexOf(mesh);
    if (index > -1) {
      this.wallObjects.splice(index, 1);
      console.log(`🚧 Removed wall object: ${mesh.name || 'unnamed'}`);
    }
  }

  // Debug: Show wall objects
  debugVisualization() {
    console.log(`🔍 Simple Collision System Debug:`);
    console.log(`📊 Total wall objects: ${this.wallObjects.length}`);
    console.log(`🎯 Player radius: ${this.playerRadius}`);
    
    // Show first few objects
    this.wallObjects.slice(0, 10).forEach((obj, index) => {
      const bbox = new THREE.Box3().setFromObject(obj);
      const size = bbox.getSize(new THREE.Vector3());
      console.log(`🏠 Wall ${index + 1}: "${obj.name || 'unnamed'}" - ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)}`);
    });
  }

  // Refresh wall objects
  refresh() {
    console.log('🔄 Refreshing simple collision system...');
    this.initializeWallObjects();
  }
} 