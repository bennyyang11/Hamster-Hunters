import React, { useState } from 'react';

// Define the 4 hamster warfare classes with their weapons
const HAMSTER_CLASSES = {
  'Tactical Chewer': {
    name: 'Tactical Chewer',
    description: 'Precision warfare specialist with tactical gear',
    icon: '🎯',
    primaryWeapon: 'scarh',
    secondaryWeapon: 'model870',
    weapons: ['low_poly_scarh.glb', 'low_poly_model870.glb'],
    specialties: ['Long-range precision', 'Heavy firepower'],
    color: '#4ecdc4'
  },
  'Fluff \'n\' reload': {
    name: 'Fluff \'n\' reload',
    description: 'Fast-paced assault hamster with rapid-fire weapons',
    icon: '⚡',
    primaryWeapon: 'ak47',
    secondaryWeapon: 'mp5',
    weapons: ['low_poly_ak47.glb', 'low_poly_mp5.glb'],
    specialties: ['High rate of fire', 'Mobile assault'],
    color: '#ff6b6b'
  },
  'Squeak or be Squeakened': {
    name: 'Squeak or be Squeakened',
    description: 'Stealth and close-quarters combat expert',
    icon: '🥷',
    primaryWeapon: 'mini_uzi',
    secondaryWeapon: 'spas12',
    weapons: ['low_poly_mini_uzi.glb', 'low_poly_spas12.glb'],
    specialties: ['Close quarters', 'High mobility'],
    color: '#ffe66d'
  },
  'Guns and Whiskers': {
    name: 'Guns and Whiskers',
    description: 'Elite marksman with advanced weaponry',
    icon: '👑',
    primaryWeapon: 'aug_a1',
    secondaryWeapon: 'an94',
    weapons: ['lowpoly_aug_a1.glb', 'low_poly_an94.glb'],
    specialties: ['Elite precision', 'Advanced tactics'],
    color: '#95e1d3'
  }
};

