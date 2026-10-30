import { FishInstance } from '../types/aquarium';
import { FISH_SPECIES_CATALOG } from '../data/aquariumData';

const speciesMap = new Map(FISH_SPECIES_CATALOG.map((s) => [s.id, s]));

const DEFAULT_NAMES: Record<string, string[]> = {
  clownfish: ['Marlin', 'Nemo', 'Coral', 'Finley', 'Bubbles', 'Rusty'],
  'blue-tang': ['Dory', 'Cobalt', 'Sapphire', 'Indigo', 'Azure'],
  'yellow-tang': ['Sunny', 'Lemon', 'Apollo', 'Ray', 'Goldie'],
  'flame-angelfish': ['Blaze', 'Phoenix', 'Ignis', 'Spark', 'Ember'],
  discus: ['Cleopatra', 'Pharaoh', 'Turquoise', 'Nefertiti', 'Ramses'],
  'neon-tetra': ['Glow', 'Flash', 'Volt', 'Prism', 'Beam', 'Dart', 'Sparks', 'Shimmer'],
  betta: ['Aria', 'Seraphina', 'Velvet', 'Silk', 'Royalty'],
  'moorish-idol': ['Gill', 'Zephyr', 'Zenith', 'Phantom', 'Eclipse'],
  'sea-turtle': ['Crush', 'Shelly', 'Honu', 'Tortuga', 'Kai'],
};

export function createFishInstance(
  speciesId: string,
  viewportWidth: number = 1200,
  viewportHeight: number = 700,
  customName?: string
): FishInstance {
  const species = speciesMap.get(speciesId);
  const namePool = DEFAULT_NAMES[speciesId] || ['Fin'];
  const name =
    customName || namePool[Math.floor(Math.random() * namePool.length)] + (Math.random() < 0.3 ? ` ${Math.floor(Math.random() * 10)}` : '');

  const startX = 60 + Math.random() * (viewportWidth - 120);
  let startY = 100 + Math.random() * (viewportHeight - 200);

  // Depth stratum preference
  if (species?.preferredDepth === 'surface') {
    startY = 80 + Math.random() * 160;
  } else if (species?.preferredDepth === 'bottom') {
    startY = viewportHeight - 240 + Math.random() * 120;
  }

  const vx = (Math.random() - 0.5) * 2;
  const vy = (Math.random() - 0.5) * 1;

  return {
    id: `fish-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    speciesId,
    name,
    x: startX,
    y: startY,
    z: 0.15 + Math.random() * 0.85, // 3D depth layer
    vx,
    vy,
    targetX: 60 + Math.random() * (viewportWidth - 120),
    targetY: startY,
    facingLeft: vx < 0,
    angle: Math.atan2(vy, vx),
    targetAngle: 0,
    speed: Math.hypot(vx, vy),
    tailPhase: Math.random() * Math.PI * 2,
    finPhase: Math.random() * Math.PI * 2,
    scale: 0.9 + Math.random() * 0.2,
    baseScale: 0.9 + Math.random() * 0.2,
    growthScale: 1.0,
    foodEatenCount: 0,
    growthPulse: 0,
    hunger: 20 + Math.random() * 40,
    state: 'cruising',
    colorVariation: 0.95 + Math.random() * 0.1,
  };
}

export function createInitialFishPopulation(): FishInstance[] {
  const initial: FishInstance[] = [];

  // 2 Clownfish
  initial.push(createFishInstance('clownfish', 1200, 700, 'Marlin'));
  initial.push(createFishInstance('clownfish', 1200, 700, 'Nemo'));

  // 1 Regal Blue Tang
  initial.push(createFishInstance('blue-tang', 1200, 700, 'Dory'));

  // 1 Yellow Tang
  initial.push(createFishInstance('yellow-tang', 1200, 700, 'Sunny'));

  // 1 Flame Angelfish
  initial.push(createFishInstance('flame-angelfish', 1200, 700, 'Blaze'));

  // 2 Royal Discus
  initial.push(createFishInstance('discus', 1200, 700, 'Cleopatra'));
  initial.push(createFishInstance('discus', 1200, 700, 'Pharaoh'));

  // 6 Neon Tetras (School)
  for (let i = 0; i < 6; i++) {
    initial.push(createFishInstance('neon-tetra', 1200, 700, `Tetra ${i + 1}`));
  }

  // 1 Halfmoon Betta
  initial.push(createFishInstance('betta', 1200, 700, 'Aria'));

  // 1 Moorish Idol
  initial.push(createFishInstance('moorish-idol', 1200, 700, 'Gill'));

  // 1 Sea Turtle
  initial.push(createFishInstance('sea-turtle', 1200, 700, 'Crush'));

  return initial;
}
