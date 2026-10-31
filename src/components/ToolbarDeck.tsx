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
    <aside
      aria-label="Tank controls"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 max-w-[96vw] select-none pointer-events-none"
    >
      {/* Parameter Control Tray (Expandable) */}
      {isExpanded && (
        <div className="pointer-events-auto flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-6 p-4 sm:px-5 sm:py-3 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-white/15 text-xs text-slate-300 shadow-2xl max-h-[45vh] sm:max-h-none overflow-y-auto w-full max-w-md sm:max-w-none ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Lighting Mode Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2">
            <span className="text-slate-400 font-medium">Lighting:</span>
            <div className="grid grid-cols-4 sm:flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-white/5 w-full sm:w-auto">
              <button
                onClick={() => setLightMode('day')}
                className={`flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1 min-h-[36px] rounded-lg transition-colors ${
                  lightMode === 'day' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Day</span>
              </button>
              <button
                onClick={() => setLightMode('sunset')}
                className={`flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1 min-h-[36px] rounded-lg transition-colors ${
                  lightMode === 'sunset' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'hover:text-white'
                }`}
              >
                <Sunset className="w-3.5 h-3.5" />
                <span>Sunset</span>
              </button>
              <button
                onClick={() => setLightMode('night')}
                className={`flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1 min-h-[36px] rounded-lg transition-colors ${
                  lightMode === 'night' ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Night</span>
              </button>
              <button
                onClick={() => setLightMode('abyss')}
                className={`flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1 min-h-[36px] rounded-lg transition-colors ${
                  lightMode === 'abyss' ? 'bg-purple-500/20 text-purple-300 font-medium' : 'hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Abyss</span>
              </button>
            </div>
          </div>

          {/* Aerator Bubbles Slider */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" /> Aerator:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={aeratorIntensity}
                onChange={(e) => setAeratorIntensity(parseFloat(e.target.value))}
                className="w-24 sm:w-20 h-2 sm:h-1.5 accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono tabular-nums text-slate-400 w-8 text-right">
                {Math.round(aeratorIntensity * 100)}%
              </span>
            </div>
          </div>

          {/* Water Current Speed Slider */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Waves className="w-3.5 h-3.5" /> Current:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={waterCurrentSpeed}
                onChange={(e) => setWaterCurrentSpeed(parseFloat(e.target.value))}
                className="w-24 sm:w-20 h-2 sm:h-1.5 accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono tabular-nums text-slate-400 w-8 text-right">
                {waterCurrentSpeed.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Glass Cleanliness & Quick Clean */}
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:border-l sm:border-white/10 sm:pl-3 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Glass:</span>
              <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                {Math.round(tankCleanliness)}%
              </span>
            </div>
            <button
              onClick={onCleanTank}
              className="px-3 py-1.5 sm:py-1 text-xs text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 rounded-lg border border-cyan-700/50 min-h-[34px] sm:min-h-0 transition-colors"
            >
              Wipe Clean
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Tool Dock - Elevated and fully visible on mobile */}
      <div className="pointer-events-auto flex items-center justify-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-950/92 backdrop-blur-xl border border-cyan-500/25 shadow-[0_12px_40px_rgba(0,0,0,0.7)] ring-1 ring-white/10 max-w-full overflow-x-auto no-scrollbar">
        {/* Tool: Feed */}
        <button
          onClick={() => setActiveTool('feed')}
          className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[48px] sm:min-h-[42px] min-w-[46px] sm:min-w-0 text-[10px] sm:text-xs font-medium rounded-xl shrink-0 transition-all active:scale-95 ${
            activeTool === 'feed'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
          }`}
          title="Click or tap inside tank to drop food flakes and grow your fish!"
        >
          <Utensils className="w-4 h-4 shrink-0" />
          <span className="sm:hidden">Feed</span>
          <span className="hidden sm:inline">Feed & Grow</span>
          {foodCount > 0 && (
            <span
              className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded-full font-mono ${
                activeTool === 'feed'
                  ? 'bg-slate-950/30 text-slate-950 font-bold'
                  : 'bg-cyan-500/30 text-cyan-300'
              }`}
            >
              {foodCount}
            </span>
          )}
        </button>

        {/* Tool: Tap Glass */}
        <button
          onClick={() => setActiveTool('tap')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[48px] sm:min-h-[42px] min-w-[46px] sm:min-w-0 text-[10px] sm:text-xs font-medium rounded-xl shrink-0 transition-all active:scale-95 ${
            activeTool === 'tap'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
          }`}
          title="Click or tap to vibrate glass and startle fish"
        >
          <Hand className="w-4 h-4 shrink-0" />
          <span className="sm:hidden">Tap</span>
          <span className="hidden sm:inline">Tap Glass</span>
        </button>

        {/* Tool: Light Beam */}
        <button
          onClick={() => setActiveTool('light')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[48px] sm:min-h-[42px] min-w-[46px] sm:min-w-0 text-[10px] sm:text-xs font-medium rounded-xl shrink-0 transition-all active:scale-95 ${
            activeTool === 'light'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
          }`}
          title="Move cursor or finger to cast a sunlit torch beam"
        >
          <Flashlight className="w-4 h-4 shrink-0" />
          <span className="sm:hidden">Light</span>
          <span className="hidden sm:inline">Sunbeam</span>
        </button>

        {/* Tool: Clean Squeegee */}
        <button
          onClick={() => setActiveTool('clean')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[48px] sm:min-h-[42px] min-w-[46px] sm:min-w-0 text-[10px] sm:text-xs font-medium rounded-xl shrink-0 transition-all active:scale-95 ${
            activeTool === 'clean'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
          }`}
          title="Drag finger or mouse on glass to wipe algae and fog"
        >
          <Eraser className="w-4 h-4 shrink-0" />
          <span className="sm:hidden">Clean</span>
          <span className="hidden sm:inline">Squeegee</span>
        </button>

        {/* Tool: Inspect Fish */}
        <button
          onClick={() => setActiveTool('inspect')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-h-[48px] sm:min-h-[42px] min-w-[46px] sm:min-w-0 text-[10px] sm:text-xs font-medium rounded-xl shrink-0 transition-all active:scale-95 ${
            activeTool === 'inspect'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
          }`}
          title="Click or tap any fish to inspect vitals and origin"
        >
          <Eye className="w-4 h-4 shrink-0" />
          <span className="sm:hidden">Inspect</span>
          <span className="hidden sm:inline">Inspect Fish</span>
        </button>

        {/* Tank Parameters Toggle */}
        <div className="w-[1px] h-6 sm:h-5 bg-white/15 mx-0.5 sm:mx-1 shrink-0" />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 min-h-[48px] sm:min-h-[42px] min-w-[46px] sm:min-w-0 rounded-xl shrink-0 transition-all active:scale-95 ${
            isExpanded
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/70'
          }`}
          title="Toggle tank settings (lighting, aerator, current)"
          aria-label="Toggle tank settings"
        >
          <Sliders className="w-4 h-4 shrink-0" />
          <span className="text-[10px] sm:hidden">Tank</span>
          <span className="hidden sm:inline text-xs">Settings</span>
        </button>
      </div>
    </aside>
  );
};
