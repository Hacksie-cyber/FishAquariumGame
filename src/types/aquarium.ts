export type AquariumThemeId = 'coral-reef' | 'amazon-aquascape' | 'bioluminescent-abyss' | 'zen-river';

export interface AquariumTheme {
  id: AquariumThemeId;
  name: string;
  category: 'Marine Reef' | 'Freshwater' | 'Deep Ocean' | 'Zen Stream';
  imagePath: string;
  description: string;
  waterTint: string;
  ambientLightColor: string;
  defaultLightMode: 'day' | 'sunset' | 'night' | 'abyss';
  waterTemperature: number; // in Celsius
  phLevel: number;
  salinity: string;
}

export type LightMode = 'day' | 'sunset' | 'night' | 'abyss';

export interface FishSpecies {
  id: string;
  name: string;
  scientificName: string;
  type: 'marine' | 'freshwater' | 'special';
  lengthCm: number;
  swimSpeed: number; // base speed
  bodyWidth: number;
  bodyHeight: number;
  diet: string;
  origin: string;
  temperament: 'Peaceful' | 'Active' | 'Gentle' | 'Schooling' | 'Curious';
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  finColor: string;
  preferredDepth: 'surface' | 'midwater' | 'bottom' | 'any';
  isSchooling?: boolean;
}

export interface FishInstance {
  id: string;
  speciesId: string;
  x: number;
  y: number;
  z: number; // 0 (deep background) to 1 (close foreground)
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  facingLeft: boolean;
  angle: number;
  targetAngle: number;
  speed: number;
  tailPhase: number;
  finPhase: number;
  scale: number;
  baseScale: number;
  growthScale: number; // 1.0 initially, grows as it eats
  foodEatenCount: number; // total flakes consumed
  growthPulse: number; // 0 to 1 for visual growth shimmer ring
  growthText?: string;
  growthTextTimer?: number;
  hunger: number; // 0 (full) to 100 (starving)
  state: 'cruising' | 'chasing_food' | 'fleeing' | 'curious' | 'nibbling';
  targetFoodId?: string;
  targetFoodTimer?: number;
  fleeTimer?: number;
  name: string;
  colorVariation: number; // 0.9 to 1.1 tint variation
}

export interface FoodPellet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'flake' | 'pellet';
  color: string;
  isEaten: boolean;
  eatenProgress?: number;
}

export interface BubbleParticle {
  id: string;
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  opacity: number;
  wobblePhase: number;
  wobbleSpeed: number;
  layer: number;
}

export interface RippleShockwave {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export interface LightMote {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  baseOpacity: number;
}

export type InteractionTool = 'feed' | 'tap' | 'light' | 'clean' | 'inspect';

export interface SensorTelemetry {
  waterTempC: number;
  waterTempF: number;
  ambientTempC: number;
  ambientTempF: number;
  humidityPercent: number;
  phLevel: number;
  dissolvedOxygenMgL: number;
  salinityPpt: number;
  tdsPpm: number;
  clarityPercent: number;
  isCalibrating: boolean;
  history: {
    temp: number[];
    humidity: number[];
    ph: number[];
    oxygen: number[];
  };
  lastSync: Date;
}
