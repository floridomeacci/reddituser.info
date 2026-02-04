/**
 * Design System JavaScript Constants
 * Import these to use design tokens in JavaScript/React
 */

// Get CSS custom properties
const getToken = (token) => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  }
  return '';
};

// Export design tokens as JavaScript constants
export const COLORS = {
  // PRIMARY ACCENT - RED
  ACCENT_PRIMARY: '#ff6b6b',
  
  // Background
  BG_DARK_GREY: '#1a1a1a',
  BG_CARD: '#2a2a2a',
  
  // Text - WHITE/GREY ONLY
  TEXT_WHITE: '#ffffff',
  TEXT_LIGHT_GREY: 'rgba(255, 255, 255, 0.7)',
  TEXT_MUTED: 'rgba(255, 255, 255, 0.5)',
  
  // Border - RED BASED
  BORDER_DEFAULT: 'rgba(255, 107, 107, 0.3)',
  
  // DATA VISUALIZATION COLORS (in priority order)
  DATA_1: '#ff6b6b',    // Red - PRIMARY
  DATA_2: '#4ade80',    // Green
  DATA_3: '#fb923c',    // Orange
  DATA_4: '#fbbf24',    // Yellow
  DATA_5: '#a78bfa',    // Purple
  DATA_6: '#60a5fa',    // Blue
  DATA_7: '#ec4899',    // Pink
  DATA_8: '#14b8a6',    // Teal
  DATA_9: '#f97316',    // Deep Orange
  DATA_10: '#84cc16',   // Lime
  
  // Chart specific
  CHART_AXIS: 'rgba(255, 255, 255, 0.15)',
  CHART_TEXT: 'rgba(255, 255, 255, 0.5)',
  CHART_GRID: 'rgba(255, 255, 255, 0.05)',
};

// Chart configuration
export const CHART_CONFIG = {
  axis: {
    stroke: COLORS.CHART_AXIS,
    tick: { fill: COLORS.CHART_TEXT, fontSize: 9 },
    axisLine: { stroke: COLORS.CHART_AXIS }
  },
  
  line: {
    strokeWidth: 2,
    dot: { r: 3 }
  }
};

// Helper to get data colors in sequence
export const getDataColor = (index) => {
  const colors = [
    COLORS.DATA_1, COLORS.DATA_2, COLORS.DATA_3, COLORS.DATA_4, COLORS.DATA_5,
    COLORS.DATA_6, COLORS.DATA_7, COLORS.DATA_8, COLORS.DATA_9, COLORS.DATA_10
  ];
  return colors[index % colors.length];
};

// Get dynamic design tokens from CSS
export const getDesignTokens = () => ({
  colors: {
    accentPrimary: getToken('--color-accent-primary') || COLORS.ACCENT_PRIMARY,
    textWhite: getToken('--color-text-white') || COLORS.TEXT_WHITE,
    textLightGrey: getToken('--color-text-light-grey') || COLORS.TEXT_LIGHT_GREY,
  },
  chart: {
    primary: getToken('--chart-color-primary') || COLORS.DATA_1,
    secondary: getToken('--chart-color-secondary') || COLORS.DATA_2,
    tertiary: getToken('--chart-color-tertiary') || COLORS.DATA_3,
    axis: getToken('--chart-axis-color') || COLORS.CHART_AXIS,
    text: getToken('--chart-text-color') || COLORS.CHART_TEXT,
    grid: getToken('--chart-grid-color') || COLORS.CHART_GRID,
  },
  radar: {
    gridColor: getToken('--radar-grid-color') || 'rgba(255, 107, 107, 0.15)',
    dataColor: getToken('--radar-data-color') || 'rgba(255, 107, 107, 0.3)',
    dataStroke: getToken('--radar-data-stroke') || COLORS.ACCENT_PRIMARY,
    pointColor: getToken('--radar-point-color') || COLORS.ACCENT_PRIMARY,
    labelColor: getToken('--radar-label-color') || 'rgba(255, 255, 255, 0.8)',
  }
});
