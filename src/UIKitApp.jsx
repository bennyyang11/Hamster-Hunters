// Hamster Hunter UIKit Application
import React, { useState } from 'react';
import { GameEngine } from './GameEngine.jsx';
import { LoadoutScreen } from './ui/LoadoutScreen.jsx';
import { LobbyScreen } from './ui/LobbyScreen.jsx';

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
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
        <p style={{ fontSize: '18px', margin: '10px 0 0 0', color: '#e0e0e0' }}>
          Pick your team for epic hamster warfare!
        </p>
      </div>

      {/* Team Selection Grid */}
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
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '15px' }}>{team.icon}</div>
            <h2 style={{ fontSize: '28px', margin: '0 0 10px 0', color: team.color, fontWeight: 'bold' }}>
              {team.name}
            </h2>
            <p style={{ fontSize: '14px', margin: '0 0 15px 0', color: '#e0e0e0', lineHeight: '1.4' }}>
              {team.description}
            </p>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
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
      <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
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
        >
          🚀 JOIN TEAM & SELECT LOADOUT
        </button>
      </div>
    </div>
  );
}

// Main App Component
export function HamsterHunterUI() {
  const [selectedWeapon, setSelectedWeapon] = useState('AK-47');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [gameState, setGameState] = useState('lobby'); // Start directly in lobby

  const handleClassSelect = (classData) => {
    console.log(`🐹 Selected class: ${classData.name}`);
    setSelectedClass(classData);
    setSelectedWeapon(classData.primaryWeapon);
    setGameState('playing');
  };

  const handleLobbyStartGame = (gameMode) => {
    console.log(`🎮 Starting game mode: ${gameMode.name}`);
    setSelectedGameMode(gameMode);
    
    // If it's Team Deathmatch (Hamster Havoc), show team selection first
    if (gameMode.id === 'hamster-havoc') {
      setGameState('teamSelection');
    } else {
      // For other game modes, go straight to loadout
      setGameState('loadout');
    }
  };

  const handleTeamSelect = (teamData) => {
    console.log(`🎯 Selected team: ${teamData.name}`);
    setSelectedTeam(teamData);
    setGameState('loadout');
  };

  const startGame = (weapon) => {
    console.log(`🎮 Starting game with ${weapon}...`);
    setSelectedWeapon(weapon);
    setGameState('playing');
  };

  const exitGame = () => {
    console.log('🏠 Returning to lobby...');
    setGameState('lobby');
    setSelectedGameMode(null);
    setSelectedTeam(null);
  };

  const backToLobby = () => {
    setGameState('lobby');
    setSelectedGameMode(null);
    setSelectedTeam(null);
  };

  const backToGameModes = () => {
    setGameState('lobby');
    setSelectedTeam(null);
  };

  // Show lobby screen
  if (gameState === 'lobby') {
    return <LobbyScreen onStartGame={handleLobbyStartGame} onBack={() => console.log('Exit app')} />;
  }

  // Show team selection screen (for Team Deathmatch)
  if (gameState === 'teamSelection') {
    return <TeamSelectionScreen onTeamSelect={handleTeamSelect} onBack={backToGameModes} selectedGameMode={selectedGameMode} />;
  }

  // Show loadout screen
  if (gameState === 'loadout') {
    return <LoadoutScreen onClassSelect={handleClassSelect} onBack={backToLobby} selectedGameMode={selectedGameMode} selectedTeam={selectedTeam} />;
  }

  // If game is active, render the GameEngine
  if (gameState === 'playing') {
    return <GameEngine selectedWeapon={selectedWeapon} selectedClass={selectedClass} selectedGameMode={selectedGameMode} selectedTeam={selectedTeam} onGameExit={exitGame} />;
  }

  // Otherwise render the lobby (fallback)
  return <LobbyScreen onStartGame={handleLobbyStartGame} onBack={() => console.log('Exit app')} />;
} 