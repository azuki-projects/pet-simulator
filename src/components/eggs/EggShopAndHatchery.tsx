import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { EGG_TIERS } from '../../data/eggs';
import { RARITIES } from '../../data/rarities';
import { formatNumber, formatTime } from '../../utils/format';
import {
  Egg,
  Flame,
  Zap,
  Clock,
  Sparkles,
  Info,
  FlaskConical,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const EggShopAndHatchery: React.FC = () => {
  const {
    state,
    buyEgg,
    warmEgg,
    hatchEggNow,
    useInstantHatchPotion,
  } = useGame();

  const [activeSubTab, setActiveSubTab] = useState<'shop' | 'hatchery'>('shop');
  const [selectedEggDetails, setSelectedEggDetails] = useState<string | null>(null);

  const readyEggs = state.incubator.filter((e) => e.isReady);
  const maxSlots = state.upgrades.incubatorSlots;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 pb-24 text-slate-100">
      {/* Top Toggle: Egg Shop vs Hatchery */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Egg className="w-7 h-7 text-amber-400" />
            <span>Incubator & Egg Market</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Hatch eggs to discover 35+ pet species with high-tier multipliers!
          </p>
        </div>

        {/* Sub-tab segmented control */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('shop')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeSubTab === 'shop'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Egg Shop (10 Tiers)
          </button>
          <button
            onClick={() => setActiveSubTab('hatchery')}
            className={`relative px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeSubTab === 'hatchery'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Hatchery</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-amber-300 border border-amber-500/40">
              {state.incubator.length}/{maxSlots}
            </span>
            {readyEggs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: EGG SHOP */}
      {activeSubTab === 'shop' && (
        <div>
          {/* Quick Incubator Capacity Banner */}
          <div className="mb-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">Nests Available:</span>
              <span className="font-semibold text-slate-300">
                {maxSlots - state.incubator.length} of {maxSlots} open
              </span>
            </div>
            {state.instantHatchPotions > 0 && (
              <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <span>🧪 Instant Potions:</span>
                <span className="font-bold">{state.instantHatchPotions}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EGG_TIERS.map((tier) => {
              const isUnlocked = state.totalCoinsEarned >= tier.unlockRequirementCoins;
              const canAfford = state.coins >= tier.cost;
              const hasFreeSlot = state.incubator.length < maxSlots;

              return (
                <div
                  key={tier.id}
                  className={`relative rounded-3xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 shadow-xl'
                      : 'bg-slate-950/60 border-slate-900 opacity-60'
                  }`}
                  style={{
                    boxShadow: isUnlocked ? `0 8px 30px -10px ${tier.glow}` : undefined,
                  }}
                >
                  {/* Card Header: Tier & Name */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner border"
                          style={{
                            backgroundColor: tier.color + '22',
                            borderColor: tier.color,
                            color: tier.color,
                          }}
                        >
                          🥚
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                            Tier {tier.tierIndex}
                          </div>
                          <h3 className="font-black text-lg text-white leading-tight">
                            {tier.name}
                          </h3>
                        </div>
                      </div>

                      {/* Info / Drop rates modal toggle */}
                      <button
                        onClick={() =>
                          setSelectedEggDetails(
                            selectedEggDetails === tier.id ? null : tier.id
                          )
                        }
                        className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                        title="View Drop Chances"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 min-h-[32px] line-clamp-2 mb-3">
                      {tier.description}
                    </p>

                    {/* Stats Strip: Cost & Hatch Time */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 mb-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Cost</span>
                        <span className="font-black text-amber-300 text-sm">
                          🪙 {formatNumber(tier.cost)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Hatch Duration</span>
                        <span className="font-bold text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-400" />
                          {formatTime(tier.hatchSeconds)}
                        </span>
                      </div>
                    </div>

                    {/* Drop Rates Breakdown Preview */}
                    <div className="space-y-1 mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Drop Rates:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(tier.dropRates).map(([rarity, rate]) => {
                          const rConfig = RARITIES[rarity as keyof typeof RARITIES];
                          return (
                            <span
                              key={rarity}
                              className="text-[10px] px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1"
                              style={{
                                color: rConfig?.color || '#fff',
                                borderColor: (rConfig?.color || '#fff') + '55',
                                backgroundColor: (rConfig?.color || '#fff') + '15',
                              }}
                            >
                              <span>{rarity}:</span>
                              <span className="font-bold">{rate}%</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Buy / Unlock Action Button */}
                  <div>
                    {!isUnlocked ? (
                      <div className="py-2.5 px-3 rounded-xl bg-slate-950 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Locked: {tier.unlockRequirementText}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const bought = buyEgg(tier.id);
                          if (bought) {
                            setActiveSubTab('hatchery');
                          }
                        }}
                        disabled={!canAfford || !hasFreeSlot}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          !hasFreeSlot
                            ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                            : canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-98'
                            : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {!hasFreeSlot ? (
                          'Nests Full (Upgrade Shop)'
                        ) : canAfford ? (
                          <>
                            <Egg className="w-4 h-4" />
                            <span>Buy Egg (🪙 {formatNumber(tier.cost)})</span>
                          </>
                        ) : (
                          'Need More Coins'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: HATCHERY */}
      {activeSubTab === 'hatchery' && (
        <div>
          {state.incubator.length === 0 ? (
            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-12 text-center max-w-lg mx-auto shadow-xl">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl mx-auto mb-4">
                🥚
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your Nests Are Empty!</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Purchase an egg from the Egg Shop to start incubation.
              </p>
              <button
                onClick={() => setActiveSubTab('shop')}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Browse Egg Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.incubator.map((egg) => {
                const tier = EGG_TIERS.find((t) => t.id === egg.eggTierId) || EGG_TIERS[0];
                const progressPct = Math.min(
                  100,
                  Math.max(
                    0,
                    100 - (egg.timeRemainingSeconds / egg.targetDurationSeconds) * 100
                  )
                );

                return (
                  <div
                    key={egg.id}
                    className={`rounded-3xl p-5 border bg-slate-900/90 transition-all shadow-xl flex flex-col justify-between ${
                      egg.isReady
                        ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div>
                      {/* Egg Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-inner ${
                              egg.isReady ? 'animate-bounce' : ''
                            }`}
                            style={{
                              backgroundColor: tier.color + '25',
                              borderColor: tier.color,
                            }}
                          >
                            🥚
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-white">
                              {tier.name}
                            </h3>
                            <span className="text-[11px] text-amber-400/90 font-medium">
                              {egg.isReady ? 'Ready to Hatch!' : 'Incubating...'}
                            </span>
                          </div>
                        </div>

                        {/* Warmed count badge */}
                        {egg.warmedCount > 0 && (
                          <div className="px-2 py-0.5 rounded-md bg-orange-950/70 border border-orange-500/40 text-[10px] text-orange-300 font-bold">
                            🔥 {egg.warmedCount * 3}s cut
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 mb-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Countdown & Percentage */}
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-4">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          {formatTime(egg.timeRemainingSeconds)}
                        </span>
                        <span className="text-amber-400 font-mono">
                          {Math.round(progressPct)}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {egg.isReady ? (
                        <button
                          onClick={() => hatchEggNow(egg.id)}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-400/30 animate-pulse flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-5 h-5 fill-slate-950" />
                          <span>HATCH EGG!</span>
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {/* Warm button (-3s per tap) */}
                          <button
                            onClick={() => warmEgg(egg.id)}
                            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/20 active:scale-90 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Cut 3 seconds off hatch timer"
                          >
                            <Flame className="w-4 h-4 fill-white" />
                            <span>Warm (-3s)</span>
                          </button>

                          {/* Instant Potion */}
                          <button
                            onClick={() => useInstantHatchPotion(egg.id)}
                            disabled={state.instantHatchPotions <= 0}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              state.instantHatchPotions > 0
                                ? 'bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 border border-cyan-500/40 cursor-pointer active:scale-95'
                                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                            }`}
                            title="Instant hatch using potion"
                          >
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span>Instant ({state.instantHatchPotions})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
