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
    
    this.setupLoadingCallbacks();
  }

  setupLoadingCallbacks() {
    this.loadingManager.onLoad = () => {
      console.log('🎮 All assets loaded successfully!');
    };
    
    this.loadingManager.onProgress = (url, loaded, total) => {
      console.log(`📦 Loading: ${url} (${loaded}/${total})`);
    };
    
    this.loadingManager.onError = (url) => {
      console.error(`❌ Failed to load: ${url}`);
    };
  }

  // Load 3D weapon models
  async loadWeaponModel(weaponName, modelPath) {
    try {
      const gltf = await this.loadGLTF(modelPath);
      const weaponModel = gltf.scene;
      
      // Store in both places for compatibility
      this.loadedAssets.models[weaponName] = weaponModel;
      this.weaponModels.set(weaponName, weaponModel);
      
      console.log(`🔫 Loaded weapon model: ${weaponName}`);
      return weaponModel;
    } catch (error) {
      console.error(`Failed to load weapon ${weaponName}:`, error);
      return this.createFallbackWeapon(weaponName);
    }
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