// Audio manager for weapon sound effects and lobby music
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterVolume = 0.3; // For sound effects
    this.musicVolume = 0.2; // For background music (lower by default)
    this.weaponSounds = new Map();
    this.currentlyPlayingAudio = new Map();
    this.lobbyMusic = null;
    this.lobbyMusicSource = null;
    this.lobbyMusicGain = null;
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

  // Load lobby music
  async loadLobbyMusic() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log('🎵 Loading lobby music...');
      
      const response = await fetch('/assets/audio/jazz-lounge-elevator-music-332339.mp3');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.lobbyMusic = audioBuffer;
      console.log('✅ Lobby music loaded successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load lobby music:', error);
      return false;
    }
  }

  // Start playing lobby music
  async startLobbyMusic() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.lobbyMusic) {
      await this.loadLobbyMusic();
    }

    if (!this.lobbyMusic) {
      console.warn('⚠️ Lobby music not available');
      return;
    }

    // Stop existing lobby music if playing
    this.stopLobbyMusic();

    try {
      // Resume audio context if suspended (required by modern browsers)
      if (this.audioContext.state === 'suspended') {
        console.log('🔊 Resuming suspended audio context...');
        await this.audioContext.resume();
      }

      this.lobbyMusicSource = this.audioContext.createBufferSource();
      this.lobbyMusicGain = this.audioContext.createGain();

      // Setup audio chain: source -> gain -> destination
      this.lobbyMusicSource.buffer = this.lobbyMusic;
      this.lobbyMusicSource.connect(this.lobbyMusicGain);
      this.lobbyMusicGain.connect(this.audioContext.destination);
      
      // Set volume and looping
      this.lobbyMusicGain.gain.value = this.musicVolume;
      this.lobbyMusicSource.loop = true;
      
      // Start playback
      this.lobbyMusicSource.start(0);
      
      console.log(`🎵 Lobby music started - Volume: ${Math.round(this.musicVolume * 100)}% - Audio Context State: ${this.audioContext.state}`);
    } catch (error) {
      console.error('❌ Failed to start lobby music:', error);
      throw error; // Re-throw so the calling code can handle it
    }
  }

  // Stop lobby music
  stopLobbyMusic() {
    if (this.lobbyMusicSource) {
      try {
        // Fade out smoothly
        if (this.lobbyMusicGain) {
          this.lobbyMusicGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
        }
        
        // Stop after fade
        setTimeout(() => {
          try {
            if (this.lobbyMusicSource) {
              this.lobbyMusicSource.stop();
            }
          } catch (e) {
            // Source might already be stopped
          }
          this.lobbyMusicSource = null;
          this.lobbyMusicGain = null;
        }, 500);
        
      } catch (error) {
        console.warn('⚠️ Error stopping lobby music:', error);
      }
      
      console.log('🔇 Lobby music stopped');
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

  // Stop all currently playing audio (weapons only, not lobby music)
  stopAllAudio() {
    for (const weaponName of this.currentlyPlayingAudio.keys()) {
      this.stopWeaponAudio(weaponName);
    }
  }

  // Stop everything including lobby music
  stopEverything() {
    this.stopAllAudio();
    this.stopLobbyMusic();
  }

  // Set sound effects volume
  setSoundVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Update volume for currently playing weapon audio
    for (const { gainNode } of this.currentlyPlayingAudio.values()) {
      gainNode.gain.value = this.masterVolume;
    }
  }

  // Set music volume
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    // Update volume for currently playing lobby music
    if (this.lobbyMusicGain) {
      this.lobbyMusicGain.gain.value = this.musicVolume;
    }
  }

  // Get current volumes
  getSoundVolume() {
    return this.masterVolume;
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  // Check if weapon audio is currently playing
  isPlaying(weaponName) {
    return this.currentlyPlayingAudio.has(weaponName);
  }

  // Check if lobby music is playing
  isLobbyMusicPlaying() {
    return this.lobbyMusicSource !== null;
  }
} 