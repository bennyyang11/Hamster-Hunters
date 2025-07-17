// Hamster Hunter UIKit Application
import React, { useState } from 'react';
import { GameEngine } from './GameEngine.jsx';
import { LoadoutScreen } from './ui/LoadoutScreen.jsx';
import { LobbyScreen } from './ui/LobbyScreen.jsx';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, mergeStyles } from './ui/DesignSystem.js';
import { Breadcrumb, Button, Card, Header, SelectionDisplay } from './ui/components/UIComponents.jsx';

// Team Selection Component for Team Deathmatch
function TeamSelectionScreen({ onTeamSelect, onBack, selectedGameMode }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [hoveredTeam, setHoveredTeam] = useState(null);

  // Breadcrumb steps
  const breadcrumbSteps = ['Game Mode', 'Team Selection', 'Class Selection', 'Deploy'];
  const currentStep = 1;

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
      height: '100vh',
      background: COLORS.background.secondary,
      color: COLORS.text.primary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      zIndex: 1000,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: SPACING.base,
      boxSizing: 'border-box'
    }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb steps={breadcrumbSteps} currentStep={currentStep} />

      {/* Header */}
      <Header 
        title="⚔️ CHOOSE YOUR SQUAD"
        subtitle="Pick your team for epic hamster warfare!"
        style={{ marginBottom: SPACING.xl }}
      />

      {/* Selected Game Mode Display */}
      {selectedGameMode && (
        <SelectionDisplay item={selectedGameMode} type="gameMode" />
      )}

      {/* Team Selection Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: SPACING['2xl'],
        maxWidth: '1000px',
        marginBottom: SPACING['2xl'],
        width: '100%',
        padding: `0 ${SPACING.xl}`
      }}>
        {teams.map((team) => (
          <Card
            key={team.id}
            selected={selectedTeam === team.id}
            hovered={hoveredTeam === team.id}
            onClick={() => handleTeamSelect(team.id)}
            onMouseEnter={() => setHoveredTeam(team.id)}
            onMouseLeave={() => setHoveredTeam(null)}
            backgroundColor={`linear-gradient(135deg, ${team.color}20, ${team.color}40)`}
            borderColor={selectedTeam === team.id ? team.color : `${team.color}80`}
            style={{
              minHeight: '400px',
              textAlign: 'center',
              cursor: 'pointer',
              borderWidth: selectedTeam === team.id ? '4px' : '3px',
              boxShadow: selectedTeam === team.id 
                ? `0 12px 35px ${team.color}50, ${SHADOWS.xl}`
                : hoveredTeam === team.id 
                ? `0 10px 30px ${team.color}30, ${SHADOWS.lg}`
                : SHADOWS.base,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ 
              fontSize: TYPOGRAPHY.fontSize['5xl'], 
              marginBottom: SPACING.lg 
            }}>
              {team.icon}
            </div>
            
            <h2 style={{ 
              fontSize: TYPOGRAPHY.fontSize['3xl'], 
              margin: `0 0 ${SPACING.base} 0`, 
              color: team.color, 
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              fontFamily: TYPOGRAPHY.fontFamily.primary
            }}>
              {team.name}
            </h2>
            
            <p style={{ 
              fontSize: TYPOGRAPHY.fontSize.base, 
              margin: `0 0 ${SPACING.lg} 0`, 
              color: COLORS.text.secondary, 
              lineHeight: '1.5' 
            }}>
              {team.description}
            </p>
            
            <div style={{
              background: `${team.color}40`,
              padding: SPACING.base,
              borderRadius: RADIUS.lg,
              margin: `${SPACING.base} 0`,
              fontSize: TYPOGRAPHY.fontSize.lg,
              fontStyle: 'italic',
              color: team.color,
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              border: `2px solid ${team.color}60`
            }}>
              "{team.motto}"
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: SPACING.sm, 
              marginTop: SPACING.lg 
            }}>
              {team.specialties.map((specialty, index) => (
                <div
                  key={index}
                  style={{
                    background: `${team.color}30`,
                    padding: `${SPACING.sm} ${SPACING.base}`,
                    borderRadius: RADIUS.full,
                    fontSize: TYPOGRAPHY.fontSize.sm,
                    color: team.color,
                    fontWeight: TYPOGRAPHY.fontWeight.bold,
                    border: `1px solid ${team.color}50`
                  }}
                >
                  ⭐ {specialty}
                </div>
              ))}
            </div>
            
            {selectedTeam === team.id && (
              <div style={{
                marginTop: SPACING.xl,
                padding: SPACING.base,
                background: team.color,
                borderRadius: RADIUS.lg,
                fontSize: TYPOGRAPHY.fontSize.lg,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: COLORS.text.dark,
                boxShadow: SHADOWS.lg,
                textTransform: 'uppercase'
              }}>
                ✅ TEAM SELECTED
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: SPACING.xl, alignItems: 'center' }}>
        <Button
          onClick={onBack}
          variant="back"
          icon="⬅️"
          size="lg"
        >
          BACK TO GAME MODES
        </Button>
        
        <Button
          onClick={handleConfirm}
          disabled={!selectedTeam}
          variant={selectedTeam ? "success" : "disabled"}
          icon="🚀"
          size="lg"
        >
          JOIN TEAM & SELECT LOADOUT
        </Button>
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