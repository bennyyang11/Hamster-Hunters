# Hamster Hunter - Quick Start Guide 🐹🔫

## 🚀 Immediate Next Steps (Do These First!)

### 1. Node.js Installation & Setup (30 minutes)
```bash
# Your immediate actions:
1. Download Node.js from nodejs.org
2. Install Node.js LTS version (v18+)
3. Create new folder "hamster-hunter"
4. Run these commands in the folder:
   npm init -y
   npm install three socket.io socket.io-client
   npm install --save-dev vite nodemon concurrently
```

### 2. Project Structure Setup (10 minutes)
```bash
# Create these folders in your project:
hamster-hunter/
├── src/player/
├── src/weapons/
├── src/networking/
├── src/gamemodes/
├── src/ui/
├── src/utils/
├── server/
├── public/
├── assets/models/
├── assets/textures/
└── assets/audio/
```

### 3. Your First AI Learning Session (45 minutes)
Open your AI assistant and start with these prompts:

```
"I'm building a multiplayer FPS game in Three.js called Hamster Hunter. I'm a beginner with Three.js but experienced with programming. Explain Three.js core architecture - Scene, Camera, Renderer, and how WebGL works - in simple terms."

"Now show me how to create a basic FPS controller class in Three.js using JavaScript. Include mouse look, WASD movement, and jumping. Explain each part of the code."

"Generate a complete, working FPS controller class that I can immediately test in the browser. Make sure it includes proper input handling and smooth movement."
```

## 📋 Today's Specific Goals (Day 1)

### Morning Session (2-3 hours)
- [ ] **Complete Three.js setup** (follow THREEJS_SETUP_GUIDE.md)
- [ ] **Create basic test scene** with ground plane and lighting
- [ ] **Generate FPS controller class** using AI
- [ ] **Test player movement** in the browser

### Afternoon Session (3-4 hours)
- [ ] **Implement mouse look** camera control
- [ ] **Add jumping mechanics**
- [ ] **Create player class** with proper structure
- [ ] **Test and refine** movement feel

### AI Prompts for Today
```
"My FPS controller feels sluggish. Here's my code: [paste code]. How can I make the movement more responsive?"

"I want to add hamster-like movement characteristics - faster acceleration, smaller jumps, quick direction changes. Modify this controller: [paste code]"

"How do I set up JavaScript input handling for FPS controls in Three.js? Show me the complete setup process."
```

## 🎯 Week Overview

### Days 1-2: Foundation
- Basic FPS controller working
- Simple multiplayer connection with Socket.io
- Player spawning and movement sync

### Days 3-5: Core Game
- Weapon system and shooting
- Health/damage system
- Team deathmatch mode

### Days 6-7: Polish
- Character classes and customization
- Additional game modes
- UI and final polish

## 🤖 AI Learning Strategy

### The "Explain-Then-Code" Method
Always ask for explanations before code:
```
"First explain how [concept] works in Unity, then show me a complete code example"
```

### The "Immediate Test" Method
Ask for code you can test right away:
```
"Create a simple test script for [feature] that I can drag onto a GameObject and see results immediately"
```

### The "Build-Up" Method
Start simple, then add complexity:
```
"Show me the simplest possible [system]. Now add [feature]. Now make it more robust by adding [advanced feature]."
```

## 📊 Success Metrics for Today

### Technical
- [ ] Player can move smoothly with WASD
- [ ] Mouse look works without issues
- [ ] Jumping feels responsive
- [ ] No console errors in browser

### Learning
- [ ] You understand Three.js scene structure
- [ ] You can explain how the FPS controller works
- [ ] You successfully modified AI-generated code
- [ ] You documented your learning process

## 🚨 Common Day 1 Issues & Solutions

### Issue: "Module not found errors"
**Solution**: Run `npm install` to install dependencies, check import paths

### Issue: "Server won't start"
**Solution**: Check if port 3000/3001 is available, kill other processes if needed

### Issue: "Movement feels weird"
**Solution**: Check deltaTime usage in animation loop, ensure proper frame rate

### Issue: "Camera spinning out of control"
**Solution**: Lock cursor with `document.body.requestPointerLock();`

## 🎮 Hamster Hunter Specific Features

### Character Personality Through Code
Ask AI to help you add hamster-like characteristics:
```
"How can I make the player movement feel more like a hamster? Consider: quick acceleration, nervous twitching, small size, agile movement"

"Add subtle idle animations or movement quirks that make the player feel like a hamster warrior"
```

### Weapon Theming
```
"Design weapon names and stats that fit the hamster theme: tiny but effective weapons, food-based ammo, hamster-sized equipment"
```

## 📝 End-of-Day Checklist

### Before You Stop:
- [ ] Fill out Day 1 section in DAILY_LEARNING_LOG.md
- [ ] Commit your code to git
- [ ] Note your most effective AI prompts
- [ ] Plan tomorrow's first 3 tasks
- [ ] Test your current build works in browser

### Git Commands:
```bash
git add .
git commit -m "Day 1: Basic FPS controller implementation"
git push origin main
```

## 🔄 Tomorrow's Preview (Day 2)

### Morning Goals:
- Set up Socket.io server and client
- Create networked player controller
- Test basic multiplayer connection

### Key AI Prompts to Prepare:
```
"Explain Socket.io architecture and how to convert a single-player controller to multiplayer"

"Show me how to create a Socket.io setup that synchronizes player movement across all clients"
```

## 💪 Motivation

Remember: You're not just building a game - you're proving that with AI assistance, you can master any new technology quickly. Every Unity concept you learn, every C# pattern you understand, every networking principle you grasp is building your ability to tackle unfamiliar technical challenges.

**Your hamster army awaits! Let's build something amazing! 🐹⚔️**

---

**Need help?** Check these files:
- `THREEJS_SETUP_GUIDE.md` - Detailed setup instructions
- `AI_LEARNING_GUIDE.md` - Advanced AI learning techniques
- `DEVELOPMENT_ROADMAP.md` - Complete 7-day plan
- `DAILY_LEARNING_LOG.md` - Track your progress

**Ready to start?** Open your terminal, create your project, and ask your first AI question! 