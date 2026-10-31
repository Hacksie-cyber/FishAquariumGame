import React from 'react';
import { X, Plus, Minus, RotateCcw, Users } from 'lucide-react';
import { FishInstance, FishSpecies } from '../types/aquarium';
import { FISH_SPECIES_CATALOG } from '../data/aquariumData';

interface PopulationManagerModalProps {
  fishList: FishInstance[];
  onAddFish: (speciesId: string) => void;
  onRemoveFish: (speciesId: string) => void;
  onAddSchool: (speciesId: string, count: number) => void;
  onResetPopulation: () => void;
  onClose: () => void;
}

export const PopulationManagerModal: React.FC<PopulationManagerModalProps> = ({
  fishList,
  onAddFish,
  onRemoveFish,
  onAddSchool,
  onResetPopulation,
  onClose,
}) => {
  // Count instances of each species
  const countsBySpecies = fishList.reduce<Record<string, number>>((acc, f) => {
    acc[f.speciesId] = (acc[f.speciesId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Aquarium Population Roster
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{fishList.length} Residents</span>
              <span aria-hidden="true">·</span>
              <span>Capacity: Healthy</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Batch Spawners */}
        <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
          <span className="text-slate-400 font-medium">Quick Populate:</span>
          <button
            onClick={() => onAddSchool('neon-tetra', 5)}
            className="px-3 py-1.5 min-h-[36px] flex items-center bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition-colors active:scale-95"
          >
            + School of 5 Tetras
          </button>
          <button
            onClick={() => onAddSchool('clownfish', 2)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-300 rounded-lg transition-colors"
          >
            + Pair of Clownfish
          </button>
          <button
            onClick={onResetPopulation}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tank</span>
          </button>
        </div>

        {/* Species List */}
        <div className="space-y-2 mt-4">
          {FISH_SPECIES_CATALOG.map((species: FishSpecies) => {
            const count = countsBySpecies[species.id] || 0;
            return (
              <div
                key={species.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Species Info */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: species.primaryColor }}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {species.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="italic font-serif">{species.scientificName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{species.temperament}</span>
                      <span aria-hidden="true">·</span>
                      <span>{species.lengthCm} cm</span>
                    </div>
                  </div>
                </div>

                {/* Counter & Controls */}
                <div className="flex items-center gap-3">
                  <span className="font-mono tabular-nums text-sm font-bold text-cyan-300 w-6 text-center">
                    {count}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRemoveFish(species.id)}
                      disabled={count === 0}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-300 hover:text-white disabled:text-slate-600 bg-slate-700/60 hover:bg-slate-700 disabled:bg-slate-800/30 rounded-lg transition-colors active:scale-95"
                      title="Remove one fish"
                      aria-label={`Remove one ${species.name}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onAddFish(species.id)}
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-colors active:scale-95"
                      title="Add one fish"
                      aria-label={`Add one ${species.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
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
