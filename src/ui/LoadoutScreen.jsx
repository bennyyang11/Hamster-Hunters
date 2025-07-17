import React, { useState, useEffect } from 'react';
import { sharedAudioManager, initializeAudio } from '../utils/SharedAudioManager.js';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATIONS, COMPONENTS, mergeStyles, createClassColorStyle } from './DesignSystem.js';
import { Breadcrumb, Button, Card, Header, SelectionDisplay, Notification, WeaponStats } from './components/UIComponents.jsx';

// Define the 4 hamster warfare classes with their weapons and stats
const HAMSTER_CLASSES = {
  'Tactical Chewer': {
    name: 'Tactical Chewer',
    description: 'Precision warfare specialist with tactical gear',
    icon: '🎯',
    primaryWeapon: 'scarh',
    secondaryWeapon: 'model870',
    weapons: ['low_poly_scarh.glb', 'low_poly_model870.glb'],
    specialties: ['Long-range precision', 'Heavy firepower'],
    color: '#4ecdc4',
    stats: {
      health: '●●●●○',
      speed: '●●○○○', 
      damage: '●●●●●',
      accuracy: '●●●●●'
    },
    weaponStats: {
      scarh: { damage: '●●●●●', range: '●●●●●', fireRate: '●●○○○', accuracy: '●●●●○' },
      model870: { damage: '●●●●●', range: '●●○○○', fireRate: '●○○○○', accuracy: '●●●○○' }
    }
  },
  'Fluff \'n\' reload': {
    name: 'Fluff \'n\' reload',
    description: 'Fast-paced assault hamster with rapid-fire weapons',
    icon: '⚡',
    primaryWeapon: 'ak47',
    secondaryWeapon: 'mp5',
    weapons: ['low_poly_ak47.glb', 'low_poly_mp5.glb'],
    specialties: ['High rate of fire', 'Mobile assault'],
    color: '#ff6b6b',
    stats: {
      health: '●●●○○',
      speed: '●●●●○',
      damage: '●●●○○',
      accuracy: '●●●○○'
    },
    weaponStats: {
      ak47: { damage: '●●●○○', range: '●●●○○', fireRate: '●●●●○', accuracy: '●●○○○' },
      mp5: { damage: '●●○○○', range: '●●○○○', fireRate: '●●●●●', accuracy: '●●●○○' }
    }
  },
  'Squeak or be Squeakened': {
    name: 'Squeak or be Squeakened',
    description: 'Stealth and close-quarters combat expert',
    icon: '🥷',
    primaryWeapon: 'mini_uzi',
    secondaryWeapon: 'spas12',
    weapons: ['low_poly_mini_uzi.glb', 'low_poly_spas12.glb'],
    specialties: ['Close quarters', 'High mobility'],
    color: '#ffe66d',
    stats: {
      health: '●●○○○',
      speed: '●●●●●',
      damage: '●●●○○',
      accuracy: '●●○○○'
    },
    weaponStats: {
      mini_uzi: { damage: '●●○○○', range: '●○○○○', fireRate: '●●●●●', accuracy: '●○○○○' },
      spas12: { damage: '●●●●●', range: '●○○○○', fireRate: '●○○○○', accuracy: '●●○○○' }
    }
  },
  'Guns and Whiskers': {
    name: 'Guns and Whiskers',
    description: 'Elite marksman with advanced weaponry',
    icon: '👑',
    primaryWeapon: 'aug_a1',
    secondaryWeapon: 'an94',
    weapons: ['lowpoly_aug_a1.glb', 'low_poly_an94.glb'],
    specialties: ['Elite precision', 'Advanced tactics'],
    color: '#95e1d3',
    stats: {
      health: '●●●●○',
      speed: '●●●○○',
      damage: '●●●●○',
      accuracy: '●●●●●'
    },
    weaponStats: {
      aug_a1: { damage: '●●●○○', range: '●●●●○', fireRate: '●●●○○', accuracy: '●●●●●' },
      an94: { damage: '●●●●○', range: '●●●●○', fireRate: '●●●●○', accuracy: '●●●●○' }
    }
  }
};

