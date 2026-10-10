import React, { useState } from 'react';
import { Sparkles, Play, BookOpen, KeyRound, Check, X, ShieldCheck, Heart } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuides: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onOpenGuides,
}) => {
  const { redeemCode, state } = useGame();
  const [quickCodeOpen, setQuickCodeOpen] = useState(false);
  const [codeInputValue, setCodeInputValue] = useState('');
  const [redeemFeedback, setRedeemFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInputValue.trim()) return;
    const res = redeemCode(codeInputValue);
    setRedeemFeedback(res);
    if (res.success) {
      setCodeInputValue('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-stone-900 to-amber-950/90 rounded-3xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button if user already entered previously */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* FRONT & CENTER: GLOWING '✨ made with Azuki ✨' BADGE */}
        <div className="flex justify-center mb-6">
          <div className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-rose-950/90 via-amber-950/90 to-rose-950/90 border border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-sm sm:text-base font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-rose-200 to-yellow-300 bg-clip-text text-transparent uppercase drop-shadow">
              ✨ made with Azuki ✨
            </span>
            <Sparkles className="w-4 h-4 text-rose-300" />
          </div>
        </div>

        {/* Title & Mascot */}
        <div className="mb-4">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            AZUKI PET SIMULATOR
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-sm mx-auto">
            Collect 56+ mystical species across 63 legendary rarities & 46 mutations. Tap, hatch, fuse, and conquer the Arena!
          </p>
        </div>

        {/* Quick Highlights info box */}
        <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-3 mb-6 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="block font-bold text-amber-400 text-sm">{state.inventory.length}</span>
            <span className="text-slate-400">Pets Owned</span>
          </div>
          <div>
            <span className="block font-bold text-cyan-400 text-sm">63</span>
            <span className="text-slate-400">Rarities</span>
          </div>
          <div>
            <span className="block font-bold text-rose-400 text-sm">100%</span>
            <span className="text-slate-400">Offline Save</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Big Enter Game Button */}
          <button
            onClick={onClose}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg tracking-wide shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>ENTER GAME</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {/* Guides & Tips Button */}
            <button
              onClick={() => {
                onClose();
                onOpenGuides();
              }}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Guides & Tips</span>
            </button>

            {/* Quick Redemption Code Pop-up Button */}
            <button
              onClick={() => {
                setQuickCodeOpen(!quickCodeOpen);
                setRedeemFeedback(null);
              }}
              className="py-3 px-4 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>Redeem Code</span>
            </button>
          </div>
        </div>

        {/* Quick Redemption Expandable Panel */}
        {quickCodeOpen && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 text-left animate-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Code Redemption
            </h4>
            <form onSubmit={handleRedeem} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Code..."
                value={codeInputValue}
                onChange={(e) => setCodeInputValue(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 font-mono uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Claim
              </button>
            </form>
            {redeemFeedback && (
              <div
                className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-2 ${
                  redeemFeedback.success
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
                }`}
              >
                {redeemFeedback.success ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{redeemFeedback.message}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-[11px] text-stone-400/80 flex items-center justify-center gap-1">
          <Heart className="w-3 h-3 text-rose-400" />
          <span>Local auto-save enabled · Pure offline experience</span>
        </div>
      </div>
    </div>
  );
};
