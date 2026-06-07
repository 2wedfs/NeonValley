// NeonValley Color Theme System - Professional Club Edition

export const THEMES = {
  'Midnight Eclipse': {
    name: 'Midnight Eclipse',
    primary: '#9D4EDD',
    secondary: '#F72585',
    base: '#050509',
    surface: '#100A1D',
    primaryLabel: 'Electric Violet',
    secondaryLabel: 'Soft Pink',
    gradient: 'linear-gradient(135deg, #3A0CA3 0%, #9D4EDD 48%, #F72585 100%)',
    glow: 'rgba(157, 78, 221, 0.28)',
    glowSecondary: 'rgba(247, 37, 133, 0.18)',
    bgGlow: 'radial-gradient(circle at 78% 0%, rgba(58,12,163,0.32), transparent 34%), radial-gradient(circle at 18% 14%, rgba(247,37,133,0.14), transparent 30%), linear-gradient(180deg, #050509 0%, #0B0714 52%, #050509 100%)',
  },
  'Miami Sunset': {
    name: 'Miami Sunset',
    primary: '#FF4F8B',
    secondary: '#FF7A45',
    accent: '#00FFD1',
    base: '#120711',
    surface: '#1A0B17',
    primaryLabel: 'Hot Coral',
    secondaryLabel: 'Sunset Orange',
    gradient: 'linear-gradient(135deg, #FF4F8B 0%, #FF7A45 68%, #00FFD1 130%)',
    glow: 'rgba(255,79,139,0.24)',
    glowSecondary: 'rgba(255,122,69,0.18)',
    bgGlow: 'radial-gradient(circle at 20% 0%, rgba(255,79,139,0.24), transparent 34%), radial-gradient(circle at 90% 20%, rgba(0,255,209,0.10), transparent 30%), linear-gradient(180deg, #120711 0%, #090509 100%)',
  },
  'Cyber Noir': {
    name: 'Cyber Noir',
    primary: '#00E5FF',
    secondary: '#0099FF',
    base: '#03070A',
    surface: '#06151A',
    primaryLabel: 'Cyan Accent',
    secondaryLabel: 'Electric Blue',
    gradient: 'linear-gradient(135deg, #003B46 0%, #00E5FF 54%, #0099FF 100%)',
    glow: 'rgba(0,229,255,0.22)',
    glowSecondary: 'rgba(0,153,255,0.16)',
    bgGlow: 'radial-gradient(circle at 85% 0%, rgba(0,59,70,0.48), transparent 36%), radial-gradient(circle at 12% 28%, rgba(0,153,255,0.12), transparent 34%), linear-gradient(180deg, #03070A 0%, #041016 100%)',
  },
  'Black Gold': {
    name: 'Black Gold',
    primary: '#FFD166',
    secondary: '#FFF1B8',
    base: '#030303',
    surface: '#111111',
    primaryLabel: 'Gold Accent',
    secondaryLabel: 'Champagne',
    gradient: 'linear-gradient(135deg, #6F5520 0%, #FFD166 58%, #FFF1B8 100%)',
    glow: 'rgba(255,209,102,0.20)',
    glowSecondary: 'rgba(255,241,184,0.10)',
    bgGlow: 'radial-gradient(circle at 82% 0%, rgba(255,209,102,0.16), transparent 34%), radial-gradient(circle at 18% 20%, rgba(255,241,184,0.07), transparent 30%), linear-gradient(180deg, #030303 0%, #101010 100%)',
  },
  // Legacy names kept so existing saved profiles continue to work.
  'Midnight Purple': null,
  'Gamer RGB': null,
  'Miami Night': null,
  'Alien Tech': null,
  'Synthwave': null,
};

THEMES['Midnight Purple'] = THEMES['Midnight Eclipse'];
THEMES['Gamer RGB'] = THEMES['Midnight Eclipse'];
THEMES['Miami Night'] = THEMES['Miami Sunset'];
THEMES['Alien Tech'] = THEMES['Cyber Noir'];
THEMES['Synthwave'] = THEMES['Miami Sunset'];

export const DISPLAY_THEMES = ['Midnight Eclipse', 'Miami Sunset', 'Cyber Noir', 'Black Gold'];
export const DEFAULT_THEME = 'Midnight Eclipse';

export function getTheme(name) {
  return THEMES[name] || THEMES[DEFAULT_THEME];
}

export const TIER_THRESHOLDS = [
  { name: 'Neon Newbie', floor: 0, nextPts: 10000, next: 'Rhythm Rider', color: 'rgba(255,255,255,0.62)', glow: 'rgba(255,255,255,0.12)' },
  { name: 'Rhythm Rider', floor: 10000, nextPts: 100000, next: 'Boogie Boss', color: '#00E5FF', glow: 'rgba(0,229,255,0.18)' },
  { name: 'Boogie Boss', floor: 100000, nextPts: 500000, next: 'Certified Toe-Tapper', color: '#FFD166', glow: 'rgba(255,209,102,0.18)' },
  { name: 'Certified Toe-Tapper', floor: 500000, nextPts: null, next: null, color: '#F72585', glow: 'rgba(247,37,133,0.18)' },
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
