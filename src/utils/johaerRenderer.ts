import { Bird } from '../types';

/**
 * Renders Johaer the bird with funny, expressive cartoon features,
 * squash-and-stretch, rotating wings, dynamic eyes, and the playful "JOHAER" floating badge.
 */
export function drawJohaer(
  ctx: CanvasRenderingContext2D,
  bird: Bird,
  timeMs: number
) {
  ctx.save();
  ctx.translate(bird.x, bird.y);

  // Apply tilt rotation (or tumble rotation on death)
  const angle = bird.isDead ? bird.tumbleAngle : bird.rotation;
  ctx.rotate(angle);

  // Apply squash and stretch
  ctx.scale(bird.squashX, bird.squashY);

  const radius = bird.radius;

  // 1. FEATHERED TAIL (wiggles behind body)
  const tailWiggle = Math.sin(timeMs * 0.015) * 4;
  ctx.save();
  ctx.translate(-radius * 0.85, radius * 0.1);
  ctx.rotate((tailWiggle * Math.PI) / 180);
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14, -8, -18, -4);
  ctx.quadraticCurveTo(-20, 2, -16, 6);
  ctx.quadraticCurveTo(-10, 8, 0, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. DANGLE FEET (two cute orange feet)
  ctx.save();
  ctx.fillStyle = '#ea580c';
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2.5;

  [-4, 6].forEach((footOffset) => {
    ctx.beginPath();
    ctx.roundRect(footOffset - 3, radius * 0.75, 7, 10, 3);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();

  // 3. MAIN PLUMP BIRD BODY (Chubby golden-yellow cartoon bird)
  ctx.save();
  // Body shadow/stroke
  ctx.fillStyle = '#facc15'; // Bright golden yellow
  ctx.strokeStyle = '#78350f'; // Dark outline
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.92, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly highlight (soft cream/light yellow)
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.ellipse(4, 4, radius * 0.65, radius * 0.58, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. ROSY BLUSH CHEEKS
  ctx.save();
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.ellipse(radius * 0.35, radius * 0.28, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. CUTE HAIR/FEATHER COWLICK ON TOP (Sways with motion)
  const hairSway = Math.sin(timeMs * 0.012) * 0.15;
  ctx.save();
  ctx.translate(-2, -radius * 0.88);
  ctx.rotate(hairSway);
  ctx.fillStyle = '#eab308';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, -14, 2, -18);
  ctx.quadraticCurveTo(8, -12, 4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Second smaller tuft
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.quadraticCurveTo(10, -10, 8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 6. EXPRESSIVE EYES
  ctx.save();
  const eyeX = radius * 0.38;
  const eyeY = -radius * 0.18;
  const eyeRadius = radius * 0.38;

  if (bird.isDead) {
    // FUNNY X_X OR DIZZY SPIRAL EYES ON BONK
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Left X eye
    const x1 = eyeX - 7;
    const y1 = eyeY;
    const sz = 6;
    ctx.beginPath();
    ctx.moveTo(x1 - sz, y1 - sz);
    ctx.lineTo(x1 + sz, y1 + sz);
    ctx.moveTo(x1 + sz, y1 - sz);
    ctx.lineTo(x1 - sz, y1 + sz);
    ctx.stroke();

    // Right spiral / dizzy eye
    const x2 = eyeX + 8;
    const y2 = eyeY - 2;
    ctx.beginPath();
    for (let i = 0; i < 25; i++) {
      const angle = 0.4 * i + timeMs * 0.02;
      const dist = (i / 25) * 8;
      const px = x2 + Math.cos(angle) * dist;
      const py = y2 + Math.sin(angle) * dist;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  } else {
    // Living eyes: Big white cartoon eyes with cute glossy reflections
    // Eye 1 (Background / right eye)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(eyeX + 6, eyeY - 2, eyeRadius * 0.75, eyeRadius * 0.85, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye 2 (Foreground / left eye)
    ctx.beginPath();
    ctx.ellipse(eyeX - 4, eyeY, eyeRadius, eyeRadius * 1.05, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils (looking forward or wide during flap!)
    const pupilShiftX = bird.vy < 0 ? 3 : 2;
    const pupilShiftY = bird.vy < 0 ? -1 : 1;
    const pupilSize = bird.vy < -3 ? eyeRadius * 0.52 : eyeRadius * 0.42;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(eyeX - 4 + pupilShiftX, eyeY + pupilShiftY, pupilSize, pupilSize, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeX + 6 + pupilShiftX * 0.8, eyeY - 2 + pupilShiftY, pupilSize * 0.8, pupilSize * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glossy catch-light reflections
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX - 5 + pupilShiftX, eyeY - 2 + pupilShiftY, pupilSize * 0.38, 0, Math.PI * 2);
    ctx.arc(eyeX + 5 + pupilShiftX * 0.8, eyeY - 4 + pupilShiftY, pupilSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 7. BEAK (Funny orange bill that squawks and opens when jumping or bonking!)
  ctx.save();
  const beakX = radius * 0.75;
  const beakY = radius * 0.05;
  const openOffset = bird.isDead ? 6 : bird.beakOpen * 7;

  ctx.fillStyle = '#f97316'; // Bright orange
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 3;

  // Upper beak
  ctx.beginPath();
  ctx.moveTo(beakX - 3, beakY - 4);
  ctx.lineTo(beakX + 18, beakY);
  ctx.lineTo(beakX, beakY + 2 - openOffset * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inside mouth if open
  if (openOffset > 1) {
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(beakX - 1, beakY);
    ctx.lineTo(beakX + 11, beakY + 1);
    ctx.lineTo(beakX - 1, beakY + openOffset);
    ctx.closePath();
    ctx.fill();
  }

  // Lower beak
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(beakX - 2, beakY + 2 + openOffset * 0.5);
  ctx.lineTo(beakX + 14, beakY + 3 + openOffset * 0.5);
  ctx.lineTo(beakX, beakY + 8 + openOffset * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 8. WING (Flapping with dynamic rotation and cute layered feathers)
  ctx.save();
  ctx.translate(-radius * 0.2, radius * 0.05);

  let wingAngle = 0;
  if (bird.isDead) {
    wingAngle = Math.PI * 0.6; // Drooping limp wing
  } else {
    // Wing flaps between -45 deg and +40 deg based on flap frame
    wingAngle = Math.sin(bird.flapFrame) * 0.7;
  }
  ctx.rotate(wingAngle);

  ctx.fillStyle = '#f59e0b'; // Amber yellow wing
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-18, -12, -26, 4);
  ctx.quadraticCurveTo(-22, 18, -6, 14);
  ctx.quadraticCurveTo(2, 8, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner wing feather accent
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.ellipse(-10, 4, 8, 4, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // End of bird rotation/scale

  // 9. "JOHAER" FLOATING NAME BADGE (Displayed above or near bird in cute playful font)
  if (!bird.isDead) {
    drawJohaerNameBadge(ctx, bird.x, bird.y - bird.radius - 22, timeMs);
  }
}

/**
 * Draws the playful "JOHAER" name tag floating above him
 */
function drawJohaerNameBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeMs: number
) {
  ctx.save();
  // Gentle bobbing motion
  const bob = Math.sin(timeMs * 0.008) * 3;
  ctx.translate(x, y + bob);

  const text = 'JOHAER';
  ctx.font = '800 13px "Luckiest Guy", "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textWidth = ctx.measureText(text).width;
  const pillWidth = textWidth + 18;
  const pillHeight = 22;

  // Badge background pill
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = '#fef08a'; // Pastel yellow badge
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, 11);
  ctx.fill();
  ctx.stroke();

  // Reset shadow for text
  ctx.shadowColor = 'transparent';

  // Small cute downward pointer triangle
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.moveTo(-4, pillHeight / 2 - 1);
  ctx.lineTo(0, pillHeight / 2 + 5);
  ctx.lineTo(4, pillHeight / 2 - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Text with thick cartoon outline
  ctx.fillStyle = '#0f172a';
  ctx.fillText(text, 0, 1);

  // Tiny sparkle star on the badge
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(-pillWidth / 2 + 6, 0, 2, 0, Math.PI * 2);
  ctx.arc(pillWidth / 2 - 6, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the comic "BONK!" explosion bubble when Johaer hits an obstacle
 */
export function drawBonkEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number // 0 (just hit) to 1 (faded)
) {
  ctx.save();
  ctx.translate(x, y);

  const scale = 1 + Math.sin(progress * Math.PI) * 0.45;
  ctx.scale(scale, scale);
  ctx.globalAlpha = Math.max(0, 1 - progress);

  // Comic starburst polygon
  const spikes = 12;
  const outerRadius = 45;
  const innerRadius = 24;

  ctx.fillStyle = '#ef4444'; // Comic red burst
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'miter';

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const a = (i * Math.PI) / spikes;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner yellow starburst
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = (i % 2 === 0 ? outerRadius : innerRadius) * 0.72;
    const a = (i * Math.PI) / spikes + 0.15;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Bold comic "BONK!" text
  ctx.font = '900 24px "Luckiest Guy", "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.strokeText('BONK!', 0, 1);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('BONK!', 0, 1);

  ctx.restore();
}
