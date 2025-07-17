// Hamster Hunter Game Engine - Integrates UIKit with Three.js Game
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls, Sky, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Import game systems
import { Player } from './player/Player.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { AudioManager } from './utils/AudioManager.js';
import { sharedAudioManager } from './utils/SharedAudioManager.js';
import { WeaponManager } from './weapons/WeaponSystem.js';
import { BulletSystem } from './utils/BulletSystem.js';
import { InputManager } from './utils/InputManager.js';
import { TestDummy } from './utils/TestDummy.js';
import { HamsterHavoc } from './gamemodes/GameMode.js';
import { RenderOptimizer } from './utils/RenderOptimizer.js';

// Get class weapons data
function getClassWeapons(selectedClass) {
  const HAMSTER_CLASSES = {
    'Tactical Chewer': {
      primary: 'SCAR-H',
      secondary: 'Model 870'
    },
    'Fluff \'n\' reload': {
      primary: 'AK-47', 
      secondary: 'MP5'
    },
    'Squeak or be Squeakened': {
      primary: 'Mini UZI',
      secondary: 'SPAS-12'
    },
    'Guns and Whiskers': {
      primary: 'AUG A1',
      secondary: 'AN-94'
    }
  };
  
  return HAMSTER_CLASSES[selectedClass?.name] || null;
}

