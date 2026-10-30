import React, { useState, useEffect, useCallback } from 'react';
import { AquariumTheme, FishInstance, InteractionTool, LightMode } from './types/aquarium';
import { AQUARIUM_THEMES } from './data/aquariumData';
import { createFishInstance, createInitialFishPopulation } from './utils/fishFactory';
import { audioEngine } from './utils/audioEngine';
import { TopBar } from './components/TopBar';
import { AquariumCanvas } from './components/AquariumCanvas';
import { ToolbarDeck } from './components/ToolbarDeck';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { FishInspectorModal } from './components/FishInspectorModal';
import { PopulationManagerModal } from './components/PopulationManagerModal';
import { EncyclopediaModal } from './components/EncyclopediaModal';

export default function App() {
  // Theme & Atmosphere State
  const [currentTheme, setCurrentTheme] = useState<AquariumTheme>(AQUARIUM_THEMES[0]);
  const [lightMode, setLightMode] = useState<LightMode>(AQUARIUM_THEMES[0].defaultLightMode);
  const [aeratorIntensity, setAeratorIntensity] = useState<number>(0.65);
  const [waterCurrentSpeed, setWaterCurrentSpeed] = useState<number>(1.0);
  const [tankCleanliness, setTankCleanliness] = useState<number>(98);

  // Active Tool & Mode
  const [activeTool, setActiveTool] = useState<InteractionTool>('feed');
  const [isToolbarExpanded, setIsToolbarExpanded] = useState<boolean>(false);
  const [foodCount, setFoodCount] = useState<number>(0);

  // Fish Population State
  const [fishList, setFishList] = useState<FishInstance[]>(() => createInitialFishPopulation());
  const [selectedFish, setSelectedFish] = useState<FishInstance | null>(null);

  // Modals & Navigation Tabs
  const [activeTab, setActiveTab] = useState<'aquarium' | 'themes' | 'population' | 'encyclopedia'>('aquarium');

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.5);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync aerator intensity with audio engine
  useEffect(() => {
    audioEngine.setAeratorIntensity(aeratorIntensity);
  }, [aeratorIntensity]);

  const handleToggleMute = () => {
    const nextMuted = audioEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleChangeVolume = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
    if (isMuted && newVol > 0) {
      audioEngine.setMuted(false);
      setIsMuted(false);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Quick Feed from Header CTA
  const handleQuickFeed = () => {
    setActiveTool('feed');
    // Drop food near top-center
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left + rect.width * (0.35 + Math.random() * 0.3),
        clientY: rect.top + 70 + Math.random() * 50,
        bubbles: true,
      });
      canvas.dispatchEvent(clickEvent);
    }
  };

  // Add individual fish
  const handleAddFish = (speciesId: string) => {
    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;
    const newFish = createFishInstance(speciesId, width, height);
    setFishList((prev) => [...prev, newFish]);
    audioEngine.playWaterPlop();
  };

  // Remove individual fish of a species
  const handleRemoveFish = (speciesId: string) => {
    setFishList((prev) => {
      const idx = prev.findIndex((f) => f.speciesId === speciesId);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  // Add a whole school
  const handleAddSchool = (speciesId: string, count: number) => {
    const width = window.innerWidth || 1200;
    const height = window.innerHeight || 800;
    const newMembers: FishInstance[] = [];
    for (let i = 0; i < count; i++) {
      newMembers.push(createFishInstance(speciesId, width, height));
    }
    setFishList((prev) => [...prev, ...newMembers]);
    audioEngine.playWaterPlop();
  };

  // Reset to default population
  const handleResetPopulation = () => {
    setFishList(createInitialFishPopulation());
    setSelectedFish(null);
  };

  // Feed specifically near selected fish
  const handleFeedNearFish = (fish: FishInstance) => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left + fish.x,
        clientY: rect.top + Math.max(50, fish.y - 40),
        bubbles: true,
      });
      canvas.dispatchEvent(clickEvent);
    }
  };

  // Switch Theme
  const handleSelectTheme = (theme: AquariumTheme) => {
    setCurrentTheme(theme);
    setLightMode(theme.defaultLightMode);
    setActiveTab('aquarium');
    audioEngine.playWaterPlop(150);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 font-sans">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <TopBar
        currentTheme={currentTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        volume={volume}
        onChangeVolume={handleChangeVolume}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fishCount={fishList.length}
        onQuickFeed={handleQuickFeed}
      />

      {/* Main Interactive Stage Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <AquariumCanvas
          currentTheme={currentTheme}
          lightMode={lightMode}
          aeratorIntensity={aeratorIntensity}
          waterCurrentSpeed={waterCurrentSpeed}
          activeTool={activeTool}
          fishList={fishList}
          setFishList={setFishList}
          selectedFishId={selectedFish?.id || null}
          onSelectFish={(fish) => setSelectedFish(fish)}
          foodCount={foodCount}
          setFoodCount={setFoodCount}
          tankCleanliness={tankCleanliness}
          setTankCleanliness={setTankCleanliness}
        />

        {/* Floating Bottom Toolbar Dock */}
        <ToolbarDeck
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          lightMode={lightMode}
          setLightMode={setLightMode}
          aeratorIntensity={aeratorIntensity}
          setAeratorIntensity={setAeratorIntensity}
          waterCurrentSpeed={waterCurrentSpeed}
          setWaterCurrentSpeed={setWaterCurrentSpeed}
          tankCleanliness={tankCleanliness}
          onCleanTank={() => {
            setTankCleanliness(100);
            audioEngine.playNibble();
          }}
          foodCount={foodCount}
          isExpanded={isToolbarExpanded}
          setIsExpanded={setIsToolbarExpanded}
        />

        {/* Selected Fish Inspector Overlay Card */}
        {selectedFish && (
          <FishInspectorModal
            fish={selectedFish}
            onClose={() => setSelectedFish(null)}
            onFeedNearFish={handleFeedNearFish}
          />
        )}
      </main>

      {/* Environment Theme Switcher Modal */}
      {activeTab === 'themes' && (
        <ThemeSelectorModal
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          onClose={() => setActiveTab('aquarium')}
        />
      )}

      {/* Population Manager Modal */}
      {activeTab === 'population' && (
        <PopulationManagerModal
          fishList={fishList}
          onAddFish={handleAddFish}
          onRemoveFish={handleRemoveFish}
          onAddSchool={handleAddSchool}
          onResetPopulation={handleResetPopulation}
          onClose={() => setActiveTab('aquarium')}
        />
      )}

      {/* Marine Encyclopedia Modal */}
      {activeTab === 'encyclopedia' && (
        <EncyclopediaModal
          onClose={() => setActiveTab('aquarium')}
          onAddFishToTank={(speciesId) => handleAddFish(speciesId)}
        />
      )}
    </div>
  );
}
