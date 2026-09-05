// Application Constants

export const GAMES = [
  {
    id: 'freefire',
    name: 'Free Fire MAX',
    tag: 'Battle Royale',
    active: true,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    description: 'Fast-paced, action-packed 50-player survival battle royale.',
  },
  {
    id: 'bgmi',
    name: 'BGMI',
    tag: 'Battlegrounds',
    active: false,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    description: 'Premier tactical mobile battle royale experience.',
  },
  {
    id: 'valorant',
    name: 'Valorant',
    tag: 'Tactical Shooter',
    active: false,
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    description: '5v5 character-based tactical FPS.',
  },
];

export const GAME_MODES = [
  { id: 'BR-DEFAULT', name: 'BR-DEFAULT', label: 'Battle Royale (Default)' },
  { id: 'BR-CRAFTLAND', name: 'BR-CRAFTLAND', label: 'BR Craftland Custom' },
];

export const TEAM_TYPES = [
  { id: 'solo', name: 'Solo', count: 1, icon: 'User', description: 'Single player entry' },
  { id: 'duo', name: 'Duo', count: 2, icon: 'Users', description: '2 players team' },
  { id: 'squad', name: 'Squad', count: 4, icon: 'UsersRound', description: '4 players full squad' },
];

export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
};

export const STATUS_LABELS = {
  submitted: 'Submitted',
  reviewing: 'Under Review',
  declined: 'Declined',
  're-submitted': 'Re-submitted',
  approved: 'Approved',
};

export const THEME_COLORS = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',
  secondary: '#00CEC9',
  success: '#00B894',
  warning: '#FDCB6E',
  danger: '#FF7675',
  bg: '#F8F9FE',
  surface: '#FFFFFF',
  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  border: '#E8ECF4',
};
