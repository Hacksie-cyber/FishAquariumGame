import React from 'react';
import { X, Check, Thermometer, Droplet, Sparkles } from 'lucide-react';
import { AquariumTheme, AquariumThemeId } from '../types/aquarium';
import { AQUARIUM_THEMES } from '../data/aquariumData';

interface ThemeSelectorModalProps {
  currentTheme: AquariumTheme;
  onSelectTheme: (theme: AquariumTheme) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  currentTheme,
  onSelectTheme,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Aquarium Environments
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an authentic underwater backdrop and water ecosystem
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
          {AQUARIUM_THEMES.map((theme) => {
            const isSelected = theme.id === currentTheme.id;
            return (
              <div
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`group relative overflow-hidden rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400/30 bg-slate-800/80'
                    : 'border-white/10 hover:border-white/20 bg-slate-900/60 hover:bg-slate-800/50'
                }`}
              >
                {/* Backdrop Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={theme.imagePath}
                    alt={theme.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Category unboxed text */}
                  <div className="absolute top-3 left-3 text-xs font-medium text-white/90 drop-shadow-md">
                    {theme.category}
                  </div>

                  {/* Active Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-cyan-500 text-slate-950 rounded-lg text-xs font-semibold shadow-md">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {theme.description}
                  </p>

                  {/* Water Parameters (Unboxed metadata with separators) */}
                  <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400 font-mono tabular-nums border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-cyan-400" />
                      {theme.waterTemperature}°C
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-cyan-400" />
                      pH {theme.phLevel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {theme.salinity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
