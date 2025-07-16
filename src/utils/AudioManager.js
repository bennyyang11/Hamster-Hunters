// Audio manager for weapon sound effects
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterVolume = 0.3; // Reduce volume for better gameplay experience
    this.weaponSounds = new Map();
    this.currentlyPlayingAudio = new Map();
    this.initialized = false;
  }

  // Initialize audio context (must be called after user interaction)
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('🔊 Audio system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
    }
  }

  // Load weapon audio files
  async loadWeaponAudio(weaponName, audioPath) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log(`🎵 Loading audio for ${weaponName}:`, audioPath);
      
      const response = await fetch(audioPath);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.weaponSounds.set(weaponName, audioBuffer);
      console.log(`✅ Audio loaded for ${weaponName}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to load audio for ${weaponName}:`, error);
      return false;
    }
  }

  // Start playing weapon audio (with looping for automatic weapons)
  startWeaponAudio(weaponName, loop = true) {
    if (!this.initialized || !this.weaponSounds.has(weaponName)) {
      console.warn(`⚠️ Audio not available for ${weaponName}`);
      return null;
    }

    // Stop existing audio for this weapon if playing
    this.stopWeaponAudio(weaponName);

    const audioBuffer = this.weaponSounds.get(weaponName);
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    // Setup audio chain: source -> gain -> destination
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Set volume
    gainNode.gain.value = this.masterVolume;
    
    // Set looping for automatic weapons
    source.loop = loop;
    
    // Start playback
    source.start(0);
    
    // Store reference for stopping later
    this.currentlyPlayingAudio.set(weaponName, { source, gainNode });
    
    console.log(`🔊 Started audio for ${weaponName} (loop: ${loop})`);
    return source;
  }

  // Stop weapon audio
  stopWeaponAudio(weaponName) {
    if (this.currentlyPlayingAudio.has(weaponName)) {
      const { source, gainNode } = this.currentlyPlayingAudio.get(weaponName);
      
      try {
        // Fade out quickly to avoid pops
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        // Stop after fade
        setTimeout(() => {
          try {
            source.stop();
          } catch (e) {
            // Source might already be stopped
          }
        }, 100);
        
      } catch (error) {
        console.warn('⚠️ Error stopping audio:', error);
      }
      
      this.currentlyPlayingAudio.delete(weaponName);
      console.log(`🔇 Stopped audio for ${weaponName}`);
    }
  }

  // Play one-shot audio (for single fire weapons)
  playWeaponShot(weaponName) {
    return this.startWeaponAudio(weaponName, false); // No looping
  }

  // Stop all currently playing audio
  stopAllAudio() {
    for (const weaponName of this.currentlyPlayingAudio.keys()) {
      this.stopWeaponAudio(weaponName);
    }
  }

  // Set master volume
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Update volume for currently playing audio
    for (const { gainNode } of this.currentlyPlayingAudio.values()) {
      gainNode.gain.value = this.masterVolume;
    }
  }

  // Check if weapon audio is currently playing
  isPlaying(weaponName) {
    return this.currentlyPlayingAudio.has(weaponName);
  }
} 