import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class AssetLoader {
  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.fbxLoader = new FBXLoader(this.loadingManager);
    this.audioLoader = new THREE.AudioLoader(this.loadingManager);
    
    this.loadedAssets = {
      models: {},
      textures: {},
      audio: {}
    };
    
    // Create weaponModels as a Map for weapon system compatibility
    this.weaponModels = new Map();
    
    // Performance optimizations
    this.assetCache = new Map(); // Cache for processed assets
    this.loadingPromises = new Map(); // Track loading promises to avoid duplicates
    this.compressionSupport = this.checkCompressionSupport();
    
    // Loading progress tracking
    this.loadingProgress = {
      total: 0,
      loaded: 0,
      percentage: 0,
      currentAsset: '',
      callbacks: []
    };
    
    this.setupLoadingCallbacks();
  }

  setupLoadingCallbacks() {
    this.loadingManager.onLoad = () => {
      this.loadingProgress.percentage = 100;
      this.loadingProgress.currentAsset = 'Complete';
      this.notifyProgressCallbacks();
      console.log('🎮 All assets loaded successfully!');
    };
    
    this.loadingManager.onProgress = (url, loaded, total) => {
      const progress = (loaded / total) * 100;
      this.loadingProgress.total = total;
      this.loadingProgress.loaded = loaded;
      this.loadingProgress.percentage = progress;
      this.loadingProgress.currentAsset = this.getAssetName(url);
      this.notifyProgressCallbacks();
      
      console.log(`📦 Loading: ${this.loadingProgress.currentAsset} (${loaded}/${total}) ${progress.toFixed(1)}%`);
    };
    
    this.loadingManager.onError = (url) => {
      console.error(`❌ Failed to load: ${url}`);
      this.notifyProgressCallbacks();
    };
  }

  // Check compression support for better asset loading
  checkCompressionSupport() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    return {
      astc: !!gl?.getExtension('WEBGL_compressed_texture_astc'),
      etc: !!gl?.getExtension('WEBGL_compressed_texture_etc'),
      pvrtc: !!gl?.getExtension('WEBGL_compressed_texture_pvrtc'),
      s3tc: !!gl?.getExtension('WEBGL_compressed_texture_s3tc')
    };
  }

  // Extract asset name from URL for progress display
  getAssetName(url) {
    return url.split('/').pop()?.split('.')[0] || 'Unknown Asset';
  }

  // Add progress callback
  onProgress(callback) {
    this.loadingProgress.callbacks.push(callback);
  }

  // Remove progress callback
  removeProgressCallback(callback) {
    const index = this.loadingProgress.callbacks.indexOf(callback);
    if (index > -1) {
      this.loadingProgress.callbacks.splice(index, 1);
    }
  }

  // Notify all progress callbacks
  notifyProgressCallbacks() {
    this.loadingProgress.callbacks.forEach(callback => {
      try {
        callback(this.loadingProgress);
      } catch (error) {
        console.warn('Error in progress callback:', error);
      }
    });
  }

  // Get current loading progress
  getProgress() {
    return { ...this.loadingProgress };
  }

  // Load 3D weapon models with caching and optimization
  async loadWeaponModel(weaponName, modelPath) {
    // Check cache first
    const cacheKey = `weapon_${weaponName}`;
    if (this.assetCache.has(cacheKey)) {
      console.log(`🔫 Using cached weapon model: ${weaponName}`);
      return this.assetCache.get(cacheKey);
    }

    // Check if already loading to prevent duplicates
    if (this.loadingPromises.has(cacheKey)) {
      console.log(`🔫 Waiting for weapon model already loading: ${weaponName}`);
      return this.loadingPromises.get(cacheKey);
    }

    // Start loading
    const loadingPromise = this.loadWeaponModelInternal(weaponName, modelPath);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const weaponModel = await loadingPromise;
      
      // Cache the result
      this.assetCache.set(cacheKey, weaponModel);
      
      // Store in both places for compatibility
      this.loadedAssets.models[weaponName] = weaponModel;
      this.weaponModels.set(weaponName, weaponModel);
      
      console.log(`🔫 Loaded and cached weapon model: ${weaponName}`);
      return weaponModel;
    } catch (error) {
      console.error(`Failed to load weapon ${weaponName}:`, error);
      return this.createFallbackWeapon(weaponName);
    } finally {
      // Clean up loading promise
      this.loadingPromises.delete(cacheKey);
    }
  }

  // Internal weapon loading method
  async loadWeaponModelInternal(weaponName, modelPath) {
    const gltf = await this.loadGLTF(modelPath);
    const weaponModel = gltf.scene;
    
    // Optimize model for better performance
    this.optimizeModel(weaponModel);
    
    return weaponModel;
  }

  // Optimize loaded models for better performance
  optimizeModel(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        // Enable frustum culling
        child.frustumCulled = true;
        
        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
          
          // Merge vertices if possible (for better performance)
          if (child.geometry.index === null) {
            child.geometry.mergeVertices();
          }
        }
        
        // Optimize materials
        if (child.material) {
          // Ensure materials are not transparent unless needed
          if (child.material.transparent && child.material.opacity >= 1.0) {
            child.material.transparent = false;
          }
          
          // Enable material caching
          child.material.needsUpdate = false;
        }
      }
    });
  }

  // Load map/environment models
  async loadMapModel(mapName, modelPath) {
    try {
      const gltf = await this.loadGLTF(modelPath);
      this.loadedAssets.models[mapName] = gltf.scene;
      console.log(`🗺️ Loaded map: ${mapName}`);
      return gltf.scene;
    } catch (error) {
      console.error(`Failed to load map ${mapName}:`, error);
      return null;
    }
  }

  // Load textures
  loadTexture(name, texturePath) {
    const texture = this.textureLoader.load(texturePath);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.loadedAssets.textures[name] = texture;
    return texture;
  }

  // Load audio files
  async loadAudio(name, audioPath) {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(audioPath, (buffer) => {
        this.loadedAssets.audio[name] = buffer;
        console.log(`🔊 Loaded audio: ${name}`);
        resolve(buffer);
      }, undefined, reject);
    });
  }

  // Helper method to load GLTF files
  loadGLTF(path) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(path, resolve, undefined, reject);
    });
  }

  // Create fallback weapon if model fails to load
  createFallbackWeapon(weaponName) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const weapon = new THREE.Mesh(geometry, material);
    console.log(`🎯 Using fallback model for ${weaponName}`);
    return weapon;
  }

  // Get loaded assets
  getModel(name) {
    return this.loadedAssets.models[name];
  }

  getTexture(name) {
    return this.loadedAssets.textures[name];
  }

  getAudio(name) {
    return this.loadedAssets.audio[name];
  }

  // Preload all game assets
  async preloadAssets() {
    const assetPromises = [];
    
    // Load weapon models that actually exist with proper key mapping
    const weaponModels = [
      { key: 'ak47', file: 'low_poly_ak47' },
      { key: 'an94', file: 'low_poly_an94' }, 
      { key: 'mini_uzi', file: 'low_poly_mini_uzi' },
      { key: 'mp5', file: 'low_poly_mp5' },
      { key: 'scarh', file: 'low_poly_scarh' },
      { key: 'spas12', file: 'low_poly_spas12' },
      { key: 'model870', file: 'low_poly_model870' },
      { key: 'aug_a1', file: 'lowpoly_aug_a1' },
      { key: 'bullet', file: 'bullet' }
    ];
    
    for (const weapon of weaponModels) {
      const modelPath = `assets/models/weapons/${weapon.file}.glb`;
      assetPromises.push(this.loadWeaponModel(weapon.key, modelPath));
    }
    
    // Skip textures and audio for now since they don't exist
    // We'll use Three.js default materials instead
    
    return Promise.allSettled(assetPromises);
  }
} 