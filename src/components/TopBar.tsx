import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Droplets, Menu, X, Compass, Users, BookOpen, Waves } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: 'aquarium' | 'themes' | 'population' | 'encyclopedia') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="relative z-30 flex items-center justify-between gap-2 sm:gap-8 px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-950/85 backdrop-blur-md border-b border-white/10 text-slate-100 select-none">
        {/* Zone 1: Brand Wordmark + Mobile Nav Toggle */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-300 hover:text-white bg-slate-900/80 rounded-xl border border-white/5 active:scale-95 transition-all"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <span className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
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

        {/* Zone 2: Desktop 4 clean single-line navigation links/tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleTabClick('aquarium')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'aquarium' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            Aquarium
          </button>
          <button
            onClick={() => handleTabClick('themes')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'themes' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            Environments
          </button>
          <button
            onClick={() => handleTabClick('population')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'population' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            Fish Roster
          </button>
          <button
            onClick={() => handleTabClick('encyclopedia')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'encyclopedia' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            Encyclopedia
          </button>
        </nav>

        {/* Zone 3: Actions + Audio & Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Ambient Underwater Sound Controller */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-2 sm:px-2.5 py-1.5 rounded-xl border border-white/5">
            <button
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute underwater ambience' : 'Mute underwater ambience'}
              className="p-1 min-w-[32px] min-h-[32px] flex items-center justify-center text-slate-400 hover:text-cyan-300 transition-colors"
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
                className="hidden sm:block w-16 h-1 accent-cyan-400 bg-slate-700 rounded-lg cursor-pointer"
              />
            )}
          </div>

          {/* Fullscreen Mode (hidden on very small viewports where OS handles fullscreen) */}
          <button
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="hidden xs:flex p-2 min-w-[36px] min-h-[36px] items-center justify-center text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-white/5 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onQuickFeed}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 min-h-[40px] text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all whitespace-nowrap shadow-sm shadow-cyan-500/20 active:scale-95"
          >
            <Droplets className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="hidden xs:inline">Feed & Grow</span>
            <span className="xs:hidden">Feed</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[53px] inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
            <button
              onClick={() => handleTabClick('aquarium')}
              className={`flex items-center gap-2 p-3 rounded-xl text-left text-xs font-medium transition-all ${
                activeTab === 'aquarium'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Aquarium</span>
            </button>
            <button
              onClick={() => handleTabClick('themes')}
              className={`flex items-center gap-2 p-3 rounded-xl text-left text-xs font-medium transition-all ${
                activeTab === 'themes'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Environments</span>
            </button>
            <button
              onClick={() => handleTabClick('population')}
              className={`flex items-center gap-2 p-3 rounded-xl text-left text-xs font-medium transition-all ${
                activeTab === 'population'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Fish Roster</span>
            </button>
            <button
              onClick={() => handleTabClick('encyclopedia')}
              className={`flex items-center gap-2 p-3 rounded-xl text-left text-xs font-medium transition-all ${
                activeTab === 'encyclopedia'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Encyclopedia</span>
            </button>
          </div>

          {/* Mobile Tank Telemetry Summary */}
          <div className="flex items-center justify-between pt-3 text-[11px] text-slate-400 font-mono tabular-nums">
            <span>{currentTheme.name}</span>
            <span>{fishCount} fish · {currentTheme.waterTemperature}°C · pH {currentTheme.phLevel}</span>
          </div>

          {/* Mobile Volume Control if unmuted */}
          {!isMuted && (
            <div className="flex items-center gap-3 pt-3 mt-2 border-t border-white/5">
              <span className="text-xs text-slate-400">Ambient Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                aria-label="Aquarium audio volume"
                className="flex-1 h-1.5 accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-cyan-400 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
