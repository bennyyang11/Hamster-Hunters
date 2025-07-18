// Rendering Performance Optimization Utilities
import * as THREE from 'three';

export class LODManager {
  constructor(camera) {
    this.camera = camera;
    this.lodLevels = {
      high: 100,     // Extended high detail range
      medium: 300,   // Extended medium detail range  
      low: 600,      // Extended low detail range
      minimal: 1000  // Extended minimal detail range
    };
    
    this.lodObjects = new Map(); // Track objects with LOD
    this.excludedObjects = new Set(); // Objects that should maintain high detail (like map buildings)
  }

  // Add objects that should always maintain high detail (like map buildings)
  excludeFromLOD(object) {
    this.excludedObjects.add(object.uuid);
    // Also exclude all children
    object.traverse((child) => {
      if (child.isMesh) {
        this.excludedObjects.add(child.uuid);
      }
    });
  }

  // Register an object for LOD management
  registerLODObject(object, lodVersions) {
    // Don't register excluded objects (like map buildings)
    if (this.excludedObjects.has(object.uuid)) {
      return;
    }

    this.lodObjects.set(object.uuid, {
      object,
      lodVersions, // { high, medium, low, minimal }
      currentLOD: 'high',
      lastDistance: 0
    });
  }

  // Update LOD based on distance from camera
  updateLOD() {
    this.lodObjects.forEach((lodData) => {
      // Skip LOD for excluded objects (map buildings)
      if (this.excludedObjects.has(lodData.object.uuid)) {
        return;
      }

      const distance = this.camera.position.distanceTo(lodData.object.position);
      let targetLOD = 'minimal';

      if (distance <= this.lodLevels.high) {
        targetLOD = 'high';
      } else if (distance <= this.lodLevels.medium) {
        targetLOD = 'medium';
      } else if (distance <= this.lodLevels.low) {
        targetLOD = 'low';
      }

      // Only update if LOD level changed
      if (targetLOD !== lodData.currentLOD) {
        this.switchLOD(lodData, targetLOD);
        lodData.currentLOD = targetLOD;
      }
      
      lodData.lastDistance = distance;
    });
  }

  // Switch to appropriate LOD level
  switchLOD(lodData, targetLOD) {
    const { object, lodVersions } = lodData;
    
    // Hide current mesh children
    object.children.forEach(child => {
      if (child.isMesh) child.visible = false;
    });

    // Show target LOD mesh
    if (lodVersions[targetLOD]) {
      lodVersions[targetLOD].visible = true;
    }
  }

  // Remove object from LOD management
  unregisterLODObject(object) {
    this.lodObjects.delete(object.uuid);
  }

  // Clean up
  dispose() {
    this.lodObjects.clear();
  }
}

export class FrustumCuller {
  constructor(camera) {
    this.camera = camera;
    this.frustum = new THREE.Frustum();
    this.cameraMatrix = new THREE.Matrix4();
    this.culledObjects = new Set();
    this.excludedObjects = new Set(); // Objects that should never be culled (like map buildings)
  }

  // Add objects that should never be culled (like map buildings)
  excludeFromCulling(object) {
    this.excludedObjects.add(object.uuid);
    // Also exclude all children
    object.traverse((child) => {
      if (child.isMesh) {
        this.excludedObjects.add(child.uuid);
      }
    });
  }

  // Update frustum based on camera
  updateFrustum() {
    this.cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.cameraMatrix);
  }

  // Check if object is in view (with more generous bounds for large objects)
  isInView(object) {
    // Never cull excluded objects (like map buildings)
    if (this.excludedObjects.has(object.uuid)) {
      return true;
    }

    if (!object.geometry || !object.geometry.boundingSphere) {
      object.geometry.computeBoundingSphere();
    }
    
    const sphere = object.geometry.boundingSphere.clone();
    sphere.applyMatrix4(object.matrixWorld);
    
    // Expand the sphere radius for more generous culling (prevents pop-in/out)
    sphere.radius *= 1.5;
    
    return this.frustum.intersectsSphere(sphere);
  }

  // Cull objects outside frustum (but be more conservative)
  cullObjects(objects) {
    this.updateFrustum();
    
    objects.forEach(object => {
      // Skip culling for excluded objects (map buildings)
      if (this.excludedObjects.has(object.uuid)) {
        object.visible = true;
        return;
      }

      const shouldBeVisible = this.isInView(object);
      
      if (object.visible !== shouldBeVisible) {
        object.visible = shouldBeVisible;
        
        if (shouldBeVisible) {
          this.culledObjects.delete(object.uuid);
        } else {
          this.culledObjects.add(object.uuid);
        }
      }
    });
  }

  // Get count of culled objects
  getCulledCount() {
    return this.culledObjects.size;
  }
}

