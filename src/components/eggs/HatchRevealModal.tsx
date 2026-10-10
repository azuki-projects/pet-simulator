import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Pet } from '../../types/game';
import { RARITIES } from '../../data/rarities';
import { PET_SPECIES } from '../../data/species';
import { formatNumber } from '../../utils/format';
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface HatchRevealModalProps {
  pet: Pet | null;
  onClose: () => void;
}

export const HatchRevealModal: React.FC<HatchRevealModalProps> = ({ pet, onClose }) => {
  const { equipPet, state } = useGame();
  const [stage, setStage] = useState<'cracking' | 'revealed'>('cracking');

  useEffect(() => {
    if (!pet) return;
    setStage('cracking');

    // After 700ms, trigger reveal & confetti
    const timer = setTimeout(() => {
      setStage('revealed');

      const rarityConfig = RARITIES[pet.rarity];
      const isHighTier = rarityConfig.order >= 5;

      try {
        confetti({
          particleCount: isHighTier ? 120 : 60,
          spread: isHighTier ? 90 : 60,
          origin: { y: 0.6 },
          colors: [rarityConfig.color, '#fbbf24', '#ffffff', '#f43f5e'],
        });
      } catch {}
    }, 700);

    return () => clearTimeout(timer);
  }, [pet]);

  if (!pet) return null;

  const rarityConfig = RARITIES[pet.rarity];
  const species = PET_SPECIES.find((s) => s.id === pet.speciesId) || PET_SPECIES[0];
  const canEquip = state.equippedPetIds.length < state.upgrades.equipSlots;

  const handleEquipAndClose = () => {
    equipPet(pet.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center overflow-hidden border shadow-2xl transition-all"
        style={{
          backgroundColor: '#0f172a',
          borderColor: rarityConfig.color,
          boxShadow: `0 0 50px ${rarityConfig.color}44`,
        }}
      >
        {/* Animated Background Rays */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${rarityConfig.color} 0%, transparent 70%)`,
          }}
        />

        {stage === 'cracking' ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="text-7xl animate-bounce mb-4 select-none">🥚</div>
            <div className="text-xl font-black text-amber-400 tracking-wider animate-pulse">
              HATCHING...
            </div>
            <p className="text-xs text-slate-400 mt-2">Cracking the shell open!</p>
          </div>
        ) : (
          <div className="animate-in zoom-in-90 duration-300">
            {/* Rarity Banner */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 border shadow"
              style={{
                backgroundColor: rarityConfig.color + '25',
                borderColor: rarityConfig.color,
                color: rarityConfig.color,
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{pet.rarity}</span>
              <span className="text-[10px] opacity-80">({formatNumber(rarityConfig.multiplier)}x)</span>
            </div>

            {/* Pet Mascot Portrait */}
            <div className="relative my-4 flex justify-center">
              <div
                className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl shadow-2xl border-2 relative"
                style={{
                  backgroundColor: rarityConfig.color + '20',
                  borderColor: rarityConfig.color,
                  boxShadow: `0 0 35px ${rarityConfig.color}66`,
                }}
              >
                {pet.shiny && (
                  <span className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[10px] shadow-lg animate-pulse">
                    ✨ SHINY (2.5x)
                  </span>
                )}
                <span className="select-none drop-shadow-md">{species.iconSvg}</span>
              </div>
            </div>

            {/* Pet Name */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
              {pet.name}
            </h2>
            <p className="text-xs text-slate-400 mb-4">{species.description}</p>

            {/* Stats Breakdown Card */}
            <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800 grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="text-left">
                <span className="text-slate-500 text-[10px] block">Base Income</span>
                <span className="font-black text-amber-300 text-sm flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  +{formatNumber(pet.baseCoinsPerSec)}/s
                </span>
              </div>
              <div className="text-left">
                <span className="text-slate-500 text-[10px] block">Weight</span>
                <span className="font-bold text-slate-200 text-sm">
                  ⚖️ {pet.weightKg} kg
                </span>
              </div>
            </div>

            {/* Traits */}
            {pet.traits.length > 0 && (
              <div className="mb-6 text-left bg-slate-950/40 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Rolled Traits:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pet.traits.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold"
                    >
                      ✦ {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Keep in Inventory
              </button>

              <button
                onClick={handleEquipAndClose}
                disabled={!canEquip}
                className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  canEquip
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/25 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{canEquip ? 'Equip Now' : 'Slots Full'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
