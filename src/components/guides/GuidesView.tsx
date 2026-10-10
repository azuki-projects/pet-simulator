import React from 'react';
import { RARITY_ORDER, RARITIES } from '../../data/rarities';
import { EGG_TIERS } from '../../data/eggs';
import { formatNumber } from '../../utils/format';
import { BookOpen, Sparkles, Flame, Layers, CloudSun, ShieldAlert, Award } from 'lucide-react';

export const GuidesView: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 pb-36 sm:pb-32 text-slate-100 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-amber-400" />
          <span>Game Guides & Master Strategy</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Everything you need to know about rarities, multipliers, egg incubation, weather buffs, and fusions.
        </p>
      </div>

      {/* SECTION 1: 12 RARITY TIERS BREAKDOWN TABLE */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>All 12 Pet Rarity Tiers & Multipliers</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Rarity Name</th>
                <th className="py-2.5 px-3">Multiplier</th>
                <th className="py-2.5 px-3">Field Presence & Aura</th>
                <th className="py-2.5 px-3">Primary Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {RARITY_ORDER.map((tier, idx) => {
                const cfg = RARITIES[tier];
                return (
                  <tr key={tier} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-bold">#{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border"
                        style={{
                          color: cfg.color,
                          borderColor: cfg.color + '55',
                          backgroundColor: cfg.color + '15',
                        }}
                      >
                        {tier}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-amber-300 tabular-nums">
                      {formatNumber(cfg.multiplier)}x
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {idx >= 10
                        ? 'Prismatic God Aura & Giant Sprite'
                        : idx >= 7
                        ? 'Cosmic Starlight & Special Radiance'
                        : idx === 5
                        ? 'Colossal 1.35x Sprite Size'
                        : idx === 6
                        ? 'Massive 1.65x Sprite Size'
                        : 'Standard Field Wanderer'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {idx <= 2
                        ? 'Starter & Spotted Eggs'
                        : idx <= 4
                        ? 'Forest & Ocean Eggs'
                        : idx <= 6
                        ? 'Desert & Volcanic Eggs'
                        : idx <= 8
                        ? 'Mystic & Celestial Eggs'
                        : 'Void & Primordial Eggs'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: WEATHER SYSTEM & ROTATING BUFFS */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-sky-400" />
          <span>Dynamic Realm Weather System (Shifts Every 30 Mins)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xl mb-1 block">☀️ Golden Sun</span>
            <span className="font-extrabold text-amber-400 text-xs block mb-1">+15% Coin Yields</span>
            <p className="text-[11px] text-slate-400">
              Increases all coin drops from lawn taps and passive income.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xl mb-1 block">🌧️ Mystic Rain</span>
            <span className="font-extrabold text-cyan-400 text-xs block mb-1">+25% Egg Hatch Luck</span>
            <p className="text-[11px] text-slate-400">
              Boosts roll weight of rare, epic, and legendary egg outcomes.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xl mb-1 block">🔥 Solar Flare</span>
            <span className="font-extrabold text-orange-400 text-xs block mb-1">+30% All Earnings & +20% Arena</span>
            <p className="text-[11px] text-slate-400">
              High-intensity solar surge maximizing income and vanguard attack.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xl mb-1 block">🌸 Azuki Sakura Blossom</span>
            <span className="font-extrabold text-rose-400 text-xs block mb-1">+20% CPS & +20% Gem Drops</span>
            <p className="text-[11px] text-slate-400">
              Blossom petals dance across the lawn, elevating ancestral fortunes.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xl mb-1 block">🌌 Cosmic Eclipse</span>
            <span className="font-extrabold text-purple-400 text-xs block mb-1">+50% Secret & Titanic Luck</span>
            <p className="text-[11px] text-slate-400">
              The rarest realm alignment; best time to hatch high-tier celestial eggs!
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: FUSION & TRAINING STRATEGIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fusion Tips */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
          <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Alchemical Pet Fusions</span>
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-white">3 Identical Pets:</strong> Transmutes 3 matching pets of the same species and rarity into 1 of the next higher tier!
            </li>
            <li>
              <strong className="text-amber-400">5 Identical Pets Super Fusion:</strong> Grants the next tier with a permanent <strong className="text-yellow-300">SHINY (2.5x CPS)</strong> multiplier!
            </li>
            <li>
              Always lock your strongest pets to prevent them from being used as fusion materials accidentally.
            </li>
          </ul>
        </div>

        {/* Rapid Progression Tips */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
          <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span>Fast Progression Pro-Tips</span>
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-white">Warm the Egg:</strong> Each tap on the warm button in the Hatchery takes 3 seconds off the timer. Rapid tapping hatches eggs in seconds!
            </li>
            <li>
              <strong className="text-white">Equip Upgrades:</strong> Prioritize Equip Slots in the Shop early; each added slot adds another full pet multiplier to your passive income.
            </li>
            <li>
              <strong className="text-white">Offline Earnings:</strong> Earn 50% passive income for up to 12 hours while the app is closed.
            </li>
            <li>
              <strong className="text-white">Secret Codes:</strong> Enter special redemption codes in the Extras or Welcome menu to claim exclusive pets, coins, and premium boosts!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
