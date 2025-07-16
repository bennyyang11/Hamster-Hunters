import { AudioManager } from './AudioManager.js';

// Create a shared audio manager instance
export const sharedAudioManager = new AudioManager();

// Initialize the audio manager on first user interaction
let audioInitialized = false;

export const initializeAudio = async () => {
  if (!audioInitialized) {
    await sharedAudioManager.initialize();
    audioInitialized = true;
  }
  return sharedAudioManager;
}; 