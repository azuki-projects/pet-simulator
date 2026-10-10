import React from 'react';
import { useGame } from '../../context/GameContext';
import {
  Sparkles,
  Egg,
  Backpack,
  Store,
  Swords,
  Gift,
  Flame,
  BookOpen,
} from 'lucide-react';

export type TabType =
  | 'field'
  | 'eggs'
  | 'inventory'
  | 'shop'
  | 'arena'
  | 'daily'
  | 'extras'
  | 'guides';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const { state } = useGame();

  // Badges calculation
  const readyEggsCount = state.incubator.filter((e) => e.isReady).length;
  const canSpinFree = Date.now() - state.lastDailySpinTimestamp > 24 * 60 * 60 * 1000;
  const canClaimDaily = !state.claimedToday;
  const dailyNotice = canSpinFree || canClaimDaily;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number | boolean }[] = [
    {
      id: 'field',
      label: 'Field',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'eggs',
      label: 'Eggs',
      icon: <Egg className="w-5 h-5" />,
      badge: readyEggsCount > 0 ? readyEggsCount : undefined,
    },
    {
      id: 'inventory',
      label: 'Pets',
      icon: <Backpack className="w-5 h-5" />,
      badge: state.inventory.length,
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: <Store className="w-5 h-5" />,
    },
    {
      id: 'arena',
      label: 'Arena',
      icon: <Swords className="w-5 h-5" />,
    },
    {
      id: 'daily',
      label: 'Rewards',
      icon: <Gift className="w-5 h-5" />,
      badge: dailyNotice,
    },
    {
      id: 'extras',
      label: 'Extras',
      icon: <Flame className="w-5 h-5" />,
    },
    {
      id: 'guides',
      label: 'Guides',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-amber-900/40 backdrop-blur-lg px-1 sm:px-4 py-1.5 shadow-2xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 min-w-[52px] sm:min-w-[64px] py-1 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 font-bold shadow-sm scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-extrabold rounded-full bg-rose-600 text-white shadow-sm ring-1 ring-slate-900">
                    {typeof tab.badge === 'number' ? tab.badge : '●'}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
