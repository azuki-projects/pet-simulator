import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatNumber } from '../../utils/format';
import {
  Store,
  ArrowUpCircle,
  Package,
  Zap,
  Sparkles,
  Clock,
  Layers,
  Flame,
  Check,
} from 'lucide-react';

export const ShopView: React.FC = () => {
  const {
    state,
    buyUpgrade,
    buyMysteryBox,
    buyGemBuff,
  } = useGame();

  const [mysteryResult, setMysteryResult] = useState<string | null>(null);

  const handleMystery = (tier: 'bronze' | 'silver' | 'gold') => {
    const res = buyMysteryBox(tier);
    if (res.type === 'success') {
      setMysteryResult(`🎁 You received: ${res.rewardText}`);
      setTimeout(() => setMysteryResult(null), 4000);
    }
  };

  const UPGRADE_CONFIGS = [
    {
      key: 'equipSlots' as const,
      title: 'Equip Slots',
      desc: 'Equip more pets to multiply lawn passive income.',
      level: state.upgrades.equipSlots,
      maxLevel: 8,
      cost: Math.round(5000 * Math.pow(4, state.upgrades.equipSlots - 3)),
      icon: '🐾',
      isMax: state.upgrades.equipSlots >= 8,
    },
    {
      key: 'incubatorSlots' as const,
      title: 'Incubator Nests',
      desc: 'Increase simultaneous egg holding capacity.',
      level: state.upgrades.incubatorSlots,
      maxLevel: 8,
      cost: Math.round(3000 * Math.pow(3.5, state.upgrades.incubatorSlots - 3)),
      icon: '🥚',
      isMax: state.upgrades.incubatorSlots >= 8,
    },
    {
      key: 'hatchSpeedLevel' as const,
      title: 'Hatch Speed',
      desc: '+15% faster egg timer progression per rank.',
      level: state.upgrades.hatchSpeedLevel,
      maxLevel: 10,
      cost: Math.round(750 * Math.pow(2.5, state.upgrades.hatchSpeedLevel)),
      icon: '⚡',
      isMax: state.upgrades.hatchSpeedLevel >= 10,
    },
    {
      key: 'luckLevel' as const,
      title: 'Egg Hatch Luck',
      desc: '+10% chance to roll rare, epic & legendary tiers.',
      level: state.upgrades.luckLevel,
      maxLevel: 10,
      cost: Math.round(1000 * Math.pow(2.8, state.upgrades.luckLevel)),
      icon: '🍀',
      isMax: state.upgrades.luckLevel >= 10,
    },
    {
      key: 'tapPowerLevel' as const,
      title: 'Lawn Tap Power',
      desc: 'Doubles base coin yields per lawn tap.',
      level: state.upgrades.tapPowerLevel,
      maxLevel: 10,
      cost: Math.round(500 * Math.pow(2.2, state.upgrades.tapPowerLevel)),
      icon: '👆',
      isMax: state.upgrades.tapPowerLevel >= 10,
    },
    {
      key: 'autoHatcher' as const,
      title: 'Auto-Hatcher Device',
      desc: 'Automatically cracks ready eggs the moment timers finish.',
      level: state.upgrades.autoHatcher ? 1 : 0,
      maxLevel: 1,
      cost: 250000,
      icon: '🤖',
      isMax: state.upgrades.autoHatcher,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 pb-24 text-slate-100">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <Store className="w-7 h-7 text-amber-400" />
          <span>General Store & Upgrades</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Permanent statistical enhancements, mystery loot chests, and premium gem boosts.
        </p>
      </div>

      {mysteryResult && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-200 font-bold text-center text-sm shadow-lg animate-in zoom-in-95">
          {mysteryResult}
        </div>
      )}

      {/* SECTION 1: PERMANENT UPGRADES */}
      <div className="mb-8">
        <h3 className="text-base font-extrabold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ArrowUpCircle className="w-4 h-4" />
          <span>Permanent Base Upgrades (Coins)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {UPGRADE_CONFIGS.map((up) => {
            const canAfford = state.coins >= up.cost;

            return (
              <div
                key={up.key}
                className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{up.icon}</span>
                      <h4 className="font-extrabold text-sm text-white">{up.title}</h4>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold border border-slate-700">
                      {up.isMax ? 'MAX' : `Lv.${up.level}/${up.maxLevel}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{up.desc}</p>
                </div>

                <button
                  onClick={() => buyUpgrade(up.key)}
                  disabled={up.isMax || !canAfford}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    up.isMax
                      ? 'bg-slate-800 text-emerald-400 cursor-default'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {up.isMax ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Maxed Out</span>
                    </>
                  ) : (
                    <span>
                      Upgrade (🪙 {formatNumber(up.cost)})
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 3 TIERS OF MYSTERY BOXES */}
      <div className="mb-8">
        <h3 className="text-base font-extrabold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span>3 Tiers of Mystery Boxes</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Bronze Box */}
          <div className="bg-gradient-to-b from-amber-950/40 to-slate-900 rounded-3xl p-5 border border-amber-700/50 text-center shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-900/40 border border-amber-600/40 flex items-center justify-center text-3xl mx-auto mb-3">
                📦
              </div>
              <h4 className="font-extrabold text-lg text-amber-300">Bronze Mystery Box</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Contains starter coins, gems, or Rare pets!
              </p>
            </div>
            <button
              onClick={() => handleMystery('bronze')}
              disabled={state.coins < 2500}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md active:scale-95 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
            >
              Open (🪙 2,500)
            </button>
          </div>

          {/* Silver Box */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-5 border border-slate-400/50 text-center shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-500/40 flex items-center justify-center text-3xl mx-auto mb-3">
                🎁
              </div>
              <h4 className="font-extrabold text-lg text-slate-200">Silver Mystery Box</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                100k+ coins, Epic pets, or Legendary beasts!
              </p>
            </div>
            <button
              onClick={() => handleMystery('silver')}
              disabled={state.gems < 40}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md active:scale-95 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
            >
              Open (💎 40 Gems)
            </button>
          </div>

          {/* Gold Azuki Box */}
          <div className="bg-gradient-to-b from-amber-900/60 to-rose-950/60 rounded-3xl p-5 border border-amber-400 text-center shadow-xl flex flex-col justify-between ring-1 ring-amber-400/50">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-3xl mx-auto mb-3 animate-pulse">
                👑
              </div>
              <h4 className="font-extrabold text-lg text-amber-300">Gold Azuki Relic</h4>
              <p className="text-xs text-amber-200/80 mt-1 mb-4">
                Millions of coins, Huge pets, or Titanic beasts!
              </p>
            </div>
            <button
              onClick={() => handleMystery('gold')}
              disabled={state.gems < 150}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
            >
              Open (💎 150 Gems)
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: GEM BUFF STORE */}
      <div>
        <h3 className="text-base font-extrabold text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>Gem Store (Timed Boosts & Potions)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 2x Coins */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1">💰</div>
              <h4 className="font-bold text-sm text-white">2x Coins Potion</h4>
              <p className="text-xs text-slate-400 mb-3">Doubles all passive income for 15 minutes.</p>
            </div>
            <button
              onClick={() => buyGemBuff('coin_2x')}
              disabled={state.gems < 50}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
            >
              Buy (💎 50)
            </button>
          </div>

          {/* 2x Luck */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1">🍀</div>
              <h4 className="font-bold text-sm text-white">Super Luck Elixir</h4>
              <p className="text-xs text-slate-400 mb-3">Doubles high-rarity egg rolls for 15 minutes.</p>
            </div>
            <button
              onClick={() => buyGemBuff('luck_2x')}
              disabled={state.gems < 50}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
            >
              Buy (💎 50)
            </button>
          </div>

          {/* 2x Speed */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1">⚡</div>
              <h4 className="font-bold text-sm text-white">Hyper Speed Tonic</h4>
              <p className="text-xs text-slate-400 mb-3">Doubles incubator hatch rate for 15 minutes.</p>
            </div>
            <button
              onClick={() => buyGemBuff('speed_2x')}
              disabled={state.gems < 50}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
            >
              Buy (💎 50)
            </button>
          </div>

          {/* Instant Potions */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1">🧪</div>
              <h4 className="font-bold text-sm text-white">3x Instant Hatch</h4>
              <p className="text-xs text-slate-400 mb-3">Immediately cracks 3 incubating eggs!</p>
            </div>
            <button
              onClick={() => buyGemBuff('instant_potion')}
              disabled={state.gems < 30}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
            >
              Buy (💎 30)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