export class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.frameTimes = [];
    this.maxSamples = 60;
    
    // Performance metrics
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      culledObjects: 0,
      visibleObjects: 0,
      drawCalls: 0
    };
  }

  // Update performance metrics
  update(renderer, scene) {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameTimes.push(deltaTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
    
    this.frameCount++;
    
    // Calculate FPS every second
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Update metrics
      this.metrics.fps = this.fps;
      this.metrics.frameTime = this.getAverageFrameTime();
      this.metrics.drawCalls = renderer.info.render.calls;
      
      // Count visible objects
      let visibleCount = 0;
      scene.traverse((object) => {
        if (object.visible && object.isMesh) visibleCount++;
      });
      this.metrics.visibleObjects = visibleCount;
    }
  }

  // Get average frame time
  getAverageFrameTime() {
    if (this.frameTimes.length === 0) return 16.67;
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    return sum / this.frameTimes.length;
  }

  // Check if performance is good
  isPerformanceGood() {
    return this.fps >= 30 && this.getAverageFrameTime() <= 33.33;
  }

  // Get performance recommendation
  getPerformanceRecommendation() {
    if (this.fps < 20) {
      return 'critical'; // Reduce quality, disable effects
    } else if (this.fps < 30) {
      return 'poor'; // Reduce LOD distances, cull more aggressively
    } else if (this.fps < 50) {
      return 'fair'; // Minor optimizations
    } else {
      return 'good'; // Can increase quality
    }
  }

  // Get metrics for debugging
  getMetrics() {
    return { ...this.metrics };
  }
}

export class ModelOptimizer {
  constructor() {
    this.optimizedCache = new Map();
  }

  // Optimize geometry for better performance
  optimizeGeometry(geometry) {
    const cacheKey = this.getGeometryHash(geometry);
    
    if (this.optimizedCache.has(cacheKey)) {
      return this.optimizedCache.get(cacheKey);
    }

    // Clone and optimize
    const optimized = geometry.clone();
    
    // Merge vertices if not already done
    if (optimized.index === null) {
      optimized.mergeVertices();
    }
    
    // Compute vertex normals if missing
    if (!optimized.attributes.normal) {
      optimized.computeVertexNormals();
    }
    
    // Compute bounding sphere for frustum culling
    optimized.computeBoundingSphere();
    optimized.computeBoundingBox();
    
    // Cache the result
    this.optimizedCache.set(cacheKey, optimized);
    
    return optimized;
  }

  // Create simplified LOD versions
  createLODVersions(originalGeometry, lodLevels = [1.0, 0.5, 0.25, 0.1]) {
    const lodVersions = {};
    
    lodLevels.forEach((factor, index) => {
      const levelNames = ['high', 'medium', 'low', 'minimal'];
      const lodGeometry = this.simplifyGeometry(originalGeometry, factor);
      lodVersions[levelNames[index]] = lodGeometry;
    });
    
    return lodVersions;
  }

  // Simplify geometry (basic implementation)
  simplifyGeometry(geometry, factor) {
    if (factor >= 1.0) return geometry.clone();
    
    const simplified = geometry.clone();
    
    // Simple vertex reduction (for demonstration)
    // In a real implementation, you'd use more sophisticated algorithms
    if (simplified.index) {
      const indexArray = simplified.index.array;
      const targetLength = Math.floor(indexArray.length * factor);
      const newIndices = new Uint16Array(targetLength);
      
      // Simple sampling approach
      const step = indexArray.length / targetLength;
      for (let i = 0; i < targetLength; i++) {
        newIndices[i] = indexArray[Math.floor(i * step)];
      }
      
      simplified.setIndex(new THREE.BufferAttribute(newIndices, 1));
    }
    
    return simplified;
  }

