import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../DesignSystem.js';

export function KDAScoreboard({ gameStats, playerPosition, teamScores, gameTime, selectedGameMode, playerStats }) {
  // Convert playerStats Map to array and add calculated fields
  const players = Array.from(playerStats.values()).map(player => ({
    ...player,
    score: (player.kills * 100) + (player.assists * 50) - (player.deaths * 25), // Calculate score
    ping: Math.floor(Math.random() * 100) + 20 // Mock ping for now - would come from server
  }));

  // Map team IDs to display names and filter by team
  const getTeamDisplayName = (teamId) => {
    const teamMap = {
      'wheel-warriors': 'Blue',
      'cheek-stuffers': 'Red',
      'red': 'Red',
      'blue': 'Blue'
    };
    return teamMap[teamId] || teamId;
  };

  const redTeam = players
    .filter(p => getTeamDisplayName(p.team) === 'Red')
    .sort((a, b) => b.score - a.score);
  
  const blueTeam = players
    .filter(p => getTeamDisplayName(p.team) === 'Blue')
    .sort((a, b) => b.score - a.score);

  const PlayerRow = ({ player, index }) => (
    <tr style={{
      backgroundColor: player.isLocalPlayer ? `${COLORS.accent}20` : 'transparent',
      borderLeft: player.isLocalPlayer ? `3px solid ${COLORS.accent}` : '3px solid transparent'
    }}>
      <td style={{
        padding: `${SPACING.sm} ${SPACING.md}`,
        color: player.isLocalPlayer ? COLORS.accent : COLORS.text.primary,
        fontWeight: player.isLocalPlayer ? TYPOGRAPHY.fontWeight.bold : TYPOGRAPHY.fontWeight.medium,
        fontSize: TYPOGRAPHY.fontSize.sm
      }}>
        #{index + 1}
      </td>
      <td style={{
        padding: `${SPACING.sm} ${SPACING.md}`,
        color: player.isLocalPlayer ? COLORS.accent : COLORS.text.primary,
        fontWeight: player.isLocalPlayer ? TYPOGRAPHY.fontWeight.bold : TYPOGRAPHY.fontWeight.medium,
        fontSize: TYPOGRAPHY.fontSize.sm,
        maxWidth: '120px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {player.name}
      </td>
      <td style={{
        padding: `${SPACING.sm} ${SPACING.md}`,
        color: COLORS.success,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        fontSize: TYPOGRAPHY.fontSize.sm,
        textAlign: 'center'
      }}>
        {player.kills}
      </td>
      <td style={{
        padding: `${SPACING.sm} ${SPACING.md}`,
        color: COLORS.danger,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        fontSize: TYPOGRAPHY.fontSize.sm,
        textAlign: 'center'
      }}>
        {player.deaths}
      </td>
      <td style={{
        padding: `${SPACING.sm} ${SPACING.md}`,
        color: COLORS.warning,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        fontSize: TYPOGRAPHY.fontSize.sm,
        textAlign: 'center'
      }}>
        {player.assists}
      </td>
      <td style={{
        padding: `${SPACING.sm} ${SPACING.md}`,
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        fontSize: TYPOGRAPHY.fontSize.sm,
        textAlign: 'center'
      }}>
        {(player.kills / Math.max(player.deaths, 1)).toFixed(2)}
      </td>
      <td style={{
        padding: `${SPACING.sm} ${SPACING.md}`,
        color: COLORS.text.primary,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        fontSize: TYPOGRAPHY.fontSize.sm,
        textAlign: 'center'
      }}>
        {player.score}
      </td>
      <td style={{
        padding: `${SPACING.sm} ${SPACING.md}`,
        color: player.ping < 50 ? COLORS.success : 
               player.ping < 100 ? COLORS.warning : COLORS.danger,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        fontSize: TYPOGRAPHY.fontSize.sm,
        textAlign: 'center'
      }}>
        {player.ping}ms
      </td>
    </tr>
  );

  const TeamTable = ({ team, teamName, teamColor }) => (
    <div style={{
      flex: 1,
      minWidth: '400px'
    }}>
      {/* Team Header */}
      <div style={{
        background: `linear-gradient(135deg, ${teamColor}30, ${teamColor}50)`,
        borderRadius: '8px 8px 0 0',
        padding: SPACING.md,
        borderBottom: `2px solid ${teamColor}`,
        textAlign: 'center'
      }}>
        <h3 style={{
          margin: 0,
          color: teamColor,
          fontSize: TYPOGRAPHY.fontSize.lg,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          🏆 {teamName} Team
        </h3>
      </div>

      {/* Team Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: `${COLORS.background.secondary}95`,
        backdropFilter: 'blur(10px)'
      }}>
        <thead>
          <tr style={{
            backgroundColor: `${teamColor}20`,
            borderBottom: `1px solid ${teamColor}40`
          }}>
            <th style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              color: COLORS.text.secondary,
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              textAlign: 'left',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Rank
            </th>
            <th style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              color: COLORS.text.secondary,
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              textAlign: 'left',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Player
            </th>
            <th style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              color: COLORS.text.secondary,
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              K
            </th>
            <th style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              color: COLORS.text.secondary,
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              D
            </th>
            <th style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              color: COLORS.text.secondary,
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              A
            </th>
            <th style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              color: COLORS.text.secondary,
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              K/D
            </th>
            <th style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              color: COLORS.text.secondary,
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Score
            </th>
            <th style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              color: COLORS.text.secondary,
              fontSize: TYPOGRAPHY.fontSize.xs,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Ping
            </th>
          </tr>
        </thead>
        <tbody>
          {team.map((player, index) => (
            <PlayerRow key={player.id} player={player} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: SPACING.xl
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: SPACING.xl
      }}>
        <h1 style={{
          margin: `0 0 ${SPACING.sm} 0`,
          color: COLORS.text.primary,
          fontSize: TYPOGRAPHY.fontSize['3xl'],
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          textShadow: '0 4px 8px rgba(0,0,0,0.5)'
        }}>
          🎯 SCOREBOARD
        </h1>
        <div style={{
          display: 'flex',
          gap: SPACING.lg,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            color: COLORS.text.secondary,
            fontSize: TYPOGRAPHY.fontSize.md,
            fontWeight: TYPOGRAPHY.fontWeight.medium
          }}>
            🏆 Red: {teamScores?.red || 0} | Blue: {teamScores?.blue || 0}
          </div>
          <div style={{
            color: COLORS.text.secondary,
            fontSize: TYPOGRAPHY.fontSize.md,
            fontWeight: TYPOGRAPHY.fontWeight.medium
          }}>
            ⏱️ {Math.floor((gameTime || 0) / 60)}:{String((gameTime || 0) % 60).padStart(2, '0')}
          </div>
          <div style={{
            color: COLORS.text.secondary,
            fontSize: TYPOGRAPHY.fontSize.md,
            fontWeight: TYPOGRAPHY.fontWeight.medium
          }}>
            🎮 {selectedGameMode?.name || 'Hamster Havoc'}
          </div>
        </div>
      </div>

      {/* Scoreboard Tables */}
      <div style={{
        display: 'flex',
        gap: SPACING.xl,
        width: '100%',
        maxWidth: '1200px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <TeamTable 
          team={redTeam} 
          teamName="Red" 
          teamColor="#ff6b6b" 
        />
        <TeamTable 
          team={blueTeam} 
          teamName="Blue" 
          teamColor="#4ecdc4" 
        />
      </div>

      {/* Footer */}
      <div style={{
        marginTop: SPACING.xl,
        textAlign: 'center',
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium
      }}>
        💡 Hold TAB to view scoreboard • Release to continue playing
      </div>
    </div>
  );
} 