export function LoadoutScreen({ onClassSelect, onBack, selectedGameMode, selectedTeam }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [hoveredClass, setHoveredClass] = useState(null);

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
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        overflowY: 'scroll',
        padding: '15px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '15px'
      }}>
        <h1 style={{
          fontSize: '32px',
          margin: '5px 0 5px 0',
          textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
        }}>
          🐹 HAMSTER WARFARE 🔫
        </h1>
        
        {/* Game Mode Display */}
        {selectedGameMode && (
          <div style={{
            background: `linear-gradient(135deg, ${selectedGameMode.color}20, ${selectedGameMode.color}40)`,
            border: `2px solid ${selectedGameMode.color}`,
            borderRadius: '10px',
            padding: '10px 20px',
            margin: '10px 0',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '20px', marginRight: '8px' }}>{selectedGameMode.icon}</span>
            <span style={{ color: selectedGameMode.color, fontWeight: 'bold', fontSize: '18px' }}>
              {selectedGameMode.name}
            </span>
            <div style={{ fontSize: '12px', color: '#ccc', marginTop: '2px' }}>
              {selectedGameMode.subtitle} • {selectedGameMode.players}
            </div>
          </div>
        )}

        {/* Team Display (for Team Deathmatch) */}
        {selectedTeam && (
          <div style={{
            background: `linear-gradient(135deg, ${selectedTeam.color}20, ${selectedTeam.color}40)`,
            border: `2px solid ${selectedTeam.color}`,
            borderRadius: '10px',
            padding: '10px 20px',
            margin: '10px 0',
            display: 'inline-block'
          }}>
            <span style={{ fontSize: '20px', marginRight: '8px' }}>{selectedTeam.icon}</span>
            <span style={{ color: selectedTeam.color, fontWeight: 'bold', fontSize: '18px' }}>
              {selectedTeam.name}
            </span>
            <div style={{ fontSize: '12px', color: '#ccc', marginTop: '2px' }}>
              "{selectedTeam.motto}"
            </div>
          </div>
        )}
        
        <h2 style={{
          fontSize: '16px',
          margin: '10px 0 0 0',
          color: '#e0e0e0'
        }}>
          Choose Your Combat Class
        </h2>
      </div>

      {/* Class Selection Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        maxWidth: '800px',
        marginBottom: '15px',
        width: '100%',
        padding: '0 15px'
      }}>
        {Object.entries(HAMSTER_CLASSES).map(([className, classData]) => (
          <div
            key={className}
            onClick={() => handleClassSelect(className)}
            onMouseEnter={() => setHoveredClass(className)}
            onMouseLeave={() => setHoveredClass(null)}
            style={{
              background: `linear-gradient(135deg, ${classData.color}20, ${classData.color}40)`,
              border: selectedClass === className ? `3px solid ${classData.color}` : `2px solid ${classData.color}80`,
              borderRadius: '10px',
              padding: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: hoveredClass === className ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selectedClass === className 
                ? `0 6px 20px ${classData.color}50`
                : '0 3px 10px rgba(0,0,0,0.3)',
              minWidth: '250px',
              textAlign: 'center'
            }}
          >
            {/* Class Icon */}
            <div style={{
              fontSize: '36px',
              marginBottom: '8px'
            }}>
              {classData.icon}
            </div>

            {/* Class Name */}
            <h3 style={{
              fontSize: '18px',
              margin: '0 0 6px 0',
              color: classData.color,
              fontWeight: 'bold'
            }}>
              {classData.name}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: '12px',
              margin: '0 0 8px 0',
              color: '#e0e0e0',
              lineHeight: '1.2'
            }}>
              {classData.description}
            </p>

            {/* Weapons */}
            <div style={{
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#ccc',
                marginBottom: '8px'
              }}>
                PRIMARY: {classData.primaryWeapon.toUpperCase()}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#ccc'
              }}>
                SECONDARY: {classData.secondaryWeapon.toUpperCase()}
              </div>
            </div>

            {/* Specialties */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}>
              {classData.specialties.map((specialty, index) => (
                <div
                  key={index}
                  style={{
                    background: `${classData.color}30`,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: classData.color,
                    fontWeight: 'bold'
                  }}
                >
                  ✦ {specialty}
                </div>
              ))}
            </div>

            {/* Selected indicator */}
            {selectedClass === className && (
              <div style={{
                marginTop: '15px',
                padding: '8px',
                background: `${classData.color}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#000'
              }}>
                ✅ SELECTED
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        marginTop: '10px'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ⬅️ BACK
        </button>

        <button
          onClick={handleConfirm}
          disabled={!selectedClass}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: selectedClass ? '#4CAF50' : '#333',
            color: selectedClass ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: selectedClass ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          🚀 {selectedTeam ? `DEPLOY ${selectedTeam.name.toUpperCase()}` : selectedGameMode ? `DEPLOY TO ${selectedGameMode.name.toUpperCase()}` : 'DEPLOY TO NUKETOWN'}
        </button>
      </div>

      {/* Selected Class Info */}
      {selectedClass && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.8)',
          padding: '15px',
          borderRadius: '10px',
          maxWidth: '300px'
        }}>
          <h4 style={{ 
            margin: '0 0 10px 0', 
            color: HAMSTER_CLASSES[selectedClass].color 
          }}>
            {selectedClass} LOADOUT
          </h4>
          {selectedTeam && (
            <div style={{
              color: selectedTeam.color,
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px',
              padding: '4px 8px',
              background: `${selectedTeam.color}20`,
              borderRadius: '5px',
              border: `1px solid ${selectedTeam.color}30`
            }}>
              {selectedTeam.icon} {selectedTeam.name} Warrior
            </div>
          )}
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            {selectedTeam 
              ? `Ready to fight for ${selectedTeam.name} with ${HAMSTER_CLASSES[selectedClass].specialties.join(' and ').toLowerCase()}. Armed with ${HAMSTER_CLASSES[selectedClass].primaryWeapon} and ${HAMSTER_CLASSES[selectedClass].secondaryWeapon} for team victory!`
              : `Ready to dominate Nuketown with ${HAMSTER_CLASSES[selectedClass].specialties.join(' and ').toLowerCase()}. Armed with ${HAMSTER_CLASSES[selectedClass].primaryWeapon} and ${HAMSTER_CLASSES[selectedClass].secondaryWeapon} for maximum hamster warfare efficiency.`
            }
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export { HAMSTER_CLASSES }; 