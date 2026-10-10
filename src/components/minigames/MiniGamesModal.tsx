import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../utils/audio';
import { formatNumber } from '../../utils/format';
import {
  X,
  Gamepad2,
  Sparkles,
  Trophy,
  Timer,
  Flame,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Gift,
} from 'lucide-react';

interface MiniGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTraining?: () => void;
}

type MiniGameMode = 'hub' | 'catcher' | 'memory';

interface FallingItem {
  id: number;
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  type: 'coin' | 'gem' | 'star' | 'bomb';
  points: number;
  speed: number;
}

export const MiniGamesModal: React.FC<MiniGamesModalProps> = ({
  isOpen,
  onClose,
  onOpenTraining,
}) => {
  const { awardMiniGameReward } = useGame();
  const [mode, setMode] = useState<MiniGameMode>('hub');

  // CATCHER GAME STATE
  const [basketX, setBasketX] = useState<number>(50); // percentage
  const [catcherScore, setCatcherScore] = useState<number>(0);
  const [catcherTimeLeft, setCatcherTimeLeft] = useState<number>(30);
  const [catcherActive, setCatcherActive] = useState<boolean>(false);
  const [catcherGameOver, setCatcherGameOver] = useState<boolean>(false);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const catcherAnimRef = useRef<number | null>(null);

  // MEMORY MATCH STATE
  const [cards, setCards] = useState<
    Array<{ id: number; symbol: string; flipped: boolean; matched: boolean }>
  >([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState<number>(0);
  const [memoryTimeLeft, setMemoryTimeLeft] = useState<number>(45);
  const [memoryActive, setMemoryActive] = useState<boolean>(false);
  const [memoryGameOver, setMemoryGameOver] = useState<boolean>(false);
  const [memoryWon, setMemoryWon] = useState<boolean>(false);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setMode('hub');
      setCatcherActive(false);
      setMemoryActive(false);
    }
  }, [isOpen]);

  // CATCHER LOOP
  useEffect(() => {
    if (!catcherActive) return;

    const timer = setInterval(() => {
      setCatcherTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCatcherActive(false);
          setCatcherGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn falling items
    const spawner = setInterval(() => {
      const types: Array<'coin' | 'gem' | 'star' | 'bomb'> = [
        'coin',
        'coin',
        'gem',
        'star',
        'bomb',
      ];
      const rollType = types[Math.floor(Math.random() * types.length)];
      let points = 100;
      if (rollType === 'gem') points = 300;
      if (rollType === 'star') points = 800;
      if (rollType === 'bomb') points = -400;

      const newItem: FallingItem = {
        id: Date.now() + Math.random(),
        x: 8 + Math.random() * 84,
        y: 0,
        type: rollType,
        points,
        speed: 1.2 + Math.random() * 1.6,
      };

      setFallingItems((prev) => [...prev, newItem]);
    }, 450);

    // Move falling items animation
    let lastTime = performance.now();
    const updatePhysics = (currTime: number) => {
      const delta = (currTime - lastTime) / 16.6;
      lastTime = currTime;

      setFallingItems((prev) => {
        const next: FallingItem[] = [];
        for (const item of prev) {
          const nextY = item.y + item.speed * 0.9 * delta;

          // Check hit basket (bottom at y ~ 85-92%)
          if (nextY >= 82 && nextY <= 92 && Math.abs(item.x - basketX) < 14) {
            // Caught!
            if (item.type === 'bomb') {
              soundManager.playError();
              setCatcherScore((s) => Math.max(0, s + item.points));
            } else {
              soundManager.playCoin();
              setCatcherScore((s) => s + item.points);
            }
            continue; // item consumed
          }

          // If still on screen, keep
          if (nextY < 100) {
            next.push({ ...item, y: nextY });
          }
        }
        return next;
      });

      catcherAnimRef.current = requestAnimationFrame(updatePhysics);
    };

    catcherAnimRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
      if (catcherAnimRef.current) cancelAnimationFrame(catcherAnimRef.current);
    };
  }, [catcherActive, basketX]);

  // Handle Catcher Game Over rewards
  useEffect(() => {
    if (catcherGameOver) {
      const coinsEarned = Math.max(500, catcherScore * 25);
      const gemsEarned = Math.max(5, Math.floor(catcherScore / 100));
      awardMiniGameReward(coinsEarned, gemsEarned);
      soundManager.playHatchFanfare(6);
    }
  }, [catcherGameOver, catcherScore, awardMiniGameReward]);

  const startCatcherGame = () => {
    setCatcherScore(0);
    setCatcherTimeLeft(30);
    setBasketX(50);
    setFallingItems([]);
    setCatcherGameOver(false);
    setCatcherActive(true);
    setMode('catcher');
  };

  // MEMORY GAME LOGIC
  const startMemoryGame = () => {
    const symbols = ['🐱', '🐉', '🦊', '🦄', '🐶', '🐰', '🦅', '🦫'];
    const deck = [...symbols, ...symbols]
      .sort(() => 0.5 - Math.random())
      .map((sym, index) => ({
        id: index,
        symbol: sym,
        flipped: false,
        matched: false,
      }));

    setCards(deck);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryTimeLeft(45);
    setMemoryGameOver(false);
    setMemoryWon(false);
    setMemoryActive(true);
    setMode('memory');
  };

  useEffect(() => {
    if (!memoryActive) return;

    const timer = setInterval(() => {
      setMemoryTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setMemoryActive(false);
          setMemoryGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [memoryActive]);

  const handleCardClick = (index: number) => {
    if (!memoryActive || cards[index].flipped || cards[index].matched) return;
    if (flippedIndices.length >= 2) return;

    soundManager.playTap();
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [first, second] = newFlipped;

      if (newCards[first].symbol === newCards[second].symbol) {
        // Match!
        soundManager.playCoin();
        setTimeout(() => {
          newCards[first].matched = true;
          newCards[second].matched = true;
          setCards([...newCards]);
          setFlippedIndices([]);

          // Check win
          if (newCards.every((c) => c.matched)) {
            setMemoryActive(false);
            setMemoryGameOver(true);
            setMemoryWon(true);
            awardMiniGameReward(50000, 50, 'luck_2x');
            soundManager.playHatchFanfare(10);
          }
        }, 300);
      } else {
        // No match, flip back
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Azuki Mini-Games Arcade</h2>
              <p className="text-xs text-slate-400">Play fast mini-games for coins, gems & boosts!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* HUB MODE */}
          {mode === 'hub' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* GAME 1: CATCHER */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/30 flex flex-col justify-between hover:border-amber-400/60 transition-all shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">🧺</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                        30 SECONDS
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-white mb-1">Coin & Gem Shower</h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Control your pet basket to catch falling gold coins, gems and lucky stars. Avoid
                      spikes!
                    </p>
                  </div>
                  <button
                    onClick={startCatcherGame}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Play Coin Catcher</span>
                  </button>
                </div>

                {/* GAME 2: MEMORY MATCH */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-400/60 transition-all shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl">🎴</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-500/30">
                        45 SECONDS
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-white mb-1">Pet Memory Match</h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Flip cards and match pet pairs. Win 50,000 Coins, 50 Gems, and a 15-minute 2x Luck
                      Boost!
                    </p>
                  </div>
                  <button
                    onClick={startMemoryGame}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Play Memory Match</span>
                  </button>
                </div>
              </div>

              {/* GAME 3: PET TRAINING MINI-GAME */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-950 border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <h4 className="text-sm font-black text-white">Pet Training Tap Rush</h4>
                    <p className="text-xs text-slate-400">
                      Rapidly tap for 10 seconds to grant any pet a 1-hour +20% earnings boost!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenTraining) onOpenTraining();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs transition-colors cursor-pointer flex-shrink-0"
                >
                  Go to Pets
                </button>
              </div>
            </div>
          )}

          {/* CATCHER GAME MODE */}
          {mode === 'catcher' && (
            <div className="flex flex-col items-center">
              {/* Top HUD */}
              <div className="w-full flex items-center justify-between mb-3 px-2">
                <button
                  onClick={() => setMode('hub')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Arcade
                </button>
                <div className="flex items-center gap-4 text-xs font-black">
                  <span className="text-amber-300">Score: {catcherScore}</span>
                  <span className="text-cyan-300 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" /> {catcherTimeLeft}s
                  </span>
                </div>
              </div>

              {/* Game Board */}
              <div
                className="w-full h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/30 rounded-2xl border border-slate-800 relative overflow-hidden select-none touch-none"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = ((e.clientX - rect.left) / rect.width) * 100;
                  setBasketX(Math.max(8, Math.min(92, pct)));
                }}
                onTouchMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const touch = e.touches[0];
                  if (touch) {
                    const pct = ((touch.clientX - rect.left) / rect.width) * 100;
                    setBasketX(Math.max(8, Math.min(92, pct)));
                  }
                }}
              >
                {/* Falling items */}
                {fallingItems.map((item) => (
                  <div
                    key={item.id}
                    className="absolute text-xl pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform"
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  >
                    {item.type === 'coin' && '🪙'}
                    {item.type === 'gem' && '💎'}
                    {item.type === 'star' && '⭐'}
                    {item.type === 'bomb' && '💣'}
                  </div>
                ))}

                {/* Player Basket */}
                <div
                  className="absolute bottom-4 transform -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
                  style={{ left: `${basketX}%` }}
                >
                  <span className="text-3xl">🧺</span>
                </div>

                {/* Game Over Overlay */}
                {catcherGameOver && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
                    <Trophy className="w-12 h-12 text-amber-400 mb-2" />
                    <h3 className="text-lg font-black text-white mb-1">Time Up! Great Run!</h3>
                    <p className="text-xs text-amber-300 font-bold mb-3">
                      Final Score: {catcherScore} Points!
                    </p>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 mb-4 text-xs font-semibold text-slate-300">
                      Claimed: +{formatNumber(Math.max(500, catcherScore * 25))} Coins & +
                      {Math.max(5, Math.floor(catcherScore / 100))} Gems!
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={startCatcherGame}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                      >
                        Play Again
                      </button>
                      <button
                        onClick={() => setMode('hub')}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Arcade Hub
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Control Buttons */}
              <div className="flex items-center justify-between w-full mt-3 gap-3">
                <button
                  onClick={() => setBasketX((x) => Math.max(8, x - 15))}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-amber-500/40 rounded-xl text-white font-black text-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Move Left
                </button>
                <button
                  onClick={() => setBasketX((x) => Math.min(92, x + 15))}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-amber-500/40 rounded-xl text-white font-black text-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  Move Right <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* MEMORY MATCH MODE */}
          {mode === 'memory' && (
            <div className="flex flex-col items-center">
              {/* Top HUD */}
              <div className="w-full flex items-center justify-between mb-3 px-2">
                <button
                  onClick={() => setMode('hub')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Arcade
                </button>
                <div className="flex items-center gap-4 text-xs font-black">
                  <span className="text-slate-300">Moves: {memoryMoves}</span>
                  <span className="text-cyan-300 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" /> {memoryTimeLeft}s
                  </span>
                </div>
              </div>

              {/* 4x4 Grid */}
              <div className="grid grid-cols-4 gap-2.5 w-full max-w-sm mb-4">
                {cards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-200 cursor-pointer shadow-md ${
                      card.flipped || card.matched
                        ? 'bg-amber-500/20 border-2 border-amber-400 rotate-0'
                        : 'bg-slate-950 border border-slate-700 hover:border-slate-500 hover:scale-105'
                    }`}
                  >
                    {card.flipped || card.matched ? card.symbol : '❓'}
                  </button>
                ))}
              </div>

              {/* Game Over / Won modal */}
              {memoryGameOver && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center w-full max-w-sm">
                  {memoryWon ? (
                    <>
                      <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                      <h3 className="text-base font-black text-white mb-1">
                        Congratulations! You Won!
                      </h3>
                      <p className="text-xs text-emerald-300 font-bold mb-3">
                        +50,000 Coins, +50 Gems, and 15m 2x Luck Boost unlocked!
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-base font-black text-white mb-1">Time's Up!</h3>
                      <p className="text-xs text-slate-400 mb-3">Keep practicing your pet memory!</p>
                    </>
                  )}
                  <button
                    onClick={startMemoryGame}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