// Game Scene Component
function GameScene({ selectedWeapon, selectedClass, selectedGameMode, selectedTeam, onGameExit, isPaused, setIsPaused, mouseSensitivity, onUpdateWeaponStats, onUpdatePlayerPosition, gameStateRef }) {
  const { scene, camera, gl } = useThree();
  const playerRef = useRef();

  // Apply sensitivity changes to player
  useEffect(() => {
    if (gameStateRef.current.player) {
      // Update player's mouse sensitivity multiplier
      const player = gameStateRef.current.player;
      player.mouseSensitivityMultiplier = mouseSensitivity;
      console.log(`🖱️ Mouse sensitivity updated to ${mouseSensitivity.toFixed(1)}x (effective: ${(mouseSensitivity * 1.0).toFixed(3)})`);
    }
  }, [mouseSensitivity]);

  // Initialize game systems
  useEffect(() => {
    if (gameStateRef.current.isInitialized) return;

    const initializeGame = async () => {
      console.log('🎮 Initializing Hamster Hunter Game...');
      
      // Initialize core systems
      const assetLoader = new AssetLoader();
      const audioManager = new AudioManager();
      const bulletSystem = new BulletSystem(scene, assetLoader);
      const weaponManager = new WeaponManager(scene, assetLoader, camera, bulletSystem);
      const gameMode = new HamsterHavoc();
      
      // Initialize render optimizer for performance
      const renderOptimizer = new RenderOptimizer(camera, gl);
      console.log('🎯 Render optimizer initialized for performance monitoring and LOD');

      // Load hamster character model FIRST (before creating player)
      console.log('📦 Loading hamster character model...');
      try {
        await assetLoader.loadWeaponModel("hamster", "/hamster.glb");
        console.log('🐹 Hamster character model loaded and ready');
      } catch (error) {
        console.warn('⚠️ Could not load hamster model, will use fallback');
      }

      // Setup camera for third-person with optimized view distance
      camera.position.set(0, 5, 10);
      camera.rotation.set(-0.2, 0, 0); // Look slightly downward
      camera.fov = 75;
      camera.near = 0.1; // Close clipping plane
      camera.far = 1000; // Optimized far clipping plane (reduced from 5000)
      camera.updateProjectionMatrix();
      console.log('📷 Camera configured with optimized view distance (far: 1000) for better performance');

      // Disable fog to ensure clear long-distance visibility
      scene.fog = null;
      console.log('🌫️ Fog disabled for clear map visibility');

      // Add subtle lighting for natural map visibility
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.25); // Much lower ambient light
      scene.add(ambientLight);
      
      // Add directional light for shadows and depth
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3); // Much lower intensity
      directionalLight.position.set(100, 200, 100);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = 5000; // Match camera far distance
      scene.add(directionalLight);
      
      console.log('💡 Subtle lighting added for natural visibility');

      // Create player at a safe spawn position (NOW the hamster model is available)
      console.log(`🐹 Creating player with selected class:`, selectedClass);
      console.log(`🐹 Class name: "${selectedClass?.name || 'No class selected'}"`);
      console.log(`🎯 Selected team:`, selectedTeam);
      console.log(`🎮 Selected game mode:`, selectedGameMode);
      
      const playerClass = selectedClass?.name || 'Tactical Chewer'; // Default to Tactical Chewer if no class selected
      console.log(`🐹 Using player class: "${playerClass}"`);
      
      // Create player at temporary position - will be updated by server spawn position
      const initialPosition = new THREE.Vector3(0, 40, 0); // Neutral center position
      console.log(`🎯 Creating player at temporary position: (${initialPosition.x}, ${initialPosition.y}, ${initialPosition.z})`);
      
      const player = new Player(
        'local_player',
        'default_hamster',
        playerClass, // Use actual selected class instead of hardcoded 'assault'
        initialPosition, // Temporary position - server will send actual spawn point
        scene,
        assetLoader,
        camera
      );

      // Setup socket connection for multiplayer
      try {
        // Dynamically import socket.io-client
        const { io } = await import('socket.io-client');
        const socket = io('http://localhost:3001');
        
        player.socket = socket;
        
        // Store reference to all other players
        const otherPlayers = new Map();

        // Helper functions for multiplayer (DEFINE BEFORE USING)
        function createOtherPlayer(playerData, scene, assetLoader, otherPlayers) {
          console.log(`🐹 Creating mesh for other player: ${playerData.id}`);
          
          try {
            // Try to use the loaded hamster model
            const hamsterModel = assetLoader?.getModel("hamster");
            let playerMesh;
            
            if (hamsterModel) {
              // Use the loaded hamster.glb model
              playerMesh = hamsterModel.clone();
              console.log('✅ Using loaded hamster.glb model for other player');
              
              // Scale the hamster to LARGE size
              playerMesh.scale.set(75.0, 75.0, 75.0);
              
                          // Keep natural hamster colors (no team coloring)
            // All hamsters will look the same regardless of team
              
                        // Set initial hamster rotation based on player data
          const initialRotation = playerData.rotation?.y || 0;
          playerMesh.rotation.y = Math.PI + initialRotation; // Add π to account for hamster facing direction
              
            } else {
              // Fallback: Create a geometric hamster
              console.log('⚠️ Using fallback geometry for other player');
              const bodyGeometry = new THREE.CapsuleGeometry(30, 60, 4, 8);
              const teamColor = playerData.team === 'wheel-warriors' ? 0x4080ff : 0xff6040;
              const bodyMaterial = new THREE.MeshLambertMaterial({ color: teamColor });
              
              playerMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
            }
            
                      // Position the mesh
          console.log(`🔍 Positioning other player with data:`, playerData.position);
          const xPos = playerData.position?.x || 0;
          const yPos = playerData.position?.y || 40;
          const zPos = playerData.position?.z || 0;
          
          playerMesh.position.set(xPos, yPos, zPos);
          console.log(`📍 Set mesh position to: (${xPos}, ${yPos}, ${zPos})`);
            
            playerMesh.castShadow = true;
            playerMesh.receiveShadow = true;
            
                      // Add name label above player
          const nameLabel = createPlayerNameLabel(playerData.character || playerData.id, playerData.team);
          nameLabel.position.set(0, 100, 0); // Above the hamster
          playerMesh.add(nameLabel);
          
          // Add weapon to other player
          addWeaponToOtherPlayer(playerMesh, playerData, assetLoader);
          
          // Add to scene
          scene.add(playerMesh);
            
            // Store player data
            const otherPlayerData = {
              id: playerData.id,
              mesh: playerMesh,
              character: playerData.character,
              team: playerData.team,
              position: new THREE.Vector3(
                playerData.position?.x || 0,
                playerData.position?.y || 40,
                playerData.position?.z || 0
              ),
              rotation: { y: playerData.rotation?.y || 0 }
            };
            
            otherPlayers.set(playerData.id, otherPlayerData);
            console.log(`👥 ✅ Created other player mesh: ${playerData.id} (${playerData.team})`);
            console.log(`📍 Player positioned at: (${playerMesh.position.x}, ${playerMesh.position.y}, ${playerMesh.position.z})`);
            console.log(`🎬 Added to scene. Scene children count: ${scene.children.length}`);
            
          } catch (error) {
            console.error(`❌ Failed to create other player mesh:`, error);
          }
        }

        function updateOtherPlayer(playerData, otherPlayers) {
          const otherPlayer = otherPlayers.get(playerData.id);
          if (otherPlayer) {
            // Update position if provided
            if (playerData.position) {
              otherPlayer.position.copy(playerData.position);
              if (otherPlayer.mesh) {
                otherPlayer.mesh.position.copy(playerData.position);
              }
            }
            
            // Check if character class has changed
            const oldCharacter = otherPlayer.character;
            const newCharacter = playerData.character || otherPlayer.character;
            
            // Update other properties
            otherPlayer.character = newCharacter;
            otherPlayer.team = playerData.team || otherPlayer.team;
            
            // If character class changed, update weapon
            if (oldCharacter !== newCharacter && otherPlayer.mesh) {
              console.log(`🔫 Character class changed from "${oldCharacter}" to "${newCharacter}" - updating weapon`);
              
              // Remove old weapon(s) from mesh
              const weaponsToRemove = [];
              otherPlayer.mesh.traverse((child) => {
                if (child.userData && child.userData.isWeapon) {
                  weaponsToRemove.push(child);
                }
              });
              weaponsToRemove.forEach(weapon => {
                otherPlayer.mesh.remove(weapon);
              });
              
              // Add new weapon based on updated character class
              addWeaponToOtherPlayer(otherPlayer.mesh, { 
                id: playerData.id, 
                character: newCharacter,
                class: playerData.class || newCharacter
              }, assetLoader);
            }
            
            console.log(`👥 Updated other player: ${playerData.id}`);
          }
        }

        function removeOtherPlayer(playerId, scene, otherPlayers) {
          const otherPlayer = otherPlayers.get(playerId);
          if (otherPlayer && otherPlayer.mesh) {
            scene.remove(otherPlayer.mesh);
            otherPlayers.delete(playerId);
            console.log(`👥 ❌ Removed other player: ${playerId}`);
          }
        }

        function createPlayerNameLabel(playerName, team) {
          // Create a simple plane for the name label
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 64;
          
          // Set background and text
          context.fillStyle = team === 'wheel-warriors' ? '#4080ff' : '#ff6040';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          context.fillStyle = 'white';
          context.font = 'bold 24px Arial';
          context.textAlign = 'center';
          context.fillText(playerName, canvas.width / 2, canvas.height / 2 + 8);
          
          // Create texture and material
          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            side: THREE.DoubleSide
          });
          
          const geometry = new THREE.PlaneGeometry(40, 10);
          const nameMesh = new THREE.Mesh(geometry, material);
          
          return nameMesh;
        }

        function addWeaponToOtherPlayer(playerMesh, playerData, assetLoader) {
          try {
            // Get primary weapon based on character class
            const characterClass = playerData.character || playerData.class;
            let weaponKey = 'ak47'; // Default weapon
            
            // Map character classes to their primary weapons (corrected)
            if (characterClass?.includes('Tactical Chewer')) {
              weaponKey = 'scarh';
            } else if (characterClass?.includes('Fluff')) {
              weaponKey = 'ak47';
            } else if (characterClass?.includes('Squeak')) {
              weaponKey = 'mini_uzi';
            } else if (characterClass?.includes('Guns and Whiskers')) {
              weaponKey = 'aug_a1'; // Fixed: was mini_uzi, should be aug_a1
            }
            
            console.log(`🔫 Adding weapon ${weaponKey} to other player ${playerData.id}`);
            
            // Get the weapon model using the same method as WeaponSystem
            let weaponModel = null;
            if (assetLoader?.weaponModels?.has(weaponKey)) {
              weaponModel = assetLoader.weaponModels.get(weaponKey);
            } else if (assetLoader?.getModel) {
              weaponModel = assetLoader.getModel(weaponKey);
            }
            
            if (weaponModel) {
              const weaponMesh = weaponModel.clone();
              
              // Reset transformations to ensure clean state
              weaponMesh.scale.set(1, 1, 1);
              weaponMesh.position.set(0, 0, 0);
              weaponMesh.rotation.set(0, 0, 0);
              weaponMesh.matrix.identity();
              weaponMesh.updateMatrix();
              
              // Use the same weapon-specific scaling as WeaponSystem.js
              const weaponScales = {
                'ak47': 1.05,       // AK-47 made bigger
                'scarh': 0.2,       // SCAR-H 
                'an94': 0.25,       // AN-94 
                'aug_a1': 0.22,     // AUG A1 
                'mp5': 0.18,        // MP5 
                'mini_uzi': 0.16,   // Mini UZI 
                'spas12': 0.28,     // SPAS-12 
                'model870': 0.2,    // Model 870 
                'default': 0.2      // Fallback
              };
              
              const weaponScale = weaponScales[weaponKey] || weaponScales['default'];
              weaponMesh.scale.setScalar(weaponScale);
              
              // Use the same positioning as WeaponSystem.js
              weaponMesh.position.set(0.3, 0.05, 0.1); // Right side, slightly forward
              
              // Use the same rotation as WeaponSystem.js (minimal rotation to point forward)
              weaponMesh.rotation.set(-0.1, 0, 0.1); // NOT Math.PI/2 which points sideways
              
              // Mark weapon for identification
              weaponMesh.userData.isWeapon = true;
              weaponMesh.userData.weaponType = weaponKey;
              
              // Add weapon to player mesh
              playerMesh.add(weaponMesh);
              
              console.log(`🔫 ✅ Added ${weaponKey} weapon to other player ${playerData.id} (scale: ${weaponScale})`);
            } else {
              console.log(`⚠️ Weapon model ${weaponKey} not available for other player`);
            }
          } catch (error) {
            console.error(`❌ Failed to add weapon to other player:`, error);
          }
        }
        
        // Listen for spawn position from server
        socket.on('spawnPosition', (data) => {
          console.log(`🎯 ✅ RECEIVED spawn position from server:`, data.position);
          console.log(`🎯 Team: ${data.team}, Game Mode: ${data.gameMode}`);
          
          // Update player position to server-calculated spawn point
          if (data.position && player) {
            console.log(`📍 BEFORE: Player position was (${player.position.x.toFixed(2)}, ${player.position.y.toFixed(2)}, ${player.position.z.toFixed(2)})`);
            player.position.set(data.position.x, data.position.y, data.position.z);
            console.log(`📍 AFTER: Player moved to spawn position: (${data.position.x.toFixed(2)}, ${data.position.y.toFixed(2)}, ${data.position.z.toFixed(2)})`);
            
            // Update camera position to follow the player
            if (player.setupCamera) {
              player.setupCamera();
            }
          } else {
            console.log(`❌ Could not update player position - data.position:`, data.position, `player:`, player);
          }
        });

        // Listen for other players joining
        socket.on('playerJoined', (playerData) => {
          console.log(`🔔 RECEIVED playerJoined event:`, playerData);
          if (playerData.id !== socket.id) {
            console.log(`👥 OTHER PLAYER JOINED: ${playerData.id}`, playerData);
            console.log(`📍 Other player position:`, playerData.position);
            console.log(`🏷️ Other player team:`, playerData.team);
            createOtherPlayer(playerData, scene, assetLoader, otherPlayers);
          } else {
            console.log(`👤 Ignoring own join event: ${playerData.id}`);
          }
        });

        // Listen for other player updates
        socket.on('playerUpdated', (playerData) => {
          console.log(`🔔 RECEIVED playerUpdated event:`, playerData);
          if (playerData.id !== socket.id) {
            console.log(`👥 OTHER PLAYER UPDATED: ${playerData.id}`, playerData);
            updateOtherPlayer(playerData, otherPlayers);
          } else {
            console.log(`👤 Ignoring own update event: ${playerData.id}`);
          }
        });

        // Listen for other players moving (optimized)
        socket.on('playerMoved', (moveData) => {
          // Log movement updates less frequently to avoid console spam
          if (Math.random() < 0.02) { // 2% of updates (reduced from 5%)
            console.log(`🔔 RECEIVED optimized playerMoved event from ${moveData.id}`);
          }
          if (moveData.id !== socket.id) {
            const otherPlayer = otherPlayers.get(moveData.id);
            if (otherPlayer) {
              // Handle compressed movement data
              let position, rotation;
              
              if (moveData.pos && moveData.rot) {
                // Compressed format
                position = {
                  x: moveData.pos[0],
                  y: moveData.pos[1],
                  z: moveData.pos[2]
                };
                rotation = {
                  x: moveData.rot[0],
                  y: moveData.rot[1],
                  z: moveData.rot[2]
                };
              } else {
                // Legacy format fallback
                position = moveData.position;
                rotation = moveData.rotation;
              }
              
              // Smoothly update other player position with interpolation
              otherPlayer.position.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.2);
              otherPlayer.rotation.y = rotation.y;
              
              // Update the mesh position and rotation
              if (otherPlayer.mesh) {
                otherPlayer.mesh.position.copy(otherPlayer.position);
                // Apply Y rotation (horizontal turning) to the hamster mesh
                otherPlayer.mesh.rotation.y = Math.PI + rotation.y; // Add π to account for hamster facing direction
              }
            } else {
              console.log(`❌ No other player found with ID: ${moveData.id}`);
            }
          } else {
            console.log(`👤 Ignoring own movement event: ${moveData.id}`);
          }
        });

        // Listen for players leaving
        socket.on('playerLeft', (playerId) => {
          console.log(`👥 PLAYER LEFT: ${playerId}`);
          removeOtherPlayer(playerId, scene, otherPlayers);
        });

        // Listen for initial game state with existing players
        socket.on('gameState', (gameStateData) => {
          console.log(`🔔 RECEIVED gameState event:`, gameStateData);
          console.log(`👥 Total players in game state: ${gameStateData.players?.length || 0}`);
          console.log(`🆔 My socket ID: ${socket.id}`);
          
          // Create meshes for all existing players
          if (gameStateData.players) {
            gameStateData.players.forEach(playerData => {
              console.log(`🔍 Processing player: ${playerData.id} (team: ${playerData.team})`);
              if (playerData.id !== socket.id) {
                console.log(`👥 CREATING EXISTING PLAYER: ${playerData.id}`, playerData);
                createOtherPlayer(playerData, scene, assetLoader, otherPlayers);
              } else {
                console.log(`👤 Skipping own player: ${playerData.id}`);
              }
            });
          }
          
          console.log(`👥 Other players map size after processing: ${otherPlayers.size}`);
        });
        
        // Add connection event listener
        socket.on('connect', () => {
          console.log(`🌐 ✅ Socket connected with ID: ${socket.id}`);
          console.log(`👥 Multiplayer system ready - listening for other players...`);
        });
        
        socket.on('disconnect', () => {
          console.log(`🌐 ❌ Socket disconnected`);
        });

        // Send heartbeat every 10 seconds to keep connection active
        setInterval(() => {
          if (socket.connected) {
            socket.emit('heartbeat');
          }
        }, 10000);
        
        // Send player join data with team information
        if (selectedGameMode && selectedGameMode.id === 'hamster-havoc' && selectedTeam) {
          console.log(`🌐 Joining server as ${selectedTeam.name} team member`);
          socket.emit('playerJoin', {
            character: playerClass,
            gameMode: selectedGameMode.id, // Use the actual game mode ID from UI
            team: selectedTeam.id, // Send team ID: 'cheek-stuffers' or 'wheel-warriors'
            rotation: player.cameraRotation
          });
        } else {
          console.log(`🌐 Joining server in solo mode for ${selectedGameMode?.name || 'unknown mode'}`);
          socket.emit('playerJoin', {
            character: playerClass,
            gameMode: selectedGameMode?.id || 'solo',
            team: null,
            rotation: player.cameraRotation
          });
        }
        
        console.log('🌐 Socket connection established and player join data sent');
        
        // TEMPORARY: Force player to correct spawn position for testing
        // This ensures bullets come from the right place even if socket sync fails
        setTimeout(() => {
          if (selectedGameMode && selectedGameMode.id === 'hamster-havoc' && selectedTeam) {
            let spawnPos;
            if (selectedTeam.id === 'wheel-warriors') {
              spawnPos = { x: -2105.83, y: 40.00, z: -3224.46 };
            } else if (selectedTeam.id === 'cheek-stuffers') {
              spawnPos = { x: 319.04, y: 40.00, z: 3942.67 };
            }
            
            if (spawnPos) {
              console.log(`🚀 FORCING player to spawn position: (${spawnPos.x}, ${spawnPos.y}, ${spawnPos.z})`);
              player.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
              if (player.setupCamera) {
                player.setupCamera();
              }
            }
          }
        }, 1000); // Wait 1 second for socket to connect
      } catch (error) {
        console.warn('⚠️ Could not establish socket connection:', error);
      }

      // Initialize input manager
      const inputManager = new InputManager();
      player.inputManager = inputManager;
      console.log('🎮 Input manager connected to player');
      
      // Input manager ready for gameplay
      console.log('🎮 Input system ready for hamster warfare!');
      
      // Setup player camera
      player.setupCamera();
      console.log('📷 Player camera setup completed');
      
      // Add click listener to canvas for pointer lock (requires user interaction)
      const handleCanvasClick = () => {
        if (!inputManager.isPointerLocked) {
          console.log('🖱️ Activating FPS controls...');
          inputManager.lockPointer();
        } else {
          console.log('✅ FPS controls already active');
        }
      };
      
      // Add event listener to canvas
      gl.domElement.addEventListener('click', handleCanvasClick);
      
      // Store cleanup function for the event listener
      const cleanup = () => {
        gl.domElement.removeEventListener('click', handleCanvasClick);
      };
      
      // Connect weapon manager to player and bullet system
      weaponManager.bulletSystem = bulletSystem;
      weaponManager.setHamsterReference(player);
      player.weaponManager = weaponManager;
      
      // Equip the primary weapon since we just replaced the weapon manager
      player.switchToWeapon('primary');
      console.log(`🔫 Player weapons set up based on class: "${playerClass}"`);

      // Create test dummy for team deathmatch mode
      let testDummy = null;
      if (selectedGameMode && selectedGameMode.id === 'hamster-havoc') {
        console.log('🎯 Creating test dummy for team deathmatch...');
        testDummy = new TestDummy(scene, assetLoader, new THREE.Vector3(0, 40, 0));
        
        // Connect test dummy to bullet system for hit detection
        bulletSystem.testDummy = testDummy;
        console.log('🎯 Test dummy added to team deathmatch mode');
      }

      // Store references
      gameStateRef.current = {
        player,
        assetLoader,
        audioManager,
        weaponManager,
        bulletSystem,
        inputManager,
        gameMode,
        testDummy,
        renderOptimizer,
        isInitialized: true
      };

      // Initialize audio
      audioManager.initialize();

      // Load game assets
      const loadGameAssets = async () => {
        console.log('📦 Loading game assets...');
        
        try {
          // Load Nuketown map from Call of Duty
          const nuketown = await assetLoader.loadMapModel("nuketown", "/assets/models/maps/nuketown_from_call_of_duty...glb");
          if (nuketown) {
            scene.add(nuketown);
            console.log('🗺️ Call of Duty Nuketown map added to scene');
          }
          
          // Load all weapon models using AssetLoader's preload system
          await assetLoader.preloadAssets();
          
          console.log('✅ All game assets loaded!');
          
          // Refresh weapon with loaded GLB assets
          if (gameStateRef.current?.player?.weaponManager) {
            gameStateRef.current.player.weaponManager.refreshWeaponWithLoadedAssets();
          }
        } catch (error) {
          console.error('❌ Error loading game assets:', error);
        }
      };

      // Load assets
      loadGameAssets();

      // Start game mode
      gameMode.start();

      console.log('✅ Game initialized successfully!');

      // Cleanup function
      return () => {
        if (gameStateRef.current.inputManager) {
          gameStateRef.current.inputManager.dispose();
        }
        if (gameStateRef.current.testDummy) {
          gameStateRef.current.testDummy.destroy();
        }
        cleanup(); // Remove canvas event listener
        console.log('🧹 Game cleanup completed');
      };
    };

    initializeGame();
      }, [scene, camera, gl, selectedWeapon, selectedClass, isPaused]); // Added selectedClass to dependency array

  // Game loop
  useFrame((state, delta) => {
    const gameState = gameStateRef.current;
    if (!gameState.isInitialized || isPaused) return; // Skip updates when paused

    // Update player
    if (gameState.player) {
      gameState.player.update(delta);
      
      // Update weapon stats for UI
      if (onUpdateWeaponStats && gameState.player.weaponManager) {
        const currentWeapon = gameState.player.weaponManager.getCurrentWeapon();
        const ammoStatus = gameState.player.weaponManager.getAmmoStatus();
        const classData = getClassWeapons(selectedClass);
        
        onUpdateWeaponStats({
          currentWeapon: currentWeapon ? currentWeapon.name : 'None',
          currentAmmo: ammoStatus.current,
          maxAmmo: ammoStatus.capacity,
          isReloading: ammoStatus.isReloading,
          primaryWeapon: classData ? classData.primary : null,
          secondaryWeapon: classData ? classData.secondary : null,
          selectedClass: selectedClass
        });
      }

      // Update player position for coordinate display
      if (onUpdatePlayerPosition && gameState.player.position) {
        onUpdatePlayerPosition({
          x: gameState.player.position.x,
          y: gameState.player.position.y,
          z: gameState.player.position.z
        });
      }
    }

    // Update bullet system
    if (gameState.bulletSystem) {
      gameState.bulletSystem.update(delta);
    }

    // Update game mode
    if (gameState.gameMode && gameState.gameMode.isActive) {
      gameState.gameMode.update();
    }

    // Update render optimizations
    if (gameState.renderOptimizer) {
      gameState.renderOptimizer.update(scene);
    }

    // ESC key is now handled by settings menu
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Environment */}
      <Sky 
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />

      {/* Game Map */}
      <GameMap />

      {/* Player Model (will be loaded by AssetLoader) */}
      <group ref={playerRef} position={[0, 0, 0]} />

      {/* Ground */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[100, 1, 100]} />
        <meshLambertMaterial color="#4a4a4a" />
      </mesh>


    </>
  );
}

