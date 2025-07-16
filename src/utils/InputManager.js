export class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, deltaX: 0, deltaY: 0 };
    this.mouseButtons = {};
    this.isPointerLocked = false;
    this.sensitivity = 0.004; // Mouse sensitivity
    this.scrollDelta = 0; // Scroll wheel delta
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      // Prevent default for game keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyR', 'ShiftLeft', 'KeyT', 'Digit1', 'Digit2'].includes(e.code)) {
        e.preventDefault();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    
    // Mouse events
    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouse.deltaX = e.movementX || 0;
        this.mouse.deltaY = e.movementY || 0;
      }
    });
    
    document.addEventListener('mousedown', (e) => {
      this.mouseButtons[e.button] = true;
      e.preventDefault();
    });
    
    document.addEventListener('mouseup', (e) => {
      this.mouseButtons[e.button] = false;
    });
    
    // Pointer lock events
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null;
      console.log(`🖱️ Pointer lock changed: ${this.isPointerLocked ? 'LOCKED' : 'UNLOCKED'}`);
    });
    
    document.addEventListener('pointerlockerror', () => {
      console.error('❌ Pointer lock failed');
    });

    // Scroll wheel events for camera zoom
    document.addEventListener('wheel', (e) => {
      this.scrollDelta = e.deltaY;
      e.preventDefault(); // Prevent page scrolling
    });
  }

  // Lock the mouse pointer for FPS controls
  lockPointer() {
    console.log('🖱️ Requesting pointer lock...');
    if (document.body.requestPointerLock) {
      document.body.requestPointerLock();
    } else {
      console.warn('⚠️ Pointer lock not supported');
    }
  }

  // Unlock the mouse pointer
  unlockPointer() {
    document.exitPointerLock();
  }

  // Check if a key is currently pressed
  isKeyPressed(keyCode) {
    return this.keys[keyCode] || false;
  }

  // Check if a mouse button is currently pressed
  isMouseButtonPressed(button) {
    return this.mouseButtons[button] || false;
  }

  // Get mouse delta and reset it
  getMouseDelta() {
    const delta = { 
      x: this.mouse.deltaX * this.sensitivity, 
      y: this.mouse.deltaY * this.sensitivity 
    };
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    return delta;
  }

  // Get scroll delta and reset it
  getScrollDelta() {
    const delta = this.scrollDelta;
    this.scrollDelta = 0;
    return delta;
  }

  // Get movement vector based on WASD keys
  getMovementVector() {
    const movement = { x: 0, z: 0 };
    
    if (this.isKeyPressed('KeyW')) movement.z -= 1;
    if (this.isKeyPressed('KeyS')) movement.z += 1;
    if (this.isKeyPressed('KeyA')) movement.x -= 1;
    if (this.isKeyPressed('KeyD')) movement.x += 1;
    
    // Only log when there's actual movement
    if (movement.x !== 0 || movement.z !== 0) {
      console.log(`🎮 Movement: x=${movement.x}, z=${movement.z}`);
    }
    
    // Normalize diagonal movement
    const length = Math.sqrt(movement.x * movement.x + movement.z * movement.z);
    if (length > 0) {
      movement.x /= length;
      movement.z /= length;
    }
    
    return movement;
  }

  // Check for jump input
  isJumpPressed() {
    return this.isKeyPressed('Space');
  }

  // Check for sprint input
  isSprintPressed() {
    return this.isKeyPressed('ShiftLeft');
  }

  // Check for shoot input
  isShootPressed() {
    return this.isMouseButtonPressed(0); // Left mouse button
  }

  // Check for reload input
  isReloadPressed() {
    return this.isKeyPressed('KeyR');
  }

  // Check for crouch input
  isCrouchPressed() {
    return this.isKeyPressed('KeyC');
  }

  // Check for third-person toggle input
  isThirdPersonTogglePressed() {
    return this.isKeyPressed('KeyT');
  }

  // Check for weapon switching keys
  isPrimaryWeaponPressed() {
    return this.isKeyPressed('Digit1');
  }

  isSecondaryWeaponPressed() {
    return this.isKeyPressed('Digit2');
  }

  // Set mouse sensitivity
  setSensitivity(sensitivity) {
    this.sensitivity = sensitivity;
  }

  // Get current sensitivity
  getSensitivity() {
    return this.sensitivity;
  }

  // Cleanup method
  dispose() {
    this.unlockPointer();
    // Event listeners are added to document, so they'll be cleaned up automatically
    // when the page unloads, but we can unlock the pointer here
    console.log('🧹 InputManager disposed');
  }
} 