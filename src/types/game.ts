export type RarityTier =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Huge'
  | 'Titanic'
  | 'Secret'
  | 'Azuki Exclusive'
  | 'Immortal'
  | 'Primordial'
  | 'Ultimate Azuki';

export interface RarityConfig {
  id: RarityTier;
  multiplier: number;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  badgeClass: string;
  order: number;
}

export interface Pet {
  id: string;
  speciesId: string;
  name: string;
  rarity: RarityTier;
  level: number; // 1 to 100
  baseCoinsPerSec: number;
  weightKg: number;
  sellPrice: number;
  traits: string[];
  locked: boolean;
  equipped: boolean;
  shiny: boolean;
  trainedUntil?: number; // timestamp
  hatchedAt: number;
}

export interface PetSpecies {
  id: string;
  name: string;
  description: string;
  basePower: number;
  category: 'beast' | 'mythic' | 'azuki' | 'celestial' | 'elemental';
  iconSvg: string; // SVG path or symbol definition
}

export interface EggTier {
  id: string;
  tierIndex: number;
  name: string;
  cost: number;
  hatchSeconds: number;
  description: string;
  color: string;
  accentColor: string;
  glow: string;
  unlockRequirementText: string;
  unlockRequirementCoins: number;
  dropRates: Partial<Record<RarityTier, number>>;
}

export interface IncubatingEgg {
  id: string;
  eggTierId: string;
  startTimestamp: number;
  targetDurationSeconds: number;
  timeRemainingSeconds: number;
  warmedCount: number;
  isReady: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'hatch' | 'coins' | 'pets' | 'arena' | 'rebirth' | 'fusion' | 'taps';
  targetValue: number;
  rewardCoins?: number;
  rewardGems?: number;
}

export type WeatherType =
  | 'sunny'
  | 'rainy'
  | 'fire_storm'
  | 'sakura_breeze'
  | 'cosmic_night';

export interface WeatherState {
  type: WeatherType;
  name: string;
  description: string;
  icon: string;
  buffText: string;
  coinMultiplier: number;
  luckMultiplier: number;
  arenaMultiplier: number;
  endsAt: number;
}

export interface Sigil {
  id: string;
  name: string;
  description: string;
  rarity: RarityTier;
  icon: string;
  buffType: 'tap_power' | 'passive_income' | 'luck' | 'speed' | 'arena_attack';
  buffMultiplier: number; // e.g. 1.25 for +25%
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'tap' | 'hatch' | 'arena_win' | 'earn_coins' | 'level_up' | 'fuse';
  target: number;
  current: number;
  rewardCoins: number;
  rewardGems: number;
  isWeekly: boolean;
  completed: boolean;
  claimed: boolean;
}

export interface ActiveBuff {
  id: string;
  type: 'coin_2x' | 'luck_2x' | 'speed_2x' | 'autoclick';
  name: string;
  multiplier: number;
  endsAt: number;
}

export interface CodeReward {
  coins?: number;
  gems?: number;
  petRarity?: RarityTier;
  species?: string;
  buffType?: string;
  buffDurationMinutes?: number;
  instantHatchPotions?: number;
  description: string;
}

export interface RedemptionCode {
  code: string;
  type: string;
  label: string;
  reward: CodeReward;
}

export interface UpgradesState {
  equipSlots: number; // 3 to 8
  luckLevel: number; // 0 to 10 (+10% luck per level)
  hatchSpeedLevel: number; // 0 to 10 (+15% speed per level)
  tapPowerLevel: number; // 0 to 10 (x2 tap power per level)
  incubatorSlots: number; // 3 to 8
  autoHatcher: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  sfxVolume: number;
  autoHatchEnabled: boolean;
  petScale: 'small' | 'medium' | 'large' | 'giant';
}

export interface GameState {
  coins: number;
  gems: number;
  arenaPoints: number;
  rebirths: number;
  rebirthMultiplier: number;
  inventory: Pet[];
  incubator: IncubatingEgg[];
  equippedPetIds: string[];
  equippedSigilIds: string[];
  ownedSigils: Sigil[];
  totalTaps: number;
  totalEggsHatched: number;
  totalCoinsEarned: number;
  totalArenaWins: number;
  totalFusions: number;
  upgrades: UpgradesState;
  claimedCodes: string[];
  claimedAchievements: string[];
  lastDailySpinTimestamp: number;
  loginStreak: number;
  lastLoginDate: string;
  claimedToday: boolean;
  collectionLog: Record<string, boolean>; // e.g. "Cat_Common": true
  activeBuffs: ActiveBuff[];
  instantHatchPotions: number;
  arenaStage: number;
  arenaBestStage: number;
  lastSavedTimestamp: number;
  settings: GameSettings;
  quests: Quest[];
}
