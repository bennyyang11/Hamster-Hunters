# Hamster Hunter 🐹🔫

A multiplayer 3D FPS game featuring hamsters in intense combat scenarios. Think Call of Duty meets adorable rodents!

## Project Overview

**Engine:** Three.js  
**Language:** JavaScript  
**Networking:** Socket.io  
**Platform:** Web Browser (cross-platform)  
**Genre:** Multiplayer First-Person Shooter  

## Game Concept

### Classes
- **Tactical Chewer** - Stealth and precision focused
- **Fluff 'n' Reload** - Heavy weapons specialist  
- **Squeak or be Squeakened** - Assault class
- **Guns and Whiskers** - Support/medic class

### Character Roster
- **Hammy Ali** - Speed and agility focused
- **Mike Nibbson** - Heavy hitter with powerful attacks
- **Chewbacca** - Tanky defender
- **Ham Solo** - Lone wolf sniper
- **Lil Gnawz X** - Rapid fire specialist
- **Kanye Nibbles** - Versatile all-rounder

### Game Modes
- **Hamster Havoc** - Team Deathmatch (4v4 or 6v6)
- **Last Ham Standing** - Battle Royale elimination
- **Nuts of Fury** - Gun Game progression mode

## Technical Requirements

### Core Features
- [x] Three.js setup
- [ ] Basic FPS controls and camera
- [ ] Hamster character models and animations
- [ ] Weapon systems
- [ ] Multiplayer networking with Socket.io
- [ ] Player progression system
- [ ] Multiple game modes
- [ ] UI/UX systems

### Performance Goals
- 60 FPS minimum
- Sub-50ms latency for multiplayer
- Support for 8-12 concurrent players

## Development Timeline

### Days 1-2: Foundation
- Three.js project setup
- Basic FPS controller
- Simple multiplayer connection with Socket.io
- Prototype level

### Days 3-5: Core Systems
- Weapon mechanics
- Character classes
- Multiplayer synchronization
- Game mode implementations

### Days 6-7: Polish & Testing
- UI implementation
- Character customization
- Performance optimization
- Multiplayer stress testing

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git for version control

### Installation
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Open browser to `http://localhost:3000`

## Architecture

### Project Structure
```
hamster-hunter/
├── src/
│   ├── player/
│   ├── weapons/
│   ├── networking/
│   ├── gamemodes/
│   ├── ui/
│   └── utils/
├── assets/
│   ├── models/
│   ├── textures/
│   └── audio/
├── server/
├── public/
└── package.json
```

## License
MIT License - See LICENSE file for details 