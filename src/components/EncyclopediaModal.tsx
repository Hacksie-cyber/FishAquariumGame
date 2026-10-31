import React, { useState } from 'react';
import { X, Globe, Sparkles, Fish, Shield } from 'lucide-react';
import { FishSpecies } from '../types/aquarium';
import { FISH_SPECIES_CATALOG } from '../data/aquariumData';

interface EncyclopediaModalProps {
  onClose: () => void;
  onAddFishToTank: (speciesId: string) => void;
}

export const EncyclopediaModal: React.FC<EncyclopediaModalProps> = ({
  onClose,
  onAddFishToTank,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'marine' | 'freshwater' | 'special'>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<FishSpecies>(FISH_SPECIES_CATALOG[0]);

  const filteredSpecies = FISH_SPECIES_CATALOG.filter((s) => {
    if (filterType === 'all') return true;
    return s.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[88vh] flex flex-col bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Aquatic Species Field Guide
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive biological profiles, natural habitats, and behavior
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

        {/* Filter bar (Segmented controls) */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-950/60 border-b border-white/5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 min-h-[36px] whitespace-nowrap shrink-0 text-xs font-medium rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Residents ({FISH_SPECIES_CATALOG.length})
          </button>
          <button
            onClick={() => setFilterType('marine')}
            className={`px-3 py-1.5 min-h-[36px] whitespace-nowrap shrink-0 text-xs font-medium rounded-lg transition-colors ${
              filterType === 'marine'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Marine Reef
          </button>
          <button
            onClick={() => setFilterType('freshwater')}
            className={`px-3 py-1.5 min-h-[36px] whitespace-nowrap shrink-0 text-xs font-medium rounded-lg transition-colors ${
              filterType === 'freshwater'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Freshwater Flora
          </button>
          <button
            onClick={() => setFilterType('special')}
            className={`px-3 py-1.5 min-h-[36px] whitespace-nowrap shrink-0 text-xs font-medium rounded-lg transition-colors ${
              filterType === 'special'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gentle Giants
          </button>
        </div>

        {/* Body Split View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Species List */}
          <div className="md:col-span-5 overflow-y-auto p-3 sm:p-4 space-y-2 border-b md:border-b-0 md:border-r border-white/10 max-h-[28vh] md:max-h-[60vh]">
            {filteredSpecies.map((species) => {
              const isSelected = species.id === selectedSpecies.id;
              return (
                <div
                  key={species.id}
                  onClick={() => setSelectedSpecies(species)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{species.name}</h4>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: species.primaryColor }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 italic font-serif mt-0.5">
                    {species.scientificName}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                    <span>{species.temperament}</span>
                    <span aria-hidden="true">·</span>
                    <span>{species.lengthCm} cm</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Species Deep-Dive Profile */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-5 max-h-[60vh]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{selectedSpecies.name}</h3>
                <span className="text-xs text-cyan-400 font-mono">
                  {selectedSpecies.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 italic font-serif mt-0.5">
                {selectedSpecies.scientificName}
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedSpecies.description}
            </p>

            {/* Trait Matrix */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Geographic Origin
                </span>
                <span className="text-white font-medium block">
                  {selectedSpecies.origin}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Natural Diet
                </span>
                <span className="text-white font-medium block">
                  {selectedSpecies.diet}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Temperament & Schooling
                </span>
                <span className="text-white font-medium block">
                  {selectedSpecies.temperament} · {selectedSpecies.isSchooling ? 'Schooling Shoal' : 'Solitary / Pair'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Fish className="w-3.5 h-3.5 text-indigo-400" /> Mature Length & Stratum
                </span>
                <span className="text-white font-medium block">
                  {selectedSpecies.lengthCm} cm · {selectedSpecies.preferredDepth}
                </span>
              </div>
            </div>

            {/* Action to add this species to current tank */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onAddFishToTank(selectedSpecies.id);
                  onClose();
                }}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-md shadow-cyan-500/20"
              >
                Spawn {selectedSpecies.name} in Aquarium
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
