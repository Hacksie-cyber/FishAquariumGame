import { FishInstance } from '../types/aquarium';
import { FISH_SPECIES_CATALOG } from '../data/aquariumData';

const speciesMap = new Map(FISH_SPECIES_CATALOG.map((s) => [s.id, s]));

/**
 * Draws a realistic, animated fish onto the 2D canvas with organic spine articulation,
 * fin fluttering, lighting depth, and species-accurate coloration.
 */
export function drawFish(
  ctx: CanvasRenderingContext2D,
  fish: FishInstance,
  isSelected: boolean = false
) {
  const species = speciesMap.get(fish.speciesId);
  if (!species) return;

  ctx.save();

  // Position and depth scaling
  // z: 0 (deep background) -> 1 (foreground)
  const depthScale = 0.55 + fish.z * 0.45;
  const totalScale = fish.scale * depthScale;

  ctx.translate(fish.x, fish.y);

  // Depth atmospheric underwater perspective:
  // Background fish are slightly more translucent and tinted by water depth
  const depthAlpha = 0.65 + fish.z * 0.35;
  ctx.globalAlpha = depthAlpha;

  // Rotation: align fish with its swimming angle
  let drawAngle = fish.angle;
  if (fish.facingLeft) {
    ctx.scale(-1, 1);
    drawAngle = Math.PI - drawAngle;
  }
  ctx.rotate(drawAngle * 0.35); // smooth gentle tilt in direction of movement
  ctx.scale(totalScale, totalScale);

  // Soft depth shadow underneath fish
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, species.bodyHeight * 0.65, species.bodyWidth * 0.55, species.bodyHeight * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Highlight halo if fish is currently selected/inspected
  if (isSelected) {
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(0, 0, species.bodyWidth * 0.75, species.bodyHeight * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Growth pulse aura when fed
  if (fish.growthPulse && fish.growthPulse > 0) {
    ctx.save();
    const pulseProgress = 1 - fish.growthPulse;
    const auraRadius = (species.bodyWidth * 0.7) * (1 + pulseProgress * 0.7);
    ctx.strokeStyle = `rgba(56, 189, 248, ${fish.growthPulse * 0.9})`;
    ctx.lineWidth = 2.5 * fish.growthPulse;
    ctx.beginPath();
    ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Sparkling growth stars
    ctx.fillStyle = `rgba(250, 204, 21, ${fish.growthPulse})`;
    for (let i = 0; i < 4; i++) {
      const sparkAngle = (i * Math.PI) / 2 + pulseProgress * 2.5;
      const sx = Math.cos(sparkAngle) * auraRadius;
      const sy = Math.sin(sparkAngle) * auraRadius;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 * fish.growthPulse, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Fin kinematics: calculate tail oscillation based on speed & tailPhase
  const tailAmp = 4 + fish.speed * 2.2;
  const tailSwing = Math.sin(fish.tailPhase) * tailAmp;
  const finSwing = Math.sin(fish.finPhase) * 6;

  switch (fish.speciesId) {
    case 'clownfish':
      renderClownfish(ctx, species.bodyWidth, species.bodyHeight, tailSwing, finSwing);
      break;
    case 'blue-tang':
      renderBlueTang(ctx, species.bodyWidth, species.bodyHeight, tailSwing, finSwing);
      break;
    case 'yellow-tang':
      renderYellowTang(ctx, species.bodyWidth, species.bodyHeight, tailSwing, finSwing);
      break;
    case 'flame-angelfish':
      renderFlameAngelfish(ctx, species.bodyWidth, species.bodyHeight, tailSwing, finSwing);
      break;
    case 'discus':
      renderDiscus(ctx, species.bodyWidth, species.bodyHeight, tailSwing, finSwing);
      break;
    case 'neon-tetra':
      renderNeonTetra(ctx, species.bodyWidth, species.bodyHeight, tailSwing, finSwing);
      break;
    case 'betta':
      renderBetta(ctx, species.bodyWidth, species.bodyHeight, tailSwing, finSwing, fish.tailPhase);
      break;
    case 'moorish-idol':
      renderMoorishIdol(ctx, species.bodyWidth, species.bodyHeight, tailSwing, finSwing);
      break;
    case 'sea-turtle':
      renderSeaTurtle(ctx, species.bodyWidth, species.bodyHeight, tailSwing, finSwing);
      break;
    default:
      renderGenericFish(ctx, species.bodyWidth, species.bodyHeight, tailSwing, species.primaryColor);
  }

  ctx.restore();

  // Floating growth indicator label
  if (fish.growthTextTimer && fish.growthTextTimer > 0 && fish.growthText) {
    ctx.save();
    const floatOffset = (45 - fish.growthTextTimer) * 0.7;
    ctx.translate(fish.x, fish.y - (species.bodyHeight * totalScale * 0.6) - 15 - floatOffset);
    ctx.font = '600 11px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    const textAlpha = Math.min(1, fish.growthTextTimer / 15);
    ctx.fillStyle = `rgba(56, 189, 248, ${textAlpha})`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.fillText(fish.growthText, 0, 0);
    ctx.restore();
  }
}

/** 1. Ocellaris Clownfish */
function renderClownfish(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  finSwing: number
) {
  const hw = w / 2;
  const hh = h / 2;

  // Caudal Tail fin
  ctx.save();
  ctx.translate(-hw + 3, tailSwing * 0.4);
  ctx.fillStyle = '#ea580c';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14, -hh * 0.7 + tailSwing, -18, -hh * 0.5 + tailSwing);
  ctx.quadraticCurveTo(-16, tailSwing, -18, hh * 0.5 + tailSwing);
  ctx.quadraticCurveTo(-14, hh * 0.7 + tailSwing, 0, 0);
  ctx.fill();
  ctx.stroke();

  // White band on tail base
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-4, tailSwing * 0.2, 2.5, hh * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Dorsal fin (top)
  ctx.save();
  ctx.fillStyle = '#f97316';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-hw * 0.4, -hh * 0.75);
  ctx.quadraticCurveTo(0, -hh * 1.35, hw * 0.3, -hh * 0.8);
  ctx.lineTo(-hw * 0.4, -hh * 0.75);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Ventral/Anal fin (bottom)
  ctx.save();
  ctx.fillStyle = '#ea580c';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-hw * 0.3, hh * 0.75);
  ctx.quadraticCurveTo(-hw * 0.05, hh * 1.2, hw * 0.2, hh * 0.8);
  ctx.lineTo(-hw * 0.3, hh * 0.75);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Main body
  const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
  grad.addColorStop(0, '#ea580c');
  grad.addColorStop(0.5, '#f97316');
  grad.addColorStop(1, '#fb923c');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(hw, 0);
  ctx.bezierCurveTo(hw * 0.8, -hh, -hw * 0.6, -hh, -hw, 0);
  ctx.bezierCurveTo(-hw * 0.6, hh, hw * 0.8, hh, hw, 0);
  ctx.closePath();
  ctx.fill();

  // 3 Iconic White Bands with thin black edge
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 1.2;

  // Band 1: Head bar
  ctx.beginPath();
  ctx.moveTo(hw * 0.45, -hh * 0.8);
  ctx.quadraticCurveTo(hw * 0.35, 0, hw * 0.45, hh * 0.8);
  ctx.quadraticCurveTo(hw * 0.22, 0, hw * 0.25, -hh * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Band 2: Mid bar with characteristic forward point
  ctx.beginPath();
  ctx.moveTo(-hw * 0.05, -hh * 0.95);
  ctx.quadraticCurveTo(hw * 0.05, 0, -hw * 0.05, hh * 0.95);
  ctx.quadraticCurveTo(-hw * 0.25, 0, -hw * 0.22, -hh * 0.95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Band 3: Caudal peduncle bar
  ctx.beginPath();
  ctx.moveTo(-hw * 0.68, -hh * 0.55);
  ctx.quadraticCurveTo(-hw * 0.62, 0, -hw * 0.68, hh * 0.55);
  ctx.quadraticCurveTo(-hw * 0.8, 0, -hw * 0.8, -hh * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pectoral fin (fluttering)
  ctx.save();
  ctx.translate(hw * 0.15, hh * 0.15);
  ctx.rotate(finSwing * 0.08);
  ctx.fillStyle = 'rgba(251, 146, 60, 0.85)';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, 7, 10, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Fish Eye
  renderEye(ctx, hw * 0.62, -hh * 0.25, 3.8, '#f97316');
}

/** 2. Regal Blue Tang */
function renderBlueTang(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  finSwing: number
) {
  const hw = w / 2;
  const hh = h / 2;

  // Yellow triangular tail fin
  ctx.save();
  ctx.translate(-hw + 4, tailSwing * 0.5);
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-20, -hh * 0.75 + tailSwing * 0.5);
  ctx.lineTo(-17, 0);
  ctx.lineTo(-20, hh * 0.75 + tailSwing * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Blue oval Body
  const bodyGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
  bodyGrad.addColorStop(0, '#1d4ed8');
  bodyGrad.addColorStop(0.5, '#2563eb');
  bodyGrad.addColorStop(1, '#3b82f6');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iconic Black Palette marking along upper flank and tail
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.moveTo(-hw * 0.85, 0);
  ctx.quadraticCurveTo(-hw * 0.2, -hh * 0.95, hw * 0.3, -hh * 0.85);
  ctx.quadraticCurveTo(hw * 0.45, -hh * 0.2, hw * 0.1, -hh * 0.1);
  ctx.quadraticCurveTo(-hw * 0.1, -hh * 0.2, -hw * 0.4, 0);
  ctx.quadraticCurveTo(-hw * 0.1, hh * 0.2, hw * 0.1, hh * 0.1);
  ctx.quadraticCurveTo(hw * 0.45, hh * 0.2, hw * 0.3, hh * 0.85);
  ctx.quadraticCurveTo(-hw * 0.2, hh * 0.95, -hw * 0.85, 0);
  ctx.fill();

  // Yellow wedge inserting from tail into mid-body
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(-hw, 0);
  ctx.lineTo(-hw * 0.35, -hh * 0.4);
  ctx.lineTo(-hw * 0.35, hh * 0.4);
  ctx.closePath();
  ctx.fill();

  // Pectoral fin
  ctx.save();
  ctx.translate(hw * 0.25, hh * 0.2);
  ctx.rotate(finSwing * 0.08);
  ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 11, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Eye
  renderEye(ctx, hw * 0.65, -hh * 0.28, 4.0, '#1e3a8a');
}

/** 3. Yellow Tang */
function renderYellowTang(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  finSwing: number
) {
  const hw = w / 2;
  const hh = h / 2;

  // Tail fin
  ctx.save();
  ctx.translate(-hw + 3, tailSwing * 0.4);
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-16, -hh * 0.45 + tailSwing * 0.4);
  ctx.lineTo(-14, 0);
  ctx.lineTo(-16, hh * 0.45 + tailSwing * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Body & Sailfin profile
  const yellowGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
  yellowGrad.addColorStop(0, '#facc15');
  yellowGrad.addColorStop(0.5, '#eab308');
  yellowGrad.addColorStop(1, '#ca8a04');

  ctx.fillStyle = yellowGrad;
  ctx.beginPath();
  // Pointed snout
  ctx.moveTo(hw, 0);
  // High arched dorsal sailfin
  ctx.bezierCurveTo(hw * 0.4, -hh * 1.15, -hw * 0.4, -hh * 1.1, -hw * 0.85, -hh * 0.3);
  ctx.lineTo(-hw, 0);
  // Deep anal fin
  ctx.lineTo(-hw * 0.85, hh * 0.3);
  ctx.bezierCurveTo(-hw * 0.4, hh * 1.1, hw * 0.4, hh * 1.15, hw, 0);
  ctx.fill();

  // Delicate dorsal fin ray lines
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.lineWidth = 1;
  for (let i = -0.6; i < 0.4; i += 0.2) {
    ctx.beginPath();
    ctx.moveTo(hw * i, 0);
    ctx.lineTo(hw * i * 0.85, -hh * 0.95);
    ctx.stroke();
  }

  // White caudal scalpel spine dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-hw * 0.72, 0, 3.5, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pectoral fin
  ctx.save();
  ctx.translate(hw * 0.2, hh * 0.2);
  ctx.rotate(finSwing * 0.08);
  ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 12, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Eye
  renderEye(ctx, hw * 0.65, -hh * 0.2, 3.8, '#a16207');
}

/** 4. Flame Angelfish */
function renderFlameAngelfish(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  finSwing: number
) {
  const hw = w / 2;
  const hh = h / 2;

  // Tail
  ctx.save();
  ctx.translate(-hw + 3, tailSwing * 0.4);
  ctx.fillStyle = 'rgba(251, 146, 60, 0.9)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14, -hh * 0.5 + tailSwing * 0.4, -18, 0);
  ctx.quadraticCurveTo(-14, hh * 0.5 + tailSwing * 0.4, 0, 0);
  ctx.fill();
  ctx.restore();

  // Body gradient - intense vermilion to amber
  const flameGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
  flameGrad.addColorStop(0, '#dc2626');
  flameGrad.addColorStop(0.5, '#ea580c');
  flameGrad.addColorStop(1, '#f97316');

  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Deep royal blue iridescent trim on dorsal and anal fin edges
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, hw, -Math.PI * 0.9, -Math.PI * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, hw, Math.PI * 0.4, Math.PI * 0.9);
  ctx.stroke();

  // Black vertical tiger bars
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  const barPositions = [-0.35, -0.15, 0.05, 0.25];
  barPositions.forEach((pos) => {
    ctx.beginPath();
    ctx.moveTo(hw * pos, -hh * 0.65);
    ctx.lineTo(hw * pos, hh * 0.65);
    ctx.stroke();
  });

  // Pectoral fin
  ctx.save();
  ctx.translate(hw * 0.25, hh * 0.15);
  ctx.rotate(finSwing * 0.08);
  ctx.fillStyle = 'rgba(249, 115, 22, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 11, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Eye
  renderEye(ctx, hw * 0.62, -hh * 0.25, 4.0, '#991b1b');
}

/** 5. Royal Turquoise Discus */
function renderDiscus(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  finSwing: number
) {
  const hw = w / 2;
  const hh = h / 2;

  // Tail
  ctx.save();
  ctx.translate(-hw + 4, tailSwing * 0.3);
  ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-18, -hh * 0.4 + tailSwing * 0.3);
  ctx.lineTo(-16, 0);
  ctx.lineTo(-18, hh * 0.4 + tailSwing * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Round disc body
  const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, hw);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.4, '#06b6d4');
  grad.addColorStop(0.85, '#0891b2');
  grad.addColorStop(1, '#0e7490');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Intricate glowing turquoise striations (wavy horizontal patterns)
  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 1.4;
  for (let y = -hh * 0.7; y <= hh * 0.7; y += 7) {
    ctx.beginPath();
    ctx.moveTo(-hw * 0.7, y);
    ctx.bezierCurveTo(-hw * 0.2, y - 3, hw * 0.2, y + 3, hw * 0.65, y);
    ctx.stroke();
  }

  // Trailing long pelvic feeler fins
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(hw * 0.1, hh * 0.8);
  ctx.quadraticCurveTo(0, hh * 1.5, -hw * 0.3, hh * 1.8 + finSwing);
  ctx.stroke();

  // Glowing ruby red eye
  renderEye(ctx, hw * 0.65, -hh * 0.22, 4.2, '#ef4444');
}

/** 6. Neon Tetra */
function renderNeonTetra(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  _finSwing: number
) {
  const hw = w / 2;
  const hh = h / 2;

  // Tail
  ctx.save();
  ctx.translate(-hw + 2, tailSwing * 0.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-12, -hh * 0.6 + tailSwing * 0.5);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-12, hh * 0.6 + tailSwing * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Slender translucent body base
  ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Radiant carmine red lower tail flank
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(-hw, 0);
  ctx.lineTo(0, hh * 0.2);
  ctx.quadraticCurveTo(-hw * 0.2, hh, -hw, 0);
  ctx.fill();

  // Iridescent electric neon blue dorsal horizontal stripe
  ctx.strokeStyle = '#00f5d4';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.shadowColor = '#00f5d4';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(hw * 0.7, -hh * 0.2);
  ctx.lineTo(-hw * 0.6, -hh * 0.1);
  ctx.stroke();
  ctx.shadowBlur = 0; // reset

  // Tiny eye
  renderEye(ctx, hw * 0.68, -hh * 0.15, 2.5, '#00f5d4');
}

/** 7. Halfmoon Betta with flowing silk fins */
function renderBetta(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  finSwing: number,
  tailPhase: number
) {
  const hw = w / 2;
  const hh = h / 2;

  // Magnificent flowing tail veil (multiple undulating layers)
  ctx.save();
  ctx.translate(-hw + 3, tailSwing * 0.3);
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(tailPhase + i * 0.6) * 8;
    ctx.fillStyle = i === 0 ? 'rgba(168, 85, 247, 0.6)' : i === 1 ? 'rgba(236, 72, 153, 0.55)' : 'rgba(56, 189, 248, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-20, -hh * 1.5 + wave, -40, -hh * 1.8 + wave, -50, wave);
    ctx.bezierCurveTo(-40, hh * 1.8 + wave, -20, hh * 1.5 + wave, 0, 0);
    ctx.fill();
  }
  ctx.restore();

  // Dorsal flowing crest
  ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
  ctx.beginPath();
  ctx.moveTo(-hw * 0.4, -hh * 0.8);
  ctx.bezierCurveTo(-hw * 0.2, -hh * 2.2, 0, -hh * 2.0, hw * 0.2, -hh * 0.8);
  ctx.fill();

  // Slender body
  const bettaGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
  bettaGrad.addColorStop(0, '#9333ea');
  bettaGrad.addColorStop(0.5, '#db2777');
  bettaGrad.addColorStop(1, '#0284c7');

  ctx.fillStyle = bettaGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flowing pelvic fins
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(hw * 0.1, hh * 0.8);
  ctx.bezierCurveTo(0, hh * 2, -hw * 0.2, hh * 2.5 + finSwing, -hw * 0.4, hh * 3);
  ctx.stroke();

  // Eye
  renderEye(ctx, hw * 0.65, -hh * 0.25, 3.4, '#a855f7');
}

