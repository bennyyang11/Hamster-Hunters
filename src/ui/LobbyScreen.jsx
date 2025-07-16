import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { sharedAudioManager, initializeAudio } from '../utils/SharedAudioManager.js';

// Preload the assets for better performance
useGLTF.preload('/hamster.glb');
useGLTF.preload('/assets/models/maps/nuketown_from_call_of_duty...glb');

// Hamster Model Component
function HamsterModel() {
  const { scene } = useGLTF('/hamster.glb');
  
  console.log('✅ Hamster model loaded successfully!');
  
  return (
    <primitive 
      object={scene.clone()} 
      position={[0, 2, 0]}   // Move hamster up 2 units above ground
      scale={[2, 2, 2]}     // Keep proportional scale
      rotation={[0, Math.PI, 0]}
    />
  );
}

// Nuketown Map Component  
function NuketownMap() {
  const { scene } = useGLTF('/assets/models/maps/nuketown_from_call_of_duty...glb');
  
  console.log('✅ Nuketown map loaded successfully!');
  
  // Clone and prepare the scene
  const nuketownClone = scene.clone();
  
  // Calculate bounding box to understand model size
  const box = new THREE.Box3().setFromObject(nuketownClone);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  
  console.log('📏 Nuketown dimensions:', {
    size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
    center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) },
    min: { x: box.min.x.toFixed(2), y: box.min.y.toFixed(2), z: box.min.z.toFixed(2) },
    max: { x: box.max.x.toFixed(2), y: box.max.y.toFixed(2), z: box.max.z.toFixed(2) }
  });
  
  let meshCount = 0;
  
  // Traverse and prepare materials for proper rendering
  nuketownClone.traverse((child) => {
    if (child.isMesh) {
      meshCount++;
      if (meshCount <= 5) { // Only log first 5 meshes to avoid spam
        console.log(`🏗️ Nuketown mesh ${meshCount}:`, child.name, child.material?.name);
      }
      
      // Ensure materials render properly (NO WIREFRAME)
      if (child.material) {
        child.material.transparent = false;
        child.material.opacity = 1;
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Make sure material is visible
        if (child.material.map) {
          child.material.needsUpdate = true;
        }
        
        // If no texture, give it a basic color based on material name
        if (!child.material.map && child.material.name) {
          if (child.material.name.includes('Yellow')) {
            child.material.color.set('#FFFF00');
          } else if (child.material.name.includes('Green')) {
            child.material.color.set('#00AA00');
          } else if (child.material.name.includes('White')) {
            child.material.color.set('#FFFFFF');
          } else if (child.material.name.includes('Roof')) {
            child.material.color.set('#666666');
          } else if (child.material.name.includes('Wood')) {
            child.material.color.set('#8B4513');
          } else {
            child.material.color.set('#CCCCCC');
          }
        }
      }
    }
  });
  
  console.log(`🏗️ Total nuketown meshes: ${meshCount}`);
  
  // Position nuketown so it's centered and visible
  // Center it and put it on the ground
  const yOffset = -center.y; // Bring bottom to y=0
  const scale = Math.min(75 / Math.max(size.x, size.z), 40); // Scale to fit in 75x75 area, max scale 40 (5x bigger!)
  
  console.log(`🎯 Nuketown positioning: scale=${scale.toFixed(2)}, yOffset=${yOffset.toFixed(2)}`);
  
  return (
    <group>
      {/* Main nuketown model - properly positioned and MUCH larger */}
      <primitive 
        object={nuketownClone} 
        position={[-center.x * scale, yOffset * scale + 5, -center.z * scale]}
        scale={[scale, scale, scale]}
      />
      
      {/* Debug: Ground plane reference */}
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4a5c3a" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Loading fallback components
function LoadingHamster() {
  return (
    <group position={[0, 0, 0]}>
      {/* Simple hamster while loading */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
      <mesh position={[0, 1.2, 0.5]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
      <mesh position={[0.2, 1.4, 0.9]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[-0.2, 1.4, 0.9]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  );
}

function LoadingGround() {
  return (
    <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#4a5c3a" />
    </mesh>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      zIndex: 50
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🐹</div>
        <div>Loading Hamster Headquarters...</div>
        <div style={{ fontSize: '16px', marginTop: '10px', opacity: 0.7 }}>
          Preparing Nuketown & Elite Hamster Forces
        </div>
      </div>
    </div>
  );
}

// Main Background Scene with Real Assets
function BackgroundScene() {
  const cameraGroupRef = useRef();
  
  // Rotate camera around the hamster's new position
  useFrame((state, delta) => {
    if (cameraGroupRef.current) {
      cameraGroupRef.current.rotation.y += delta * 0.3; // Faster rotation
    }
  });

  return (
    <group ref={cameraGroupRef}>
      {/* Nuketown Map with Loading Fallback */}
      <Suspense fallback={<LoadingGround />}>
        <NuketownMap />
      </Suspense>
      
      {/* Hamster Model with Loading Fallback */}
      <Suspense fallback={<LoadingHamster />}>
        <HamsterModel />
      </Suspense>
      
      {/* Enhanced Lighting for the scene */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.0} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={0.6} color="#4ecdc4" />
      <pointLight position={[-5, 3, -5]} intensity={0.4} color="#ff6b6b" />
      <pointLight position={[5, 3, 5]} intensity={0.4} color="#ffe66d" />
    </group>
  );
}




// GameMode Selection Component
function GameModeSelection({ onGameModeSelect, onBack }) {
  const gameModes = [
    {
      id: 'hamster-havoc',
      name: 'Hamster Havoc',
      subtitle: 'Team Deathmatch',
      description: 'Classic team vs team combat. First team to reach the kill limit wins!',
      icon: '⚔️',
      color: '#ff6b6b',
      players: '4v4'
    },
    {
      id: 'last-ham-standing',
      name: 'Last Ham Standing', 
      subtitle: 'Elimination',
      description: 'Battle royale style elimination. Be the last hamster standing!',
      icon: '👑',
      color: '#4ecdc4',
      players: '1v7'
    },
    {
      id: 'nuts-of-fury',
      name: 'Nuts of Fury',
      subtitle: 'Gun Game',
      description: 'Progress through weapons with each kill. First to finish wins!',
      icon: '🏆',
      color: '#ffe66d',
      players: '1v7'
    }
  ];

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000
    }}>
      <h1 style={{
        fontSize: '48px',
        margin: '0 0 20px 0',
        textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
        color: '#00ff00'
      }}>
        🎮 SELECT GAME MODE
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '20px',
        width: '100%'
      }}>
        {gameModes.map((mode) => (
          <div
            key={mode.id}
            onClick={() => onGameModeSelect(mode)}
            style={{
              background: `linear-gradient(135deg, ${mode.color}20, ${mode.color}40)`,
              border: `3px solid ${mode.color}`,
              borderRadius: '15px',
              padding: '30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = `0 10px 30px ${mode.color}50`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <div>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                {mode.icon}
              </div>
              <h2 style={{
                fontSize: '24px',
                margin: '0 0 5px 0',
                color: mode.color
              }}>
                {mode.name}
              </h2>
              <h3 style={{
                fontSize: '16px',
                margin: '0 0 15px 0',
                color: '#ccc',
                fontWeight: 'normal'
              }}>
                {mode.subtitle}
              </h3>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.4',
                color: '#e0e0e0',
                margin: '0 0 15px 0'
              }}>
                {mode.description}
              </p>
            </div>
            <div style={{
              background: `${mode.color}30`,
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: mode.color
            }}>
              👥 {mode.players} Players
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={onBack}
        style={{
          padding: '15px 40px',
          fontSize: '18px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '30px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#888'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#666'}
      >
        ⬅️ BACK TO LOBBY
      </button>
    </div>
  );
}

// Team Selection Component for Team Deathmatch
function TeamSelectionScreen({ onTeamSelect, onBack, selectedGameMode }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [hoveredTeam, setHoveredTeam] = useState(null);

  const teams = [
    {
      id: 'cheek-stuffers',
      name: 'The Cheek Stuffers',
      description: 'Elite hamsters with tactical cheek storage capabilities',
      icon: '🐹',
      color: '#4ecdc4',
      motto: 'Stuff \'em up, take \'em down!',
      specialties: ['Supply Hoarding', 'Surprise Attacks', 'Endurance Combat']
    },
    {
      id: 'wheel-warriors',
      name: 'The Wheel Warriors', 
      description: 'High-speed combat specialists with endless energy',
      icon: '⚡',
      color: '#ff6b6b',
      motto: 'Keep spinning, keep winning!',
      specialties: ['Speed Tactics', 'Mobile Assault', 'Quick Strikes']
    }
  ];

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId);
  };

  const handleConfirm = () => {
    if (selectedTeam) {
      const teamData = teams.find(team => team.id === selectedTeam);
      onTeamSelect(teamData);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #9b59b6 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '48px',
          margin: '0 0 15px 0',
          textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ⚔️ CHOOSE YOUR SQUAD
        </h1>
        {selectedGameMode && (
          <div style={{
            background: `linear-gradient(135deg, ${selectedGameMode.color}20, ${selectedGameMode.color}40)`,
            border: `2px solid ${selectedGameMode.color}`,
            borderRadius: '10px',
            padding: '10px 20px',
            margin: '10px 0',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>{selectedGameMode.icon}</span>
            <span style={{ color: selectedGameMode.color, fontWeight: 'bold', fontSize: '20px' }}>
              {selectedGameMode.name}
            </span>
          </div>
        )}
        <p style={{
          fontSize: '18px',
          margin: '10px 0 0 0',
          color: '#e0e0e0'
        }}>
          Pick your team for epic hamster warfare!
        </p>
      </div>

      {/* Team Selection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '40px',
        maxWidth: '900px',
        marginBottom: '40px',
        width: '100%',
        padding: '0 30px'
      }}>
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => handleTeamSelect(team.id)}
            onMouseEnter={() => setHoveredTeam(team.id)}
            onMouseLeave={() => setHoveredTeam(null)}
            style={{
              background: `linear-gradient(135deg, ${team.color}20, ${team.color}40)`,
              border: selectedTeam === team.id ? `4px solid ${team.color}` : `3px solid ${team.color}80`,
              borderRadius: '15px',
              padding: '30px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: hoveredTeam === team.id || selectedTeam === team.id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedTeam === team.id 
                ? `0 10px 30px ${team.color}50`
                : hoveredTeam === team.id 
                ? `0 8px 25px ${team.color}30`
                : '0 5px 15px rgba(0,0,0,0.3)',
              textAlign: 'center',
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* Team Icon */}
            <div style={{
              fontSize: '64px',
              marginBottom: '15px'
            }}>
              {team.icon}
            </div>

            {/* Team Name */}
            <h2 style={{
              fontSize: '28px',
              margin: '0 0 10px 0',
              color: team.color,
              fontWeight: 'bold'
            }}>
              {team.name}
            </h2>

            {/* Team Description */}
            <p style={{
              fontSize: '14px',
              margin: '0 0 15px 0',
              color: '#e0e0e0',
              lineHeight: '1.4'
            }}>
              {team.description}
            </p>

            {/* Team Motto */}
            <div style={{
              background: `${team.color}30`,
              padding: '10px',
              borderRadius: '8px',
              margin: '10px 0',
              fontSize: '16px',
              fontStyle: 'italic',
              color: team.color,
              fontWeight: 'bold'
            }}>
              "{team.motto}"
            </div>

            {/* Team Specialties */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '15px'
            }}>
              {team.specialties.map((specialty, index) => (
                <div
                  key={index}
                  style={{
                    background: `${team.color}25`,
                    padding: '6px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    color: team.color,
                    fontWeight: 'bold',
                    border: `1px solid ${team.color}50`
                  }}
                >
                  ⭐ {specialty}
                </div>
              ))}
            </div>

            {/* Selected indicator */}
            {selectedTeam === team.id && (
              <div style={{
                marginTop: '20px',
                padding: '12px',
                background: team.color,
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#000',
                boxShadow: `0 4px 15px ${team.color}60`
              }}>
                ✅ TEAM SELECTED
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '25px',
        alignItems: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '18px 35px',
            fontSize: '18px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#777';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#666';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ⬅️ BACK TO GAME MODES
        </button>

        <button
          onClick={handleConfirm}
          disabled={!selectedTeam}
          style={{
            padding: '18px 35px',
            fontSize: '18px',
            backgroundColor: selectedTeam ? '#4CAF50' : '#333',
            color: selectedTeam ? 'white' : '#666',
            border: 'none',
            borderRadius: '10px',
            cursor: selectedTeam ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: selectedTeam ? '0 4px 15px rgba(76, 175, 80, 0.4)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (selectedTeam) {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTeam) {
              e.target.style.backgroundColor = '#4CAF50';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          🚀 JOIN TEAM & SELECT LOADOUT
        </button>
      </div>

      {/* Selected Team Info */}
      {selectedTeam && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '30px',
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '350px',
          border: `2px solid ${teams.find(t => t.id === selectedTeam)?.color}`
        }}>
          <h4 style={{ 
            margin: '0 0 10px 0', 
            color: teams.find(t => t.id === selectedTeam)?.color,
            fontSize: '18px'
          }}>
            {teams.find(t => t.id === selectedTeam)?.name} BRIEFING
          </h4>
          <div style={{ fontSize: '14px', lineHeight: '1.4', color: '#ccc' }}>
            You've joined the elite {teams.find(t => t.id === selectedTeam)?.name}! 
            Prepare for intense Team Deathmatch combat with your specialized squad tactics.
            Choose your loadout wisely to dominate Nuketown!
          </div>
        </div>
      )}
    </div>
  );
}

// Main Lobby Screen Component
export function LobbyScreen({ onStartGame, onBack }) {
  const [showGameModes, setShowGameModes] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);

  // Start lobby music when component mounts
  useEffect(() => {
    const startMusic = async () => {
      try {
        await initializeAudio();
        await sharedAudioManager.startLobbyMusic();
        setAudioStarted(true);
        console.log('🎵 Lobby music started successfully');
      } catch (error) {
        console.warn('⚠️ Could not start lobby music (likely browser policy):', error);
        setAudioStarted(false);
      }
    };

    startMusic();

    // Cleanup: stop lobby music when component unmounts
    return () => {
      sharedAudioManager.stopLobbyMusic();
      console.log('🔇 Lobby music stopped on cleanup');
    };
  }, []);

  // Handle user interaction to start audio
  const handleUserInteraction = async () => {
    if (!audioStarted) {
      try {
        console.log('👆 User clicked - attempting to start audio...');
        await initializeAudio();
        await sharedAudioManager.startLobbyMusic();
        setAudioStarted(true);
        console.log('🎵 Lobby music started after user interaction');
      } catch (error) {
        console.error('❌ Failed to start lobby music:', error);
      }
    }
  };

  const handlePlayGame = () => {
    setShowGameModes(true);
  };

  const handleGameModeSelect = (gameMode) => {
    console.log(`🎮 Selected game mode: ${gameMode.name}`);
    onStartGame(gameMode);
  };

  const handleBackToLobby = () => {
    setShowGameModes(false);
  };

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={handleUserInteraction}
    >
      {/* 3D Background Scene */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Suspense fallback={<LoadingScreen />}>
                  <Canvas 
          camera={{ position: [4, 3.5, 3], fov: 75 }}  // Zoom closer to hamster
          style={{ width: '100%', height: '100%' }}
          gl={{ 
            antialias: true, 
            alpha: true,
            preserveDrawingBuffer: false
          }}
          onCreated={(state) => {
            console.log('🎨 3D Lobby scene created with real hamster and nuketown assets');
            console.log('📷 Camera position:', state.camera.position);
            // Disable user controls - this is just for visual background
            state.gl.domElement.style.pointerEvents = 'none';
            // Set clear color to a nice sky blue
            state.gl.setClearColor('#87CEEB', 1);
            // Make camera look at hamster at elevated position
            state.camera.lookAt(0, 2, 0);
          }}
          onError={(error) => {
            console.error('❌ Canvas error:', error);
          }}
        >
            <BackgroundScene />
          </Canvas>
        </Suspense>
      </div>

      {/* UI Overlay - Top Left */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        zIndex: 100,
        pointerEvents: 'none',
        maxWidth: '400px'
      }}>
        

        {/* Header */}
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{
            fontSize: '32px',
            margin: '0',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            background: 'linear-gradient(45deg, #00ff00, #4ecdc4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🐹 HAMSTER HUNTER
          </h1>
          <p style={{
            fontSize: '16px',
            margin: '5px 0 0 0',
            color: '#e0e0e0',
            textShadow: '1px 1px 2px rgba(0,0,0,0.6)'
          }}>
            Elite Hamster Warfare Academy
          </p>
          
          {/* Audio Status Notification */}
          {!audioStarted && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: 'rgba(255, 193, 7, 0.9)',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#000',
              fontWeight: 'bold',
              textAlign: 'center',
              animation: 'pulse 2s infinite'
            }}>
              🔊 Click anywhere to enable audio!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          pointerEvents: 'auto'
        }}>
          <button
            onClick={handlePlayGame}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#00ff00',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,255,0,0.4)',
              width: '200px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 18px rgba(0,255,0,0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,255,0,0.4)';
            }}
          >
            🎮 PLAY GAME
          </button>

          <button
            onClick={() => window.location.reload()} // Quick play - could be enhanced
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#0080ff',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '200px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0099ff';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#0080ff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🔫 QUICK PLAY
          </button>

          <button
            onClick={() => alert('Settings coming soon!')} // Settings placeholder
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#ff8000',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '200px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ff9000';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ff8000';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ⚙️ SETTINGS
          </button>

          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              width: '200px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.25)';
              e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.15)';
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🚪 EXIT GAME
          </button>
        </div>

        {/* Status Info */}
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          padding: '15px',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#ccc',
          marginTop: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{ color: '#4ecdc4', marginBottom: '8px', fontWeight: 'bold' }}>
            🐹 HAMSTER STATUS
          </div>
          <div style={{ marginBottom: '4px' }}>Ready for Combat</div>
          <div style={{ marginBottom: '4px' }}>Weapons: Loaded</div>
          <div style={{ marginBottom: '4px' }}>Whiskers: Twitching</div>
          <div style={{ color: '#ffe66d', fontWeight: 'bold', marginTop: '10px' }}>
            🎯 Victory Awaits!
          </div>
        </div>
      </div>

      {/* Game Mode Selection Overlay */}
      {showGameModes && (
        <GameModeSelection 
          onGameModeSelect={handleGameModeSelect}
          onBack={handleBackToLobby}
        />
      )}
    </div>
  );
} 