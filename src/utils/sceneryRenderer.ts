import { Cloud, FloatingMessage, Obstacle, Particle, TimeOfDay } from '../types';
import { GAME_HEIGHT, GAME_WIDTH, GROUND_HEIGHT, THEME_PALETTES } from './constants';

/**
 * Computes current TimeOfDay and theme palette based on score
 */
export function getTimeOfDay(score: number): TimeOfDay {
  if (score < 15) return 'DAY';
  if (score < 30) return 'SUNSET';
  return 'NIGHT';
}

/**
 * Draws the dynamic colorful cartoon sky with day/night transition,
 * sun/moon, twinkling stars, and drifting clouds.
 */
export function drawSkyAndScenery(
  ctx: CanvasRenderingContext2D,
  timeOfDay: TimeOfDay,
  clouds: Cloud[],
  groundScroll: number,
  timeMs: number
) {
  const theme = THEME_PALETTES[timeOfDay];

  // 1. SKY GRADIENT
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT - GROUND_HEIGHT);
  skyGrad.addColorStop(0, theme.skyTop);
  skyGrad.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // 2. STARS (Only visible or prominent in NIGHT / late SUNSET)
  if (timeOfDay === 'NIGHT') {
    ctx.save();
    for (let i = 0; i < 45; i++) {
      // Deterministic star positions
      const sx = ((i * 137.5) % GAME_WIDTH);
      const sy = ((i * 89.3) % (GAME_HEIGHT - GROUND_HEIGHT - 120));
      const twinkle = Math.sin(timeMs * 0.003 + i) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(254, 240, 138, ${twinkle * 0.85})`;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3 === 0 ? 2 : 1.2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. SUN OR MOON
  ctx.save();
  if (timeOfDay === 'NIGHT') {
    // Glowing crescent / full cartoon moon
    const moonX = GAME_WIDTH - 90;
    const moonY = 85;

    // Outer glow
    const glow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 45);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
    glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 45, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cute craters
    ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.beginPath();
    ctx.arc(moonX - 7, moonY - 5, 5, 0, Math.PI * 2);
    ctx.arc(moonX + 6, moonY + 7, 4, 0, Math.PI * 2);
    ctx.arc(moonX + 8, moonY - 8, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Bright cartoon sun with rays
    const sunX = GAME_WIDTH - 85;
    const sunY = 80;
    const pulse = Math.sin(timeMs * 0.002) * 2;

    // Sun rays
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(timeMs * 0.0005);
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.lineWidth = 4;
    for (let r = 0; r < 8; r++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, 32);
      ctx.lineTo(0, 42 + pulse);
      ctx.stroke();
    }
    ctx.restore();

    // Sun circle
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 40);
    sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
    sunGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.sunMoon;
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 4. DISTANT PARALLAX MOUNTAINS (Scroll speed ~ 0.1x)
  ctx.save();
  const mountainScroll = (groundScroll * 0.12) % GAME_WIDTH;
  ctx.fillStyle = theme.mountainColor;
  ctx.beginPath();
  ctx.moveTo(0, GAME_HEIGHT - GROUND_HEIGHT);

  for (let offset = -GAME_WIDTH; offset <= GAME_WIDTH * 2; offset += GAME_WIDTH) {
    const x = offset - mountainScroll;
    ctx.lineTo(x + 0, GAME_HEIGHT - GROUND_HEIGHT - 60);
    ctx.lineTo(x + 110, GAME_HEIGHT - GROUND_HEIGHT - 130);
    ctx.lineTo(x + 230, GAME_HEIGHT - GROUND_HEIGHT - 70);
    ctx.lineTo(x + 340, GAME_HEIGHT - GROUND_HEIGHT - 150);
    ctx.lineTo(x + 480, GAME_HEIGHT - GROUND_HEIGHT - 60);
  }
  ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 5. CLOUDS (Drifting slowly)
  clouds.forEach((cloud) => {
    drawCloud(ctx, cloud, timeOfDay);
  });

  // 6. MIDGROUND ROLLING HILLS & TREES (Scroll speed ~ 0.35x)
  ctx.save();
  const hillScroll = (groundScroll * 0.35) % 360;
  ctx.fillStyle = theme.hillColor;
  ctx.beginPath();
  ctx.moveTo(0, GAME_HEIGHT - GROUND_HEIGHT);

  for (let x = -360; x <= GAME_WIDTH + 360; x += 180) {
    const hx = x - hillScroll;
    ctx.quadraticCurveTo(
      hx + 90,
      GAME_HEIGHT - GROUND_HEIGHT - 90,
      hx + 180,
      GAME_HEIGHT - GROUND_HEIGHT - 40
    );
  }
  ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Cute cartoon trees on the hills
  for (let t = -360; t <= GAME_WIDTH + 360; t += 120) {
    const tx = t - hillScroll + 45;
    if (tx > -40 && tx < GAME_WIDTH + 40) {
      drawCartoonTree(ctx, tx, GAME_HEIGHT - GROUND_HEIGHT - 55, timeOfDay);
    }
  }
  ctx.restore();

  // 7. FOREGROUND GREEN HILLS (Scroll speed ~ 0.6x)
  ctx.save();
  const fgScroll = (groundScroll * 0.6) % 280;
  ctx.fillStyle = theme.frontHillColor;
  ctx.beginPath();
  ctx.moveTo(0, GAME_HEIGHT - GROUND_HEIGHT);
  for (let x = -280; x <= GAME_WIDTH + 280; x += 140) {
    const fx = x - fgScroll;
    ctx.quadraticCurveTo(
      fx + 70,
      GAME_HEIGHT - GROUND_HEIGHT - 55,
      fx + 140,
      GAME_HEIGHT - GROUND_HEIGHT - 20
    );
  }
  ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a soft cartoon cloud with multiple fluffy puffs
 */
function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud, timeOfDay: TimeOfDay) {
  ctx.save();
  ctx.translate(cloud.x, cloud.y);
  ctx.scale(cloud.scale, cloud.scale);

  ctx.fillStyle = timeOfDay === 'NIGHT' ? 'rgba(148, 163, 184, 0.4)' : 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  cloud.puffs.forEach((puff) => {
    ctx.arc(puff.offsetX, puff.offsetY, puff.radius, 0, Math.PI * 2);
  });
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a cute miniature cartoon pine/round tree
 */
function drawCartoonTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeOfDay: TimeOfDay
) {
  ctx.save();
  // Trunk
  ctx.fillStyle = timeOfDay === 'NIGHT' ? '#1e293b' : '#78350f';
  ctx.fillRect(x - 3, y, 6, 18);

  // Foliage
  ctx.fillStyle = timeOfDay === 'NIGHT' ? '#065f46' : '#15803d';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.arc(x, y - 6, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = timeOfDay === 'NIGHT' ? '#047857' : '#22c55e';
  ctx.beginPath();
  ctx.arc(x - 3, y - 9, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the scrolling ground with grass blades, stone accents, and soil strata
 */
export function drawGround(
  ctx: CanvasRenderingContext2D,
  groundScroll: number,
  timeOfDay: TimeOfDay
) {
  const theme = THEME_PALETTES[timeOfDay];
  const groundY = GAME_HEIGHT - GROUND_HEIGHT;

  ctx.save();

  // Soil body
  ctx.fillStyle = theme.groundSoil;
  ctx.fillRect(0, groundY, GAME_WIDTH, GROUND_HEIGHT);

  // Sub-soil stripe pattern
  ctx.fillStyle = theme.groundSoilLight;
  ctx.fillRect(0, groundY + 28, GAME_WIDTH, 14);

  // Grassy top band
  ctx.fillStyle = theme.groundTop;
  ctx.fillRect(0, groundY, GAME_WIDTH, 18);

  // Dark border separating sky and ground
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(GAME_WIDTH, groundY);
  ctx.stroke();

  // Animated scrolling grass blades & pebbles
  const patternWidth = 24;
  const shift = groundScroll % patternWidth;

  // Grass blades
  ctx.fillStyle = '#86efac';
  for (let x = -patternWidth; x < GAME_WIDTH + patternWidth; x += patternWidth) {
    const gx = x - shift;
    ctx.beginPath();
    ctx.moveTo(gx, groundY);
    ctx.lineTo(gx + 4, groundY - 6);
    ctx.lineTo(gx + 8, groundY);
    ctx.lineTo(gx + 12, groundY - 8);
    ctx.lineTo(gx + 16, groundY);
    ctx.fill();
  }

  // Cute soil pebbles
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  for (let x = -48; x < GAME_WIDTH + 48; x += 36) {
    const px = x - (groundScroll % 36);
    ctx.beginPath();
    ctx.arc(px, groundY + 35, 3.5, 0, Math.PI * 2);
    ctx.arc(px + 14, groundY + 58, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws cartoon pipe obstacles with distinctive rounded caps,
 * wood/candy style highlights, rivets, and decorative cartoon accents.
 */
export function drawObstacles(
  ctx: CanvasRenderingContext2D,
  obstacles: Obstacle[],
  timeOfDay: TimeOfDay
) {
  const theme = THEME_PALETTES[timeOfDay];
  const capHeight = 28;
  const capOverhang = 8;

  obstacles.forEach((obs) => {
    // 1. TOP OBSTACLE (HANGING DOWN)
    if (obs.topHeight > 0) {
      drawPillarSegment(
        ctx,
        obs.x,
        0,
        obs.width,
        obs.topHeight - capHeight,
        theme.pipeBody,
        theme.pipeHighlight,
        theme.pipeRim,
        false
      );

      // Top pillar collar / cap
      drawPillarCap(
        ctx,
        obs.x - capOverhang,
        obs.topHeight - capHeight,
        obs.width + capOverhang * 2,
        capHeight,
        theme.pipeBody,
        theme.pipeHighlight,
        theme.pipeRim,
        obs.hasFlowerOrVine
      );
    }

    // 2. BOTTOM OBSTACLE (RISING UP)
    const bottomHeight = GAME_HEIGHT - GROUND_HEIGHT - obs.bottomY;
    if (bottomHeight > 0) {
      // Bottom collar / cap
      drawPillarCap(
        ctx,
        obs.x - capOverhang,
        obs.bottomY,
        obs.width + capOverhang * 2,
        capHeight,
        theme.pipeBody,
        theme.pipeHighlight,
        theme.pipeRim,
        obs.hasFlowerOrVine
      );

      // Bottom pillar body
      drawPillarSegment(
        ctx,
        obs.x,
        obs.bottomY + capHeight,
        obs.width,
        bottomHeight - capHeight,
        theme.pipeBody,
        theme.pipeHighlight,
        theme.pipeRim,
        true
      );
    }
  });
}

function drawPillarSegment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bodyColor: string,
  highlightColor: string,
  rimColor: string,
  isBottom: boolean
) {
  if (h <= 0) return;
  ctx.save();

  // Pillar body
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.5;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  // Glossy highlight strip
  ctx.fillStyle = highlightColor;
  ctx.fillRect(x + 7, y, 9, h);

  // Shadow edge
  ctx.fillStyle = rimColor;
  ctx.fillRect(x + w - 10, y, 10, h);

  // Cartoon rivets
  ctx.fillStyle = '#0f172a';
  for (let ry = y + 16; ry < y + h - 10; ry += 32) {
    ctx.beginPath();
    ctx.arc(x + 6, ry, 2.5, 0, Math.PI * 2);
    ctx.arc(x + w - 6, ry, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPillarCap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bodyColor: string,
  highlightColor: string,
  rimColor: string,
  hasDecor?: boolean
) {
  ctx.save();
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  // Highlight strip on cap
  ctx.fillStyle = highlightColor;
  ctx.fillRect(x + 9, y + 2, 10, h - 4);

  // Shadow side
  ctx.fillStyle = rimColor;
  ctx.fillRect(x + w - 12, y + 2, 9, h - 4);

  // Cute flower or leaf decoration on selected obstacles!
  if (hasDecor) {
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws funny floating meme messages
 */
export function drawFloatingMessages(
  ctx: CanvasRenderingContext2D,
  messages: FloatingMessage[]
) {
  messages.forEach((msg) => {
    ctx.save();
    ctx.translate(msg.x, msg.y);
    ctx.scale(msg.scale, msg.scale);
    ctx.globalAlpha = Math.max(0, msg.opacity);

    ctx.font = '800 15px "Luckiest Guy", "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(msg.text).width;
    const padX = 16;
    const padY = 9;

    // Speech bubble pill
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.roundRect(
      -textWidth / 2 - padX,
      -padY - 8,
      textWidth + padX * 2,
      padY * 2 + 16,
      16
    );
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Cute pointer tail
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-6, padY + 8);
    ctx.lineTo(0, padY + 14);
    ctx.lineTo(6, padY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Message text
    ctx.fillStyle = msg.color || '#0f172a';
    ctx.fillText(msg.text, 0, 1);

    ctx.restore();
  });
}

/**
 * Draws active particles (confetti, feathers, stars, circles)
 */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
) {
  particles.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;

    if (p.shape === 'star') {
      // 5-point star
      const spikes = 5;
      const step = Math.PI / spikes;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? p.size : p.size * 0.45;
        const a = i * step;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else if (p.shape === 'confetti') {
      ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
    } else if (p.shape === 'feather') {
      // Little yellow/amber bird feather floating
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}