/** 8. Moorish Idol */
function renderMoorishIdol(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  finSwing: number
) {
  const hw = w / 2;
  const hh = h / 2;

  // Black forked tail
  ctx.save();
  ctx.translate(-hw + 4, tailSwing * 0.4);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-16, -hh * 0.4 + tailSwing * 0.4);
  ctx.lineTo(-13, 0);
  ctx.lineTo(-16, hh * 0.4 + tailSwing * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Very long trailing dorsal banner/filament
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(hw * 0.1, -hh * 0.9);
  ctx.bezierCurveTo(-hw * 0.4, -hh * 2.2, -hw * 1.2, -hh * 1.8, -hw * 1.5, -hh * 0.8 + tailSwing);
  ctx.stroke();

  // High disc body
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(hw, 0);
  ctx.lineTo(hw * 0.2, -hh * 1.1);
  ctx.lineTo(-hw * 0.8, -hh * 0.4);
  ctx.lineTo(-hw, 0);
  ctx.lineTo(-hw * 0.8, hh * 0.4);
  ctx.lineTo(hw * 0.2, hh * 1.1);
  ctx.closePath();
  ctx.fill();

  // Bold black mask bands
  ctx.fillStyle = '#0f172a';
  // Front eye mask
  ctx.beginPath();
  ctx.moveTo(hw * 0.4, -hh * 0.7);
  ctx.lineTo(hw * 0.15, -hh * 1.05);
  ctx.lineTo(hw * 0.05, hh * 1.05);
  ctx.lineTo(hw * 0.35, hh * 0.7);
  ctx.fill();

  // Rear black band
  ctx.beginPath();
  ctx.moveTo(-hw * 0.35, -hh * 0.8);
  ctx.lineTo(-hw * 0.65, -hh * 0.5);
  ctx.lineTo(-hw * 0.65, hh * 0.5);
  ctx.lineTo(-hw * 0.35, hh * 0.8);
  ctx.fill();

  // Canary yellow accent bands
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(hw * 0.05, -hh * 0.9);
  ctx.lineTo(-hw * 0.35, -hh * 0.8);
  ctx.lineTo(-hw * 0.35, hh * 0.8);
  ctx.lineTo(hw * 0.05, hh * 0.9);
  ctx.fill();

  // Yellow saddle on snout
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.ellipse(hw * 0.85, 0, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pectoral fin
  ctx.save();
  ctx.translate(hw * 0.2, hh * 0.15);
  ctx.rotate(finSwing * 0.08);
  ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 11, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Eye
  renderEye(ctx, hw * 0.35, -hh * 0.3, 3.8, '#facc15');
}

/** 9. Pacific Green Sea Turtle */
function renderSeaTurtle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  finSwing: number
) {
  const hw = w / 2;
  const hh = h / 2;

  // Rear paddle flippers
  ctx.fillStyle = '#4d7c0f';
  ctx.beginPath();
  ctx.ellipse(-hw * 0.7, -hh * 0.55, 12, 6, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-hw * 0.7, hh * 0.55, 12, 6, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();

  // Small tail
  ctx.beginPath();
  ctx.moveTo(-hw * 0.85, 0);
  ctx.lineTo(-hw * 1.05, tailSwing * 0.3);
  ctx.lineTo(-hw * 0.85, 3);
  ctx.fill();

  // Front flying flippers (synchronized graceful wing flapping)
  const flipperAngle = Math.sin(finSwing * 0.4) * 0.35;
  ctx.save();
  ctx.translate(hw * 0.25, -hh * 0.6);
  ctx.rotate(-Math.PI / 4 + flipperAngle);
  ctx.fillStyle = '#65a30d';
  ctx.beginPath();
  ctx.ellipse(14, 0, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(hw * 0.25, hh * 0.6);
  ctx.rotate(Math.PI / 4 - flipperAngle);
  ctx.fillStyle = '#65a30d';
  ctx.beginPath();
  ctx.ellipse(14, 0, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Carapace Shell (oval dome)
  const shellGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, hw * 0.8);
  shellGrad.addColorStop(0, '#ca8a04');
  shellGrad.addColorStop(0.6, '#65a30d');
  shellGrad.addColorStop(1, '#3f6212');

  ctx.fillStyle = shellGrad;
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-hw * 0.1, 0, hw * 0.78, hh * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shell Scute Plates
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
  ctx.lineWidth = 1.2;
  for (let x = -hw * 0.5; x <= hw * 0.3; x += 16) {
    ctx.beginPath();
    ctx.arc(x, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Turtle Head
  ctx.fillStyle = '#4d7c0f';
  ctx.beginPath();
  ctx.ellipse(hw * 0.85, 0, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Turtle Eye
  renderEye(ctx, hw * 0.92, -3, 2.5, '#713f12');
}

/** Fallback Generic Fish */
function renderGenericFish(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tailSwing: number,
  color: string
) {
  const hw = w / 2;
  const hh = h / 2;

  // Tail
  ctx.save();
  ctx.translate(-hw, tailSwing * 0.4);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, -hh * 0.5);
  ctx.lineTo(-12, 0);
  ctx.lineTo(-14, hh * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
  ctx.fill();

  renderEye(ctx, hw * 0.6, -hh * 0.2, 3.5, '#000000');
}

/** Helper for realistic sparkling fish eyes */
function renderEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  irisColor: string
) {
  ctx.save();
  // Sclera / Iris
  ctx.fillStyle = irisColor;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Dark Pupil
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // Specular light glint (gives life to the fish)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + radius * 0.22, y - radius * 0.25, radius * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
