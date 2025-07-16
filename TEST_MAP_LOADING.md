# 🗺️ Map Loading Test Guide

## Test the Nuketown Map Loading

### 1. **Start the Game**
```bash
npm run dev
```

### 2. **Open Browser Console** 
- Press `F12` to open developer tools
- Click on the `Console` tab

### 3. **Check Loading Messages**
You should see these messages when the page loads:
```
🎮 Initializing Hamster Hunter...
📦 Loading game assets...
🏗️ Setting up environment...
🗺️ Loaded map: nuketown
🗺️ Using custom map model
📐 Map bounding box: [NUMBER] children
✅ Nuketown map loaded and positioned
📷 Camera positioned at: Vector3 {x: 0, y: 2, z: 5}
✅ Hamster Hunter initialized successfully!
```

### 4. **Click START GAME**
After clicking the start button, you should see:
```
🎮 Starting Hamster Hunter...
✅ Start screen hidden
🗺️ Positioning camera for custom map
🎬 Scene has [NUMBER] objects
✅ Game started successfully
```

### 5. **What You Should See**
- ✅ **Black screen disappears** (start screen hidden)
- ✅ **3D Nuketown map** visible in the scene
- ✅ **Smaller scale** (0.1x) for hamster-sized gameplay
- ✅ **Camera positioned** to see the map from above and behind

### 6. **If You See Issues**

**⚠️ "Using procedural environment" message:**
- Map failed to load
- Check if `assets/models/maps/nuketown.glb` exists
- File might be corrupted

**⚠️ Black screen after clicking START GAME:**
- Camera positioning issue
- Check console for error messages
- Fallback scene should appear

**⚠️ Map too small/large:**
- Adjust scale in `setupEnvironment()` method
- Change `customMap.scale.set(0.1, 0.1, 0.1)` to different values

## Quick Fixes

### **Map Not Loading:**
```javascript
// In setupEnvironment(), try different path
const customMap = await this.assetLoader.loadMapModel('nuketown', './assets/models/maps/nuketown.glb');
```

### **Map Wrong Size:**
```javascript
// Make bigger
customMap.scale.set(0.5, 0.5, 0.5);

// Make smaller  
customMap.scale.set(0.05, 0.05, 0.05);
```

### **Camera Too Close:**
```javascript
// Move camera further back
this.camera.position.set(0, 5, 10);
```

## Expected File Structure
```
assets/
└── models/
    └── maps/
        └── nuketown.glb (31MB)
```

## Success Indicators
- ✅ Console shows "🗺️ Loaded map: nuketown"
- ✅ Scene has more than 10 objects
- ✅ 3D Nuketown environment visible
- ✅ Camera positioned to see the map
- ✅ No red error messages in console 