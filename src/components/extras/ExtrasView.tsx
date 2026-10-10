import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ACHIEVEMENTS } from '../../data/achievements';
import { SIGIL_REGISTRY, SIGIL_MAP } from '../../data/sigils';
import { RARITIES } from '../../data/rarities';
import { formatNumber } from '../../utils/format';
import {
  KeyRound,
  Trophy,
  RefreshCcw,
  Sparkles,
  Settings,
  ShieldCheck,
  Check,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  ListTodo,
} from 'lucide-react';

export const ExtrasView: React.FC = () => {
  const {
    state,
    redeemCode,
    claimAchievement,
    claimQuest,
    performRebirth,
    toggleEquipSigil,
    updateSettings,
    resetAllProgress,
  } = useGame();

  const [activeSubTab, setActiveSubTab] = useState<'codes' | 'achievements' | 'rebirth' | 'sigils' | 'quests' | 'settings'>('codes');

  // Codes state
  const [codeInput, setCodeInput] = useState('');
  const [codeFeedback, setCodeFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Rebirth calculation
  const nextRebirthCost = Math.round(250000 * Math.pow(state.rebirths + 1, 2.2));
  const canRebirth = state.coins >= nextRebirthCost;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    const res = redeemCode(codeInput);
    setCodeFeedback(res);
    if (res.success) {
      setCodeInput('');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 pb-36 sm:pb-32 text-slate-100">
      {/* Title & Sub-tabs */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 mb-1">
          <Sparkles className="w-7 h-7 text-amber-400" />
          <span>Extras, Codes & Progression</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Redeem secret codes, claim 28 achievements, perform rebirths, and manage your sigils.
        </p>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl scrollbar-none">
          <button
            onClick={() => setActiveSubTab('codes')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              activeSubTab === 'codes' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Redeem Codes
          </button>
          <button
            onClick={() => setActiveSubTab('achievements')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              activeSubTab === 'achievements' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Achievements ({state.claimedAchievements.length}/{ACHIEVEMENTS.length})
          </button>
          <button
            onClick={() => setActiveSubTab('quests')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              activeSubTab === 'quests' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quests
          </button>
          <button
            onClick={() => setActiveSubTab('rebirth')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              activeSubTab === 'rebirth' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rebirth Chamber
          </button>
          <button
            onClick={() => setActiveSubTab('sigils')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              activeSubTab === 'sigils' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sigil Relics
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
              activeSubTab === 'settings' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: REDEEM CODES */}
      {activeSubTab === 'codes' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-3xl mx-auto mb-3">
              🎟️
            </div>
            <h3 className="text-xl font-black text-white">Secret Redemption Codes</h3>
            <p className="text-xs text-slate-400 mt-1">
              Codes are case-insensitive and can be claimed once per save file.
            </p>
          </div>

          <form onSubmit={handleRedeem} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter redemption code..."
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase text-sm focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all cursor-pointer shadow-md"
              >
                Claim
              </button>
            </div>

            {codeFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  codeFeedback.success
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                }`}
              >
                {codeFeedback.success ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{codeFeedback.message}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* SUB-TAB 2: ACHIEVEMENTS */}
      {activeSubTab === 'achievements' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const isClaimed = state.claimedAchievements.includes(ach.id);

              let currentVal = 0;
              if (ach.category === 'hatch') currentVal = state.totalEggsHatched;
              if (ach.category === 'taps') currentVal = state.totalTaps;
              if (ach.category === 'coins') currentVal = state.totalCoinsEarned;
              if (ach.category === 'pets') currentVal = state.inventory.length;
              if (ach.category === 'arena') currentVal = state.totalArenaWins;
              if (ach.category === 'fusion') currentVal = state.totalFusions;
              if (ach.category === 'rebirth') currentVal = state.rebirths;

              const isUnlocked = currentVal >= ach.targetValue;
              const progressPct = Math.min(100, Math.round((currentVal / ach.targetValue) * 100));

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isClaimed
                      ? 'bg-slate-950/40 border-slate-900 opacity-60'
                      : isUnlocked
                      ? 'bg-amber-950/40 border-amber-500/50 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className={`w-4 h-4 ${isUnlocked ? 'text-amber-400' : 'text-slate-600'}`} />
                      <h4 className="font-extrabold text-sm text-white">{ach.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{ach.description}</p>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden mb-1">
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatNumber(currentVal)} / {formatNumber(ach.targetValue)} ({progressPct}%)
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[11px] font-bold text-amber-300 mb-1.5">
                      {ach.rewardCoins && <div>+🪙 {formatNumber(ach.rewardCoins)}</div>}
                      {ach.rewardGems && <div>+💎 {ach.rewardGems}</div>}
                    </div>

                    <button
                      onClick={() => claimAchievement(ach.id)}
                      disabled={isClaimed || !isUnlocked}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isClaimed
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : isUnlocked
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md animate-pulse active:scale-95'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {isClaimed ? 'Claimed' : isUnlocked ? 'Claim!' : 'Locked'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: QUESTS */}
      {activeSubTab === 'quests' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.quests.map((q) => {
              const progressPct = Math.min(100, Math.round((q.current / q.target) * 100));

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    q.claimed
                      ? 'bg-slate-950/40 border-slate-900 opacity-60'
                      : q.completed
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md ring-1 ring-emerald-400/40'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ListTodo className={`w-4 h-4 ${q.completed ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <h4 className="font-extrabold text-sm text-white">{q.title}</h4>
                      {q.isWeekly && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-300 font-bold border border-purple-500/40">
                          WEEKLY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{q.description}</p>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden mb-1">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {q.current} / {q.target} ({progressPct}%)
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[11px] font-bold text-amber-300 mb-1.5">
                      <div>+🪙 {formatNumber(q.rewardCoins)}</div>
                      <div>+💎 {q.rewardGems}</div>
                    </div>

                    <button
                      onClick={() => claimQuest(q.id)}
                      disabled={q.claimed || !q.completed}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        q.claimed
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : q.completed
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md animate-pulse active:scale-95'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {q.claimed ? 'Claimed' : q.completed ? 'Claim!' : 'In Progress'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: REBIRTH CHAMBER */}
      {activeSubTab === 'rebirth' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-4xl mx-auto mb-4 animate-pulse">
            ⭐
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Rebirth Chamber</h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Reset current coins to permanently elevate your spiritual multiplier. Locked and equipped pets remain safe!
          </p>

          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-6 space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Rebirths:</span>
              <span className="font-extrabold text-purple-400">{state.rebirths}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Multiplier:</span>
              <span className="font-extrabold text-amber-300">
                {(1 + state.rebirths * 0.5).toFixed(1)}x
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">After Rebirth Multiplier:</span>
              <span className="font-extrabold text-emerald-400">
                {(1 + (state.rebirths + 1) * 0.5).toFixed(1)}x (+50%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Rebirth Gem Bonus:</span>
              <span className="font-extrabold text-cyan-300">
                +💎 {150 * (state.rebirths + 1)} Gems
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800">
              <span className="text-slate-300 font-bold">Required Coins:</span>
              <span className="font-black text-amber-300">
                🪙 {formatNumber(nextRebirthCost)}
              </span>
            </div>
          </div>

          <button
            onClick={performRebirth}
            disabled={!canRebirth}
            className={`w-full py-4 rounded-2xl font-black text-base tracking-wide shadow-xl transition-all cursor-pointer ${
              canRebirth
                ? 'bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-purple-600/30 active:scale-95 animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {canRebirth ? 'ASCEND NOW (PERFORM REBIRTH)' : 'NEED MORE COINS TO REBIRTH'}
          </button>
        </div>
      )}

      {/* SUB-TAB 5: SIGILS */}
      {activeSubTab === 'sigils' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-white">Sigil Relics System</h3>
              <p className="text-xs text-slate-400">
                Equip up to 3 mystical sigils for global passive income, tap, luck, and arena attack boosts.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-300 px-3 py-1 bg-slate-950 rounded-full border border-slate-800">
              Equipped: {state.equippedSigilIds.length} / 3
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.ownedSigils.map((sigil) => {
              const isEquipped = state.equippedSigilIds.includes(sigil.id);

              return (
                <div
                  key={sigil.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400 shadow-md'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">{sigil.icon}</span>
                      <span
                        className="text-[10px] font-bold uppercase"
                        style={{ color: RARITIES[sigil.rarity].color }}
                      >
                        {sigil.rarity}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-white mb-1">{sigil.name}</h4>
                    <p className="text-xs text-slate-400 mb-4">{sigil.description}</p>
                  </div>

                  <button
                    onClick={() => toggleEquipSigil(sigil.id)}
                    className={`w-full py-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                      isEquipped
                        ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                        : state.equippedSigilIds.length < 3
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped ? 'Unequip Relic' : 'Equip Relic'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl max-w-lg mx-auto space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Game Settings</span>
          </h3>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="font-bold text-sm text-white block">Synthesized Sound Effects</span>
              <span className="text-xs text-slate-400">Procedural Web Audio API sound generator</span>
            </div>
            <button
              onClick={() => updateSettings({ soundEnabled: !state.settings.soundEnabled })}
              className={`p-2 rounded-lg font-bold text-xs cursor-pointer ${
                state.settings.soundEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {state.settings.soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Auto-Hatch Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="font-bold text-sm text-white block">Auto-Hatch Ready Eggs</span>
              <span className="text-xs text-slate-400">
                {state.upgrades.autoHatcher ? 'Auto-cracks 0s eggs' : 'Requires Auto-Hatcher upgrade in Shop'}
              </span>
            </div>
            <button
              onClick={() => updateSettings({ autoHatchEnabled: !state.settings.autoHatchEnabled })}
              disabled={!state.upgrades.autoHatcher}
              className={`p-2 rounded-lg font-bold text-xs ${
                state.settings.autoHatchEnabled && state.upgrades.autoHatcher
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {state.settings.autoHatchEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Pet Size on Fence Setting */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-white block">Pet Size on Fence</span>
                <span className="text-xs text-slate-400">
                  Scale pet avatar sizes in the grass play area
                </span>
              </div>
              <span className="text-xs font-bold text-amber-300 capitalize">
                {state.settings.petScale || 'medium'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(
                [
                  { id: 'small', label: 'Small (75%)' },
                  { id: 'medium', label: 'Normal (100%)' },
                  { id: 'large', label: 'Large (135%)' },
                  { id: 'giant', label: 'Giant (175%)' },
                ] as const
              ).map((opt) => {
                const isActive = (state.settings.petScale || 'medium') === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateSettings({ petScale: opt.id })}
                    className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-102'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Progress */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to completely reset all save data?')) {
                  resetAllProgress();
                }
              }}
              className="w-full py-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Save Progress</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
