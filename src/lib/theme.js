// NeonValley Color Theme System — Premium Nightlife Edition

export const THEMES = {
  'Midnight Purple': {
    name: 'Midnight Purple',
    primary: '#8A2BE2',
    secondary: '#FF2DAA',
    primaryLabel: 'Violet',
    secondaryLabel: 'Magenta',
    gradient: 'linear-gradient(135deg, #8A2BE2, #FF2DAA)',
    glow: 'rgba(138,43,226,0.45)',
    glowSecondary: 'rgba(255,45,170,0.35)',
    bgGlow: 'radial-gradient(circle at top right, rgba(138,43,226,0.22), transparent 38%), radial-gradient(circle at bottom left, rgba(255,45,170,0.14), transparent 42%)',
  },
  'Miami Sunset': {
    name: 'Miami Sunset',
    primary: '#FF4F8B',
    secondary: '#00FFD1',
    primaryLabel: 'Coral',
    secondaryLabel: 'Aqua',
    gradient: 'linear-gradient(135deg, #FF4F8B, #00FFD1)',
    glow: 'rgba(255,79,139,0.45)',
    glowSecondary: 'rgba(0,255,209,0.35)',
    bgGlow: 'radial-gradient(circle at top, rgba(255,79,139,0.20), transparent 36%), radial-gradient(circle at bottom, rgba(0,255,209,0.10), transparent 42%)',
  },
  'Cyber Noir': {
    name: 'Cyber Noir',
    primary: '#00F5FF',
    secondary: '#00C27A',
    primaryLabel: 'Electric Blue',
    secondaryLabel: 'Emerald',
    gradient: 'linear-gradient(135deg, #00F5FF, #00C27A)',
    glow: 'rgba(0,245,255,0.40)',
    glowSecondary: 'rgba(0,194,122,0.35)',
    bgGlow: 'radial-gradient(circle at top right, rgba(0,245,255,0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(0,194,122,0.10), transparent 42%)',
  },
  'Black Gold': {
    name: 'Black Gold',
    primary: '#FFD76A',
    secondary: '#FFFFFF',
    primaryLabel: 'Gold',
    secondaryLabel: 'White',
    gradient: 'linear-gradient(135deg, #FFD76A, #fff)',
    glow: 'rgba(255,215,106,0.40)',
    glowSecondary: 'rgba(255,255,255,0.20)',
    bgGlow: 'radial-gradient(circle at top right,  rgba(255,215,106,0.18), transparent 34%), radial-gradient(circle at bottom left,  rgba(255,255,255,0.04), transparent 45%)',
  },
  // Legacy theme names mapped to new ones for backward compat
  'Gamer RGB': {
    name: 'Gamer RGB',
    primary: ' #8A2BE2',
    secondary: ' #FF2DAA',
    primaryLabel: 'Violet',
    secondaryLabel: 'Magenta',
    gradient: 'linear-gradient(135deg,  #8A2BE2,  #FF2DAA)',
    glow: ' rgba(138,43,226,0.45)',
    glowSecondary: ' rgba(255,45,170,0.35)',
    bgGlow: 'radial-gradient(circle at top right,  rgba(138,43,226,0.22), transparent 38%), radial-gradient(circle at bottom left,  rgba(255,45,170,0.14), transparent 42%)',
  },
  'Miami Night': {
    name: 'Miami Night',
    primary: ' #FF4F8B',
    secondary: ' #00FFD1',
    primaryLabel: 'Coral',
    secondaryLabel: 'Aqua',
    gradient: 'linear-gradient(135deg,  #FF4F8B,  #00FFD1)',
    glow: ' rgba(255,79,139,0.45)',
    glowSecondary: ' rgba(0,255,209,0.35)',
    bgGlow: 'radial-gradient(circle at top,  rgba(255,79,139,0.20), transparent 36%), radial-gradient(circle at bottom,  rgba(0,255,209,0.10), transparent 42%)',
  },
  'Alien Tech': {
    name: 'Alien Tech',
    primary: ' #00F5FF',
    secondary: ' #00C27A',
    primaryLabel: 'Electric Blue',
    secondaryLabel: 'Emerald',
    gradient: 'linear-gradient(135deg,  #00F5FF,  #00C27A)',
    glow: ' rgba(0,245,255,0.40)',
    glowSecondary: ' rgba(0,194,122,0.35)',
    bgGlow: 'radial-gradient(circle at top right,  rgba(0,245,255,0.16), transparent 34%), radial-gradient(circle at bottom left,  rgba(0,194,122,0.10), transparent 42%)',
  },
  'Synthwave': {
    name: 'Synthwave',
    primary: ' #FF4F8B',
    secondary: ' #8A2BE2',
    primaryLabel: 'Pink',
    secondaryLabel: 'Purple',
    gradient: 'linear-gradient(135deg,  #FF4F8B,  #8A2BE2)',
    glow: ' rgba(255,79,139,0.40)',
    glowSecondary: ' rgba(138,43,226,0.35)',
    bgGlow: 'radial-gradient(circle at top,  rgba(255,79,139,0.18), transparent 36%), radial-gradient(circle at bottom,  rgba(138,43,226,0.14), transparent 42%)',
  },
};

export const DISPLAY_THEMES = ['Midnight Purple', 'Miami Sunset', 'Cyber Noir', 'Black Gold'];

export const DEFAULT_THEME = 'Midnight Purple';

export function getTheme(name) {
  return THEMES[name] || THEMES[DEFAULT_THEME];
}

export const TIER_THRESHOLDS = [
  { name: 'Neon Newbie',           floor: 0,      nextPts: 10000,  next: 'Rhythm Rider',         color: ' rgba(255,255,255,0.55)', glow: ' rgba(255,255,255,0.2)' },
  { name: 'Rhythm Rider',          floor: 10000,  nextPts: 100000, next: 'Boogie Boss',           color: ' #00E5FF', glow: ' rgba(0,229,255,0.3)' },
  { name: 'Boogie Boss',           floor: 100000, nextPts: 500000, next: 'Certified Toe-Tapper',  color: ' #FFD76A', glow: ' rgba(255,215,106,0.3)' },
  { name: 'Certified Toe-Tapper',  floor: 500000, nextPts: null,   next: null,                   color: ' #a855f7', glow: ' rgba(168,85,247,0.3)' },
];

export function getTierInfo(totalLifetimePoints) {
  const pts = totalLifetimePoints || 0;
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (pts >= TIER_THRESHOLDS[i].floor) return TIER_THRESHOLDS[i];
  }
  return TIER_THRESHOLDS[0];
}

export function getMembershipTier(totalLifetimePoints) {
  if (totalLifetimePoints >= 500000) return 'Certified Toe-Tapper';
  if (totalLifetimePoints >= 100000) return 'Boogie Boss';
  if (totalLifetimePoints >= 10000) return 'Rhythm Rider';
  return 'Neon Newbie';
}
