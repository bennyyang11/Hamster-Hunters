# 3D Models Directory

## Weapon Models (assets/models/weapons/)
Place your weapon 3D models here in GLB/GLTF format:

- `acorn_shooter.glb` - Basic hamster weapon that shoots acorns
- `sunflower_blaster.glb` - Rapid-fire sunflower seed weapon
- `pellet_rifle.glb` - Precision hamster pellet rifle
- `hamster_cannon.glb` - Heavy artillery hamster cannon
- `nuclear_nut.glb` - Explosive nut launcher
- `silenced_acorn.glb` - Stealth acorn weapon
- `assault_acorns.glb` - Automatic acorn rifle
- `healing_pellets.glb` - Support weapon that heals teammates

## Map Models (assets/models/maps/)
Place your level/environment models here:

- `office_map.glb` - Office environment for hamster warfare
- `garden_map.glb` - Garden level with plants and obstacles
- `warehouse_map.glb` - Industrial warehouse setting

## Character Models (assets/models/characters/)
Place your hamster character models here:

- `hammy_ali.glb` - Speed-focused hamster character
- `mike_nibbson.glb` - Heavy-hitting hamster
- `chewbacca.glb` - Tank hamster character

## Model Requirements
- **Format**: GLB (preferred) or GLTF
- **Size**: Keep under 1MB per model
- **Polygons**: 500-2000 triangles for weapons, 5000-10000 for maps
- **Textures**: Embedded or separate, max 1024x1024
- **Style**: Cartoon/stylized to match hamster theme

## Testing
The game will automatically try to load these models. If they don't exist, it will use fallback geometric shapes. 