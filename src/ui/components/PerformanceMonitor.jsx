import React, { useState, useEffect } from 'react';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../DesignSystem.js';

export function PerformanceMonitor({ 
  renderOptimizer, 
  networkStats = {},
  show = false,
  position = 'top-right'
}) {
  const [metrics, setMetrics] = useState({
    fps: 60,
    frameTime: 16.67,
    culledObjects: 0,
    visibleObjects: 0,
    drawCalls: 0,
    lodObjects: 0
  });

  const [networkMetrics, setNetworkMetrics] = useState({
    updatesSent: 0,
    updatesReceived: 0,
    dataCompression: 0,
    latency: 0
  });

  // Update metrics every second
  useEffect(() => {
    if (!renderOptimizer || !show) return;

    const interval = setInterval(() => {
      try {
        const newMetrics = renderOptimizer.getMetrics();
        setMetrics(newMetrics);
        
        // Update network metrics if provided
        if (networkStats) {
          setNetworkMetrics(prev => ({
            ...prev,
            ...networkStats
          }));
        }
      } catch (error) {
        console.warn('Error updating performance metrics:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [renderOptimizer, show, networkStats]);

  if (!show) return null;

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 10000,
      minWidth: '250px',
      maxWidth: '350px'
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: SPACING.base, left: SPACING.base };
      case 'top-right':
        return { ...baseStyles, top: SPACING.base, right: SPACING.base };
      case 'bottom-left':
        return { ...baseStyles, bottom: SPACING.base, left: SPACING.base };
      case 'bottom-right':
        return { ...baseStyles, bottom: SPACING.base, right: SPACING.base };
      default:
        return { ...baseStyles, top: SPACING.base, right: SPACING.base };
    }
  };

  const getPerformanceColor = (fps) => {
    if (fps >= 50) return COLORS.success;
    if (fps >= 30) return COLORS.warning;
    return COLORS.danger;
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return Math.round(num).toString();
  };

  return (
    <div style={{
      ...getPositionStyles(),
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: COLORS.text.primary,
      padding: SPACING.base,
      borderRadius: RADIUS.lg,
      fontFamily: TYPOGRAPHY.fontFamily.secondary,
      fontSize: TYPOGRAPHY.fontSize.xs,
      border: `1px solid ${COLORS.primary}40`,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${COLORS.primary}40`,
        paddingBottom: SPACING.sm,
        marginBottom: SPACING.sm
      }}>
        <div style={{
          color: COLORS.primary,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          fontSize: TYPOGRAPHY.fontSize.sm,
          textAlign: 'center'
        }}>
          🎯 PERFORMANCE MONITOR
        </div>
      </div>

      {/* Rendering Metrics */}
      <div style={{ marginBottom: SPACING.base }}>
        <div style={{
          color: COLORS.accent,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.xs,
          fontSize: TYPOGRAPHY.fontSize.xs
        }}>
          📊 RENDERING
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.xs }}>
          <MetricItem 
            label="FPS" 
            value={metrics.fps} 
            color={getPerformanceColor(metrics.fps)}
            suffix=""
          />
          <MetricItem 
            label="Frame Time" 
            value={metrics.frameTime?.toFixed(1)} 
            color={COLORS.text.secondary}
            suffix="ms"
          />
          <MetricItem 
            label="Draw Calls" 
            value={formatNumber(metrics.drawCalls)} 
            color={COLORS.text.secondary}
          />
          <MetricItem 
            label="Visible" 
            value={formatNumber(metrics.visibleObjects)} 
            color={COLORS.text.secondary}
          />
        </div>
      </div>

      {/* Optimization Metrics */}
      <div style={{ marginBottom: SPACING.base }}>
        <div style={{
          color: COLORS.accent,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.xs,
          fontSize: TYPOGRAPHY.fontSize.xs
        }}>
          ⚡ OPTIMIZATIONS
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.xs }}>
          <MetricItem 
            label="Culled" 
            value={formatNumber(metrics.culledObjects)} 
            color={COLORS.success}
          />
          <MetricItem 
            label="LOD Objects" 
            value={formatNumber(metrics.lodObjects)} 
            color={COLORS.primary}
          />
        </div>
      </div>

      {/* Network Metrics */}
      <div>
        <div style={{
          color: COLORS.accent,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.xs,
          fontSize: TYPOGRAPHY.fontSize.xs
        }}>
          🌐 NETWORK
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.xs }}>
          <MetricItem 
            label="Updates/s" 
            value={networkMetrics.updatesSent || 0} 
            color={COLORS.text.secondary}
          />
          <MetricItem 
            label="Received/s" 
            value={networkMetrics.updatesReceived || 0} 
            color={COLORS.text.secondary}
          />
          <MetricItem 
            label="Compression" 
            value={`${networkMetrics.dataCompression || 0}%`} 
            color={COLORS.success}
          />
          <MetricItem 
            label="Latency" 
            value={`${networkMetrics.latency || 0}ms`} 
            color={getLatencyColor(networkMetrics.latency || 0)}
          />
        </div>
      </div>

      {/* Performance Recommendation */}
      {renderOptimizer && (
        <div style={{
          marginTop: SPACING.base,
          padding: SPACING.sm,
          backgroundColor: getRecommendationColor(metrics.fps),
          borderRadius: RADIUS.base,
          textAlign: 'center',
          fontSize: TYPOGRAPHY.fontSize.xs,
          fontWeight: TYPOGRAPHY.fontWeight.bold
        }}>
          {getPerformanceRecommendation(metrics.fps)}
        </div>
      )}
    </div>
  );
}

// Individual metric item component
function MetricItem({ label, value, color = COLORS.text.secondary, suffix = '' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${SPACING.xs} 0`
    }}>
      <span style={{ color: COLORS.text.muted, fontSize: TYPOGRAPHY.fontSize.xs }}>
        {label}:
      </span>
      <span style={{ 
        color: color, 
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        fontSize: TYPOGRAPHY.fontSize.xs
      }}>
        {value}{suffix}
      </span>
    </div>
  );
}

// Helper functions
function getLatencyColor(latency) {
  if (latency <= 50) return COLORS.success;
  if (latency <= 100) return COLORS.warning;
  return COLORS.danger;
}

function getRecommendationColor(fps) {
  if (fps >= 50) return `${COLORS.success}30`;
  if (fps >= 30) return `${COLORS.warning}30`;
  return `${COLORS.danger}30`;
}

function getPerformanceRecommendation(fps) {
  if (fps >= 50) return '🟢 EXCELLENT PERFORMANCE';
  if (fps >= 30) return '🟡 GOOD PERFORMANCE';
  if (fps >= 20) return '🟠 FAIR PERFORMANCE';
  return '🔴 POOR PERFORMANCE';
} 