  // Generate a hash for geometry caching
  getGeometryHash(geometry) {
    const vertexCount = geometry.attributes.position?.count || 0;
    const indexCount = geometry.index?.count || 0;
    return `${vertexCount}_${indexCount}_${geometry.uuid}`;
  }

  // Clean up cache
  clearCache() {
    this.optimizedCache.clear();
  }
}

// Main render optimizer that coordinates all optimizations
export class RenderOptimizer {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    
    this.lodManager = new LODManager(camera);
    this.frustumCuller = new FrustumCuller(camera);
    this.performanceMonitor = new PerformanceMonitor();
    this.modelOptimizer = new ModelOptimizer();
    
    this.updateInterval = 200; // Reduced frequency to 200ms (5 FPS) for less aggressive culling
    this.lastUpdate = 0;
    this.lastCullingUpdate = 0;
    this.cullingInterval = 500; // Frustum culling only every 500ms (2 FPS) to prevent buildings popping
    
    this.isEnabled = true;
    this.mapObjects = new Set(); // Track map objects that should never be culled
  }

  // Register map objects that should never be culled or have LOD applied
  registerMapObject(object) {
    this.mapObjects.add(object.uuid);
    this.frustumCuller.excludeFromCulling(object);
    this.lodManager.excludeFromLOD(object);
    
    // Ensure the object and all its children remain visible
    object.traverse((child) => {
      if (child.isMesh) {
        child.visible = true;
        child.frustumCulled = false; // Disable Three.js built-in frustum culling
        this.mapObjects.add(child.uuid);
      }
    });
    
    console.log(`🏢 Registered map object for permanent visibility: ${object.name || 'unnamed'}`);
  }

  // Update all optimizations
  update(scene) {
    if (!this.isEnabled) return;
    
    const now = performance.now();
    if (now - this.lastUpdate < this.updateInterval) return;
    
    // Update performance monitoring
    this.performanceMonitor.update(this.renderer, scene);
    
    // Adjust optimization aggressiveness based on performance
    this.adjustOptimizationLevel();
    
    // Update LOD (but exclude map objects)
    this.lodManager.updateLOD();
    
    // Frustum culling (much less frequent and exclude map objects)
    if (now - this.lastCullingUpdate > this.cullingInterval) {
      const meshes = [];
      scene.traverse((object) => {
        if (object.isMesh && !this.mapObjects.has(object.uuid)) {
          meshes.push(object);
        }
      });
      this.frustumCuller.cullObjects(meshes);
      this.lastCullingUpdate = now;
    }
    
    this.lastUpdate = now;
  }

  // Adjust optimization based on current performance
  adjustOptimizationLevel() {
    const recommendation = this.performanceMonitor.getPerformanceRecommendation();
    
    switch (recommendation) {
      case 'critical':
        this.lodManager.lodLevels = { high: 25, medium: 75, low: 150, minimal: 250 };
        this.updateInterval = 8; // More aggressive updates
        break;
      case 'poor':
        this.lodManager.lodLevels = { high: 40, medium: 100, low: 200, minimal: 400 };
        this.updateInterval = 12;
        break;
      case 'fair':
        this.lodManager.lodLevels = { high: 50, medium: 150, low: 300, minimal: 500 };
        this.updateInterval = 16;
        break;
      case 'good':
        this.lodManager.lodLevels = { high: 75, medium: 200, low: 400, minimal: 600 };
        this.updateInterval = 20; // Less aggressive updates
        break;
    }
  }

  // Enable/disable optimizations
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.performanceMonitor.getMetrics(),
      culledObjects: this.frustumCuller.getCulledCount(),
      lodObjects: this.lodManager.lodObjects.size
    };
  }

  // Clean up
  dispose() {
    this.lodManager.dispose();
    this.modelOptimizer.clearCache();
  }
} 