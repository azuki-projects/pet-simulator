import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { RARITIES } from '../../data/rarities';
import { PET_SPECIES } from '../../data/species';
import { formatNumber } from '../../utils/format';
import { Sparkles, Zap, Plus } from 'lucide-react';

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  text: string;
  isCrit: boolean;
}

interface PetWanderer {
  id: string;
  name: string;
  speciesId: string;
  rarity: string;
  shiny: boolean;
  x: number; // percentage 10% to 85%
  y: number; // percentage 15% to 80%
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  facingLeft: boolean;
  speechText?: string;
  speechTimeout?: number;
  isBouncing: boolean;
}

const PET_SPEECHES = [
  '❤️ Azuki!',
  '+🪙 Chime!',
  'Cozy lawn!',
  'Happy bounce!',
  'Shiny vibes!',
  'Woof!',
  'Purr~',
  '🌸 Sakura!',
];

export const GameField: React.FC = () => {
  const { state, tapGrass, weather, updateSettings } = useGame();
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const nextNumberId = useRef(1);
  const playAreaRef = useRef<HTMLDivElement>(null);

  const petScaleMultiplier = {
    small: 0.75,
    medium: 1.0,
    large: 1.35,
    giant: 1.75,
  }[state.settings.petScale || 'medium'] || 1.0;

  // Equipped pet wander state
  const [wanderers, setWanderers] = useState<PetWanderer[]>([]);

  // Sync wanderers with equipped pets
  useEffect(() => {
    const equippedPets = state.inventory.filter((p) => state.equippedPetIds.includes(p.id));

    setWanderers((prev) => {
      return equippedPets.map((pet, idx) => {
        const existing = prev.find((w) => w.id === pet.id);
        if (existing) {
          return {
            ...existing,
            name: pet.name,
            rarity: pet.rarity,
            shiny: pet.shiny,
          };
        }
        // Spread evenly across the field initially
        const angle = (idx / Math.max(1, equippedPets.length)) * Math.PI * 2;
        return {
          id: pet.id,
          name: pet.name,
          speciesId: pet.speciesId,
          rarity: pet.rarity,
          shiny: pet.shiny,
          x: 45 + Math.cos(angle) * 25,
          y: 45 + Math.sin(angle) * 20,
          targetX: 20 + Math.random() * 60,
          targetY: 20 + Math.random() * 55,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          facingLeft: Math.random() > 0.5,
          isBouncing: false,
        };
      });
    });
  }, [state.equippedPetIds, state.inventory]);

  // Pet autonomous roaming animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setWanderers((prev) =>
        prev.map((w) => {
          // If close to target, pick new target
          const dx = w.targetX - w.x;
          const dy = w.targetY - w.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let nextTargetX = w.targetX;
          let nextTargetY = w.targetY;
          if (dist < 4 || Math.random() < 0.05) {
            nextTargetX = 12 + Math.random() * 75; // Stay well within the wooden fence
            nextTargetY = 16 + Math.random() * 68;
          }

          const angle = Math.atan2(nextTargetY - w.y, nextTargetX - w.x);
          const speed = 0.35 + Math.random() * 0.2;
          const newX = Math.max(10, Math.min(88, w.x + Math.cos(angle) * speed));
          const newY = Math.max(14, Math.min(84, w.y + Math.sin(angle) * speed));

          return {
            ...w,
            x: newX,
            y: newY,
            targetX: nextTargetX,
            targetY: nextTargetY,
            facingLeft: Math.cos(angle) < 0,
            isBouncing: dist > 2,
          };
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Handle tap on grass
  const handleGrassTap = (e: React.MouseEvent<any>) => {
    // Get local coordinate within container
    if (!playAreaRef.current) return;
    const rect = playAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { earned, crit } = tapGrass(x, y);

    const newNum: FloatingNumber = {
      id: nextNumberId.current++,
      x,
      y,
      text: `+${formatNumber(earned)}${crit ? ' CRIT!' : ''}`,
      isCrit: crit,
    };

    setFloatingNumbers((prev) => [...prev, newNum]);

    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((n) => n.id !== newNum.id));
    }, 900);
  };

  // Pet click celebration
  const handlePetTap = (e: React.MouseEvent, petId: string) => {
    e.stopPropagation();
    handleGrassTap(e);

    const randomSpeech = PET_SPEECHES[Math.floor(Math.random() * PET_SPEECHES.length)];
    setWanderers((prev) =>
      prev.map((w) =>
        w.id === petId
          ? {
              ...w,
              speechText: randomSpeech,
              // jump flip
              targetX: Math.max(15, Math.min(85, w.x + (Math.random() - 0.5) * 15)),
              targetY: Math.max(18, Math.min(80, w.y - 8)),
            }
          : w
      )
    );

    setTimeout(() => {
      setWanderers((prev) =>
        prev.map((w) => (w.id === petId ? { ...w, speechText: undefined } : w))
      );
    }, 1800);
  };

  return (
    <div className="relative w-full h-[calc(100vh-125px)] sm:h-[calc(100vh-130px)] flex flex-col items-center justify-center p-2 sm:p-4 select-none overflow-hidden">
      {/* WOODEN FENCE BORDER CONTAINER */}
      <div
        ref={playAreaRef}
        onClick={handleGrassTap}
        className="relative w-full max-w-4xl h-full rounded-3xl overflow-hidden cursor-pointer shadow-2xl transition-all"
        style={{
          // Lush grass field texture using SVG pattern & gradients
          background: 'radial-gradient(ellipse at 50% 40%, #4ade80 0%, #22c55e 50%, #15803d 95%)',
        }}
      >
        {/* Subtle grass tufts & clover overlay */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#166534 2px, transparent 2px), radial-gradient(#15803d 2px, transparent 2px)`,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
          }}
        />

        {/* Stone Pathway in center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 rounded-full border border-amber-800/15 bg-amber-200/10 pointer-events-none blur-sm" />

        {/* FULL WOODEN FENCE SURROUND (Top, Bottom, Left, Right Rails & Posts) */}
        {/* Top Fence */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-gradient-to-b from-amber-800 to-amber-950 border-b-2 border-amber-950/80 shadow-md flex items-center justify-around z-20 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={`post-top-${i}`}
              className="w-3.5 h-8 -mt-1 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 rounded-t-sm border border-amber-950 shadow"
            />
          ))}
        </div>

        {/* Bottom Fence */}
        <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-amber-800 to-amber-950 border-t-2 border-amber-950/80 shadow-md flex items-center justify-around z-20 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={`post-bot-${i}`}
              className="w-3.5 h-8 -mb-1 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 rounded-b-sm border border-amber-950 shadow"
            />
          ))}
        </div>

        {/* Left Fence */}
        <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-amber-800 to-amber-950 border-r-2 border-amber-950/80 shadow-md flex flex-col justify-around z-20 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`post-left-${i}`}
              className="h-3.5 w-7 -ml-1 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-l-sm border border-amber-950 shadow"
            />
          ))}
        </div>

        {/* Right Fence */}
        <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-amber-800 to-amber-950 border-l-2 border-amber-950/80 shadow-md flex flex-col justify-around z-20 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`post-right-${i}`}
              className="h-3.5 w-7 -mr-1 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-r-sm border border-amber-950 shadow"
            />
          ))}
        </div>

        {/* Weather Atmospheric Overlay */}
        {weather.type === 'sakura_breeze' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={`petal-${i}`}
                className="absolute text-pink-300 text-sm opacity-80 animate-pulse"
                style={{
                  left: `${(i * 6.5) % 95}%`,
                  top: `${(i * 11) % 90}%`,
                  transform: `rotate(${i * 24}deg)`,
                }}
              >
                🌸
              </div>
            ))}
          </div>
        )}

        {weather.type === 'fire_storm' && (
          <div className="absolute inset-0 bg-red-500/10 pointer-events-none z-10" />
        )}

        {weather.type === 'cosmic_night' && (
          <div className="absolute inset-0 bg-indigo-950/20 pointer-events-none z-10" />
        )}

        {/* Field HUD Overlay: Tap anywhere prompt & Equipped stats & Pet Size toggle */}
        <div className="absolute top-9 left-9 right-9 flex items-center justify-between pointer-events-none z-20">
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Tap grass for coins!</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Size Toggle on Fence */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const nextScale =
                  state.settings.petScale === 'small'
                    ? 'medium'
                    : state.settings.petScale === 'medium'
                    ? 'large'
                    : state.settings.petScale === 'large'
                    ? 'giant'
                    : 'small';
                updateSettings({ petScale: nextScale });
              }}
              className="pointer-events-auto bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-white hover:border-amber-400 transition-colors cursor-pointer flex items-center gap-1 shadow-md"
              title="Click to cycle pet size on fence"
            >
              <span>Size:</span>
              <span className="font-extrabold text-amber-300 capitalize">
                {state.settings.petScale || 'medium'}
              </span>
            </button>

            <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 text-xs font-semibold text-amber-300 shadow-md">
              <span>Equipped: {wanderers.length}/{state.upgrades.equipSlots}</span>
            </div>
          </div>
        </div>

        {/* Decorative flowers on grass */}
        <div className="absolute top-[28%] left-[22%] text-lg pointer-events-none opacity-80">🌼</div>
        <div className="absolute top-[65%] left-[30%] text-base pointer-events-none opacity-75">🌷</div>
        <div className="absolute top-[35%] right-[25%] text-lg pointer-events-none opacity-80">🌺</div>
        <div className="absolute top-[72%] right-[20%] text-base pointer-events-none opacity-75">🌸</div>
        <div className="absolute top-[18%] left-[55%] text-sm pointer-events-none opacity-60">🍀</div>
        <div className="absolute top-[80%] left-[50%] text-sm pointer-events-none opacity-60">🍀</div>

        {/* EQUIPPED PETS WANDERING AND BOUNCING */}
        {wanderers.map((w) => {
          const rarityCfg = RARITIES[w.rarity as keyof typeof RARITIES] || RARITIES.Common;
          const species = PET_SPECIES.find((s) => s.id === w.speciesId) || PET_SPECIES[0];

          // Dynamic scale based on Huge/Titanic multiplied by user settings
          let scale = 1;
          if (w.rarity === 'Huge') scale = 1.35;
          if (w.rarity === 'Titanic') scale = 1.65;
          if (w.rarity === 'Ultimate Azuki') scale = 1.85;
          scale = scale * petScaleMultiplier;

          return (
            <div
              key={w.id}
              onClick={(e) => handlePetTap(e, w.id)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-100 ease-out group"
              style={{
                left: `${w.x}%`,
                top: `${w.y}%`,
                transform: `scale(${scale})`,
              }}
            >
              {/* Pet Speech Bubble */}
              {w.speechText && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-950/90 text-white font-black text-[10px] px-2 py-0.5 rounded-full border border-amber-400 shadow-lg whitespace-nowrap animate-bounce z-30">
                  {w.speechText}
                </div>
              )}

              {/* Shadow on grass */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-black/35 rounded-full blur-[1px]" />

              {/* Pet Avatar Box */}
              <div
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xl transition-transform ${
                  w.isBouncing ? 'animate-bounce' : ''
                } ${rarityCfg.glowColor}`}
                style={{
                  backgroundColor: rarityCfg.color + '33',
                  border: `2px solid ${rarityCfg.color}`,
                  transform: w.facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
                }}
              >
                {/* Shiny Sparkle Indicator */}
                {w.shiny && (
                  <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-amber-300 animate-spin" />
                )}

                <span className="drop-shadow-md select-none">{species.iconSvg}</span>
              </div>

              {/* Pet Name Tag */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-md bg-slate-950/80 text-[9px] font-bold text-slate-200 border border-slate-700/80 shadow whitespace-nowrap">
                {w.name}
              </div>
            </div>
          );
        })}

        {/* FLOATING TAP NUMBERS */}
        {floatingNumbers.map((num) => (
          <div
            key={num.id}
            className={`absolute pointer-events-none font-black text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-30 transition-all duration-700 -translate-x-1/2 -translate-y-1/2 ${
              num.isCrit
                ? 'text-yellow-300 scale-125 font-extrabold animate-ping'
                : 'text-amber-200'
            }`}
            style={{
              left: `${num.x}px`,
              top: `${num.y - 25}px`,
              animation: 'floatUp 0.8s ease-out forwards',
            }}
          >
            {num.text}
          </div>
        ))}

        {/* Empty state prompt if no pet equipped */}
        {wanderers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-700 text-center shadow-xl">
              <p className="text-amber-300 font-bold text-sm">No Pets Equipped!</p>
              <p className="text-slate-400 text-xs mt-1">
                Go to the Pets tab to equip your companions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