// Game Map Component
function GameMap() {
  const nuketown = useGLTF('/assets/models/maps/nuketown_from_call_of_duty...glb');
  
  useEffect(() => {
    if (nuketown.scene) {
      nuketown.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      console.log('🗺️ Call of Duty Nuketown map effects applied');
    }
  }, [nuketown]);

  return nuketown.scene ? <primitive object={nuketown.scene} scale={[1, 1, 1]} /> : null;
}

// Asset loading function
async function loadGameAssets(assetLoader, scene) {
  console.log('📦 Loading game assets...');

  try {
    // Load character models
    await assetLoader.loadModel('hamster', '/hamster.glb');
    
    // Load weapon models
    const weapons = [
      'low_poly_ak47',
      'low_poly_scarh', 
      'low_poly_mp5',
      'low_poly_spas12'
    ];
    
    for (const weapon of weapons) {
      await assetLoader.loadModel(weapon, `/assets/models/weapons/${weapon}.glb`);
    }

    // Load weapon audio
    await assetLoader.loadAudio('ak47_fire', '/assets/audio/weapons/ak-47-firing-8760.mp3');

    console.log('✅ All game assets loaded!');
  } catch (error) {
    console.error('❌ Error loading game assets:', error);
  }
}

// Game HUD Component
// Reload Progress Circle Component
function ReloadProgressCircle() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 10) % 360);
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderTop: '2px solid rgba(255, 107, 107, 0.8)',
      borderRight: '2px solid rgba(255, 107, 107, 0.6)'
    }} />
  );
}

