import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Droplets } from 'lucide-react';
import { AquariumTheme } from '../types/aquarium';

interface TopBarProps {
  currentTheme: AquariumTheme;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  activeTab: 'aquarium' | 'themes' | 'population' | 'encyclopedia';
  setActiveTab: (tab: 'aquarium' | 'themes' | 'population' | 'encyclopedia') => void;
  fishCount: number;
  onQuickFeed: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTheme,
  isMuted,
  onToggleMute,
  volume,
  onChangeVolume,
  isFullscreen,
  onToggleFullscreen,
  activeTab,
  setActiveTab,
  fishCount,
  onQuickFeed,
}) => {
  return (
    <header className="relative z-30 flex items-center justify-between gap-8 px-6 py-3 bg-slate-950/80 backdrop-blur-md border-b border-white/10 text-slate-100 select-none">
      {/* Zone 1: Single text element Brand Zone */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
          Aquaria
        </span>
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
          <span>{currentTheme.name}</span>
          <span aria-hidden="true">·</span>
          <span>{fishCount} Residents</span>
          <span aria-hidden="true">·</span>
          <span>{currentTheme.waterTemperature}°C</span>
          <span aria-hidden="true">·</span>
          <span>pH {currentTheme.phLevel}</span>
        </div>
      </div>

      {/* Zone 2: 4 clean single-line navigation links/tabs */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('aquarium')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'aquarium' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Aquarium
        </button>
        <button
          onClick={() => setActiveTab('themes')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'themes' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Environments
        </button>
        <button
          onClick={() => setActiveTab('population')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'population' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Fish Roster
        </button>
        <button
          onClick={() => setActiveTab('encyclopedia')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'encyclopedia' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
          }`}
        >
          Encyclopedia
        </button>
      </nav>

      {/* Zone 3: 1 primary action + ambient sound & fullscreen affordances */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Ambient Underwater Sound Controller */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-white/5">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute underwater ambience' : 'Mute underwater ambience'}
            className="text-slate-400 hover:text-cyan-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          {!isMuted && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              aria-label="Aquarium audio volume"
              className="w-16 h-1 accent-cyan-400 bg-slate-700 rounded-lg cursor-pointer"
            />
          )}
        </div>

        {/* Fullscreen Mode */}
        <button
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-white/5 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onQuickFeed}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-500/20 active:scale-95"
        >
          <Droplets className="w-3.5 h-3.5 fill-current" />
          <span>Feed & Grow</span>
        </button>
      </div>
    </header>
  );
};
