import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../utils/audio';
import { PET_SPECIES } from '../../data/species';
import { Flame, Sparkles, X, Trophy } from 'lucide-react';

interface TrainingModalProps {
  petId: string | null;
  onClose: () => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({ petId, onClose }) => {
  const { state, completePetTraining } = useGame();
  const [gameState, setGameState] = useState<'ready' | 'tapping' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(10);
  const [taps, setTaps] = useState(0);

  const targetTaps = 30;
  const pet = state.inventory.find((p) => p.id === petId);
  const species = pet ? PET_SPECIES.find((s) => s.id === pet.speciesId) : null;

  useEffect(() => {
    if (gameState !== 'tapping') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('finished');
          const success = taps >= targetTaps;
          if (petId) {
            completePetTraining(petId, success);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, taps, petId]);

  if (!petId || !pet) return null;

  const handleStart = () => {
    setTaps(0);
    setTimeLeft(10);
    setGameState('tapping');
  };

  const handleTap = () => {
    if (gameState !== 'tapping') return;
    soundManager.playTap();
    setTaps((t) => t + 1);
  };

  const progressPct = Math.min(100, Math.round((taps / targetTaps) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-stone-900 to-slate-900 rounded-3xl border border-orange-500/50 p-6 text-center shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-400 flex items-center justify-center text-3xl mx-auto mb-3">
          {species?.iconSvg || '🐾'}
        </div>

        <h3 className="text-xl font-black text-white mb-1">
          Train {pet.name}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Tap fast to reach 30 taps in 10 seconds to grant a <strong className="text-orange-400">+20% 1-Hour Earnings Boost</strong>!
        </p>

        {gameState === 'ready' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Get ready to tap the button as fast as you can!
            </div>
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 text-white font-black text-sm tracking-wide shadow-lg shadow-orange-500/25 active:scale-95 cursor-pointer"
            >
              START TRAINING (10s)
            </button>
          </div>
        )}

        {gameState === 'tapping' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-orange-400 font-bold">Time Left: {timeLeft}s</span>
              <span className="text-amber-300 font-bold">Taps: {taps}/{targetTaps}</span>
            </div>

            {/* Energy Meter */}
            <div className="w-full bg-slate-950 rounded-full h-4 p-0.5 border border-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-75"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Rapid Tap Button */}
            <button
              onClick={handleTap}
              className="w-full h-32 rounded-3xl bg-gradient-to-b from-orange-600 to-amber-700 active:from-orange-500 active:to-amber-600 text-white font-black text-2xl shadow-xl border-2 border-orange-400 flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <Flame className="w-8 h-8 fill-white animate-bounce" />
              <span>TAP! TAP! TAP!</span>
              <span className="text-xs font-bold text-amber-200">({taps} taps)</span>
            </button>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="space-y-4">
            {taps >= targetTaps ? (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold animate-in zoom-in-95">
                <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-base font-black text-white">TRAINING SUCCESSFUL!</div>
                <p className="mt-1">
                  {pet.name} achieved peak form! +20% passive income applied for the next 1 hour.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-bold animate-in zoom-in-95">
                <div className="text-base font-black text-white">MISSED TARGET</div>
                <p className="mt-1">
                  You reached {taps}/{targetTaps} taps. Try again to boost {pet.name}!
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