// Subtle Weapons UI Component (Right Side)
function WeaponsUI({ weaponStats }) {
  if (!weaponStats) return null;

  const { currentWeapon, currentAmmo, maxAmmo, isReloading, primaryWeapon, secondaryWeapon, selectedClass } = weaponStats;

  return (
    <div style={{
      position: 'absolute',
      bottom: '100px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
      zIndex: 1000
    }}>
      {/* Weapon Selection - Compact */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '6px',
        padding: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Primary Weapon */}
        <div style={{
          backgroundColor: currentWeapon === primaryWeapon ? 'rgba(78, 205, 196, 0.4)' : 'rgba(0, 0, 0, 0.3)',
          border: currentWeapon === primaryWeapon ? '1px solid rgba(78, 205, 196, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          padding: '6px 10px',
          color: 'white',
          fontSize: '12px',
          fontWeight: currentWeapon === primaryWeapon ? 'bold' : 'normal',
          textAlign: 'center',
          minWidth: '70px',
          opacity: currentWeapon === primaryWeapon ? 1.0 : 0.7
        }}>
          <div style={{ color: '#4ecdc4', fontSize: '10px' }}>1</div>
          <div style={{ fontSize: '11px' }}>{primaryWeapon}</div>
        </div>

        {/* Secondary Weapon */}
        <div style={{
          backgroundColor: currentWeapon === secondaryWeapon ? 'rgba(255, 107, 107, 0.4)' : 'rgba(0, 0, 0, 0.3)',
          border: currentWeapon === secondaryWeapon ? '1px solid rgba(255, 107, 107, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          padding: '6px 10px',
          color: 'white',
          fontSize: '12px',
          fontWeight: currentWeapon === secondaryWeapon ? 'bold' : 'normal',
          textAlign: 'center',
          minWidth: '70px',
          opacity: currentWeapon === secondaryWeapon ? 1.0 : 0.7
        }}>
          <div style={{ color: '#ff6b6b', fontSize: '10px' }}>2</div>
          <div style={{ fontSize: '11px' }}>{secondaryWeapon}</div>
        </div>
      </div>

      {/* Current Ammo - Compact */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '6px',
        padding: '8px 12px',
        color: 'white',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minWidth: '90px'
      }}>
        <div style={{ 
          color: isReloading ? '#ff6b6b' : '#ffe66d', 
          fontSize: '16px', 
          fontWeight: 'bold'
        }}>
          {isReloading ? '⟳' : `${currentAmmo}/${maxAmmo}`}
        </div>
        
        {!isReloading && (
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '10px',
            marginTop: '2px'
          }}>
            AMMO
          </div>
        )}
      </div>
    </div>
  );
}

