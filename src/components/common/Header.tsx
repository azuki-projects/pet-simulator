import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatNumber } from '../../utils/format';
import { Volume2, VolumeX, Sparkles, Zap, ShieldAlert, Award } from 'lucide-react';

interface HeaderProps {
  onOpenWelcome: () => void;
  onOpenGuides: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWelcome }) => {
  const { state, weather, passiveCoinsPerSec, updateSettings } = useGame();

  const toggleSound = () => {
    updateSettings({ soundEnabled: !state.settings.soundEnabled });
  };

  return (
    <header className="w-full bg-slate-900/95 border-b border-amber-900/40 px-3 py-2 text-slate-100 flex flex-wrap items-center justify-between gap-2 shadow-md relative z-30 select-none backdrop-blur-md">
      {/* Brand & Welcome link */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenWelcome}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-sm tracking-wide transition-all shadow-sm group active:scale-95"
          title="Open Welcome Menu"
        >
          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span>Azuki Pets</span>
        </button>

        {/* Weather Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300"
          title={weather.description}
        >
          <span>{weather.icon}</span>
          <span className="font-semibold text-amber-300">{weather.buffText}</span>
        </div>
      </div>

      {/* Main Currencies Bar */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        {/* Coins */}
        <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-600/40 px-2.5 py-1 rounded-lg shadow-inner">
          <span className="text-base">🪙</span>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-amber-300 text-sm sm:text-base tabular-nums">
              {formatNumber(state.coins)}
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium tabular-nums flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 inline text-amber-400" />
              +{formatNumber(passiveCoinsPerSec)}/s
            </span>
          </div>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-600/40 px-2.5 py-1 rounded-lg shadow-inner">
          <span className="text-base">💎</span>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-cyan-300 text-sm sm:text-base tabular-nums">
              {formatNumber(state.gems)}
            </span>
            <span className="text-[10px] text-cyan-400/70 font-medium">Gems</span>
          </div>
        </div>

        {/* Arena Points */}
        {state.arenaPoints > 0 && (
          <div className="hidden md:flex items-center gap-1 bg-red-950/40 border border-red-600/40 px-2 py-1 rounded-lg shadow-inner">
            <Award className="w-3.5 h-3.5 text-red-400" />
            <span className="font-bold text-red-300 text-xs tabular-nums">
              {formatNumber(state.arenaPoints)} AP
            </span>
          </div>
        )}

        {/* Rebirth Indicator */}
        {state.rebirths > 0 && (
          <div className="hidden lg:flex items-center gap-1 bg-purple-950/40 border border-purple-500/40 px-2 py-1 rounded-lg text-xs font-semibold text-purple-300">
            <span>⭐ R{state.rebirths}</span>
            <span className="text-[10px] text-purple-400/80">({(1 + state.rebirths * 0.5).toFixed(1)}x)</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Active Buffs Count */}
        {state.activeBuffs.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{state.activeBuffs.length} Active</span>
          </div>
        )}

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title={state.settings.soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
        >
          {state.settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>
    </header>
  );
};
