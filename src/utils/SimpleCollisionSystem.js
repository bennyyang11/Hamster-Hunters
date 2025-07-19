// Simple collision system for Hamster Hunter - Only handles horizontal wall collision
import * as THREE from 'three';

export class SimpleCollisionSystem {
  constructor(scene) {
    this.scene = scene;
    this.wallObjects = [];
    this.playerRadius = 15; // Very small radius - only block for very close walls
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
          
          // Log first several objects for debugging
          if (this.wallObjects.length <= 20) { // Show more objects to see fence detection
            const bbox = new THREE.Box3().setFromObject(child);
            const size = bbox.getSize(new THREE.Vector3());
            const meshName = (child.name || '').toLowerCase();
            const objectType = meshName.includes('post') || meshName.includes('pole') || meshName.includes('poll') ? '[POST]' :
                              meshName.includes('fence') || meshName.includes('rail') ? '[FENCE]' : 
                              meshName.includes('wall') ? '[WALL]' : 
                              meshName.includes('barrier') ? '[BARRIER]' :
                              meshName.includes('wood') ? '[WOOD]' : '[OBSTACLE]';
            console.log(`🚧 ${objectType} ${this.wallObjects.length}: "${child.name || 'unnamed'}" - Size: ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)}`);
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
    
    // Check mesh name for specific object types
    const meshName = (mesh.name || '').toLowerCase();
    
    // Skip ground/floor objects (large horizontal objects)
    if (meshName && (
      meshName.includes('ground') ||
      meshName.includes('terrain') ||
      meshName.includes('floor') ||
      meshName.includes('road') ||
      meshName.includes('pavement') ||
      meshName.includes('street') ||
      meshName.includes('sidewalk')
    )) {
      return false; // Don't use ground objects for wall collision
    }
    
    // Include fence objects by name (very permissive)
    if (meshName && (
      meshName.includes('fence') ||
      meshName.includes('barrier') ||
      meshName.includes('gate') ||
      meshName.includes('wall') ||
      meshName.includes('border') ||
      meshName.includes('post') ||
      meshName.includes('pole') ||
      meshName.includes('poll') ||
      meshName.includes('rail') ||
      meshName.includes('perimeter') ||
      meshName.includes('enclosure') ||
      meshName.includes('wood') ||
      meshName.includes('timber') ||
      meshName.includes('plank') ||
      meshName.includes('stake')
    )) {
      // For named fence objects, be extremely permissive about size
      if (size.y > 3 && (size.x > 5 || size.z > 5)) {
        console.log(`🚧 Fence detected by name: "${mesh.name || 'unnamed'}" - Size: ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)}`);
        return true;
      }
    }
    
    // Skip very large flat objects (likely ground)
    if (size.x > 500 && size.z > 500 && size.y < 50) {
      return false;
    }
    
    // Skip enormous objects (likely invisible bounding boxes or world boundaries)
    if (size.x > 5000 || size.y > 5000 || size.z > 5000) {
      console.log(`🚫 Skipping massive object: "${mesh.name || 'unnamed'}" - Size: ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)}`);
      return false;
    }
    
    // Skip very large objects that are likely terrain or background elements
    if (size.x > 2000 && size.z > 2000) {
      return false;
    }
    
    // Skip only truly tiny decorative objects (be very permissive for potential fence pieces)
    if (size.x < 3 && size.y < 3 && size.z < 3) {
      return false;
    }
    
    // Skip objects that are very flat (likely decals or ground textures)
    if (size.y < 2 && (size.x > 20 || size.z > 20)) {
      return false;
    }
    
    // Log objects that might be fences but are being skipped for other reasons
    if (meshName && (meshName.includes('fence') || meshName.includes('post') || meshName.includes('pole') || meshName.includes('poll') || meshName.includes('rail') || meshName.includes('barrier') || meshName.includes('wood'))) {
      console.log(`⚠️ Potential fence skipped: "${mesh.name || 'unnamed'}" - Size: ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)}`);
    }
    
    // Include solid vertical objects (walls, buildings, fences) - be more selective
    if (size.y > 50 && (size.x > 100 || size.z > 100)) { // Must be tall AND substantial
      return true;
    }
    
    // Include fence-like objects by dimensions (extremely permissive)
    // Long fence sections
    const isLongX = size.x > 50 && size.z < 40 && size.y > 10; // Long fence in X direction  
    const isLongZ = size.z > 50 && size.x < 40 && size.y > 10; // Long fence in Z direction
    // Medium fence sections
    const isMediumFenceX = size.x > 30 && size.z < 25 && size.y > 8 && size.y < 150; // Medium fence in X direction
    const isMediumFenceZ = size.z > 30 && size.x < 25 && size.y > 8 && size.y < 150; // Medium fence in Z direction
    // Small fence sections or posts
    const isSmallFenceX = size.x > 15 && size.z < 15 && size.y > 12 && size.y < 100; // Small fence in X direction
    const isSmallFenceZ = size.z > 15 && size.x < 15 && size.y > 12 && size.y < 100; // Small fence in Z direction
    
    // Fence posts/polls (be very aggressive about posts)
    const isTallPost = size.y > 15 && size.x < 12 && size.z < 12; // Tall narrow posts
    const isMediumPost = size.y > 10 && size.x < 8 && size.z < 8; // Medium posts
    const isSmallPost = size.y > 8 && size.x < 6 && size.z < 6; // Small posts
    const isTinyPost = size.y > 6 && size.x < 4 && size.z < 4; // Very small posts/stakes
    
    // Any reasonably tall narrow object could be a post
    const isNarrowTallObject = size.y > 8 && (size.x < 10 && size.z < 10) && size.y > Math.max(size.x, size.z) * 2;
    
    if (isLongX || isLongZ || isMediumFenceX || isMediumFenceZ || isSmallFenceX || isSmallFenceZ || 
        isTallPost || isMediumPost || isSmallPost || isTinyPost || isNarrowTallObject) {
      console.log(`🚧 Fence detected by dimensions: "${mesh.name || 'unnamed'}" - Size: ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)}`);
      return true;
    }
    
    // Include any vertical barrier-like objects (catch-all for missed fences and posts)
    if (size.y > 8 && size.y < 200) { // Has reasonable height for a barrier/post
      // Check if it's narrow enough to be a barrier or post
      const isNarrowBarrier = (size.x > 15 && size.z < 15) || (size.z > 15 && size.x < 15);
      const isVeryNarrow = size.x < 12 && size.z < 12; // Could be a post
      const isTallRelativeToWidth = size.y > Math.max(size.x, size.z) * 1.5; // Taller than it is wide
      
      if (isNarrowBarrier || isVeryNarrow || isTallRelativeToWidth) {
        console.log(`🚧 Barrier/Post detected (catch-all): "${mesh.name || 'unnamed'}" - Size: ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)}`);
        return true;
      }
    }
    
    // Include medium-sized solid objects that could be obstacles
    if ((size.x > 80 || size.z > 80) && size.y > 20) { // Must have decent size in at least one dimension AND some height
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
    
    // Only check collisions for small movements (ignore large teleports/spawns)
    if (movementDistance > 100) {
      return newPosition; // Allow large movements without collision checking
    }
    
    // Normalize movement direction
    const movementDirection = movement.normalize();
    
    // Create rays around the player for collision detection (simplified for better performance)
    const rayOrigins = [
      // Center ray (most important)
      new THREE.Vector3(horizontalCurrent.x, horizontalCurrent.y, horizontalCurrent.z),
      // Side rays only
      new THREE.Vector3(horizontalCurrent.x - this.playerRadius * 0.3, horizontalCurrent.y, horizontalCurrent.z),
      new THREE.Vector3(horizontalCurrent.x + this.playerRadius * 0.3, horizontalCurrent.y, horizontalCurrent.z)
    ];

    // Check each ray for wall collisions
    let blockedRays = 0;
    let closestCollisionDistance = Infinity;
    let closestCollisionObject = null;
    
    for (let i = 0; i < rayOrigins.length; i++) {
      this.raycaster.set(rayOrigins[i], movementDirection);
      // Much shorter ray distance - only check for very close objects
      this.raycaster.far = Math.min(movementDistance + this.playerRadius, 30);
      
      const intersects = this.raycaster.intersectObjects(this.wallObjects, false);
      
      if (intersects.length > 0) {
        const closestIntersection = intersects[0];
        
        // Only block if collision is VERY close (within player radius + small grace distance)
        const minCollisionDistance = this.playerRadius + 5; // 5 unit grace distance
        if (closestIntersection.distance < minCollisionDistance) {
          blockedRays++;
          if (closestIntersection.distance < closestCollisionDistance) {
            closestCollisionDistance = closestIntersection.distance;
            closestCollisionObject = closestIntersection.object;
          }
        }
      }
    }
    
    // Only block movement if ALL rays are blocked (very conservative)
    if (blockedRays >= rayOrigins.length && closestCollisionDistance < this.playerRadius) {
      // Log collision for debugging (only occasionally to avoid spam)
      if (Math.random() < 0.2) { // 20% chance to log
        console.log(`🚧 Movement blocked by: "${closestCollisionObject?.name || 'unnamed'}" at distance ${closestCollisionDistance.toFixed(1)}`);
      }
      
      // Block horizontal movement but allow vertical (Y) movement
      return new THREE.Vector3(currentPosition.x, newPosition.y, currentPosition.z);
    }

    // No significant collision detected - allow movement
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