export function LoadoutScreen({ onClassSelect, onBack, selectedGameMode, selectedTeam }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [hoveredClass, setHoveredClass] = useState(null);
  const [audioStarted, setAudioStarted] = useState(false);

  // Breadcrumb steps
  const breadcrumbSteps = ['Game Mode', 'Team Selection', 'Class Selection', 'Deploy'];
  const currentStep = selectedTeam ? 2 : 1; // Adjust based on whether team was selected

  // Ensure lobby music is playing
  useEffect(() => {
    const startMusic = async () => {
      try {
        await initializeAudio();
        if (!sharedAudioManager.isLobbyMusicPlaying()) {
          await sharedAudioManager.startLobbyMusic();
          console.log('🎵 Lobby music started in loadout screen');
        }
        setAudioStarted(true);
      } catch (error) {
        console.warn('⚠️ Could not start lobby music in loadout:', error);
        setAudioStarted(false);
      }
    };

    startMusic();
  }, []);

  // Handle user interaction to start audio
  const handleUserInteraction = async () => {
    if (!audioStarted) {
      try {
        console.log('👆 User clicked - attempting to start audio in loadout...');
        await initializeAudio();
        await sharedAudioManager.startLobbyMusic();
        setAudioStarted(true);
        console.log('🎵 Lobby music started after user interaction in loadout');
      } catch (error) {
        console.error('❌ Failed to start lobby music in loadout:', error);
      }
    }
  };

  const handleClassSelect = (className) => {
    setSelectedClass(className);
  };

  const handleConfirm = () => {
    if (selectedClass) {
      const classData = HAMSTER_CLASSES[selectedClass];
      onClassSelect(classData);
    }
  };

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        background: COLORS.background.primary,
        color: COLORS.text.primary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        overflow: 'hidden'
      }}
      onClick={handleUserInteraction}
    >
      <div style={{
        width: '100%',
        height: '100%',
        overflowY: 'scroll',
        padding: SPACING.base,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
      
      {/* Breadcrumb Navigation */}
      <Breadcrumb steps={breadcrumbSteps} currentStep={currentStep} />

      {/* Header */}
      <Header 
        title="🐹 HAMSTER WARFARE 🔫"
        subtitle="Choose Your Combat Class"
        style={{ marginBottom: SPACING.base }}
      />

      {/* Audio Status Notification */}
      <Notification 
        message="🔊 Click anywhere to enable audio!"
        type="warning"
        show={!audioStarted}
      />

      {/* Selected Game Mode Display */}
      {selectedGameMode && (
        <SelectionDisplay item={selectedGameMode} type="gameMode" />
      )}

      {/* Selected Team Display */}
      {selectedTeam && (
        <SelectionDisplay item={selectedTeam} type="team" />
      )}

      {/* Class Selection Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: SPACING.lg,
        maxWidth: '1000px',
        marginBottom: SPACING.lg,
        width: '100%',
        padding: `0 ${SPACING.base}`
      }}>
        {Object.entries(HAMSTER_CLASSES).map(([className, classData]) => (
          <Card
            key={className}
            selected={selectedClass === className}
            hovered={hoveredClass === className}
            onClick={() => handleClassSelect(className)}
            onMouseEnter={() => setHoveredClass(className)}
            onMouseLeave={() => setHoveredClass(null)}
            backgroundColor={`linear-gradient(135deg, ${classData.color}20, ${classData.color}40)`}
            borderColor={selectedClass === className ? classData.color : `${classData.color}80`}
            style={{
              minWidth: '320px',
              textAlign: 'center',
              cursor: 'pointer',
              borderWidth: selectedClass === className ? '3px' : '2px',
              boxShadow: selectedClass === className 
                ? `0 8px 25px ${classData.color}50, ${SHADOWS.xl}`
                : SHADOWS.lg
            }}
          >
            {/* Class Icon */}
            <div style={{
              fontSize: TYPOGRAPHY.fontSize['4xl'],
              marginBottom: SPACING.base
            }}>
              {classData.icon}
            </div>

            {/* Class Name */}
            <h3 style={{
              fontSize: TYPOGRAPHY.fontSize.xl,
              margin: `0 0 ${SPACING.sm} 0`,
              color: classData.color,
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              fontFamily: TYPOGRAPHY.fontFamily.primary
            }}>
              {classData.name}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: TYPOGRAPHY.fontSize.sm,
              margin: `0 0 ${SPACING.base} 0`,
              color: COLORS.text.secondary,
              lineHeight: '1.4'
            }}>
              {classData.description}
            </p>

            {/* Character Stats */}
            <div style={{
              background: COLORS.background.blur,
              borderRadius: RADIUS.base,
              padding: SPACING.sm,
              marginBottom: SPACING.base
            }}>
              <div style={{
                color: classData.color,
                fontSize: TYPOGRAPHY.fontSize.xs,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                marginBottom: SPACING.xs,
                textTransform: 'uppercase'
              }}>
                🐹 Character Stats
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: SPACING.xs,
                fontSize: TYPOGRAPHY.fontSize.xs
              }}>
                <div style={{ color: COLORS.text.muted }}>
                  <span style={{ color: COLORS.accent }}>❤️</span> Health: {classData.stats.health}
                </div>
                <div style={{ color: COLORS.text.muted }}>
                  <span style={{ color: COLORS.accent }}>⚡</span> Speed: {classData.stats.speed}
                </div>
                <div style={{ color: COLORS.text.muted }}>
                  <span style={{ color: COLORS.accent }}>💥</span> Damage: {classData.stats.damage}
                </div>
                <div style={{ color: COLORS.text.muted }}>
                  <span style={{ color: COLORS.accent }}>🎯</span> Accuracy: {classData.stats.accuracy}
                </div>
              </div>
            </div>

            {/* Weapons */}
            <div style={{
              marginBottom: SPACING.base
            }}>
              <div style={{
                fontSize: TYPOGRAPHY.fontSize.sm,
                color: COLORS.text.muted,
                marginBottom: SPACING.sm,
                fontWeight: TYPOGRAPHY.fontWeight.bold
              }}>
                🔫 PRIMARY: {classData.primaryWeapon.toUpperCase()}
              </div>
              <div style={{
                fontSize: TYPOGRAPHY.fontSize.sm,
                color: COLORS.text.muted,
                fontWeight: TYPOGRAPHY.fontWeight.bold
              }}>
                🔫 SECONDARY: {classData.secondaryWeapon.toUpperCase()}
              </div>
            </div>

            {/* Specialties */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: SPACING.xs,
              marginBottom: SPACING.base
            }}>
              {classData.specialties.map((specialty, index) => (
                <div
                  key={index}
                  style={{
                    background: `${classData.color}40`,
                    padding: `${SPACING.xs} ${SPACING.sm}`,
                    borderRadius: RADIUS.full,
                    fontSize: TYPOGRAPHY.fontSize.xs,
                    color: classData.color,
                    fontWeight: TYPOGRAPHY.fontWeight.bold,
                    border: `1px solid ${classData.color}60`
                  }}
                >
                  ✦ {specialty}
                </div>
              ))}
            </div>

            {/* Selected indicator */}
            {selectedClass === className && (
              <div style={{
                marginTop: SPACING.base,
                padding: SPACING.sm,
                background: classData.color,
                borderRadius: RADIUS.base,
                fontSize: TYPOGRAPHY.fontSize.base,
                fontWeight: TYPOGRAPHY.fontWeight.bold,
                color: COLORS.text.dark,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: SHADOWS.base
              }}>
                ✅ SELECTED
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: SPACING.lg,
        alignItems: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl
      }}>
        <Button
          onClick={onBack}
          variant="back"
          icon="⬅️"
          size="lg"
        >
          BACK
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={!selectedClass}
          variant={selectedClass ? "success" : "disabled"}
          icon="🚀"
          size="lg"
        >
          {selectedTeam 
            ? `DEPLOY ${selectedTeam.name.toUpperCase()}` 
            : selectedGameMode 
              ? `DEPLOY TO ${selectedGameMode.name.toUpperCase()}` 
              : 'DEPLOY TO NUKETOWN'}
        </Button>
      </div>

      {/* Selected Class Detailed Info */}
      {selectedClass && (
        <Card style={{
          position: 'fixed',
          bottom: SPACING.lg,
          left: SPACING.lg,
          maxWidth: '400px',
          backgroundColor: COLORS.background.overlay,
          borderColor: HAMSTER_CLASSES[selectedClass].color,
          borderWidth: '2px'
        }}>
          <h4 style={{ 
            margin: `0 0 ${SPACING.base} 0`, 
            color: HAMSTER_CLASSES[selectedClass].color,
            fontSize: TYPOGRAPHY.fontSize.xl,
            fontWeight: TYPOGRAPHY.fontWeight.bold,
            fontFamily: TYPOGRAPHY.fontFamily.primary,
            textTransform: 'uppercase'
          }}>
            {selectedClass} LOADOUT
          </h4>
          
          {selectedTeam && (
            <div style={{
              color: selectedTeam.color,
              fontSize: TYPOGRAPHY.fontSize.base,
              fontWeight: TYPOGRAPHY.fontWeight.bold,
              marginBottom: SPACING.base,
              padding: SPACING.sm,
              background: `${selectedTeam.color}20`,
              borderRadius: RADIUS.base,
              border: `1px solid ${selectedTeam.color}40`
            }}>
              {selectedTeam.icon} {selectedTeam.name} Warrior
            </div>
          )}

          {/* Weapon Stats for Selected Class */}
          <div style={{ marginBottom: SPACING.base }}>
            <WeaponStats 
              weaponName={HAMSTER_CLASSES[selectedClass].primaryWeapon}
              stats={HAMSTER_CLASSES[selectedClass].weaponStats[HAMSTER_CLASSES[selectedClass].primaryWeapon]}
            />
          </div>

          <div style={{ 
            fontSize: TYPOGRAPHY.fontSize.sm, 
            lineHeight: '1.5',
            color: COLORS.text.secondary
          }}>
            {selectedTeam 
              ? `Ready to fight for ${selectedTeam.name} with ${HAMSTER_CLASSES[selectedClass].specialties.join(' and ').toLowerCase()}. Armed with ${HAMSTER_CLASSES[selectedClass].primaryWeapon.toUpperCase()} and ${HAMSTER_CLASSES[selectedClass].secondaryWeapon.toUpperCase()} for team victory!`
              : `Ready to dominate Nuketown with ${HAMSTER_CLASSES[selectedClass].specialties.join(' and ').toLowerCase()}. Armed with ${HAMSTER_CLASSES[selectedClass].primaryWeapon.toUpperCase()} and ${HAMSTER_CLASSES[selectedClass].secondaryWeapon.toUpperCase()} for maximum hamster warfare efficiency.`
            }
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}

export { HAMSTER_CLASSES }; 