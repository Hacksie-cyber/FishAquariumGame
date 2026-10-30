import React from 'react';
import {
  Utensils,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Hand,
  Flashlight,
  Wind,
  Waves,
  Eye,
  Eraser,
  Sliders,
} from 'lucide-react';
import { InteractionTool, LightMode } from '../types/aquarium';

interface ToolbarDeckProps {
  activeTool: InteractionTool;
  setActiveTool: (tool: InteractionTool) => void;
  lightMode: LightMode;
  setLightMode: (mode: LightMode) => void;
  aeratorIntensity: number;
  setAeratorIntensity: (val: number) => void;
  waterCurrentSpeed: number;
  setWaterCurrentSpeed: (val: number) => void;
  tankCleanliness: number;
  onCleanTank: () => void;
  foodCount: number;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export const ToolbarDeck: React.FC<ToolbarDeckProps> = ({
  activeTool,
  setActiveTool,
  lightMode,
  setLightMode,
  aeratorIntensity,
  setAeratorIntensity,
  waterCurrentSpeed,
  setWaterCurrentSpeed,
  tankCleanliness,
  onCleanTank,
  foodCount,
  isExpanded,
  setIsExpanded,
}) => {
  return (
    <aside aria-label="Tank controls" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 max-w-[95vw] select-none">
      {/* Parameter Control Tray (Expandable) */}
      {isExpanded && (
        <div className="flex flex-wrap items-center justify-center gap-6 px-5 py-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-white/10 text-xs text-slate-300 shadow-2xl">
          {/* Lighting Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Lighting:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-white/5">
              <button
                onClick={() => setLightMode('day')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  lightMode === 'day' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Day</span>
              </button>
              <button
                onClick={() => setLightMode('sunset')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  lightMode === 'sunset' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'hover:text-white'
                }`}
              >
                <Sunset className="w-3.5 h-3.5" />
                <span>Sunset</span>
              </button>
              <button
                onClick={() => setLightMode('night')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  lightMode === 'night' ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Night</span>
              </button>
              <button
                onClick={() => setLightMode('abyss')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  lightMode === 'abyss' ? 'bg-purple-500/20 text-purple-300 font-medium' : 'hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Abyss</span>
              </button>
            </div>
          </div>

          {/* Aerator Bubbles Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" /> Aerator:
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={aeratorIntensity}
              onChange={(e) => setAeratorIntensity(parseFloat(e.target.value))}
              className="w-20 h-1 accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono tabular-nums text-slate-400 w-8">
              {Math.round(aeratorIntensity * 100)}%
            </span>
          </div>

          {/* Water Current Speed Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Waves className="w-3.5 h-3.5" /> Current:
            </span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={waterCurrentSpeed}
              onChange={(e) => setWaterCurrentSpeed(parseFloat(e.target.value))}
              className="w-20 h-1 accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="font-mono tabular-nums text-slate-400 w-8">
              {waterCurrentSpeed.toFixed(1)}x
            </span>
          </div>

          {/* Glass Cleanliness & Quick Clean */}
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <span className="text-slate-400">Glass:</span>
            <span className="font-mono tabular-nums text-emerald-400">
              {Math.round(tankCleanliness)}%
            </span>
            <button
              onClick={onCleanTank}
              className="px-2 py-0.5 text-xs text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/50 rounded border border-cyan-800/40 transition-colors"
            >
              Wipe Clean
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Tool Dock */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-2xl">
        {/* Tool: Feed */}
        <button
          onClick={() => setActiveTool('feed')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
            activeTool === 'feed'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
          title="Click inside tank to drop food flakes and grow your fish!"
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Feed & Grow</span>
          {foodCount > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-slate-900/40 rounded-full font-mono">
              {foodCount}
            </span>
          )}
        </button>

        {/* Tool: Tap Glass */}
        <button
          onClick={() => setActiveTool('tap')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
            activeTool === 'tap'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
          title="Click to tap tank glass and startle fish"
        >
          <Hand className="w-3.5 h-3.5" />
          <span>Tap Glass</span>
        </button>

        {/* Tool: Light Beam */}
        <button
          onClick={() => setActiveTool('light')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
            activeTool === 'light'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
          title="Move cursor to cast a sunlit torch beam"
        >
          <Flashlight className="w-3.5 h-3.5" />
          <span>Sunbeam</span>
        </button>

        {/* Tool: Clean Squeegee */}
        <button
          onClick={() => setActiveTool('clean')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
            activeTool === 'clean'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
          title="Drag mouse on glass to wipe algae and fog"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>Squeegee</span>
        </button>

        {/* Tool: Inspect Fish */}
        <button
          onClick={() => setActiveTool('inspect')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
            activeTool === 'inspect'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
          title="Click on any fish to inspect vitals and origin"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect Fish</span>
        </button>

        {/* Tank Parameters Toggle */}
        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-xl transition-colors ${
            isExpanded
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Toggle tank settings (lighting, aerator, current)"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
