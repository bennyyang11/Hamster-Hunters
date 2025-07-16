# 🎮 Hamster Hunter Asset Setup Guide

## Overview
This guide shows you how to add 3D models, textures, and audio to your Hamster Hunter game. The game is designed to work with or without these assets using fallback systems.

## 📁 Required Asset Structure

```
assets/
├── models/
│   ├── weapons/
│   │   ├── acorn_shooter.glb
│   │   ├── sunflower_blaster.glb
│   │   ├── pellet_rifle.glb
│   │   ├── hamster_cannon.glb
│   │   ├── nuclear_nut.glb
│   │   ├── silenced_acorn.glb
│   │   ├── assault_acorns.glb
│   │   └── healing_pellets.glb
│   ├── maps/
│   │   ├── office_map.glb
│   │   ├── garden_map.glb
│   │   └── warehouse_map.glb
│   └── characters/
│       ├── hammy_ali.glb
│       ├── mike_nibbson.glb
│       └── chewbacca.glb
├── textures/
│   ├── grass.jpg
│   ├── stone.jpg
│   ├── wood.jpg
│   ├── metal.jpg
│   └── ui/
│       ├── crosshair.png
│       └── health_bar.png
└── audio/
    ├── weapons/
    │   ├── gunshot.mp3
    │   ├── reload.mp3
    │   └── empty_clip.mp3
    ├── footsteps/
    │   ├── grass_step.mp3
    │   └── concrete_step.mp3
    └── ambient/
        ├── background.mp3
        └── wind.mp3
```

## 🛠️ Where to Get Assets

### **1. Free Sources**
- **Sketchfab** (free models): https://sketchfab.com/
  - Search: "cartoon gun", "cute weapon", "hamster", "stylized rifle"
  - Download as GLB/GLTF format
- **Poly Haven**: https://polyhaven.com/ (textures & HDRIs)
- **Freesound.org**: https://freesound.org/ (audio effects)
- **OpenGameArt.org**: https://opengameart.org/

### **2. AI Generated**
- **Meshy.ai**: Text to 3D models
  - Prompts: "cartoon acorn gun", "hamster-sized rifle", "cute sci-fi weapon"
- **Stable Diffusion**: Generate textures
- **ElevenLabs**: Generate voice lines

### **3. Tools to Create Your Own**
- **Blender** (free): Professional 3D modeling
- **Blockbench**: Perfect for voxel/Minecraft-style assets
- **MagicaVoxel**: Easy voxel art creation
- **Audacity**: Free audio editing

## 🎯 Recommended Asset Specifications

### **Weapon Models**
- **Format**: GLB/GLTF (preferred) or FBX
- **Size**: 50-500KB each
- **Polygons**: 500-2000 triangles
- **Textures**: 512x512 or 1024x1024 max
- **Style**: Cartoon/stylized to match hamster theme

### **Textures**
- **Format**: JPG (for performance) or PNG (for transparency)
- **Size**: 512x512 to 1024x1024
- **Tileable**: Yes (for ground/wall textures)

### **Audio**
- **Format**: MP3 or OGG
- **Length**: 0.1-2 seconds for effects, 30-60s for background
- **Quality**: 44.1kHz, 16-bit

## 📝 Asset Implementation Examples

### **Adding a Custom Weapon Model**

1. **Place the model**: `assets/models/weapons/my_custom_gun.glb`

2. **Update WeaponSystem.js**:
```javascript
// Add to your weapon configurations
const WEAPON_CONFIGS = {
  'my_custom_gun': {
    name: 'My Custom Gun',
    damage: 30,
    fireRate: 400,
    accuracy: 0.90,
    modelPath: 'assets/models/weapons/my_custom_gun.glb'
  }
};
```

3. **The AssetLoader will automatically try to load it**

### **Adding a Custom Map**

1. **Place the model**: `assets/models/maps/my_map.glb`

2. **Update main.js**:
```javascript
// In setupEnvironment() method
const mapModel = await this.assetLoader.loadMapModel('my_map', 'assets/models/maps/my_map.glb');
if (mapModel) {
  this.scene.add(mapModel);
}
```

## 🎨 Quick Asset Creation Tips

### **For Weapon Models**
- Keep them small and stylized
- Use bright, cartoonish colors
- Add some "hamster-like" features (nuts, seeds, small size)
- Examples: Acorn-shaped bullets, sunflower seed magazines

### **For Maps**
- Create hamster-scale environments
- Add obstacles at hamster height (1-2 units)
- Use warm, friendly colors
- Include hamster-themed decorations

### **For Audio**
- Use higher-pitched sounds for hamster theme
- Keep weapon sounds punchy but not too aggressive
- Add some "cute" elements to sound effects

## 🚀 Testing Your Assets

1. **Place assets in correct folders**
2. **Start the game**: `npm run dev`
3. **Check browser console for loading messages**:
   - ✅ `🔫 Loaded weapon model: acorn_shooter`
   - ✅ `🗺️ Loaded map: office_map`
   - ✅ `🔊 Loaded audio: gunshot`
   - ⚠️ `🎯 Using fallback model for missing_weapon`

## 📋 Asset Checklist

- [ ] **8 weapon models** placed in `assets/models/weapons/`
- [ ] **Basic textures** (grass, stone, wood, metal) in `assets/textures/`
- [ ] **Audio effects** (gunshot, reload, footsteps) in `assets/audio/`
- [ ] **Test each asset** loads without errors
- [ ] **Verify fallbacks** work for missing assets
- [ ] **Check file sizes** (keep total under 50MB for web)

## 🎯 Asset Optimization

- **Compress textures**: Use tools like TinyPNG
- **Optimize models**: Use Blender's decimate modifier
- **Compress audio**: Use Audacity to reduce file size
- **Use atlases**: Combine multiple textures into one

## 🎮 Next Steps

1. **Start with one weapon model** to test the system
2. **Add basic textures** for ground and obstacles
3. **Include weapon sound effects** for better feedback
4. **Gradually add more assets** as you find/create them
5. **Test performance** - remove assets if game runs slowly

The game will work perfectly fine without any assets (using fallback systems), but adding them will make it much more visually appealing and immersive!

## 🔧 Troubleshooting

- **Model not loading**: Check file path and format (GLB preferred)
- **Texture not showing**: Ensure proper UV mapping and file format
- **Audio not playing**: Check browser audio permissions and file format
- **Performance issues**: Reduce model complexity and texture sizes

Remember: The game has robust fallback systems, so missing assets won't break the game - they'll just use simple geometric shapes instead! 