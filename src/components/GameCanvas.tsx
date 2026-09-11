import React, { useEffect, useRef, useCallback } from 'react';
import { Bird, Cloud, FloatingMessage, GameState, Obstacle, Particle } from '../types';
import { sound } from '../utils/audio';
import {
  DEATH_QUIPS,
  FUNNY_MESSAGES,
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_HEIGHT,
  MILESTONES,
  PHYSICS,
} from '../utils/constants';
import { drawBonkEffect, drawJohaer } from '../utils/johaerRenderer';
import {
  drawFloatingMessages,
  drawGround,
  drawObstacles,
  drawParticles,
  drawSkyAndScenery,
  getTimeOfDay,
} from '../utils/sceneryRenderer';

interface GameCanvasProps {
  gameState: GameState;
  score: number;
  highScore: number;
  onScoreChange: (score: number) => void;
  onGameOver: (finalScore: number, isNewHigh: boolean, deathQuip: string) => void;
  onMilestone: (milestone: { title: string; subtitle: string; color: string }) => void;
  onStartGame: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  score,
  highScore,
  onScoreChange,
  onGameOver,
  onMilestone,
  onStartGame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game simulation state held in refs for 60fps stutter-free physics
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const highScoreRef = useRef(highScore);
  highScoreRef.current = highScore;

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const birdRef = useRef<Bird>({
    x: 120,
    y: 310,
    vx: 0,
    vy: 0,
    radius: 17,
    rotation: 0,
    targetRotation: 0,
    flapFrame: 0,
    squashX: 1,
    squashY: 1,
    eyeState: 'normal',
    beakOpen: 0,
    isDead: false,
    tumbleAngle: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const messagesRef = useRef<FloatingMessage[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const groundScrollRef = useRef(0);
  const nextObstacleIdRef = useRef(1);
  const screenShakeRef = useRef(0);
  const bonkEffectRef = useRef<{ x: number; y: number; progress: number } | null>(null);
  const deathQuipRef = useRef(DEATH_QUIPS[0]);

  // Initialize animated clouds
  useEffect(() => {
    const initialClouds: Cloud[] = [
      {
        x: 60,
        y: 80,
        scale: 0.9,
        speed: 0.35,
        puffs: [
          { offsetX: 0, offsetY: 0, radius: 24 },
          { offsetX: 22, offsetY: -8, radius: 30 },
          { offsetX: 48, offsetY: 0, radius: 22 },
        ],
      },
      {
        x: 280,
        y: 140,
        scale: 0.75,
        speed: 0.25,
        puffs: [
          { offsetX: 0, offsetY: 0, radius: 18 },
          { offsetX: 18, offsetY: -6, radius: 24 },
          { offsetX: 38, offsetY: 0, radius: 18 },
        ],
      },
      {
        x: 420,
        y: 60,
        scale: 1.1,
        speed: 0.45,
        puffs: [
          { offsetX: 0, offsetY: 0, radius: 28 },
          { offsetX: 26, offsetY: -10, radius: 36 },
          { offsetX: 56, offsetY: 0, radius: 26 },
        ],
      },
    ];
    cloudsRef.current = initialClouds;
  }, []);

  // Spawn confetti particles for celebrations
  const spawnConfetti = useCallback((count = 45) => {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#facc15', '#a855f7', '#ec4899'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particlesRef.current.push({
        x: GAME_WIDTH / 2,
        y: 240,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 45 + 50,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.4 ? 'confetti' : 'star',
      });
    }
  }, []);

  // Reset game state when starting
  const resetGame = useCallback(() => {
    birdRef.current = {
      x: 120,
      y: 310,
      vx: 0,
      vy: 0,
      radius: 17,
      rotation: 0,
      targetRotation: 0,
      flapFrame: 0,
      squashX: 1,
      squashY: 1,
      eyeState: 'normal',
      beakOpen: 0,
      isDead: false,
      tumbleAngle: 0,
    };
    obstaclesRef.current = [];
    particlesRef.current = [];
    messagesRef.current = [];
    bonkEffectRef.current = null;
    screenShakeRef.current = 0;
    nextObstacleIdRef.current = 1;
  }, []);

