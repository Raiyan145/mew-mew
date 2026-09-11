export type GameState = 'START' | 'PLAYING' | 'BONKED' | 'GAMEOVER' | 'PAUSED';

export type TimeOfDay = 'DAY' | 'SUNSET' | 'NIGHT';

export interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  targetRotation: number;
  flapFrame: number;
  squashX: number;
  squashY: number;
  eyeState: 'normal' | 'blink' | 'wide' | 'dizzy' | 'shocked';
  beakOpen: number; // 0 to 1
  isDead: boolean;
  tumbleAngle: number;
}

export interface Obstacle {
  id: number;
  x: number;
  width: number;
  topHeight: number;
  gap: number;
  bottomY: number;
  passed: boolean;
  type: 'wood' | 'stone' | 'candy';
  hasFlowerOrVine?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
  shape: 'circle' | 'star' | 'feather' | 'sparkle' | 'confetti';
}

export interface FloatingMessage {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  opacity: number;
  scale: number;
  life: number;
  maxLife: number;
  color: string;
  borderColor: string;
}

export interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  puffs: { offsetX: number; offsetY: number; radius: number }[];
}

export interface Milestone {
  score: number;
  title: string;
  color: string;
}
