import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AquariumTheme,
  BubbleParticle,
  FishInstance,
  FoodPellet,
  InteractionTool,
  LightMode,
  LightMote,
  RippleShockwave,
} from '../types/aquarium';
import { FISH_SPECIES_CATALOG } from '../data/aquariumData';
import { drawFish } from '../utils/fishRenderer';
import { audioEngine } from '../utils/audioEngine';

interface AquariumCanvasProps {
  currentTheme: AquariumTheme;
  lightMode: LightMode;
  aeratorIntensity: number; // 0 to 1
  waterCurrentSpeed: number; // 0.5 to 2.0
  activeTool: InteractionTool;
  fishList: FishInstance[];
  setFishList: React.Dispatch<React.SetStateAction<FishInstance[]>>;
  selectedFishId: string | null;
  onSelectFish: (fish: FishInstance | null) => void;
  onTapCountIncrement?: () => void;
  foodCount: number;
  setFoodCount: React.Dispatch<React.SetStateAction<number>>;
  tankCleanliness: number;
  setTankCleanliness: React.Dispatch<React.SetStateAction<number>>;
}

const speciesCatalogMap = new Map(FISH_SPECIES_CATALOG.map((s) => [s.id, s]));

export const AquariumCanvas: React.FC<AquariumCanvasProps> = ({
  currentTheme,
  lightMode,
  aeratorIntensity,
  waterCurrentSpeed,
  activeTool,
  fishList,
  setFishList,
  selectedFishId,
  onSelectFish,
  setFoodCount,
  tankCleanliness,
  setTankCleanliness,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation physics refs (held in refs for high-frequency 60fps animation)
  const fishRef = useRef<FishInstance[]>(fishList);
  const foodRef = useRef<FoodPellet[]>([]);
  const bubblesRef = useRef<BubbleParticle[]>([]);
  const motesRef = useRef<LightMote[]>([]);
  const ripplesRef = useRef<RippleShockwave[]>([]);
  const mousePosRef = useRef<{ x: number; y: number; isDown: boolean }>({ x: -100, y: -100, isDown: false });
  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const causticPhaseRef = useRef<number>(0);

  // Sync prop changes to ref
  useEffect(() => {
    fishRef.current = fishList;
  }, [fishList]);

  // Initial populate bubbles and light motes
  useEffect(() => {
    const bubbles: BubbleParticle[] = [];
    for (let i = 0; i < 40; i++) {
      bubbles.push({
        id: `bubble-${Math.random()}`,
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * (window.innerHeight || 800),
        vy: -(0.8 + Math.random() * 1.6),
        vx: (Math.random() - 0.5) * 0.4,
        size: 2 + Math.random() * 5,
        opacity: 0.2 + Math.random() * 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.04 + Math.random() * 0.06,
        layer: Math.random(),
      });
    }
    bubblesRef.current = bubbles;

    const motes: LightMote[] = [];
    for (let i = 0; i < 50; i++) {
      motes.push({
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * (window.innerHeight || 800),
        size: 1 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.15,
        opacity: 0.15 + Math.random() * 0.35,
        baseOpacity: 0.15 + Math.random() * 0.35,
      });
    }
    motesRef.current = motes;
  }, []);

  // Drop food pellet function
  const dropFood = useCallback(
    (x: number, y: number) => {
      const pelletTypes: ('flake' | 'pellet')[] = ['flake', 'pellet'];
      const pelletColors = ['#f97316', '#eab308', '#ef4444', '#ca8a04'];
      const newPellets: FoodPellet[] = [];

      // Drop a pinch of 3-5 flakes
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        newPellets.push({
          id: `food-${Date.now()}-${Math.random()}`,
          x: x + (Math.random() - 0.5) * 26,
          y: y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0.4 + Math.random() * 0.8,
          size: 3 + Math.random() * 3,
          type: pelletTypes[Math.floor(Math.random() * pelletTypes.length)],
          color: pelletColors[Math.floor(Math.random() * pelletColors.length)],
          isEaten: false,
        });
      }

      foodRef.current.push(...newPellets);
      setFoodCount(foodRef.current.length);
      audioEngine.playWaterPlop();

      // Trigger surface ripple
      ripplesRef.current.push({
        id: `ripple-${Date.now()}`,
        x,
        y: Math.min(y, 100),
        radius: 4,
        maxRadius: 65,
        opacity: 0.7,
      });
    },
    [setFoodCount]
  );

  // Handle glass tap shockwave
  const triggerGlassTap = useCallback(
    (x: number, y: number) => {
      audioEngine.playGlassTap();

      ripplesRef.current.push({
        id: `tap-ripple-${Date.now()}`,
        x,
        y,
        radius: 6,
        maxRadius: 140,
        opacity: 0.85,
      });

      // Startle nearby fish
      fishRef.current.forEach((fish) => {
        const dx = fish.x - x;
        const dy = fish.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < 260) {
          fish.state = 'fleeing';
          fish.fleeTimer = 90; // frames
          const angle = Math.atan2(dy, dx);
          fish.vx = Math.cos(angle) * 3.8;
          fish.vy = Math.sin(angle) * 2.2;
          fish.facingLeft = fish.vx < 0;
        }
      });
    },
    []
  );

  // Canvas click handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'feed') {
      dropFood(x, y);
    } else if (activeTool === 'tap') {
      triggerGlassTap(x, y);
    } else if (activeTool === 'clean') {
      setTankCleanliness((prev) => Math.min(100, prev + 8));
      audioEngine.playNibble();
    } else if (activeTool === 'inspect') {
      // Find clicked fish
      let clickedFish: FishInstance | null = null;
      for (let i = fishRef.current.length - 1; i >= 0; i--) {
        const f = fishRef.current[i];
        const species = speciesCatalogMap.get(f.speciesId);
        const radius = (species?.bodyWidth || 50) * 0.7;
        const dist = Math.hypot(f.x - x, f.y - y);
        if (dist < radius) {
          clickedFish = f;
          break;
        }
      }
      onSelectFish(clickedFish);
    }
  };

  // Mouse move handler for flashlight beam or squeegee cleaning
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isDown: e.buttons === 1,
    };

    if (activeTool === 'clean' && e.buttons === 1) {
      setTankCleanliness((prev) => Math.min(100, prev + 0.5));
    }
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: -200, y: -200, isDown: false };
  };

  // Mobile Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    mousePosRef.current = { x, y, isDown: true };

    if (activeTool === 'feed') {
      dropFood(x, y);
    } else if (activeTool === 'tap') {
      triggerGlassTap(x, y);
    } else if (activeTool === 'clean') {
      setTankCleanliness((prev) => Math.min(100, prev + 6));
      audioEngine.playNibble();
    } else if (activeTool === 'inspect') {
      // Find clicked/tapped fish (with generous touch radius)
      let clickedFish: FishInstance | null = null;
      for (let i = fishRef.current.length - 1; i >= 0; i--) {
        const f = fishRef.current[i];
        const species = speciesCatalogMap.get(f.speciesId);
        const radius = (species?.bodyWidth || 50) * 0.9;
        const dist = Math.hypot(f.x - x, f.y - y);
        if (dist < radius) {
          clickedFish = f;
          break;
        }
      }
      onSelectFish(clickedFish);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    mousePosRef.current = { x, y, isDown: true };

    if (activeTool === 'clean') {
      setTankCleanliness((prev) => Math.min(100, prev + 0.8));
    }
  };

  const handleTouchEnd = () => {
    mousePosRef.current.isDown = false;
    if (activeTool === 'light') {
      setTimeout(() => {
        if (!mousePosRef.current.isDown) {
          mousePosRef.current = { x: -200, y: -200, isDown: false };
        }
      }, 1500);
    }
  };

  // Main 60fps simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;

    const render = (time: number) => {
      if (!isSubscribed) return;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      causticPhaseRef.current += dt * 0.8;

      // Handle retina resolution & canvas dimensions
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // --- 1. Draw Subtle Light Caustics on Water ---
      drawWaterCaustics(ctx, width, height, causticPhaseRef.current, lightMode);

      // --- 2. Update & Draw Aerator Bubble Columns ---
      updateAndDrawBubbles(ctx, width, height, aeratorIntensity, waterCurrentSpeed);

      // --- 3. Update & Draw Sinking Food Flakes ---
      updateAndDrawFood(ctx, width, height);

      // --- 4. Update & Draw Fish with Artificial Life Kinematics ---
      updateAndDrawFish(ctx, width, height, waterCurrentSpeed, dt, selectedFishId);

      // --- 5. Floating Ambient Plankton & Motes ---
      updateAndDrawMotes(ctx, width, height, waterCurrentSpeed);

      // --- 6. Shockwave Ripples ---
      updateAndDrawRipples(ctx);

      // --- 7. Interactive Light Beam (Torch Mode) ---
      if (activeTool === 'light') {
        drawFlashlightBeam(ctx, width, height, mousePosRef.current);
      }

      // --- 8. Glass Squeegee Tool Indicator ---
      if (activeTool === 'clean') {
        drawSqueegeeCursor(ctx, mousePosRef.current);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      isSubscribed = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [aeratorIntensity, waterCurrentSpeed, lightMode, activeTool, selectedFishId]);

  // Physics & Drawing Subroutines
  const updateAndDrawBubbles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number,
    currentSpeed: number
  ) => {
    // Spawn new bubbles from 2 bottom aerator stones
    const spawnChance = 0.2 + intensity * 0.8;
    if (intensity > 0.05 && Math.random() < spawnChance) {
      const aeratorX = Math.random() < 0.5 ? width * 0.18 : width * 0.82;
      bubblesRef.current.push({
        id: `b-${Date.now()}-${Math.random()}`,
        x: aeratorX + (Math.random() - 0.5) * 28,
        y: height - 15,
        vy: -(1.4 + Math.random() * 2.4 * (0.8 + intensity)),
        vx: (Math.random() - 0.5) * 0.4 + (currentSpeed - 1) * 0.3,
        size: 2 + Math.random() * 5,
        opacity: 0.35 + Math.random() * 0.45,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.06 + Math.random() * 0.08,
        layer: Math.random(),
      });
    }

    // Filter and draw bubbles
    const remainingBubbles: BubbleParticle[] = [];
    bubblesRef.current.forEach((b) => {
      b.y += b.vy;
      b.wobblePhase += b.wobbleSpeed;
      b.x += b.vx + Math.sin(b.wobblePhase) * 0.6;

      if (b.y > 10) {
        remainingBubbles.push(b);

        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity * 0.7})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bubble inner highlight reflection
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.9})`;
        ctx.beginPath();
        ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Cap maximum bubbles
    if (remainingBubbles.length > 180) {
      remainingBubbles.splice(0, remainingBubbles.length - 180);
    }
    bubblesRef.current = remainingBubbles;
  };

  const updateAndDrawFood = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const remainingFood: FoodPellet[] = [];
    foodRef.current.forEach((food) => {
      if (food.isEaten) return;

      // Sinking physics with water drag
      food.y += food.vy;
      food.x += food.vx;
      food.vx *= 0.98; // water drag
      food.vy = Math.min(food.vy, 1.2); // terminal sinking velocity

      // If reached bottom gravel, rests on sand
      if (food.y < height - 20) {
        remainingFood.push(food);
      }

      ctx.save();
      ctx.fillStyle = food.color;
      ctx.beginPath();
      if (food.type === 'flake') {
        ctx.ellipse(food.x, food.y, food.size * 1.2, food.size * 0.7, food.vx * 2, 0, Math.PI * 2);
      } else {
        ctx.arc(food.x, food.y, food.size * 0.8, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    });

    foodRef.current = remainingFood;
  };

  const updateAndDrawFish = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentSpeed: number,
    dt: number,
    selectedId: string | null
  ) => {
    const foods = foodRef.current.filter((f) => !f.isEaten);

    // Sort fish by depth (Z-index) so foreground fish draw in front of background fish
    const sortedFish = [...fishRef.current].sort((a, b) => a.z - b.z);

    sortedFish.forEach((fish) => {
      const species = speciesCatalogMap.get(fish.speciesId);
      if (!species) return;

      // Tail oscillation increases with swim speed
      const baseSwim = species.swimSpeed * currentSpeed;
      fish.tailPhase += (0.12 + fish.speed * 0.08) * (dt * 60);
      fish.finPhase += 0.16 * (dt * 60);

      // Smooth growth expansion
      const targetScale = (fish.baseScale || 1.0) * (fish.growthScale || 1.0);
      fish.scale += (targetScale - fish.scale) * 0.08;

      // Decay visual effects
      if (fish.growthPulse && fish.growthPulse > 0) {
        fish.growthPulse = Math.max(0, fish.growthPulse - 0.025);
      }
      if (fish.growthTextTimer && fish.growthTextTimer > 0) {
        fish.growthTextTimer--;
      }

      // AI States:
      // 1. Fleeing from glass tap
      if (fish.state === 'fleeing' && fish.fleeTimer && fish.fleeTimer > 0) {
        fish.fleeTimer--;
        fish.x += fish.vx;
        fish.y += fish.vy;
        fish.speed = Math.hypot(fish.vx, fish.vy);
        if (fish.fleeTimer <= 0) {
          fish.state = 'cruising';
        }
      }
      // 2. Chasing Food
      else if (foods.length > 0) {
        // Find nearest food within perception radius
        let nearestFood: FoodPellet | null = null;
        let minDist = 380; // perception radius

        foods.forEach((f) => {
          const d = Math.hypot(f.x - fish.x, f.y - fish.y);
          if (d < minDist) {
            minDist = d;
            nearestFood = f;
          }
        });

        if (nearestFood) {
          fish.state = 'chasing_food';
          const foodItem: FoodPellet = nearestFood;
          const dx = foodItem.x - fish.x;
          const dy = foodItem.y - fish.y;
          const dist = Math.hypot(dx, dy);

          // Steer toward food
          const steerSpeed = baseSwim * 1.8;
          fish.vx = (dx / dist) * steerSpeed;
          fish.vy = (dy / dist) * steerSpeed;
          fish.facingLeft = fish.vx < 0;
          fish.angle = Math.atan2(fish.vy, fish.vx);
          fish.speed = steerSpeed;

          fish.x += fish.vx;
          fish.y += fish.vy;

          // Eat food condition & Grow!
          if (dist < 18) {
            foodItem.isEaten = true;
            fish.state = 'cruising';
            audioEngine.playNibble();
            audioEngine.playGrowthChime();

            // Increase growth level noticeably!
            fish.foodEatenCount = (fish.foodEatenCount || 0) + 1;
            const newGrowth = Math.min(3.5, (fish.growthScale || 1.0) + 0.15);
            fish.growthScale = newGrowth;
            fish.growthPulse = 1.0;
            const pct = Math.round((newGrowth - 1) * 100);
            fish.growthText = pct > 0 ? `+${pct}% Growing!` : 'Growing!';
            fish.growthTextTimer = 45;

            // Spawn happy tiny bubbles
            for (let b = 0; b < 2; b++) {
              bubblesRef.current.push({
                id: `eat-bubble-${Date.now()}-${b}`,
                x: fish.x + (Math.random() - 0.5) * 10,
                y: fish.y - 10,
                vy: -1.6 - Math.random() * 0.8,
                vx: (Math.random() - 0.5) * 0.6,
                size: 2.5 + Math.random() * 2,
                opacity: 0.7,
                wobblePhase: 0,
                wobbleSpeed: 0.08,
                layer: 0.8,
              });
            }
          }
        } else {
          // No food nearby, resume cruising
          fish.state = 'cruising';
          cruiseFish(fish, width, height, baseSwim);
        }
      }
      // 3. Schooling for Tetras
      else if (species.isSchooling) {
        schoolFish(fish, fishRef.current, width, height, baseSwim);
      }
      // 4. Default Peaceful Cruising
      else {
        fish.state = 'cruising';
        cruiseFish(fish, width, height, baseSwim);
      }

      // Boundary bounds & gentle turnaround
      const margin = 40;
      if (fish.x < margin) {
        fish.x = margin;
        fish.targetX = width * (0.3 + Math.random() * 0.6);
        fish.facingLeft = false;
      } else if (fish.x > width - margin) {
        fish.x = width - margin;
        fish.targetX = width * (0.1 + Math.random() * 0.6);
        fish.facingLeft = true;
      }
      if (fish.y < margin + 30) {
        fish.y = margin + 30;
        fish.targetY = height * (0.3 + Math.random() * 0.5);
      } else if (fish.y > height - margin - 20) {
        fish.y = height - margin - 20;
        fish.targetY = height * (0.2 + Math.random() * 0.5);
      }

      // Draw the animated fish
      const isSelected = fish.id === selectedId;
      drawFish(ctx, fish, isSelected);
    });
  };

  // Autonomous fish cruising navigation
  const cruiseFish = (
    fish: FishInstance,
    width: number,
    height: number,
    baseSwim: number
  ) => {
    // Check if reached destination or need new target
    const distToTarget = Math.hypot(fish.targetX - fish.x, fish.targetY - fish.y);
    if (distToTarget < 30 || Math.random() < 0.008) {
      fish.targetX = 60 + Math.random() * (width - 120);
      fish.targetY = 70 + Math.random() * (height - 140);
    }

    const dx = fish.targetX - fish.x;
    const dy = fish.targetY - fish.y;
    const dist = Math.hypot(dx, dy) || 1;

    // Smooth acceleration toward target
    const targetVx = (dx / dist) * baseSwim;
    const targetVy = (dy / dist) * (baseSwim * 0.6);

    fish.vx += (targetVx - fish.vx) * 0.03;
    fish.vy += (targetVy - fish.vy) * 0.03;

    fish.x += fish.vx;
    fish.y += fish.vy;
    fish.speed = Math.hypot(fish.vx, fish.vy);

    if (Math.abs(fish.vx) > 0.2) {
      fish.facingLeft = fish.vx < 0;
    }
    fish.angle = Math.atan2(fish.vy, fish.vx);
  };

  // Schooling behavior for Neon Tetras (Boids flocking)
  const schoolFish = (
    fish: FishInstance,
    allFish: FishInstance[],
    width: number,
    height: number,
    baseSwim: number
  ) => {
    let avgVx = 0;
    let avgVy = 0;
    let avgX = 0;
    let avgY = 0;
    let separationX = 0;
    let separationY = 0;
    let neighborCount = 0;

    allFish.forEach((other) => {
      if (other.id !== fish.id && other.speciesId === fish.speciesId) {
        const d = Math.hypot(other.x - fish.x, other.y - fish.y);
        if (d < 120) {
          avgVx += other.vx;
          avgVy += other.vy;
          avgX += other.x;
          avgY += other.y;
          neighborCount++;

          if (d < 30) {
            separationX -= (other.x - fish.x) / (d || 1);
            separationY -= (other.y - fish.y) / (d || 1);
          }
        }
      }
    });

    if (neighborCount > 0) {
      avgVx /= neighborCount;
      avgVy /= neighborCount;
      avgX /= neighborCount;
      avgY /= neighborCount;

      const cohesionX = (avgX - fish.x) * 0.015;
      const cohesionY = (avgY - fish.y) * 0.015;

      fish.vx += avgVx * 0.04 + cohesionX + separationX * 0.08;
      fish.vy += avgVy * 0.04 + cohesionY + separationY * 0.08;
    } else {
      cruiseFish(fish, width, height, baseSwim);
      return;
    }

    // Clamp speed
    const currentSpd = Math.hypot(fish.vx, fish.vy);
    if (currentSpd > baseSwim * 1.5) {
      fish.vx = (fish.vx / currentSpd) * baseSwim * 1.5;
      fish.vy = (fish.vy / currentSpd) * baseSwim * 1.5;
    }

    fish.x += fish.vx;
    fish.y += fish.vy;
    fish.speed = Math.hypot(fish.vx, fish.vy);
    if (Math.abs(fish.vx) > 0.1) {
      fish.facingLeft = fish.vx < 0;
    }
    fish.angle = Math.atan2(fish.vy, fish.vx);
  };

  const updateAndDrawMotes = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentSpeed: number
  ) => {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';

    motesRef.current.forEach((mote) => {
      mote.x += mote.vx * currentSpeed;
      mote.y += mote.vy;

      if (mote.x < 0) mote.x = width;
      if (mote.x > width) mote.x = 0;
      if (mote.y < 0) mote.y = height;
      if (mote.y > height) mote.y = 0;

      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  const updateAndDrawRipples = (ctx: CanvasRenderingContext2D) => {
    const remainingRipples: RippleShockwave[] = [];
    ripplesRef.current.forEach((r) => {
      r.radius += 2.2;
      r.opacity *= 0.94;

      if (r.opacity > 0.03 && r.radius < r.maxRadius) {
        remainingRipples.push(r);

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.opacity})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(125, 211, 252, ${r.opacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });

    ripplesRef.current = remainingRipples;
  };

  const drawWaterCaustics = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    phase: number,
    mode: LightMode
  ) => {
    if (mode === 'night') return; // night mode has dark stillness
    ctx.save();

    const causticOpacity = mode === 'day' ? 0.07 : mode === 'sunset' ? 0.05 : 0.03;
    ctx.fillStyle = mode === 'sunset' ? `rgba(251, 146, 60, ${causticOpacity})` : `rgba(255, 255, 255, ${causticOpacity})`;

    // Projected sun rays passing through surface
    ctx.beginPath();
    const rayCount = 5;
    for (let i = 0; i < rayCount; i++) {
      const topX = width * (0.15 + (i / rayCount) * 0.7) + Math.sin(phase + i) * 30;
      const bottomX = topX + (i - rayCount / 2) * 80 + Math.cos(phase * 0.8 + i) * 40;
      const rayWidth = 40 + Math.sin(phase * 1.2 + i) * 15;

      ctx.moveTo(topX - rayWidth * 0.5, 0);
      ctx.lineTo(topX + rayWidth * 0.5, 0);
      ctx.lineTo(bottomX + rayWidth * 1.8, height);
      ctx.lineTo(bottomX - rayWidth * 1.8, height);
      ctx.closePath();
    }
    ctx.fill();

    ctx.restore();
  };

  const drawFlashlightBeam = (
    ctx: CanvasRenderingContext2D,
    _width: number,
    _height: number,
    mouse: { x: number; y: number }
  ) => {
    if (mouse.x < 0) return;
    ctx.save();

    const radius = 160;
    const beamGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    beamGrad.addColorStop(0.4, 'rgba(125, 211, 252, 0.25)');
    beamGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle pointer ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

  const drawSqueegeeCursor = (
    ctx: CanvasRenderingContext2D,
    mouse: { x: number; y: number }
  ) => {
    if (mouse.x < 0) return;
    ctx.save();
    ctx.translate(mouse.x, mouse.y);

    // Draw magnetic glass cleaner squeegee pad
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-24, -14, 48, 28, 6);
    ctx.fill();
    ctx.stroke();

    // Squeegee rubber wiper blade
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-20, 10, 40, 4);

    ctx.restore();
  };

  // Determine light mode tint overlay
  const getLightingOverlayClass = () => {
    switch (lightMode) {
      case 'sunset':
        return 'bg-gradient-to-b from-amber-500/15 via-rose-500/10 to-indigo-950/30';
      case 'night':
        return 'bg-gradient-to-b from-blue-950/60 via-slate-950/50 to-black/70';
      case 'abyss':
        return 'bg-gradient-to-b from-indigo-950/40 via-purple-950/30 to-blue-950/60';
      case 'day':
      default:
        return 'bg-gradient-to-b from-cyan-400/10 via-transparent to-black/20';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950"
    >
      {/* Background Aquarium Image Layer */}
      <img
        src={currentTheme.imagePath}
        alt={currentTheme.name}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none scale-102 transform filter brightness-95"
      />

      {/* Atmospheric Water Tint Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentTheme.waterTint }}
      />

      {/* Lighting Mode Overlay (Day, Sunset, Night, Abyss) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-700 ${getLightingOverlayClass()}`}
      />

      {/* Glass Cleanliness Fog Filter (shows slight condensation if not 100% clean) */}
      {tankCleanliness < 95 && (
        <div
          className="absolute inset-0 pointer-events-none backdrop-blur-[1px] transition-opacity duration-300"
          style={{ opacity: (100 - tankCleanliness) / 100 * 0.45 }}
        >
          <div className="w-full h-full bg-emerald-950/10" />
        </div>
      )}

      {/* Subtle Aquarium Glass Reflection Highlight (Diagonal Sheen) */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/4 to-transparent" />

      {/* Surface Shimmer Edge at Top */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

      {/* Interactive Simulation Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative z-10 w-full h-full block touch-none ${
          activeTool === 'feed'
            ? 'cursor-pointer'
            : activeTool === 'clean'
            ? 'cursor-none'
            : activeTool === 'inspect'
            ? 'cursor-crosshair'
            : 'cursor-default'
        }`}
      />
    </div>
  );
};
