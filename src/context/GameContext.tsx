import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import {
  GameState,
  Pet,
  IncubatingEgg,
  WeatherState,
  RarityTier,
  ActiveBuff,
  Quest,
} from '../types/game';
import { RARITIES, RARITY_ORDER } from '../data/rarities';
import { EGG_TIERS_MAP } from '../data/eggs';
import { ACHIEVEMENTS } from '../data/achievements';
import { SIGIL_MAP, SIGIL_REGISTRY } from '../data/sigils';
import { soundManager } from '../utils/audio';
import { createPet, rollRarityFromEgg } from '../utils/petFactory';
import allCodesData from '../data/codes.json';

const LOCAL_STORAGE_KEY = 'azuki_pet_simulator_save_v1';

export interface OfflineRewardSummary {
  secondsAway: number;
  coinsEarned: number;
}

const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'q_taps',
    title: 'Warm Up Taps',
    description: 'Tap on the grass area 30 times.',
    type: 'tap',
    target: 30,
    current: 0,
    rewardCoins: 1500,
    rewardGems: 10,
    isWeekly: false,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_hatch',
    title: 'Incubate New Friends',
    description: 'Hatch 3 eggs of any tier.',
    type: 'hatch',
    target: 3,
    current: 0,
    rewardCoins: 5000,
    rewardGems: 25,
    isWeekly: false,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_arena',
    title: 'Arena Gladiator',
    description: 'Win 2 Arena battle stages.',
    type: 'arena_win',
    target: 2,
    current: 0,
    rewardCoins: 10000,
    rewardGems: 30,
    isWeekly: false,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_level',
    title: 'Pet Trainer',
    description: 'Level up any pet 3 times.',
    type: 'level_up',
    target: 3,
    current: 0,
    rewardCoins: 7500,
    rewardGems: 20,
    isWeekly: false,
    completed: false,
    claimed: false,
  },
  {
    id: 'q_weekly_hatch',
    title: 'Weekly Incubator Marathon',
    description: 'Hatch 25 eggs this week.',
    type: 'hatch',
    target: 25,
    current: 0,
    rewardCoins: 150000,
    rewardGems: 200,
    isWeekly: true,
    completed: false,
    claimed: false,
  },
];

function getInitialState(): GameState {
  const initialPet = createPet('Common', 'cat');
  initialPet.equipped = true;

  return {
    coins: 150,
    gems: 25,
    arenaPoints: 0,
    rebirths: 0,
    rebirthMultiplier: 1.0,
    inventory: [initialPet],
    incubator: [],
    equippedPetIds: [initialPet.id],
    equippedSigilIds: [],
    ownedSigils: [SIGIL_REGISTRY[0]], // Start with Sigil of Fortune
    totalTaps: 0,
    totalEggsHatched: 0,
    totalCoinsEarned: 150,
    totalArenaWins: 0,
    totalFusions: 0,
    upgrades: {
      equipSlots: 3,
      luckLevel: 0,
      hatchSpeedLevel: 0,
      tapPowerLevel: 0,
      incubatorSlots: 3,
      autoHatcher: false,
    },
    claimedCodes: [],
    claimedAchievements: [],
    lastDailySpinTimestamp: 0,
    loginStreak: 1,
    lastLoginDate: new Date().toISOString().split('T')[0],
    claimedToday: false,
    collectionLog: { [`${initialPet.speciesId}_${initialPet.rarity}`]: true },
    activeBuffs: [],
    instantHatchPotions: 1,
    arenaStage: 1,
    arenaBestStage: 1,
    lastSavedTimestamp: Date.now(),
    settings: {
      soundEnabled: true,
      sfxVolume: 0.6,
      autoHatchEnabled: true,
      petScale: 'medium',
    },
    quests: DEFAULT_QUESTS,
  };
}

const WEATHERS: WeatherState[] = [
  {
    type: 'sunny',
    name: '☀️ Golden Sun',
    description: 'Bright warm sunlight bathes the lawn.',
    icon: '☀️',
    buffText: '+15% Coin Yields',
    coinMultiplier: 1.15,
    luckMultiplier: 1.0,
    arenaMultiplier: 1.0,
    endsAt: 0,
  },
  {
    type: 'rainy',
    name: '🌧️ Mystic Rain',
    description: 'Enchanted rain nourishes fertile egg nests.',
    icon: '🌧️',
    buffText: '+25% Egg Hatch Luck',
    coinMultiplier: 1.0,
    luckMultiplier: 1.25,
    arenaMultiplier: 1.0,
    endsAt: 0,
  },
  {
    type: 'fire_storm',
    name: '🔥 Solar Flare',
    description: 'Superheated energy surges across the realm.',
    buffText: '+30% All Earnings',
    icon: '🔥',
    coinMultiplier: 1.3,
    luckMultiplier: 1.1,
    arenaMultiplier: 1.2,
    endsAt: 0,
  },
  {
    type: 'sakura_breeze',
    name: '🌸 Azuki Sakura Blossom',
    description: 'Cherry blossom petals swirl with ancestral luck.',
    icon: '🌸',
    buffText: '+20% CPS & +20% Gem Drops',
    coinMultiplier: 1.2,
    luckMultiplier: 1.2,
    arenaMultiplier: 1.15,
    endsAt: 0,
  },
  {
    type: 'cosmic_night',
    name: '🌌 Cosmic Eclipse',
    description: 'Nebula auroras align, unlocking deep mysteries.',
    icon: '🌌',
    buffText: '+50% Secret & Titanic Luck',
    coinMultiplier: 1.1,
    luckMultiplier: 1.5,
    arenaMultiplier: 1.25,
    endsAt: 0,
  },
];

