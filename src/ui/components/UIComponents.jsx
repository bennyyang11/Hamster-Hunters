import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATIONS, COMPONENTS, mergeStyles } from '../DesignSystem.js';

// Breadcrumb Navigation Component
export function Breadcrumb({ steps, currentStep }) {
  return (
    <div style={COMPONENTS.breadcrumb.container}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <React.Fragment key={step}>
            <div style={mergeStyles(
              COMPONENTS.breadcrumb.item,
              isActive ? COMPONENTS.breadcrumb.active : {},
              isCompleted ? { backgroundColor: COLORS.success, color: COLORS.text.primary } : {}
            )}>
              {isCompleted && '✓ '}{step}
            </div>
            {index < steps.length - 1 && (
              <span style={{ margin: `0 ${SPACING.sm}`, color: COLORS.text.muted }}>→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Enhanced Button Component
export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'base',
  disabled = false,
  icon = null,
  className = '',
  style = {},
  ...props 
}) {
  const sizeStyles = {
    sm: { 
      fontSize: TYPOGRAPHY.fontSize.base, 
      padding: `${SPACING.sm} ${SPACING.lg}` 
    },
    base: { 
      fontSize: TYPOGRAPHY.fontSize.lg, 
      padding: `${SPACING.base} ${SPACING.xl}` 
    },
    lg: { 
      fontSize: TYPOGRAPHY.fontSize.xl, 
      padding: `${SPACING.lg} ${SPACING['2xl']}` 
    }
  };

  const buttonStyle = mergeStyles(
    COMPONENTS.button.base,
    sizeStyles[size],
    disabled ? COMPONENTS.button.disabled : COMPONENTS.button[variant],
    style
  );

  const handleMouseEnter = (e) => {
    if (!disabled) {
      e.target.style.transform = ANIMATIONS.hover.scale;
      e.target.style.filter = ANIMATIONS.hover.glow;
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.target.style.transform = 'scale(1)';
      e.target.style.filter = 'none';
    }
  };

  return (
    <button
      style={buttonStyle}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={className}
      {...props}
    >
      {icon && <span style={{ marginRight: SPACING.sm }}>{icon}</span>}
      {children}
    </button>
  );
}

// Card Component
export function Card({ 
  children, 
  selected = false, 
  hovered = false,
  onClick,
  backgroundColor,
  borderColor,
  className = '',
  style = {},
  ...props 
}) {
  const cardStyle = mergeStyles(
    COMPONENTS.card.base,
    backgroundColor ? { background: backgroundColor } : {},
    borderColor ? { borderColor: borderColor } : {},
    selected ? COMPONENTS.card.selected : {},
    hovered ? COMPONENTS.card.hover : {},
    style
  );

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

// Header Component
export function Header({ title, subtitle, icon, style = {} }) {
  return (
    <div style={mergeStyles({ textAlign: 'center', marginBottom: SPACING.xl }, style)}>
      {icon && (
        <div style={{ 
          fontSize: TYPOGRAPHY.fontSize['5xl'], 
          marginBottom: SPACING.base 
        }}>
          {icon}
        </div>
      )}
      <h1 style={COMPONENTS.header.title}>
        {title}
      </h1>
      {subtitle && (
        <p style={COMPONENTS.header.subtitle}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Game Mode/Team/Class Display Component
export function SelectionDisplay({ item, type = 'gameMode' }) {
  if (!item) return null;

  const getIcon = () => {
    switch (type) {
      case 'gameMode': return item.icon;
      case 'team': return item.icon;
      case 'class': return item.icon;
      default: return '🎮';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'gameMode': return item.name;
      case 'team': return item.name;
      case 'class': return item.name;
      default: return item.name || 'Unknown';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'gameMode': return `${item.subtitle} • ${item.players}`;
      case 'team': return `"${item.motto}"`;
      case 'class': return item.description;
      default: return '';
    }
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
      border: `2px solid ${item.color}`,
      borderRadius: RADIUS.lg,
      padding: `${SPACING.base} ${SPACING.xl}`,
      margin: `${SPACING.base} 0`,
      display: 'inline-block',
      textAlign: 'center'
    }}>
      <span style={{ fontSize: TYPOGRAPHY.fontSize['2xl'], marginRight: SPACING.sm }}>
        {getIcon()}
      </span>
      <span style={{ 
        color: item.color, 
        fontWeight: TYPOGRAPHY.fontWeight.bold, 
        fontSize: TYPOGRAPHY.fontSize.xl 
      }}>
        {getTitle()}
      </span>
      {getSubtitle() && (
        <div style={{ 
          fontSize: TYPOGRAPHY.fontSize.sm, 
          color: COLORS.text.secondary, 
          marginTop: SPACING.xs 
        }}>
          {getSubtitle()}
        </div>
      )}
    </div>
  );
}

// Notification Component
export function Notification({ message, type = 'info', icon, show = true, style = {} }) {
  if (!show) return null;

  const typeColors = {
    info: COLORS.primary,
    warning: COLORS.warning,
    success: COLORS.success,
    error: COLORS.danger
  };

  const typeIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌'
  };

  return (
    <div style={mergeStyles({
      marginTop: SPACING.base,
      marginBottom: SPACING.base,
      padding: `${SPACING.sm} ${SPACING.base}`,
      backgroundColor: `${typeColors[type]}E6`,
      border: `1px solid ${typeColors[type]}`,
      borderRadius: RADIUS.base,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: type === 'warning' ? COLORS.text.dark : COLORS.text.primary,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      textAlign: 'center',
      display: 'inline-block'
    }, style)}>
      <span style={{ marginRight: SPACING.xs }}>
        {icon || typeIcons[type]}
      </span>
      {message}
    </div>
  );
}

// Weapon Stats Component
export function WeaponStats({ weaponName, stats }) {
  const statItems = [
    { label: 'Damage', value: stats?.damage || '●●●○○', icon: '🔫' },
    { label: 'Range', value: stats?.range || '●●○○○', icon: '🎯' },
    { label: 'Rate of Fire', value: stats?.fireRate || '●●●●○', icon: '⚡' },
    { label: 'Accuracy', value: stats?.accuracy || '●●●○○', icon: '📍' }
  ];

  return (
    <div style={{
      background: COLORS.background.blur,
      borderRadius: RADIUS.base,
      padding: SPACING.base,
      marginTop: SPACING.base
    }}>
      <div style={{
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: SPACING.sm,
        textAlign: 'center'
      }}>
        🔫 {weaponName.toUpperCase()} STATS
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSize.xs
      }}>
        {statItems.map((stat, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            color: COLORS.text.secondary
          }}>
            <span style={{ marginRight: SPACING.xs }}>{stat.icon}</span>
            <span style={{ marginRight: SPACING.xs }}>{stat.label}:</span>
            <span style={{ color: COLORS.accent }}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Component
export function Loading({ message = 'Loading...', icon = '🐹' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: COLORS.text.primary,
      fontSize: TYPOGRAPHY.fontSize['2xl']
    }}>
      <div style={{ 
        fontSize: TYPOGRAPHY.fontSize['5xl'], 
        marginBottom: SPACING.lg,
        animation: 'spin 2s linear infinite'
      }}>
        {icon}
      </div>
      <div>{message}</div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Volume Slider Component
export function VolumeSlider({ label, value, onChange, icon = '🔊' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: SPACING.base,
      background: COLORS.background.blur,
      padding: SPACING.base,
      borderRadius: RADIUS.base
    }}>
      <span style={{ marginRight: SPACING.sm, fontSize: TYPOGRAPHY.fontSize.lg }}>
        {icon}
      </span>
      <span style={{ 
        marginRight: SPACING.base, 
        minWidth: '80px',
        color: COLORS.text.secondary,
        fontSize: TYPOGRAPHY.fontSize.sm
      }}>
        {label}:
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          flex: 1,
          marginRight: SPACING.base,
          accentColor: COLORS.primary
        }}
      />
      <span style={{ 
        minWidth: '30px', 
        textAlign: 'right',
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        fontSize: TYPOGRAPHY.fontSize.sm
      }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
} 