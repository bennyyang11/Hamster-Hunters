# Three.js Setup Guide for Hamster Hunter

## Prerequisites Installation

### Step 1: Install Node.js
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install the LTS version (v18 or later)
3. Verify installation by running `node --version` in terminal

### Step 2: Create Project Directory
1. Create a new folder named "hamster-hunter"
2. Open terminal/command prompt in this folder
3. Initialize npm project: `npm init -y`

## Essential Package Installation

### Step 3: Install Three.js and Dependencies
Run these commands in your project directory:
```bash
npm install three
npm install socket.io socket.io-client
npm install vite --save-dev
npm install @types/three --save-dev
```

### Step 4: Install Additional Development Dependencies
```bash
npm install --save-dev @vitejs/plugin-basic-ssl
npm install --save-dev express
npm install --save-dev nodemon
npm install --save-dev concurrently
```

## Project Structure Setup

### Step 5: Create Folder Structure
Create these directories in your project root:
```
hamster-hunter/
├── src/
│   ├── player/
│   ├── weapons/
│   ├── networking/
│   ├── gamemodes/
│   ├── ui/
│   ├── utils/
│   └── main.js
├── server/
│   ├── index.js
│   ├── gameserver.js
│   └── rooms/
├── public/
│   ├── index.html
│   └── styles.css
├── assets/
│   ├── models/
│   ├── textures/
│   ├── audio/
│   └── fonts/
├── package.json
├── vite.config.js
└── README.md
```

## Basic Files Setup

### Step 6: Create Core Files
1. **public/index.html**
   - Main HTML file that loads the game
   - Contains canvas element for Three.js rendering

2. **src/main.js**
   - Entry point for the game client
   - Initializes Three.js scene and game logic

3. **server/index.js**
   - Node.js server entry point
   - Sets up Express server and Socket.io

### Step 7: Basic Configuration Files
Create these essential files:

**vite.config.js**
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
```

## Networking Setup

### Step 8: Configure Socket.io Server
**server/index.js**
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static('public'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 9: Create Basic Player Class Structure
**src/player/Player.js**
```javascript
import * as THREE from 'three';

export class Player {
  constructor(scene, camera, id = 'local') {
    this.scene = scene;
    this.camera = camera;
    this.id = id;
    this.position = new THREE.Vector3(0, 1, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    
    this.createPlayerMesh();
    this.setupControls();
  }

  createPlayerMesh() {
    const geometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  setupControls() {
    // Will be implemented with FPS controls
  }
}
```

## Input System Setup

### Step 10: Configure Input Handling
**src/utils/InputManager.js**
```javascript
export class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, deltaX: 0, deltaY: 0 };
    this.mouseButtons = {};
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    
    // Mouse events
    document.addEventListener('mousemove', (e) => {
      this.mouse.deltaX = e.movementX || 0;
      this.mouse.deltaY = e.movementY || 0;
    });
    
    document.addEventListener('mousedown', (e) => {
      this.mouseButtons[e.button] = true;
    });
    
    document.addEventListener('mouseup', (e) => {
      this.mouseButtons[e.button] = false;
    });
  }

  isKeyPressed(keyCode) {
    return this.keys[keyCode] || false;
  }

  isMouseButtonPressed(button) {
    return this.mouseButtons[button] || false;
  }

  getMouseDelta() {
    const delta = { x: this.mouse.deltaX, y: this.mouse.deltaY };
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    return delta;
  }
}
```

## Version Control Setup

### Step 11: Git Configuration
Create these files in your project root:

**.gitignore**:
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Build outputs
dist/
build/
*.tgz

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
```

Initialize git:
```bash
git init
git add .
git commit -m "Initial Three.js project setup"
```

## Performance Settings

### Step 12: Optimize Development Settings
**package.json** scripts section:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "client": "vite",
    "server": "nodemon server/index.js",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server/index.js"
  }
}
```

**Performance optimizations in src/main.js**:
```javascript
// Enable antialiasing for better visual quality
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  powerPreference: "high-performance"
});

// Optimize shadow settings
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Set pixel ratio for different devices
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

## Testing the Setup

### Step 13: Verify Installation
Run these commands to test your setup:
```bash
# Test server
npm run server

# Test client (in another terminal)
npm run client
```

### Step 14: Create Basic Test Files
**public/index.html**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hamster Hunter</title>
    <style>
        body { margin: 0; overflow: hidden; font-family: Arial, sans-serif; }
        #gameCanvas { display: block; }
        #ui { position: absolute; top: 10px; left: 10px; color: white; z-index: 100; }
    </style>
</head>
<body>
    <div id="ui">
        <div id="fps">FPS: 0</div>
        <div id="players">Players: 0</div>
    </div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**src/main.js**:
```javascript
import * as THREE from 'three';
import { io } from 'socket.io-client';

// Initialize Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add basic lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Add ground plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Add test cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.y = 0.5;
scene.add(cube);

// Position camera
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

// Connect to server
const socket = io('http://localhost:3001');

socket.on('connect', () => {
    console.log('Connected to server');
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate cube for testing
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
```

## Next Steps

### Immediate Actions:
1. ✅ Complete Node.js installation and project creation
2. ✅ Set up folder structure
3. ✅ Install required packages
4. ✅ Create basic HTML and JS files
5. ✅ Configure Socket.io basics

### Day 1 Goals:
- [ ] Create basic FPS controller
- [ ] Implement mouse look
- [ ] Add basic movement
- [ ] Test in web browser

### Common Issues & Solutions:

**Problem**: Port already in use
**Solution**: Change port in package.json or kill process on port 3000/3001

**Problem**: Module not found errors
**Solution**: Run `npm install` to install dependencies

**Problem**: CORS issues
**Solution**: Check Socket.io server configuration and origins

**Problem**: Three.js not loading
**Solution**: Check import statements and network tab in browser dev tools

## AI Learning Integration

### Starting Prompts for Day 1:
```
"I just set up Three.js for a multiplayer FPS project. What should I implement first?"

"Show me how to create a basic FPS controller class in Three.js"

"Explain Three.js scene structure and how to use it for game development"

"What are the essential Three.js concepts I need for multiplayer game development?"
```

### Development Workflow:
1. **Plan** - Ask AI to help design your approach
2. **Code** - Use AI to generate and explain code
3. **Test** - Implement and test in browser
4. **Debug** - Use AI to solve problems
5. **Optimize** - Ask AI for performance improvements

## Resource Links

### Essential Three.js Resources:
- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Three.js Journey Course](https://threejs-journey.com/)
- [Socket.io Documentation](https://socket.io/docs/)

### Community Resources:
- Three.js Discord Server
- r/threejs on Reddit
- Stack Overflow
- YouTube channels: Bruno Simon, Three.js Journey

### AI-Specific Resources:
- Use AI for code generation and learning
- Ask AI to explain Three.js concepts
- Request AI help for debugging
- Get AI assistance for optimization

Remember: The goal is to move fast and learn efficiently. Don't get stuck on perfectionism - focus on getting a working prototype quickly, then iterate and improve! 