interface GameContextType {
  state: GameState;
  weather: WeatherState;
  passiveCoinsPerSec: number;
  tapPower: number;
  hatchRevealPet: Pet | null;
  offlineSummary: OfflineRewardSummary | null;
  clearOfflineSummary: () => void;
  clearHatchReveal: () => void;
  tapGrass: (x?: number, y?: number) => { earned: number; crit: boolean };
  buyEgg: (eggTierId: string) => boolean;
  warmEgg: (eggId: string) => void;
  hatchEggNow: (eggId: string) => void;
  useInstantHatchPotion: (eggId: string) => void;
  equipPet: (petId: string) => void;
  unequipPet: (petId: string) => void;
  renamePet: (petId: string, newName: string) => void;
  levelUpPet: (petId: string) => boolean;
  sellPet: (petId: string) => void;
  toggleLockPet: (petId: string) => void;
  fusePets: (petIds: string[]) => { success: boolean; newPet?: Pet; message?: string };
  buyUpgrade: (type: keyof GameState['upgrades']) => boolean;
  buyMysteryBox: (boxTier: 'bronze' | 'silver' | 'gold') => { type: string; rewardText: string };
  buyGemBuff: (buffType: 'coin_2x' | 'luck_2x' | 'instant_potion' | 'speed_2x') => boolean;
  redeemCode: (codeStr: string) => { success: boolean; message: string; reward?: unknown };
  spinWheel: (isFree: boolean) => { sliceIndex: number; rewardText: string };
  claimLoginReward: () => boolean;
  claimAchievement: (achievementId: string) => void;
  claimQuest: (questId: string) => void;
  performRebirth: () => boolean;
  startPetTraining: (petId: string) => void;
  completePetTraining: (petId: string, success: boolean) => void;
  toggleEquipSigil: (sigilId: string) => void;
  buyArenaItem: (itemId: string, cost: number) => boolean;
  recordArenaWin: (stage: number) => void;
  updateSettings: (newSettings: Partial<GameState['settings']>) => void;
  resetAllProgress: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...getInitialState(),
          ...parsed,
          upgrades: { ...getInitialState().upgrades, ...(parsed.upgrades || {}) },
          settings: { ...getInitialState().settings, ...(parsed.settings || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to parse save game:', e);
    }
    return getInitialState();
  });

  const [weatherIndex, setWeatherIndex] = useState(0);
  const [weatherTimeRemaining, setWeatherTimeRemaining] = useState(1800); // 30 mins
  const [hatchRevealPet, setHatchRevealPet] = useState<Pet | null>(null);
  const [offlineSummary, setOfflineSummary] = useState<OfflineRewardSummary | null>(null);

  // Sync audio manager settings
  useEffect(() => {
    soundManager.enabled = state.settings.soundEnabled;
    soundManager.volume = state.settings.sfxVolume;
  }, [state.settings.soundEnabled, state.settings.sfxVolume]);

  // Calculate passive CPS
  const passiveCoinsPerSec = useMemo(() => {
    const equippedPets = state.inventory.filter((p) => state.equippedPetIds.includes(p.id));
    let baseSum = 0;

    for (const pet of equippedPets) {
      let petCPS = pet.baseCoinsPerSec * (1 + (pet.level - 1) * 0.18);
      // Traits
      if (pet.traits.includes('Coin Magnet')) petCPS *= 1.25;
      if (pet.traits.includes('Supercharged')) petCPS *= 1.5;
      if (pet.traits.includes('Golden Aura')) petCPS *= 1.45;
      if (pet.traits.includes('Sakura Blessing')) petCPS *= 1.3;
      // Trained boost
      if (pet.trainedUntil && pet.trainedUntil > Date.now()) {
        petCPS *= 1.2;
      }
      baseSum += petCPS;
    }

    // Rebirth Multiplier
    const rebirthMult = 1 + state.rebirths * 0.5;

    // Weather Multiplier
    const weatherMult = WEATHERS[weatherIndex].coinMultiplier;

    // Sigils
    let sigilMult = 1.0;
    state.equippedSigilIds.forEach((id) => {
      const s = SIGIL_MAP.get(id);
      if (s && s.buffType === 'passive_income') {
        sigilMult += (s.buffMultiplier - 1.0);
      }
    });

    // Active Buffs
    let buffMult = 1.0;
    const now = Date.now();
    state.activeBuffs.forEach((b) => {
      if (b.endsAt > now && b.type === 'coin_2x') {
        buffMult *= 2;
      }
    });

    return Math.max(0, Math.round(baseSum * rebirthMult * weatherMult * sigilMult * buffMult));
  }, [state.inventory, state.equippedPetIds, state.rebirths, weatherIndex, state.equippedSigilIds, state.activeBuffs]);

  // Tap power
  const tapPower = useMemo(() => {
    const baseTap = 1 + Math.pow(2, state.upgrades.tapPowerLevel);
    const cpsBonus = Math.max(0, Math.round(passiveCoinsPerSec * 0.05));
    let sigilMult = 1.0;
    state.equippedSigilIds.forEach((id) => {
      const s = SIGIL_MAP.get(id);
      if (s && s.buffType === 'tap_power') {
        sigilMult += (s.buffMultiplier - 1.0);
      }
    });
    return Math.max(1, Math.round((baseTap + cpsBonus) * sigilMult));
  }, [state.upgrades.tapPowerLevel, passiveCoinsPerSec, state.equippedSigilIds]);

  // Offline earnings check on initial mount
  useEffect(() => {
    if (state.lastSavedTimestamp && passiveCoinsPerSec > 0) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - state.lastSavedTimestamp) / 1000);
      if (elapsedSeconds > 15) {
        const cappedSeconds = Math.min(elapsedSeconds, 12 * 3600); // 12 hours cap
        const offlineCoins = Math.round(passiveCoinsPerSec * cappedSeconds * 0.5);
        if (offlineCoins > 0) {
          setOfflineSummary({
            secondsAway: cappedSeconds,
            coinsEarned: offlineCoins,
          });
          setState((prev) => ({
            ...prev,
            coins: prev.coins + offlineCoins,
            totalCoinsEarned: prev.totalCoinsEarned + offlineCoins,
          }));
        }
      }
    }
  }, []); // Run once on startup

  // Save to local storage
  useEffect(() => {
    try {
      const toSave = {
        ...state,
        lastSavedTimestamp: Date.now(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [state]);

  // Main 1-second game tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        let newCoins = prev.coins + passiveCoinsPerSec;
        let newTotalCoins = prev.totalCoinsEarned + passiveCoinsPerSec;

        // Clean expired buffs
        const now = Date.now();
        const validBuffs = prev.activeBuffs.filter((b) => b.endsAt > now);

        // Update Incubator Eggs
        const hatchSpeedMultiplier = 1 + prev.upgrades.hatchSpeedLevel * 0.15;
        let newlyHatchedPet: Pet | null = null;
        let updatedIncubator = prev.incubator.map((egg) => {
          const newTime = Math.max(0, egg.timeRemainingSeconds - hatchSpeedMultiplier);
          return {
            ...egg,
            timeRemainingSeconds: newTime,
            isReady: newTime <= 0,
          };
        });

        // Auto hatcher logic
        if (prev.upgrades.autoHatcher && prev.settings.autoHatchEnabled) {
          const readyEggIndex = updatedIncubator.findIndex((e) => e.isReady);
          if (readyEggIndex !== -1 && prev.inventory.length < 250) {
            const eggToHatch = updatedIncubator[readyEggIndex];
            updatedIncubator = updatedIncubator.filter((_, idx) => idx !== readyEggIndex);
            const rolledRarity = rollRarityFromEgg(
              eggToHatch.eggTierId,
              (1 + prev.upgrades.luckLevel * 0.1) * WEATHERS[weatherIndex].luckMultiplier
            );
            const hatchedPet = createPet(rolledRarity);
            newlyHatchedPet = hatchedPet;
          }
        }

        const newInventory = newlyHatchedPet
          ? [...prev.inventory, newlyHatchedPet]
          : prev.inventory;

        const newCollectionLog = newlyHatchedPet
          ? {
              ...prev.collectionLog,
              [`${newlyHatchedPet.speciesId}_${newlyHatchedPet.rarity}`]: true,
            }
          : prev.collectionLog;

        return {
          ...prev,
          coins: newCoins,
          totalCoinsEarned: newTotalCoins,
          activeBuffs: validBuffs,
          incubator: updatedIncubator,
          inventory: newInventory,
          collectionLog: newCollectionLog,
          totalEggsHatched: newlyHatchedPet ? prev.totalEggsHatched + 1 : prev.totalEggsHatched,
        };
      });

      // Update weather timer
      setWeatherTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          setWeatherIndex((idx) => (idx + 1) % WEATHERS.length);
          return 1800; // 30 minutes
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [passiveCoinsPerSec, weatherIndex]);

  // Tap grass play area
  const tapGrass = (_x?: number, _y?: number) => {
    const isCrit = Math.random() < 0.1; // 10% critical tap
    const earned = Math.round(tapPower * (isCrit ? 2.5 : 1.0));

    soundManager.playCoin();

    setState((prev) => {
      // Progress quest
      const updatedQuests = prev.quests.map((q) => {
        if (q.type === 'tap' && !q.completed) {
          const newCurrent = q.current + 1;
          return {
            ...q,
            current: newCurrent,
            completed: newCurrent >= q.target,
          };
        }
        return q;
      });

      return {
        ...prev,
        coins: prev.coins + earned,
        totalCoinsEarned: prev.totalCoinsEarned + earned,
        totalTaps: prev.totalTaps + 1,
        quests: updatedQuests,
      };
    });

    return { earned, crit: isCrit };
  };

  // Buy Egg
  const buyEgg = (eggTierId: string): boolean => {
    const egg = EGG_TIERS_MAP.get(eggTierId);
    if (!egg) return false;
    if (state.coins < egg.cost) return false;
    if (state.incubator.length >= state.upgrades.incubatorSlots) return false;

    soundManager.playCoin();

    const newIncubatingEgg: IncubatingEgg = {
      id: `egg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eggTierId,
      startTimestamp: Date.now(),
      targetDurationSeconds: egg.hatchSeconds,
      timeRemainingSeconds: egg.hatchSeconds,
      warmedCount: 0,
      isReady: false,
    };

    setState((prev) => ({
      ...prev,
      coins: prev.coins - egg.cost,
      incubator: [...prev.incubator, newIncubatingEgg],
    }));

    return true;
  };

  // Warm Egg (-3 seconds per tap)
  const warmEgg = (eggId: string) => {
    soundManager.playWarmEgg();

    setState((prev) => ({
      ...prev,
      incubator: prev.incubator.map((egg) => {
        if (egg.id === eggId) {
          const newRemaining = Math.max(0, egg.timeRemainingSeconds - 3);
          return {
            ...egg,
            timeRemainingSeconds: newRemaining,
            warmedCount: egg.warmedCount + 1,
            isReady: newRemaining <= 0,
          };
        }
        return egg;
      }),
    }));
  };

  // Hatch ready egg
  const hatchEggNow = (eggId: string) => {
    const egg = state.incubator.find((e) => e.id === eggId);
    if (!egg || !egg.isReady) return;

    const luck = (1 + state.upgrades.luckLevel * 0.1) * WEATHERS[weatherIndex].luckMultiplier;
    const rolledRarity = rollRarityFromEgg(egg.eggTierId, luck);
    const pet = createPet(rolledRarity);

    soundManager.playEggCrack();
    setTimeout(() => {
      soundManager.playHatchFanfare(RARITIES[rolledRarity].order);
    }, 400);

    setHatchRevealPet(pet);

    setState((prev) => {
      const updatedQuests = prev.quests.map((q) => {
        if (q.type === 'hatch' && !q.completed) {
          const newCurrent = q.current + 1;
          return {
            ...q,
            current: newCurrent,
            completed: newCurrent >= q.target,
          };
        }
        return q;
      });

      return {
        ...prev,
        incubator: prev.incubator.filter((e) => e.id !== eggId),
        inventory: [...prev.inventory, pet],
        totalEggsHatched: prev.totalEggsHatched + 1,
        collectionLog: {
          ...prev.collectionLog,
          [`${pet.speciesId}_${pet.rarity}`]: true,
        },
        quests: updatedQuests,
      };
    });
  };

  // Use Instant Hatch Potion
  const useInstantHatchPotion = (eggId: string) => {
    if (state.instantHatchPotions <= 0) return;
    setState((prev) => ({
      ...prev,
      instantHatchPotions: prev.instantHatchPotions - 1,
      incubator: prev.incubator.map((egg) => {
        if (egg.id === eggId) {
          return {
            ...egg,
            timeRemainingSeconds: 0,
            isReady: true,
          };
        }
        return egg;
      }),
    }));
  };

  // Equip / Unequip
  const equipPet = (petId: string) => {
    if (state.equippedPetIds.length >= state.upgrades.equipSlots) return;
    if (state.equippedPetIds.includes(petId)) return;

    soundManager.playTap();
    setState((prev) => ({
      ...prev,
      equippedPetIds: [...prev.equippedPetIds, petId],
      inventory: prev.inventory.map((p) =>
        p.id === petId ? { ...p, equipped: true } : p
      ),
    }));
  };

  const unequipPet = (petId: string) => {
    soundManager.playTap();
    setState((prev) => ({
      ...prev,
      equippedPetIds: prev.equippedPetIds.filter((id) => id !== petId),
      inventory: prev.inventory.map((p) =>
        p.id === petId ? { ...p, equipped: false } : p
      ),
    }));
  };

  const renamePet = (petId: string, newName: string) => {
    if (!newName.trim()) return;
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((p) =>
        p.id === petId ? { ...p, name: newName.trim().slice(0, 24) } : p
      ),
    }));
  };

  const levelUpPet = (petId: string): boolean => {
    const pet = state.inventory.find((p) => p.id === petId);
    if (!pet || pet.level >= 100) return false;

    const cost = Math.round(pet.baseCoinsPerSec * pet.level * 25);
    if (state.coins < cost) return false;

    soundManager.playLevelUp();

    setState((prev) => {
      const updatedQuests = prev.quests.map((q) => {
        if (q.type === 'level_up' && !q.completed) {
          const newCurrent = q.current + 1;
          return {
            ...q,
            current: newCurrent,
            completed: newCurrent >= q.target,
          };
        }
        return q;
      });

      return {
        ...prev,
        coins: prev.coins - cost,
        inventory: prev.inventory.map((p) =>
          p.id === petId ? { ...p, level: p.level + 1 } : p
        ),
        quests: updatedQuests,
      };
    });

    return true;
  };

  const sellPet = (petId: string) => {
    const pet = state.inventory.find((p) => p.id === petId);
    if (!pet || pet.locked || pet.equipped) return;

    soundManager.playCoin();

    setState((prev) => ({
      ...prev,
      coins: prev.coins + pet.sellPrice,
      totalCoinsEarned: prev.totalCoinsEarned + pet.sellPrice,
      inventory: prev.inventory.filter((p) => p.id !== petId),
      equippedPetIds: prev.equippedPetIds.filter((id) => id !== petId),
    }));
  };

  const toggleLockPet = (petId: string) => {
    soundManager.playTap();
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((p) =>
        p.id === petId ? { ...p, locked: !p.locked } : p
      ),
    }));
  };

  // Pet Fusion (allows any 3 or 5 pets of same or different rarities!)
  const fusePets = (petIds: string[]) => {
    if (petIds.length !== 3 && petIds.length !== 5) {
      return { success: false, message: 'Select exactly 3 or 5 pets to fuse!' };
    }

    const selectedPets = state.inventory.filter((p) => petIds.includes(p.id));
    if (selectedPets.length !== petIds.length) {
      return { success: false, message: 'Invalid pets selected.' };
    }

    if (selectedPets.some((p) => p.locked || p.equipped)) {
      return { success: false, message: 'Cannot fuse locked or equipped pets!' };
    }

    // Determine target rarity based on the highest rarity selected
    const rarityIndices = selectedPets.map((p) => RARITY_ORDER.indexOf(p.rarity));
    const maxRarityIdx = Math.max(...rarityIndices);
    const targetRarityIdx = Math.min(RARITY_ORDER.length - 1, maxRarityIdx + 1);
    const nextRarity = RARITY_ORDER[targetRarityIdx];

    // Pick species from the highest-rarity pets in the fusion batch
    const highestTierPets = selectedPets.filter(
      (p) => RARITY_ORDER.indexOf(p.rarity) === maxRarityIdx
    );
    const chosenSpeciesId = highestTierPets[Math.floor(Math.random() * highestTierPets.length)].speciesId;

    const isFiveFuse = petIds.length === 5;
    const newPet = createPet(nextRarity, chosenSpeciesId, isFiveFuse);

    soundManager.playLevelUp();

    setState((prev) => {
      const updatedQuests = prev.quests.map((q) => {
        if (q.type === 'fuse' && !q.completed) {
          const newCurrent = q.current + 1;
          return {
            ...q,
            current: newCurrent,
            completed: newCurrent >= q.target,
          };
        }
        return q;
      });

      return {
        ...prev,
        inventory: [...prev.inventory.filter((p) => !petIds.includes(p.id)), newPet],
        totalFusions: prev.totalFusions + 1,
        collectionLog: {
          ...prev.collectionLog,
          [`${newPet.speciesId}_${newPet.rarity}`]: true,
        },
        quests: updatedQuests,
      };
    });

    return {
      success: true,
      newPet,
      message: `Fused into ${isFiveFuse ? '✨ SHINY ' : ''}${newPet.rarity} ${newPet.name}!`,
    };
  };

  // Upgrades
  const buyUpgrade = (type: keyof GameState['upgrades']): boolean => {
    const curVal = state.upgrades[type];
    let cost = 0;

    switch (type) {
      case 'equipSlots':
        if (typeof curVal === 'number' && curVal >= 8) return false;
        cost = Math.round(5000 * Math.pow(4, (curVal as number) - 3));
        break;
      case 'luckLevel':
        if (typeof curVal === 'number' && curVal >= 10) return false;
        cost = Math.round(1000 * Math.pow(2.8, curVal as number));
        break;
      case 'hatchSpeedLevel':
        if (typeof curVal === 'number' && curVal >= 10) return false;
        cost = Math.round(750 * Math.pow(2.5, curVal as number));
        break;
      case 'tapPowerLevel':
        if (typeof curVal === 'number' && curVal >= 10) return false;
        cost = Math.round(500 * Math.pow(2.2, curVal as number));
        break;
      case 'incubatorSlots':
        if (typeof curVal === 'number' && curVal >= 8) return false;
        cost = Math.round(3000 * Math.pow(3.5, (curVal as number) - 3));
        break;
      case 'autoHatcher':
        if (curVal === true) return false;
        cost = 250000;
        break;
    }

    if (state.coins < cost) return false;

    soundManager.playLevelUp();

    setState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      upgrades: {
        ...prev.upgrades,
        [type]: typeof curVal === 'boolean' ? true : (curVal as number) + 1,
      },
    }));

    return true;
  };

  // Mystery Box
  const buyMysteryBox = (boxTier: 'bronze' | 'silver' | 'gold') => {
    let costCoins = 0;
    let costGems = 0;

    if (boxTier === 'bronze') costCoins = 2500;
    if (boxTier === 'silver') costGems = 40;
    if (boxTier === 'gold') costGems = 150;

    if (state.coins < costCoins || state.gems < costGems) {
      return { type: 'error', rewardText: 'Not enough currency!' };
    }

    soundManager.playLevelUp();

    let rewardText = '';
    let coinsBonus = 0;
    let gemsBonus = 0;
    let addedPet: Pet | null = null;

    if (boxTier === 'bronze') {
      const roll = Math.random();
      if (roll < 0.6) {
        coinsBonus = 5000;
        rewardText = '5,000 Coins!';
      } else if (roll < 0.9) {
        gemsBonus = 15;
        rewardText = '15 Gems!';
      } else {
        addedPet = createPet('Rare');
        rewardText = `Rare ${addedPet.name} Pet!`;
      }
    } else if (boxTier === 'silver') {
      const roll = Math.random();
      if (roll < 0.5) {
        coinsBonus = 100000;
        rewardText = '100,000 Coins!';
      } else if (roll < 0.8) {
        addedPet = createPet('Epic');
        rewardText = `Epic ${addedPet.name} Pet!`;
      } else {
        addedPet = createPet('Legendary');
        rewardText = `Legendary ${addedPet.name} Pet!`;
      }
    } else {
      // Gold
      const roll = Math.random();
      if (roll < 0.4) {
        coinsBonus = 2500000;
        rewardText = '2,500,000 Coins!';
      } else if (roll < 0.75) {
        addedPet = createPet('Huge');
        rewardText = `Huge ${addedPet.name} Pet!`;
      } else {
        addedPet = createPet('Titanic');
        rewardText = `TITANIC ${addedPet.name} PET!`;
      }
    }

    setState((prev) => ({
      ...prev,
      coins: prev.coins - costCoins + coinsBonus,
      gems: prev.gems - costGems + gemsBonus,
      totalCoinsEarned: prev.totalCoinsEarned + coinsBonus,
      inventory: addedPet ? [...prev.inventory, addedPet] : prev.inventory,
    }));

    return { type: 'success', rewardText };
  };

  // Buy Gem Buffs
  const buyGemBuff = (buffType: 'coin_2x' | 'luck_2x' | 'instant_potion' | 'speed_2x'): boolean => {
    let cost = 50;
    if (buffType === 'instant_potion') cost = 30;

    if (state.gems < cost) return false;

    soundManager.playCoin();

    setState((prev) => {
      if (buffType === 'instant_potion') {
        return {
          ...prev,
          gems: prev.gems - cost,
          instantHatchPotions: prev.instantHatchPotions + 3,
        };
      }

      const newBuff: ActiveBuff = {
        id: `buff_${Date.now()}`,
        type: buffType,
        name: buffType === 'coin_2x' ? '2x Coins' : buffType === 'luck_2x' ? '2x Luck' : '2x Speed',
        multiplier: 2,
        endsAt: Date.now() + 15 * 60 * 1000, // 15 mins
      };

      return {
        ...prev,
        gems: prev.gems - cost,
        activeBuffs: [...prev.activeBuffs, newBuff],
      };
    });

    return true;
  };

  // 500 Codes Redemption
  const redeemCode = (codeStr: string) => {
    const cleanCode = codeStr.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a code.' };

    if (state.claimedCodes.includes(cleanCode)) {
      return { success: false, message: 'This code has already been redeemed!' };
    }

    const matched = (allCodesData as Array<{ code: string; type: string; label: string; reward: Record<string, unknown> }>).find(
      (c) => c.code.toUpperCase() === cleanCode
    );

    if (!matched) {
      return { success: false, message: 'Invalid redemption code!' };
    }

    const rew = matched.reward;
    soundManager.playHatchFanfare(10);

    let newPet: Pet | null = null;
    if (rew.petRarity) {
      newPet = createPet(rew.petRarity as RarityTier, (rew.species as string) || undefined);
    }

    setState((prev) => {
      let coinsToAdd = (rew.coins as number) || 0;
      let gemsToAdd = (rew.gems as number) || 0;
      let potionsToAdd = (rew.instantHatchPotions as number) || 0;

      let newBuffs = [...prev.activeBuffs];
      if (rew.buffType && rew.buffDurationMinutes) {
        newBuffs.push({
          id: `code_buff_${Date.now()}`,
          type: rew.buffType as 'coin_2x' | 'luck_2x',
          name: 'Code Overdrive Boost',
          multiplier: 2,
          endsAt: Date.now() + (rew.buffDurationMinutes as number) * 60 * 1000,
        });
      }

      return {
        ...prev,
        coins: prev.coins + coinsToAdd,
        gems: prev.gems + gemsToAdd,
        totalCoinsEarned: prev.totalCoinsEarned + coinsToAdd,
        instantHatchPotions: prev.instantHatchPotions + potionsToAdd,
        inventory: newPet ? [...prev.inventory, newPet] : prev.inventory,
        activeBuffs: newBuffs,
        claimedCodes: [...prev.claimedCodes, cleanCode],
        collectionLog: newPet
          ? { ...prev.collectionLog, [`${newPet.speciesId}_${newPet.rarity}`]: true }
          : prev.collectionLog,
      };
    });

    return {
      success: true,
      message: `Redeemed ${matched.label}! Received: ${(rew.description as string) || 'Awesome Rewards!'}`,
      reward: rew,
    };
  };

  // Daily Spin
  const spinWheel = (isFree: boolean) => {
    if (!isFree && state.gems < 25) {
      return { sliceIndex: -1, rewardText: 'Need 25 gems to spin!' };
    }

    // 8 slices:
    // 0: 5,000 Coins
    // 1: 25 Gems
    // 2: 50,000 Coins
    // 3: 100 Gems
    // 4: 2x Boost (15m)
    // 5: 500,000 Coins
    // 6: Rare/Epic Pet
    // 7: JACKPOT: 5M Coins + Legendary Pet!
    const roll = Math.random();
    let sliceIndex = 0;
    let rewardText = '';
    let coinsToAdd = 0;
    let gemsToAdd = 0;
    let petToAdd: Pet | null = null;
    let buffToAdd: ActiveBuff | null = null;

    if (roll < 0.28) {
      sliceIndex = 0;
      coinsToAdd = 5000;
      rewardText = '5,000 Coins!';
    } else if (roll < 0.50) {
      sliceIndex = 1;
      gemsToAdd = 25;
      rewardText = '25 Gems!';
    } else if (roll < 0.70) {
      sliceIndex = 2;
      coinsToAdd = 50000;
      rewardText = '50,000 Coins!';
    } else if (roll < 0.82) {
      sliceIndex = 3;
      gemsToAdd = 100;
      rewardText = '100 Gems!';
    } else if (roll < 0.90) {
      sliceIndex = 4;
      buffToAdd = {
        id: `spin_buff_${Date.now()}`,
        type: 'coin_2x',
        name: 'Daily 2x Coin Boost',
        multiplier: 2,
        endsAt: Date.now() + 15 * 60 * 1000,
      };
      rewardText = '15m 2x Coins Boost!';
    } else if (roll < 0.96) {
      sliceIndex = 5;
      coinsToAdd = 500000;
      rewardText = '500,000 Coins!';
    } else if (roll < 0.99) {
      sliceIndex = 6;
      petToAdd = createPet('Epic');
      rewardText = `Epic ${petToAdd.name} Pet!`;
    } else {
      sliceIndex = 7;
      coinsToAdd = 5000000;
      petToAdd = createPet('Legendary');
      rewardText = `🎉 JACKPOT! 5,000,000 Coins + Legendary ${petToAdd.name}!`;
    }

    setState((prev) => ({
      ...prev,
      gems: isFree ? prev.gems + gemsToAdd : prev.gems - 25 + gemsToAdd,
      coins: prev.coins + coinsToAdd,
      totalCoinsEarned: prev.totalCoinsEarned + coinsToAdd,
      lastDailySpinTimestamp: isFree ? Date.now() : prev.lastDailySpinTimestamp,
      inventory: petToAdd ? [...prev.inventory, petToAdd] : prev.inventory,
      activeBuffs: buffToAdd ? [...prev.activeBuffs, buffToAdd] : prev.activeBuffs,
    }));

    return { sliceIndex, rewardText };
  };

  // 7-Day Login Rewards
  const claimLoginReward = (): boolean => {
    if (state.claimedToday) return false;

    const day = ((state.loginStreak - 1) % 7) + 1;
    let coins = 0;
    let gems = 0;
    let pet: Pet | null = null;

    switch (day) {
      case 1:
        coins = 500;
        break;
      case 2:
        coins = 2500;
        gems = 10;
        break;
      case 3:
        coins = 10000;
        gems = 25;
        pet = createPet('Rare');
        break;
      case 4:
        coins = 25000;
        gems = 50;
        break;
      case 5:
        coins = 75000;
        gems = 100;
        pet = createPet('Epic');
        break;
      case 6:
        coins = 150000;
        gems = 150;
        break;
      case 7:
        coins = 500000;
        gems = 500;
        pet = createPet('Titanic');
        break;
    }

    soundManager.playLevelUp();

    setState((prev) => ({
      ...prev,
      coins: prev.coins + coins,
      gems: prev.gems + gems,
      totalCoinsEarned: prev.totalCoinsEarned + coins,
      claimedToday: true,
      loginStreak: prev.loginStreak + 1,
      inventory: pet ? [...prev.inventory, pet] : prev.inventory,
    }));

    return true;
  };

  // Achievements
  const claimAchievement = (achievementId: string) => {
    const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach || state.claimedAchievements.includes(achievementId)) return;

    soundManager.playCoin();

    setState((prev) => ({
      ...prev,
      coins: prev.coins + (ach.rewardCoins || 0),
      gems: prev.gems + (ach.rewardGems || 0),
      totalCoinsEarned: prev.totalCoinsEarned + (ach.rewardCoins || 0),
      claimedAchievements: [...prev.claimedAchievements, achievementId],
    }));
  };

  // Quests
  const claimQuest = (questId: string) => {
    const quest = state.quests.find((q) => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    soundManager.playCoin();

    setState((prev) => ({
      ...prev,
      coins: prev.coins + quest.rewardCoins,
      gems: prev.gems + quest.rewardGems,
      totalCoinsEarned: prev.totalCoinsEarned + quest.rewardCoins,
      quests: prev.quests.map((q) =>
        q.id === questId ? { ...q, claimed: true } : q
      ),
    }));
  };

  // Rebirth
  const performRebirth = (): boolean => {
    const requiredCoins = Math.round(250000 * Math.pow(state.rebirths + 1, 2.2));
    if (state.coins < requiredCoins) return false;

    soundManager.playHatchFanfare(12);

    setState((prev) => {
      // Keep locked pets, clear unlocked non-equipped pets or basic inventory
      const preservedPets = prev.inventory.filter((p) => p.locked || prev.equippedPetIds.includes(p.id));

      return {
        ...prev,
        coins: 0,
        gems: prev.gems + 150 * (prev.rebirths + 1),
        rebirths: prev.rebirths + 1,
        rebirthMultiplier: 1 + (prev.rebirths + 1) * 0.5,
        inventory: preservedPets.length > 0 ? preservedPets : [createPet('Common', 'cat')],
      };
    });

    return true;
  };

  // Pet Training
  const startPetTraining = (_petId: string) => {
    soundManager.playTap();
  };

  const completePetTraining = (petId: string, success: boolean) => {
    if (!success) return;
    soundManager.playLevelUp();
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((p) =>
        p.id === petId ? { ...p, trainedUntil: Date.now() + 60 * 60 * 1000 } : p
      ),
    }));
  };

  // Sigil equip
  const toggleEquipSigil = (sigilId: string) => {
    soundManager.playTap();
    setState((prev) => {
      const isEquipped = prev.equippedSigilIds.includes(sigilId);
      if (isEquipped) {
        return {
          ...prev,
          equippedSigilIds: prev.equippedSigilIds.filter((id) => id !== sigilId),
        };
      } else {
        if (prev.equippedSigilIds.length >= 3) {
          return prev; // max 3 sigils
        }
        return {
          ...prev,
          equippedSigilIds: [...prev.equippedSigilIds, sigilId],
        };
      }
    });
  };

  // Arena
  const buyArenaItem = (_itemId: string, cost: number): boolean => {
    if (state.arenaPoints < cost) return false;
    soundManager.playLevelUp();
    setState((prev) => ({
      ...prev,
      arenaPoints: prev.arenaPoints - cost,
    }));
    return true;
  };

  const recordArenaWin = (stage: number) => {
    soundManager.playLevelUp();
    const earnedPoints = 10 + stage * 2;
    const earnedCoins = stage * 2500;
    const earnedGems = Math.floor(stage / 3) + 2;

    setState((prev) => {
      const updatedQuests = prev.quests.map((q) => {
        if (q.type === 'arena_win' && !q.completed) {
          const newCurrent = q.current + 1;
          return {
            ...q,
            current: newCurrent,
            completed: newCurrent >= q.target,
          };
        }
        return q;
      });

      return {
        ...prev,
        arenaPoints: prev.arenaPoints + earnedPoints,
        coins: prev.coins + earnedCoins,
        gems: prev.gems + earnedGems,
        totalCoinsEarned: prev.totalCoinsEarned + earnedCoins,
        totalArenaWins: prev.totalArenaWins + 1,
        arenaStage: Math.max(prev.arenaStage, stage + 1),
        arenaBestStage: Math.max(prev.arenaBestStage, stage + 1),
        quests: updatedQuests,
      };
    });
  };

  const updateSettings = (newSettings: Partial<GameState['settings']>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const resetAllProgress = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState(getInitialState());
  };

  return (
    <GameContext.Provider
      value={{
        state,
        weather: WEATHERS[weatherIndex],
        passiveCoinsPerSec,
        tapPower,
        hatchRevealPet,
        offlineSummary,
        clearOfflineSummary: () => setOfflineSummary(null),
        clearHatchReveal: () => setHatchRevealPet(null),
        tapGrass,
        buyEgg,
        warmEgg,
        hatchEggNow,
        useInstantHatchPotion,
        equipPet,
        unequipPet,
        renamePet,
        levelUpPet,
        sellPet,
        toggleLockPet,
        fusePets,
        buyUpgrade,
        buyMysteryBox,
        buyGemBuff,
        redeemCode,
        spinWheel,
        claimLoginReward,
        claimAchievement,
        claimQuest,
        performRebirth,
        startPetTraining,
        completePetTraining,
        toggleEquipSigil,
        buyArenaItem,
        recordArenaWin,
        updateSettings,
        resetAllProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
