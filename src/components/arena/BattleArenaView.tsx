import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { PET_SPECIES } from '../../data/species';
import { RARITIES } from '../../data/rarities';
import { SIGIL_REGISTRY } from '../../data/sigils';
import { formatNumber } from '../../utils/format';
import { soundManager } from '../../utils/audio';
import { Swords, Trophy, Shield, Zap, Award, Sparkles, RefreshCw, ShoppingCart, Check } from 'lucide-react';

interface Combatant {
  id: string;
  name: string;
  icon: string;
  maxHp: number;
  currentHp: number;
  attackPower: number;
  isEnemy: boolean;
}

export const BattleArenaView: React.FC = () => {
  const { state, recordArenaWin, buyArenaItem } = useGame();
  const [activeTab, setActiveTab] = useState<'battle' | 'shop'>('battle');
  const [currentStage, setCurrentStage] = useState(state.arenaStage);
  const [battleState, setBattleState] = useState<'idle' | 'fighting' | 'victory' | 'defeat'>('idle');
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [playerTeam, setPlayerTeam] = useState<Combatant[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Combatant[]>([]);

  // Get top 3 strongest equipped or owned pets
  const topPets = [...state.inventory]
    .sort((a, b) => b.baseCoinsPerSec * b.level - a.baseCoinsPerSec * a.level)
    .slice(0, 3);

  // Initialize teams
  const setupBattle = (stage: number) => {
    // Sigil bonus
    let sigilAtkMult = 1.0;
    state.equippedSigilIds.forEach((id) => {
      const s = SIGIL_REGISTRY.find((sig) => sig.id === id);
      if (s && s.buffType === 'arena_attack') {
        sigilAtkMult += s.buffMultiplier - 1.0;
      }
    });

    const pTeam: Combatant[] = topPets.map((p, idx) => {
      const species = PET_SPECIES.find((s) => s.id === p.speciesId) || PET_SPECIES[0];
      const atk = Math.round(p.baseCoinsPerSec * p.level * 1.5 * sigilAtkMult);
      const hp = Math.round(atk * 8);
      return {
        id: `player_${idx}_${p.id}`,
        name: p.name,
        icon: species.iconSvg,
        maxHp: Math.max(100, hp),
        currentHp: Math.max(100, hp),
        attackPower: Math.max(20, atk),
        isEnemy: false,
      };
    });

    // Enemy team scaling
    const baseEnemyHp = Math.round(300 * Math.pow(stage, 1.25));
    const baseEnemyAtk = Math.round(45 * Math.pow(stage, 1.15));

    const enemyMonsters = [
      { name: `Dungeon Wolf (St.${stage})`, icon: '🐺' },
      { name: `Nether Wyrm (St.${stage})`, icon: '🐲' },
      { name: `Boss Shadow Behemoth`, icon: '👹' },
    ];

    const eTeam: Combatant[] = [0, 1, 2].map((idx) => {
      const m = enemyMonsters[idx];
      const hp = Math.round(baseEnemyHp * (0.8 + idx * 0.4));
      const atk = Math.round(baseEnemyAtk * (0.8 + idx * 0.3));
      return {
        id: `enemy_${idx}`,
        name: m.name,
        icon: m.icon,
        maxHp: hp,
        currentHp: hp,
        attackPower: atk,
        isEnemy: true,
      };
    });

    setPlayerTeam(pTeam);
    setEnemyTeam(eTeam);
    setBattleState('idle');
    setCombatLog([`Stage ${stage} arena challenge initiated!`]);
  };

  useEffect(() => {
    setupBattle(currentStage);
  }, [currentStage]);

  // Turn auto-battle runner
  useEffect(() => {
    if (battleState !== 'fighting') return;

    const timer = setInterval(() => {
      // Find alive player and alive enemy
      setPlayerTeam((prevPlayer) => {
        setEnemyTeam((prevEnemy) => {
          const alivePlayer = prevPlayer.find((p) => p.currentHp > 0);
          const aliveEnemy = prevEnemy.find((e) => e.currentHp > 0);

          if (!alivePlayer) {
            setBattleState('defeat');
            return prevEnemy;
          }
          if (!aliveEnemy) {
            setBattleState('victory');
            soundManager.playLevelUp();
            recordArenaWin(currentStage);
            return prevEnemy;
          }

          // Player attacks enemy
          soundManager.playBattleHit();
          const pDamage = Math.round(alivePlayer.attackPower * (0.9 + Math.random() * 0.3));
          const updatedEnemy = prevEnemy.map((e) =>
            e.id === aliveEnemy.id ? { ...e, currentHp: Math.max(0, e.currentHp - pDamage) } : e
          );

          // Enemy counter-attacks player
          const eDamage = Math.round(aliveEnemy.attackPower * (0.85 + Math.random() * 0.3));
          const updatedPlayer = prevPlayer.map((p) =>
            p.id === alivePlayer.id ? { ...p, currentHp: Math.max(0, p.currentHp - eDamage) } : p
          );

          setCombatLog((prev) => [
            `${alivePlayer.name} dealt ${formatNumber(pDamage)} DMG! ${aliveEnemy.name} hit back for ${formatNumber(eDamage)} DMG!`,
            ...prev.slice(0, 4),
          ]);

          // Update player state via return in outer closure
          setPlayerTeam(updatedPlayer);
          return updatedEnemy;
        });
        return prevPlayer;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [battleState, currentStage]);

  const handleStartBattle = () => {
    setupBattle(currentStage);
    setBattleState('fighting');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 pb-24 text-slate-100">
      {/* Title */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Swords className="w-7 h-7 text-red-500" />
            <span>Colosseum Battle Arena</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Auto-battle your 3 strongest pets to earn Arena Points, coins, and gems!
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('battle')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'battle' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            Battlefield
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'shop' ? 'bg-red-600 text-white' : 'text-slate-400'
            }`}
          >
            Arena Shop ({state.arenaPoints} AP)
          </button>
        </div>
      </div>

      {activeTab === 'battle' ? (
        <div className="space-y-6">
          {/* Stage Progress Bar */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center justify-center font-black text-red-400">
                {currentStage}
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Stage {currentStage}</h4>
                <span className="text-xs text-slate-400">Best Cleared: Stage {state.arenaBestStage}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStage((s) => Math.max(1, s - 1))}
                disabled={currentStage <= 1 || battleState === 'fighting'}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs font-bold disabled:opacity-40"
              >
                ◀ Prev
              </button>
              <button
                onClick={() => setCurrentStage((s) => Math.min(state.arenaStage, s + 1))}
                disabled={currentStage >= state.arenaStage || battleState === 'fighting'}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs font-bold disabled:opacity-40"
              >
                Next ▶
              </button>
            </div>
          </div>

          {/* COMBAT ARENA FIELD */}
          <div className="relative rounded-3xl p-6 bg-gradient-to-b from-stone-900 via-slate-900 to-amber-950/70 border border-red-900/40 shadow-2xl overflow-hidden min-h-[300px]">
            {/* Split Arena Layout: Player Team (Left) vs Enemy Team (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Player Team (Left) */}
              <div className="space-y-3">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-wider block">
                  Your Vanguard (3 Strongest):
                </span>
                {playerTeam.map((p) => {
                  const hpPct = Math.round((p.currentHp / p.maxHp) * 100);
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        p.currentHp > 0
                          ? 'bg-slate-950/80 border-cyan-500/40'
                          : 'bg-slate-950/40 border-slate-900 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{p.icon}</span>
                          <span className="font-extrabold text-xs text-white">{p.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-300">
                          ⚔️ {formatNumber(p.attackPower)} ATK
                        </span>
                      </div>

                      {/* HP Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all duration-300"
                          style={{ width: `${hpPct}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-right font-mono text-slate-400 mt-0.5">
                        {formatNumber(p.currentHp)} / {formatNumber(p.maxHp)} HP
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Enemy Team (Right) */}
              <div className="space-y-3">
                <span className="text-xs font-black text-red-400 uppercase tracking-wider block text-right">
                  Enemy Opponents:
                </span>
                {enemyTeam.map((e) => {
                  const hpPct = Math.round((e.currentHp / e.maxHp) * 100);
                  return (
                    <div
                      key={e.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        e.currentHp > 0
                          ? 'bg-slate-950/80 border-red-500/40'
                          : 'bg-slate-950/40 border-slate-900 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 flex-row-reverse">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <span className="text-2xl">{e.icon}</span>
                          <span className="font-extrabold text-xs text-white">{e.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-300">
                          ⚔️ {formatNumber(e.attackPower)} ATK
                        </span>
                      </div>

                      {/* HP Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 transition-all duration-300"
                          style={{ width: `${hpPct}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-left font-mono text-slate-400 mt-0.5">
                        {formatNumber(e.currentHp)} / {formatNumber(e.maxHp)} HP
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Battle controls & states */}
            <div className="mt-8 text-center">
              {battleState === 'idle' && (
                <button
                  onClick={handleStartBattle}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base shadow-xl shadow-red-600/30 active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <Swords className="w-5 h-5" />
                  <span>START AUTO BATTLE</span>
                </button>
              )}

              {battleState === 'fighting' && (
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-950/80 border border-red-500 text-red-200 font-bold text-sm animate-pulse">
                  <Swords className="w-4 h-4 animate-spin" />
                  <span>Combat in progress...</span>
                </div>
              )}

              {battleState === 'victory' && (
                <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 max-w-sm mx-auto animate-in zoom-in-95">
                  <div className="text-3xl mb-1">🏆 VICTORY!</div>
                  <p className="text-xs text-emerald-200 mb-3">
                    Stage {currentStage} conquered! Rewarded: +{10 + currentStage * 2} AP, +🪙 {formatNumber(currentStage * 2500)}, +💎 {Math.floor(currentStage / 3) + 2}
                  </p>
                  <button
                    onClick={() => {
                      setCurrentStage((s) => s + 1);
                      setupBattle(currentStage + 1);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                  >
                    Next Stage ({currentStage + 1})
                  </button>
                </div>
              )}

              {battleState === 'defeat' && (
                <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/60 max-w-sm mx-auto animate-in zoom-in-95">
                  <div className="text-2xl mb-1">⚔️ DEFEAT</div>
                  <p className="text-xs text-rose-200 mb-3">
                    Your team fell! Level up your pets or equip combat Sigils to overpower the beasts.
                  </p>
                  <button
                    onClick={() => setupBattle(currentStage)}
                    className="px-5 py-2 rounded-xl bg-rose-600 text-white font-black text-xs cursor-pointer shadow-md"
                  >
                    Retry Stage
                  </button>
                </div>
              )}
            </div>

            {/* Combat Log */}
            {combatLog.length > 0 && (
              <div className="mt-6 p-3 rounded-xl bg-black/60 border border-slate-800 text-left text-[11px] font-mono text-slate-300 space-y-1">
                {combatLog.map((log, i) => (
                  <div key={i} className="truncate">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ARENA SHOP (EXCHANGE AP) */
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-red-400" />
            <span>Colosseum Glory Exchange</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SIGIL_REGISTRY.map((sigil) => {
              const isOwned = state.ownedSigils.some((s) => s.id === sigil.id);
              const cost = 150 + RARITIES[sigil.rarity].order * 100;
              const canAfford = state.arenaPoints >= cost;

              return (
                <div
                  key={sigil.id}
                  className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{sigil.icon}</span>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{sigil.name}</h4>
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{ color: RARITIES[sigil.rarity].color }}
                        >
                          {sigil.rarity} Sigil
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{sigil.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (!isOwned && canAfford) {
                        buyArenaItem(sigil.id, cost);
                      }
                    }}
                    disabled={isOwned || !canAfford}
                    className={`w-full py-2 rounded-xl font-bold text-xs cursor-pointer ${
                      isOwned
                        ? 'bg-slate-800 text-emerald-400 cursor-default'
                        : canAfford
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isOwned ? 'Owned' : `Buy (${cost} AP)`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
