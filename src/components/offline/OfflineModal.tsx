import React from 'react';
import { formatNumber, formatTime } from '../../utils/format';
import { Moon, Coins, Check, Sparkles } from 'lucide-react';

interface OfflineModalProps {
  secondsAway: number;
  coinsEarned: number;
  onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({
  secondsAway,
  coinsEarned,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-amber-950/90 rounded-3xl border border-amber-500/50 p-6 text-center shadow-2xl overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
          🌙
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
          Welcome Back!
        </h3>
        <p className="text-xs text-slate-300 mb-4">
          Your pets stayed busy farming while you were away!
        </p>

        {/* Offline Summary Box */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Time Resting:</span>
            <span className="font-bold text-slate-200">{formatTime(secondsAway)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Offline Rate:</span>
            <span className="font-bold text-amber-400">50% Passive CPS</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <span className="text-slate-200 font-bold">Coins Harvested:</span>
            <span className="font-black text-amber-300 text-base">
              🪙 +{formatNumber(coinsEarned)}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>COLLECT REWARDS</span>
        </button>
      </div>
    </div>
  );
};
