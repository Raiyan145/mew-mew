export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;

export const GROUND_HEIGHT = 90;

export const PHYSICS = {
  GRAVITY: 0.38,
  JUMP_IMPULSE: -7.2,
  MAX_FALL_SPEED: 10.5,
  BASE_OBSTACLE_SPEED: 2.6,
  MAX_OBSTACLE_SPEED: 4.2,
  OBSTACLE_SPACING: 240, // Distance between successive obstacles
  OBSTACLE_WIDTH: 72,
  BASE_GAP: 165,
  MIN_GAP: 130, // Gaps remain fair and fun even at high scores
};

export const FUNNY_MESSAGES = [
  "JOHAER, FOCUS! 👀",
  "Bro is flying 💀",
  "Gravity has entered the chat. 📉",
  "WHY DID YOU DO THAT?! 😱",
  "Hold up... he's cooking! 🍳",
  "Who gave this bird a license?! 🪪",
  "Flap for your life! 💨",
  "Calculated... almost! 📐",
  "Don't sneeze right now! 🤧",
  "Aero-dynamics? Never heard of her.",
  "Smooth operator! 😎",
  "Look Ma, no hands! 🪽",
];

export const DEATH_QUIPS = [
  "Gravity: 1 — Johaer: 0",
  "The obstacle jumped in front of me, I swear!",
  "Newton sends his regards.",
  "Johaer decided to take a quick nap on the floor.",
  "That was a tactical bonk.",
  "Warning: bird collision detected!",
  "Next time try flapping UP instead of into the pillar.",
  "Ouch! That's gotta hurt.",
  "Bro forgot birds have wings 💀",
];

export const MILESTONES: Record<number, { title: string; subtitle: string; color: string }> = {
  10: { title: "10 POINTS! LEGEND! ⭐", subtitle: "Sunset Arrives! You got skills!", color: "#f59e0b" },
  25: { title: "25 POINTS! MASTER FLAPPER! 🚀", subtitle: "Night Falls! True Gamer Status!", color: "#ec4899" },
  50: { title: "50 POINTS! GODLIKE JOHAER! 👑", subtitle: "Is Johaer an eagle now?!", color: "#8b5cf6" },
  100: { title: "100 POINTS! ASCENDED BIRD! 🌟", subtitle: "You beat gravity itself!", color: "#06b6d4" },
};

export const THEME_PALETTES = {
  DAY: {
    skyTop: '#38bdf8',
    skyBottom: '#bae6fd',
    sunMoon: '#fde047',
    mountainColor: '#86efac',
    hillColor: '#4ade80',
    frontHillColor: '#22c55e',
    groundTop: '#16a34a',
    groundSoil: '#854d0e',
    groundSoilLight: '#a16207',
    pipeBody: '#22c55e',
    pipeRim: '#15803d',
    pipeHighlight: '#86efac',
    label: '☀️ Daytime',
  },
  SUNSET: {
    skyTop: '#f97316',
    skyBottom: '#fed7aa',
    sunMoon: '#fb923c',
    mountainColor: '#fb7185',
    hillColor: '#e11d48',
    frontHillColor: '#be123c',
    groundTop: '#9f1239',
    groundSoil: '#4c0519',
    groundSoilLight: '#881337',
    pipeBody: '#ea580c',
    pipeRim: '#9a3412',
    pipeHighlight: '#fdba74',
    label: '🌇 Golden Sunset',
  },
  NIGHT: {
    skyTop: '#0f172a',
    skyBottom: '#1e1b4b',
    sunMoon: '#fef08a', // glowing moon
    mountainColor: '#312e81',
    hillColor: '#1e1b4b',
    frontHillColor: '#111827',
    groundTop: '#047857',
    groundSoil: '#1e293b',
    groundSoilLight: '#334155',
    pipeBody: '#0284c7',
    pipeRim: '#0369a1',
    pipeHighlight: '#7dd3fc',
    label: '🌙 Starry Night',
  },
};
