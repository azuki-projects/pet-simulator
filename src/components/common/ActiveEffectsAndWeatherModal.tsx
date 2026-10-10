import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { formatTime } from '../../utils/format';
import {
  X,
  CloudSun,
  Zap,
  Sparkles,
  Clock,
  ShieldCheck,
  Flame,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';

interface ActiveEffectsAndWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'effects' | 'weather';
}

export const ActiveEffectsAndWeatherModal: React.FC<ActiveEffectsAndWeatherModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'effects',
}) => {
  const {
    state,
    weather,
    weatherTimeRemaining,
    buyGemBuff,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'effects' | 'weather'>(defaultTab);
  const [now, setNow] = useState(Date.now());
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickActivate = (buffType: 'coin_2x' | 'luck_2x' | 'speed_2x' | 'instant_potion') => {
    const success = buyGemBuff(buffType);
    if (success) {
      setPurchaseNotice(
        buffType === 'instant_potion'
          ? 'Added 3 Instant Hatch Potions to your stash!'
          : `Activated 15-minute ${buffType.replace('_', ' ').toUpperCase()} boost!`
      );
      setTimeout(() => setPurchaseNotice(null), 3500);
    } else {
      setPurchaseNotice('Not enough gems! Earn gems via taps, codes, or arena.');
      setTimeout(() => setPurchaseNotice(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Active Effects & Realm Weather</h2>
              <p className="text-xs text-slate-400">Monitor live multipliers, active potions & forecast</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('effects')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'effects'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Active Potions & Buffs ({state.activeBuffs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'weather'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudSun className="w-4 h-4" />
            <span>Weather & Forecast</span>
          </button>
        </div>

        {/* Notification Toast */}
        {purchaseNotice && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{purchaseNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'effects' && (
            <>
              {/* Active Buffs List */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Currently Running Effects
                </h3>

                {state.activeBuffs.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    No active potion boosts running right now. Activate one below!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.activeBuffs.map((buff) => {
                      const remainingSec = Math.max(0, Math.floor((buff.endsAt - now) / 1000));
                      return (
                        <div
                          key={buff.id}
                          className="p-3 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-amber-500/40 flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">
                              {buff.type === 'coin_2x' ? '🪙' : buff.type === 'luck_2x' ? '🍀' : '⚡'}
                            </span>
                            <div>
                              <div className="text-xs font-black text-white flex items-center gap-1.5">
                                <span>{buff.name}</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                  x{buff.multiplier} Power
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {buff.type === 'coin_2x'
                                  ? 'Doubles all coin production & tap earnings'
                                  : buff.type === 'luck_2x'
                                  ? 'Doubles chance for high rarity egg drops'
                                  : 'Doubles hatching and movement speed'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-black text-sm text-amber-300">
                              {formatTime(remainingSec)}
                            </span>
                            <span className="block text-[9px] text-slate-500 uppercase font-bold">
                              remaining
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Instant Hatch Potions Stash */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🧪</span>
                  <div>
                    <h4 className="text-xs font-black text-white">Instant Hatch Potions</h4>
                    <p className="text-[10px] text-slate-400">
                      Skip any egg incubation countdown instantly in the Hatchery!
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-lg text-emerald-400">
                    {state.instantHatchPotions}
                  </span>
                  <span className="block text-[9px] text-slate-500 font-bold uppercase">in stash</span>
                </div>
              </div>

              {/* Quick Activate Potion Section */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                  Quick-Use Potion Apothecary
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 2x Coins Potion */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-300">🪙 2x Coins (15m)</span>
                        <span className="text-[10px] text-cyan-300 font-extrabold">50 Gems</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-3">
                        Doubles all passive income and lawn tap coin rewards.
                      </p>
                    </div>
                    <button
                      onClick={() => handleQuickActivate('coin_2x')}
                      className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                    >
                      Drink Potion
                    </button>
                  </div>

                  {/* 2x Luck Potion */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-300">🍀 2x Luck (15m)</span>
                        <span className="text-[10px] text-cyan-300 font-extrabold">50 Gems</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-3">
                        Doubles chances of rolling Epic, Legendary, Huge & Secret pets!
                      </p>
                    </div>
                    <button
                      onClick={() => handleQuickActivate('luck_2x')}
                      className="w-full py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                    >
                      Drink Potion
                    </button>
                  </div>

                  {/* 2x Speed Potion */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-sky-300">⚡ 2x Speed (15m)</span>
                        <span className="text-[10px] text-cyan-300 font-extrabold">50 Gems</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-3">
                        Eggs incubate 2x faster, and pet wandering speed doubles.
                      </p>
                    </div>
                    <button
                      onClick={() => handleQuickActivate('speed_2x')}
                      className="w-full py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                    >
                      Drink Potion
                    </button>
                  </div>

                  {/* 3x Instant Hatch Potions */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-purple-300">🧪 3x Instant Potions</span>
                        <span className="text-[10px] text-cyan-300 font-extrabold">30 Gems</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-3">
                        Instantly crack 3 eggs of any tier to zero seconds.
                      </p>
                    </div>
                    <button
                      onClick={() => handleQuickActivate('instant_potion')}
                      className="w-full py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                    >
                      Buy 3 Potions
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'weather' && (
            <>
              {/* Current Active Weather Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/50 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{weather.icon}</span>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400">
                        Current Realm Weather
                      </span>
                      <h3 className="text-base font-black text-white">{weather.name}</h3>
                      <p className="text-xs text-amber-200/90 font-semibold">{weather.buffText}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Rotates in
                    </span>
                    <span className="text-sm font-mono font-black text-amber-300">
                      {formatTime(weatherTimeRemaining)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  {weather.description}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block font-semibold">Coins</span>
                    <span className="text-amber-300 font-black text-xs">
                      {weather.coinMultiplier > 1
                        ? `+${Math.round((weather.coinMultiplier - 1) * 100)}%`
                        : 'Standard'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block font-semibold">Egg Luck</span>
                    <span className="text-emerald-300 font-black text-xs">
                      {weather.luckMultiplier > 1
                        ? `+${Math.round((weather.luckMultiplier - 1) * 100)}%`
                        : 'Standard'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block font-semibold">Arena Power</span>
                    <span className="text-red-300 font-black text-xs">
                      {weather.arenaMultiplier > 1
                        ? `+${Math.round((weather.arenaMultiplier - 1) * 100)}%`
                        : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weather System Info */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  About the 30-Minute Dynamic Weather System
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Every 30 minutes, the weather across the Azuki fence changes dynamically. Different
                  weather types bring unique advantages: Sunny boosts all coin earnings, Rainy blesses
                  incubators with rare hatch luck, and Fire Storm supercharges pet battle power!
                </p>
              </div>

              {/* Upcoming Weather Forecast */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Realm Weather Forecast
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">☀️</span>
                      <div>
                        <span className="font-bold text-white">Sunny Day</span>
                        <span className="block text-[10px] text-amber-300">+10% Coins from all sources</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Warm & Pleasant</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌧️</span>
                      <div>
                        <span className="font-bold text-white">Lucky Rain</span>
                        <span className="block text-[10px] text-emerald-300">+10% Egg Hatch Luck</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Rare Pet Blessings</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <div>
                        <span className="font-bold text-white">Fire Storm</span>
                        <span className="block text-[10px] text-orange-300">+25% All Coins & Arena Power</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">High Energy</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌸</span>
                      <div>
                        <span className="font-bold text-white">Sakura Breeze</span>
                        <span className="block text-[10px] text-pink-300">+15% Coins & +15% Luck</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Azuki Heritage</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌌</span>
                      <div>
                        <span className="font-bold text-white">Cosmic Eclipse</span>
                        <span className="block text-[10px] text-purple-300">+50% Secret & Titanic Luck</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Ancient Eclipse</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
