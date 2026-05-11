export const COLORS = {
  background: '#0A1128',
  card: '#162241',
  cardSecondary: '#1C2B4F',
  primary: '#00E5FF',
  primaryGlow: 'rgba(0, 229, 255, 0.3)',
  text: '#FFFFFF',
  textSecondary: '#A0B0D0',
  success: '#00FF87',
  danger: '#FF3B30',
  border: '#2A3B5E',
};

export const SHADOWS = {
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
};
