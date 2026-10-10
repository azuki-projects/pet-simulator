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
import { GlobalChat } from './components/chat/GlobalChat';

const GameContainer: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('field');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);
  const [trainingPetId, setTrainingPetId] = useState<string | null>(null);

  const {
    hatchRevealPet,
    clearHatchReveal,
    offlineSummary,
    clearOfflineSummary,
  } = useGame();

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top HUD */}
      <Header
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        onOpenGuides={() => setCurrentTab('guides')}
      />

      {/* Main Content Area - Fully touch scrollable on mobile */}
      <main
        className="flex-1 w-full overflow-y-auto overflow-x-hidden touch-pan-y"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {currentTab === 'field' && <GameField />}
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

      {/* Global Realm Live Chat (streams every 3 seconds) */}
      <GlobalChat />

      {/* Bottom Dock Navigation */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Welcome Screen with glowing ✨ made with Azuki ✨ badge */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        onOpenGuides={() => setCurrentTab('guides')}
      />

      {/* Rarity Hatch Reveal Modal */}
      <HatchRevealModal
        pet={hatchRevealPet}
        onClose={clearHatchReveal}
      />

      {/* Offline Earnings Summary Popup */}
      {offlineSummary && (
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