function GameHUD({ gameStats, weaponStats, playerPosition, onSettingsOpen }) {
  return (
    <div>
      {/* Crosshair with Reload Progress */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 1000
      }}>
        {/* Reload Progress Circle */}
        {weaponStats?.isReloading && (
          <ReloadProgressCircle />
        )}
        
        {/* Main Crosshair Dot */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '4px',
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px rgba(0,0,0,0.3)'
        }} />
      </div>

      {/* Coordinates Display */}
      {playerPosition && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #4ecdc4',
          borderRadius: '8px',
          padding: '15px',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '14px',
          minWidth: '180px',
          zIndex: 1000
        }}>
          <div style={{ color: '#4ecdc4', fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
            📍 COORDINATES
          </div>
          <div style={{ color: '#ff6b6b' }}>X: {playerPosition.x.toFixed(2)}</div>
          <div style={{ color: '#4ecdc4' }}>Y: {playerPosition.y.toFixed(2)}</div>
          <div style={{ color: '#ffe66d' }}>Z: {playerPosition.z.toFixed(2)}</div>
          <div style={{ color: '#95e1d3', fontSize: '12px', marginTop: '8px' }}>
            💡 Copy for spawn points
          </div>
        </div>
      )}

      {/* Settings Button */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}>
        <button
          onClick={onSettingsOpen}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: '2px solid #4ecdc4',
            borderRadius: '8px',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(78, 205, 196, 0.2)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ⚙️ Settings
        </button>
      </div>
      
      {/* Health and stats */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '5px',
        color: 'white',
        textAlign: 'right',
        minWidth: '200px'
      }}>
        <div style={{ color: '#ff6b6b', fontSize: '18px', fontWeight: 'bold' }}>❤️ Health: {gameStats.health}/100</div>
        <div style={{ color: '#4ecdc4', fontSize: '14px', marginTop: '5px' }}>🐹 Hamster Warrior</div>
        <div style={{ color: '#ffe66d', fontSize: '12px' }}>Class: {weaponStats?.selectedClass?.name || 'Assault Hamster'}</div>
      </div>

      {/* Enhanced Weapons UI */}
      <WeaponsUI weaponStats={weaponStats} />

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '5px',
        color: 'white',
        fontSize: '14px',
        minWidth: '180px'
      }}>
        <div style={{ color: '#4ecdc4', fontSize: '16px', marginBottom: '10px' }}>🐹 HAMSTER CONTROLS</div>
        <div style={{ color: '#ff6b6b', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>⚠️ CLICK ANYWHERE TO ACTIVATE MOVEMENT!</div>
        <div>🎮 WASD - Move Hamster</div>
        <div>🖱️ Mouse - Look Around</div>
        <div>🔫 Left Click - Shoot</div>
        <div>🏃 Shift - Sprint</div>
        <div>🦘 Space - Jump</div>
        <div style={{ color: '#95e1d3' }}>1/2 - Switch Weapons</div>
        <div style={{ color: '#95e1d3' }}>⚙️ Settings Button - Adjust Sensitivity</div>
                        <div>⏸️ ESC - Pause Menu</div>
        <div style={{ color: '#ffe66d', fontSize: '12px', marginTop: '8px' }}>If movement stops working, click in the game area again!</div>
      </div>
    </div>
  );
}