  // Flap action
  const handleFlap = useCallback(() => {
    if (gameStateRef.current === 'START') {
      resetGame();
      onStartGame();
      // Initial jump on start
      birdRef.current.vy = PHYSICS.JUMP_IMPULSE;
      birdRef.current.squashX = 0.82;
      birdRef.current.squashY = 1.25;
      birdRef.current.beakOpen = 1;
      sound.playFlap();
      return;
    }

    if (gameStateRef.current === 'PLAYING') {
      const bird = birdRef.current;
      if (bird.isDead) return;

      bird.vy = PHYSICS.JUMP_IMPULSE;
      bird.targetRotation = -0.45; // ~ -25 degrees
      bird.squashX = 0.82;
      bird.squashY = 1.28;
      bird.beakOpen = 1;
      sound.playFlap();

      // Spawn subtle wing puff particles behind Johaer
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: bird.x - 14,
          y: bird.y + 6 + (Math.random() - 0.5) * 8,
          vx: -Math.random() * 2 - 1,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 4 + 3,
          color: 'rgba(255, 255, 255, 0.7)',
          alpha: 0.8,
          life: 0,
          maxLife: 15,
          rotation: 0,
          vRot: 0,
          shape: 'circle',
        });
      }
    }
  }, [onStartGame, resetGame]);

  // Handle Bonk / Obstacle hit
  const triggerBonk = useCallback((hitX: number, hitY: number) => {
    const bird = birdRef.current;
    if (bird.isDead) return;

    bird.isDead = true;
    bird.eyeState = 'dizzy';
    bird.beakOpen = 1;
    bird.vy = -3.5; // Comical bounce up before plummeting
    screenShakeRef.current = 14;

    // Pick a funny death quip
    const randomQuip = DEATH_QUIPS[Math.floor(Math.random() * DEATH_QUIPS.length)];
    deathQuipRef.current = randomQuip;

    // Sound & Bonk Visual
    sound.playBonk();
    bonkEffectRef.current = { x: hitX, y: hitY, progress: 0 };

    // Scatter cartoon feathers and comic stars
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 6 + 2;
      particlesRef.current.push({
        x: hitX,
        y: hitY,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: Math.random() * 6 + 5,
        color: i % 2 === 0 ? '#facc15' : '#ef4444',
        alpha: 1,
        life: 0,
        maxLife: 35,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.4,
        shape: i % 3 === 0 ? 'feather' : 'star',
      });
    }

    // Play funny falling whistle
    setTimeout(() => {
      sound.playFall();
    }, 180);
  }, []);

  // Main animation frame loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 16.666, 2.5);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const currentScore = scoreRef.current;
      const timeOfDay = getTimeOfDay(currentScore);
      const bird = birdRef.current;

      // Update Clouds
      cloudsRef.current.forEach((cloud) => {
        cloud.x -= cloud.speed * dt;
        if (cloud.x < -120) {
          cloud.x = GAME_WIDTH + 60;
          cloud.y = 50 + Math.random() * 120;
        }
      });

      // --- LOGIC & PHYSICS BASED ON STATE ---
      if (gameStateRef.current === 'START') {
        // Idle hover animation
        bird.y = 310 + Math.sin(currentTime * 0.005) * 12;
        bird.rotation = Math.sin(currentTime * 0.006) * 0.08;
        bird.flapFrame += 0.15 * dt;
        groundScrollRef.current += 1.2 * dt;
      } else if (gameStateRef.current === 'PLAYING') {
        groundScrollRef.current += PHYSICS.BASE_OBSTACLE_SPEED * dt;

        if (!bird.isDead) {
          // Bird gravity & movement
          bird.vy += PHYSICS.GRAVITY * dt;
          if (bird.vy > PHYSICS.MAX_FALL_SPEED) bird.vy = PHYSICS.MAX_FALL_SPEED;
          bird.y += bird.vy * dt;

          // Smooth rotation: tilt up on jump, tilt down smoothly when falling
          if (bird.vy < 0) {
            bird.rotation = -0.45;
          } else {
            bird.rotation = Math.min(1.2, bird.rotation + 0.045 * dt);
          }

          // Squash & stretch recovery
          bird.squashX += (1 - bird.squashX) * 0.15 * dt;
          bird.squashY += (1 - bird.squashY) * 0.15 * dt;
          bird.beakOpen = Math.max(0, bird.beakOpen - 0.08 * dt);
          bird.flapFrame += (bird.vy < 0 ? 0.35 : 0.18) * dt;

          // Ceiling collision
          if (bird.y - bird.radius < 0) {
            bird.y = bird.radius;
            bird.vy = 1;
          }

          // Ground collision
          const groundY = GAME_HEIGHT - GROUND_HEIGHT;
          if (bird.y + bird.radius >= groundY) {
            bird.y = groundY - bird.radius;
            triggerBonk(bird.x, groundY);
          }

          // Spawn new obstacles with random fair gaps
          const obstacles = obstaclesRef.current;
          const lastObs = obstacles[obstacles.length - 1];
          if (!lastObs || lastObs.x < GAME_WIDTH - PHYSICS.OBSTACLE_SPACING) {
            // Calculate fair gap size (shrinks slightly as score rises)
            const gap = Math.max(
              PHYSICS.MIN_GAP,
              PHYSICS.BASE_GAP - Math.floor(currentScore / 8) * 4
            );
            const minHeight = 70;
            const maxHeight = groundY - gap - 70;
            const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
            const bottomY = topHeight + gap;

            obstacles.push({
              id: nextObstacleIdRef.current++,
              x: GAME_WIDTH + 20,
              width: PHYSICS.OBSTACLE_WIDTH,
              topHeight,
              gap,
              bottomY,
              passed: false,
              type: 'wood',
              hasFlowerOrVine: Math.random() > 0.6,
            });
          }

          // Move obstacles & collision check
          const speed = Math.min(
            PHYSICS.MAX_OBSTACLE_SPEED,
            PHYSICS.BASE_OBSTACLE_SPEED + Math.floor(currentScore / 10) * 0.25
          );

          for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.x -= speed * dt;

            // Score checking
            if (!obs.passed && bird.x > obs.x + obs.width / 2) {
              obs.passed = true;
              const newScore = currentScore + 1;
              onScoreChange(newScore);
              sound.playScore();

              // Check milestone
              if (MILESTONES[newScore]) {
                const ms = MILESTONES[newScore];
                sound.playMilestone();
                spawnConfetti(55);
                onMilestone(ms);
              }

              // Occasional funny floating meme message (~22% chance or on score milestones)
              if (Math.random() < 0.22 && messagesRef.current.length < 2) {
                const randomMsg = FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)];
                messagesRef.current.push({
                  id: Date.now() + Math.random(),
                  text: randomMsg,
                  x: bird.x + 30,
                  y: bird.y - 45,
                  vy: -1.2,
                  opacity: 1,
                  scale: 0.6,
                  life: 0,
                  maxLife: 80,
                  color: '#0f172a',
                  borderColor: '#facc15',
                });
              }
            }

            // Circle-to-rectangle collision with Obstacle
            // 1. Top pipe
            const birdRight = bird.x + bird.radius * 0.85;
            const birdLeft = bird.x - bird.radius * 0.85;
            const birdTop = bird.y - bird.radius * 0.85;
            const birdBottom = bird.y + bird.radius * 0.85;

            const inXRange = birdRight > obs.x && birdLeft < obs.x + obs.width;
            if (inXRange) {
              if (birdTop < obs.topHeight) {
                // Hit top pillar
                triggerBonk(bird.x + bird.radius, Math.max(birdTop, obs.topHeight - 10));
                break;
              } else if (birdBottom > obs.bottomY) {
                // Hit bottom pillar
                triggerBonk(bird.x + bird.radius, Math.min(birdBottom, obs.bottomY + 10));
                break;
              }
            }

            // Remove offscreen obstacles
            if (obs.x + obs.width < -40) {
              obstacles.splice(i, 1);
            }
          }
        } else {
          // Dead bird tumbling physics
          bird.vy += PHYSICS.GRAVITY * 1.2 * dt;
          bird.y += bird.vy * dt;
          bird.tumbleAngle += 0.25 * dt;

          const groundY = GAME_HEIGHT - GROUND_HEIGHT;
          if (bird.y + bird.radius >= groundY) {
            bird.y = groundY - bird.radius;
            bird.vy = 0;

            // Small delay to let user register the funny death animation
            if (gameStateRef.current === 'PLAYING') {
              gameStateRef.current = 'BONKED';
              setTimeout(() => {
                const isNewHigh = scoreRef.current > highScoreRef.current;
                onGameOver(scoreRef.current, isNewHigh, deathQuipRef.current);
              }, 450);
            }
          }
        }
      }

      // Update Floating Messages
      for (let i = messagesRef.current.length - 1; i >= 0; i--) {
        const msg = messagesRef.current[i];
        msg.y += msg.vy * dt;
        msg.life += dt;
        if (msg.life < 10) {
          msg.scale = 0.6 + (msg.life / 10) * 0.4;
        }
        if (msg.life > msg.maxLife - 20) {
          msg.opacity = (msg.maxLife - msg.life) / 20;
        }
        if (msg.life >= msg.maxLife) {
          messagesRef.current.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.15 * dt; // gravity on particles
        p.rotation += p.vRot * dt;
        p.life += dt;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Update Bonk effect
      if (bonkEffectRef.current) {
        bonkEffectRef.current.progress += 0.035 * dt;
        if (bonkEffectRef.current.progress >= 1) {
          bonkEffectRef.current = null;
        }
      }

      // Update screen shake
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (screenShakeRef.current > 0) {
        shakeOffsetX = (Math.random() - 0.5) * screenShakeRef.current;
        shakeOffsetY = (Math.random() - 0.5) * screenShakeRef.current;
        screenShakeRef.current = Math.max(0, screenShakeRef.current - 1 * dt);
      }

      // --- RENDERING ---
      ctx.save();
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Apply screen shake
      if (shakeOffsetX !== 0 || shakeOffsetY !== 0) {
        ctx.translate(shakeOffsetX, shakeOffsetY);
      }

      // 1. Sky & Parallax Scenery
      drawSkyAndScenery(ctx, timeOfDay, cloudsRef.current, groundScrollRef.current, currentTime);

      // 2. Obstacles
      drawObstacles(ctx, obstaclesRef.current, timeOfDay);

      // 3. Ground
      drawGround(ctx, groundScrollRef.current, timeOfDay);

      // 4. Johaer
      drawJohaer(ctx, bird, currentTime);

      // 5. Bonk comic explosion
      if (bonkEffectRef.current) {
        drawBonkEffect(
          ctx,
          bonkEffectRef.current.x,
          bonkEffectRef.current.y,
          bonkEffectRef.current.progress
        );
      }

      // 6. Floating messages
      drawFloatingMessages(ctx, messagesRef.current);

      // 7. Particles
      drawParticles(ctx, particlesRef.current);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [onScoreChange, onMilestone, onGameOver, triggerBonk, spawnConfetti]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleFlap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlap]);

  return (
    <div
      id="game-canvas-container"
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden"
      onPointerDown={(e) => {
        // Prevent event bubbling if clicking HUD buttons
        if ((e.target as HTMLElement).closest('button')) return;
        handleFlap();
      }}
    >
      <canvas
        id="game-canvas"
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="w-full h-full max-h-full max-w-[480px] object-contain shadow-2xl rounded-2xl bg-sky-300 border-4 border-slate-900 cursor-pointer"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
