import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/common/Header';
import { Navigation, TabType } from './components/common/Navigation';
import { GameField } from './components/field/GameField';
import { EggShopAndHatchery } from './components/eggs/EggShopAndHatchery';
import { InventoryView } from './components/inventory/InventoryView';
import { ShopView } from './components/shop/ShopView';
import { BattleArenaView } from './components/arena/BattleArenaView';
import { DailyRewardsView } from './components/daily/DailyRewardsView';
import { ExtrasView } from './components/extras/ExtrasView';
import { GuidesView } from './components/guides/GuidesView';
import { WelcomeModal } from './components/welcome/WelcomeModal';
import { HatchRevealModal } from './components/eggs/HatchRevealModal';
import { OfflineModal } from './components/offline/OfflineModal';
import { TrainingModal } from './components/training/TrainingModal';
import { LoadingScreen } from './components/common/LoadingScreen';
import { ActiveEffectsAndWeatherModal } from './components/common/ActiveEffectsAndWeatherModal';
import { MiniGamesModal } from './components/minigames/MiniGamesModal';

const GameContainer: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('field');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trainingPetId, setTrainingPetId] = useState<string | null>(null);
  const [activeEffectsTab, setActiveEffectsTab] = useState<'effects' | 'weather' | null>(null);
  const [isMiniGamesOpen, setIsMiniGamesOpen] = useState(false);

  const {
    hatchRevealPet,
    clearHatchReveal,
    offlineSummary,
    clearOfflineSummary,
  } = useGame();

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // If not first time, keep welcome closed, else user can open from header
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* INITIAL LOADING SCREEN */}
      {isLoading && <LoadingScreen onLoaded={handleLoadingComplete} />}

      {/* Top HUD */}
      <Header
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        onOpenGuides={() => setCurrentTab('guides')}
        onOpenActiveEffects={(tab) => setActiveEffectsTab(tab || 'effects')}
        onOpenMiniGames={() => setIsMiniGamesOpen(true)}
      />

      {/* Main Content Area - Fully touch scrollable on mobile */}
      <main
        className="flex-1 w-full overflow-y-auto overflow-x-hidden touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {currentTab === 'field' && (
          <GameField
            onOpenMiniGames={() => setIsMiniGamesOpen(true)}
            onOpenActiveEffects={() => setActiveEffectsTab('effects')}
          />
        )}
        {currentTab === 'eggs' && <EggShopAndHatchery />}
        {currentTab === 'inventory' && (
          <InventoryView onOpenTraining={(petId) => setTrainingPetId(petId)} />
        )}
        {currentTab === 'shop' && <ShopView />}
        {currentTab === 'arena' && <BattleArenaView />}
        {currentTab === 'daily' && <DailyRewardsView />}
        {currentTab === 'extras' && <ExtrasView />}
        {currentTab === 'guides' && <GuidesView />}
      </main>

      {/* Bottom Dock Navigation */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Welcome Screen with glowing ✨ made with Azuki ✨ badge */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        onOpenGuides={() => setCurrentTab('guides')}
      />

      {/* Active Potions & Realm Weather Popup */}
      <ActiveEffectsAndWeatherModal
        isOpen={activeEffectsTab !== null}
        defaultTab={activeEffectsTab || 'effects'}
        onClose={() => setActiveEffectsTab(null)}
      />

      {/* Mini-Games Arcade Modal */}
      <MiniGamesModal
        isOpen={isMiniGamesOpen}
        onClose={() => setIsMiniGamesOpen(false)}
        onOpenTraining={() => setCurrentTab('inventory')}
      />

      {/* Rarity Hatch Reveal Modal */}
      <HatchRevealModal
        pet={hatchRevealPet}
        onClose={clearHatchReveal}
      />

      {/* Offline Earnings Summary Popup (shown after loading if offline progress occurred) */}
      {!isLoading && offlineSummary && (
        <OfflineModal
          secondsAway={offlineSummary.secondsAway}
          coinsEarned={offlineSummary.coinsEarned}
          onClose={clearOfflineSummary}
        />
      )}

      {/* Pet Training Fast-Tap Mini-Game Modal */}
      {trainingPetId && (
        <TrainingModal
          petId={trainingPetId}
          onClose={() => setTrainingPetId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