// Main Game Engine Component
export function GameEngine({ selectedWeapon, selectedClass, selectedGameMode, selectedTeam, onGameExit }) {
  const [gameStats, setGameStats] = useState({
    health: 100,
    weapon: selectedWeapon || 'AK-47',
    ammo: 30
  });

  const [weaponStats, setWeaponStats] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showLoadoutScreen, setShowLoadoutScreen] = useState(false);
  const [mouseSensitivity, setMouseSensitivity] = useState(2.0);
  const [soundVolume, setSoundVolume] = useState(0.3);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [playerPosition, setPlayerPosition] = useState(null);

  // Stop lobby music when game starts and sync volume controls
  useEffect(() => {
    // Stop lobby music when entering the game
    sharedAudioManager.stopLobbyMusic();
    console.log('🔇 Lobby music stopped - entering game');

    // Sync volume controls with audio manager
    sharedAudioManager.setSoundVolume(soundVolume);
    sharedAudioManager.setMusicVolume(musicVolume);
    
    return () => {
      // Clean up when component unmounts
      console.log('🧹 GameEngine cleanup');
    };
  }, []);

  // Update audio manager volumes when state changes
  useEffect(() => {
    sharedAudioManager.setSoundVolume(soundVolume);
  }, [soundVolume]);

  useEffect(() => {
    sharedAudioManager.setMusicVolume(musicVolume);
  }, [musicVolume]);

  // Game state ref - moved to main component so buttons can access it
  const gameStateRef = useRef({
    player: null,
    assetLoader: null,
    audioManager: null,
    weaponManager: null,
    bulletSystem: null,
    inputManager: null,
    gameMode: null,
    testDummy: null,
    isInitialized: false
  });

  const handleResumeGame = () => {
    setIsPaused(false);
  };

  const handleExitToMenu = () => {
    onGameExit();
  };

  const handleUpdateWeaponStats = (stats) => {
    setWeaponStats(stats);
  };

  const handleUpdatePlayerPosition = (position) => {
    setPlayerPosition(position);
  };

  // Handle ESC key for pause menu
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Escape') {
        // Close any open menus or show pause menu
        if (showSettings || showLoadoutScreen) {
          setShowSettings(false);
          setShowLoadoutScreen(false);
          setShowPauseMenu(true);
        } else {
          setShowPauseMenu(prev => !prev);
        }
        console.log(`⏸️ Pause menu toggled`);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showSettings, showLoadoutScreen, showPauseMenu]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#87CEEB' }}>
      <Canvas 
        camera={{ position: [0, 5, 10], fov: 75, rotation: [0, 0, 0] }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <GameScene 
          selectedWeapon={selectedWeapon} 
          selectedClass={selectedClass}
          selectedGameMode={selectedGameMode}
          selectedTeam={selectedTeam}
          onGameExit={onGameExit}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          mouseSensitivity={mouseSensitivity}
          onUpdateWeaponStats={handleUpdateWeaponStats}
          onUpdatePlayerPosition={handleUpdatePlayerPosition}
          gameStateRef={gameStateRef}
        />
      </Canvas>
      
      <GameHUD 
        gameStats={gameStats} 
        weaponStats={weaponStats}
        playerPosition={playerPosition}
        onSettingsOpen={() => setShowSettings(true)} 
      />
      


      {/* Pause Screen Overlay */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 20, 20, 0.9)',
            padding: '40px',
            borderRadius: '15px',
            textAlign: 'center',
            border: '2px solid #4ecdc4'
          }}>
            <h1 style={{ color: '#4ecdc4', marginBottom: '30px', fontSize: '32px' }}>🐹 GAME PAUSED</h1>
            
            <div style={{ marginBottom: '30px', fontSize: '16px', lineHeight: '1.5' }}>
              <div style={{ color: '#ffe66d', marginBottom: '15px' }}>📝 Debug Console Available</div>
              <div style={{ fontSize: '14px', color: '#ccc' }}>
                Press F12 to open browser console<br/>
                Check for movement debug messages
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button
                onClick={handleResumeGame}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  backgroundColor: '#4ecdc4',
                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ▶️ RESUME
              </button>
              
              <button
                onClick={handleExitToMenu}
                style={{
                  padding: '15px 30px',
                  fontSize: '18px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🏠 EXIT TO MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {showPauseMenu && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            padding: '40px',
            borderRadius: '15px',
            border: '2px solid #4ecdc4',
            minWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ color: '#4ecdc4', marginBottom: '40px', fontSize: '28px' }}>⏸️ Game Paused</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              {/* Settings Button */}
              <button
                onClick={() => {
                  setShowPauseMenu(false);
                  setShowSettings(true);
                  console.log('⚙️ Opening settings menu');
                }}
                style={{
                  backgroundColor: '#4ecdc4',
                  color: '#000',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  width: '250px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#45b7b8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4ecdc4'}
              >
                ⚙️ Settings
              </button>

              {/* Change Loadout Button */}
              <button
                onClick={() => {
                  setShowPauseMenu(false);
                  setShowLoadoutScreen(true);
                  console.log('🔫 Opening loadout screen');
                }}
                style={{
                  backgroundColor: '#ffe66d',
                  color: '#000',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  width: '250px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#ffd93d'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffe66d'}
              >
                🔫 Change Loadout
              </button>

              {/* Exit Game Button */}
              <button
                onClick={() => {
                  console.log('🚪 Exiting to main menu');
                  onGameExit();
                }}
                style={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  width: '250px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#ff5252'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff6b6b'}
              >
                🚪 Exit Game
              </button>

              {/* Resume Game Button */}
              <button
                onClick={() => {
                  setShowPauseMenu(false);
                  console.log('▶️ Resuming game');
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#4ecdc4',
                  border: '2px solid #4ecdc4',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  width: '200px',
                  transition: 'all 0.3s ease',
                  marginTop: '20px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(78, 205, 196, 0.2)';
                  e.target.style.borderColor = '#45b7b8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = '#4ecdc4';
                }}
              >
                ▶️ Resume Game
              </button>
            </div>

            <div style={{ marginTop: '25px', fontSize: '14px', color: '#aaa', lineHeight: '1.4' }}>
              💡 <strong>Tip:</strong> Press <strong>ESC</strong> again to resume the game
            </div>
          </div>
        </div>
      )}

      {/* Settings Menu Overlay */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            padding: '40px',
            borderRadius: '15px',
            border: '2px solid #4ecdc4',
            minWidth: '450px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ color: '#4ecdc4', marginBottom: '30px', fontSize: '24px' }}>⚙️ Game Settings</h2>
            
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px' }}>
              <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', color: '#ffe66d' }}>
                🖱️ Mouse Sensitivity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <input
                  type="number"
                  min="0.1"
                  max="20.0"
                  step="0.1"
                  value={mouseSensitivity.toFixed(1)}
                  onChange={(e) => {
                    const newSensitivity = parseFloat(e.target.value);
                    if (!isNaN(newSensitivity) && newSensitivity >= 0.1 && newSensitivity <= 20.0) {
                      setMouseSensitivity(newSensitivity);
                      console.log(`🖱️ Sensitivity changed to ${newSensitivity.toFixed(1)}x`);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  style={{
                    width: '120px',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    border: '2px solid #4ecdc4',
                    borderRadius: '8px',
                    color: 'white',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <span style={{ color: '#4ecdc4', fontSize: '18px', fontWeight: 'bold' }}>x</span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => setMouseSensitivity(0.5)} style={{ padding: '6px 10px', backgroundColor: 'rgba(255, 107, 107, 0.2)', border: '1px solid #ff6b6b', borderRadius: '5px', color: '#ff6b6b', fontSize: '11px', cursor: 'pointer' }}>0.5x</button>
                <button onClick={() => setMouseSensitivity(2.0)} style={{ padding: '6px 10px', backgroundColor: 'rgba(78, 205, 196, 0.2)', border: '1px solid #4ecdc4', borderRadius: '5px', color: '#4ecdc4', fontSize: '11px', cursor: 'pointer' }}>2.0x</button>
                <button onClick={() => setMouseSensitivity(5.0)} style={{ padding: '6px 10px', backgroundColor: 'rgba(255, 230, 109, 0.2)', border: '1px solid #ffe66d', borderRadius: '5px', color: '#ffe66d', fontSize: '11px', cursor: 'pointer' }}>5.0x</button>
                <button onClick={() => setMouseSensitivity(10.0)} style={{ padding: '6px 10px', backgroundColor: 'rgba(255, 92, 192, 0.2)', border: '1px solid #ff5cc0', borderRadius: '5px', color: '#ff5cc0', fontSize: '11px', cursor: 'pointer' }}>10.0x</button>
              </div>
            </div>

            {/* Sound Volume Controls */}
            <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px' }}>
              <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', color: '#ff6b6b' }}>
                🔊 Sound Effects Volume
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setSoundVolume(newVolume);
                  }}
                  style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ color: '#ff6b6b', fontSize: '16px', fontWeight: 'bold', minWidth: '60px' }}>
                  {Math.round(soundVolume * 100)}%
                </span>
              </div>
            </div>

            {/* Music Volume Controls */}
            <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px' }}>
              <label style={{ display: 'block', marginBottom: '15px', fontSize: '18px', color: '#95e1d3' }}>
                🎵 Music Volume
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setMusicVolume(newVolume);
                  }}
                  style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ color: '#95e1d3', fontSize: '16px', fontWeight: 'bold', minWidth: '60px' }}>
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#ccc', marginTop: '8px' }}>
                {musicVolume === 0 ? '🔇 Music is muted' : '🎵 Affects lobby background music'}
              </div>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowPauseMenu(true);
                  console.log(`✅ Settings applied: Sensitivity ${mouseSensitivity.toFixed(1)}x`);
                }}
                style={{
                  backgroundColor: '#4ecdc4',
                  color: '#000',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#45b7b8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4ecdc4'}
              >
                ✅ Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loadout Screen Overlay */}
      {showLoadoutScreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            padding: '40px',
            borderRadius: '15px',
            border: '2px solid #ffe66d',
            minWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ color: '#ffe66d', marginBottom: '30px', fontSize: '24px' }}>🔫 Change Loadout</h2>
            
            <div style={{ marginBottom: '30px', fontSize: '16px', color: '#ccc' }}>
              Choose your combat class and weapons:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
              {[
                { name: 'Tactical Chewer', primary: 'SCAR-H', secondary: 'Model 870', color: '#4ecdc4' },
                { name: 'Fluff \'n\' reload', primary: 'AK-47', secondary: 'MP5', color: '#ff6b6b' },
                { name: 'Squeak or be Squeakened', primary: 'Mini UZI', secondary: 'SPAS-12', color: '#ffe66d' },
                { name: 'Guns and Whiskers', primary: 'AUG A1', secondary: 'AN-94', color: '#ff9800' }
              ].map((classData, index) => (
                <div
                  key={index}
                  onClick={() => {
                    console.log(`🔄 Switching to class: ${classData.name}`);
                    // Here you would implement class switching logic
                    setShowLoadoutScreen(false);
                    setShowPauseMenu(true);
                  }}
                  style={{
                    padding: '15px',
                    backgroundColor: `rgba(${classData.color === '#4ecdc4' ? '78, 205, 196' : classData.color === '#ff6b6b' ? '255, 107, 107' : classData.color === '#ffe66d' ? '255, 230, 109' : '255, 152, 0'}, 0.2)`,
                    border: `2px solid ${classData.color}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: classData.color
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `rgba(${classData.color === '#4ecdc4' ? '78, 205, 196' : classData.color === '#ff6b6b' ? '255, 107, 107' : classData.color === '#ffe66d' ? '255, 230, 109' : '255, 152, 0'}, 0.4)`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `rgba(${classData.color === '#4ecdc4' ? '78, 205, 196' : classData.color === '#ff6b6b' ? '255, 107, 107' : classData.color === '#ffe66d' ? '255, 230, 109' : '255, 152, 0'}, 0.2)`}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{classData.name}</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Primary: {classData.primary}</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Secondary: {classData.secondary}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowLoadoutScreen(false);
                  setShowPauseMenu(true);
                  console.log('🔙 Returning to pause menu');
                }}
                style={{
                  backgroundColor: '#ffe66d',
                  color: '#000',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#ffd93d'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffe66d'}
              >
                🔙 Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 