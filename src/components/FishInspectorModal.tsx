import React from 'react';
import { X, Heart, Compass, MapPin, Sparkles, Utensils } from 'lucide-react';
import { FishInstance } from '../types/aquarium';
import { FISH_SPECIES_CATALOG } from '../data/aquariumData';

interface FishInspectorModalProps {
  fish: FishInstance;
  onClose: () => void;
  onFeedNearFish: (fish: FishInstance) => void;
}

const speciesCatalogMap = new Map(FISH_SPECIES_CATALOG.map((s) => [s.id, s]));

export const FishInspectorModal: React.FC<FishInspectorModalProps> = ({
  fish,
  onClose,
  onFeedNearFish,
}) => {
  const species = speciesCatalogMap.get(fish.speciesId);
  if (!species) return null;

  const depthLabel =
    fish.y < 200 ? 'Pelagic Surface Zone' : fish.y > 600 ? 'Benthic Substrate Layer' : 'Midwater Reef Realm';

  return (
    <div className="fixed bottom-20 right-6 z-40 w-84 bg-slate-950/92 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-5 text-slate-100 animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">{fish.name}</h3>
            <span className="text-xs text-cyan-400 font-mono">({species.name})</span>
          </div>
          <p className="text-xs text-slate-400 italic font-serif">
            {species.scientificName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Vital Metrics Grid (Tabular Numerals) */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 space-y-0.5">
          <span className="text-slate-400 text-[11px] block">Current Length</span>
          <span className="font-mono tabular-nums text-cyan-300 font-semibold text-sm">
            {(species.lengthCm * (fish.growthScale || 1.0)).toFixed(1)} cm
          </span>
          <span className="text-[10px] text-amber-300 block font-mono">
            {((fish.growthScale || 1.0) * 100).toFixed(0)}% Size · {fish.foodEatenCount || 0} Fed
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 space-y-0.5">
          <span className="text-slate-400 text-[11px] block">Swim Velocity</span>
          <span className="font-mono tabular-nums text-cyan-300 font-semibold text-sm">
            {(fish.speed * 2.2).toFixed(1)} cm/s
          </span>
          <span className="text-[10px] text-emerald-300 block">
            {species.temperament}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 space-y-0.5 col-span-2">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" /> Current Depth
          </span>
          <span className="font-mono tabular-nums text-slate-200 text-xs">
            {depthLabel} (Layer Z: {(fish.z * 100).toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Origin & Diet Info */}
      <div className="mt-3 space-y-1.5 text-xs text-slate-300">
        <div className="flex items-start gap-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{species.origin}</span>
        </div>
        <div className="flex items-start gap-1.5 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{species.diet}</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
        <button
          onClick={() => onFeedNearFish(fish)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors active:scale-95"
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Feed & Grow</span>
        </button>
        <button
          onClick={onClose}
          className="py-1.5 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
