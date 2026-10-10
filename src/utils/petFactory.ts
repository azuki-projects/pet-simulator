import { Pet, RarityTier } from '../types/game';
import { RARITIES, TRAIT_POOL } from '../data/rarities';
import { PET_SPECIES } from '../data/species';
import { EGG_TIERS_MAP } from '../data/eggs';

export function createPet(
  rarity: RarityTier,
  customSpeciesId?: string,
  forceShiny: boolean = false
): Pet {
  const species = customSpeciesId
    ? PET_SPECIES.find((s) => s.id === customSpeciesId) || PET_SPECIES[0]
    : PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];

  const rarityConfig = RARITIES[rarity];
  const isShiny = forceShiny || Math.random() < 0.01; // 1% random shiny

  // Trait roll: 1 to 3 traits
  const numTraits = rarityConfig.order > 8 ? 3 : rarityConfig.order > 4 ? 2 : 1;
  const shuffledTraits = [...TRAIT_POOL].sort(() => 0.5 - Math.random());
  const selectedTraits = shuffledTraits.slice(0, numTraits).map((t) => t.name);

  // Weight logic
  let baseWeight = 2 + Math.random() * 8;
  if (rarity === 'Huge') baseWeight = 50 + Math.random() * 120;
  if (rarity === 'Titanic') baseWeight = 500 + Math.random() * 1500;
  if (rarity === 'Secret' || rarity === 'Azuki Exclusive') baseWeight = 800 + Math.random() * 2000;
  if (rarity === 'Immortal' || rarity === 'Primordial' || rarity === 'Ultimate Azuki') {
    baseWeight = 2500 + Math.random() * 5000;
  }

  // Base CPS
  const variance = 0.9 + Math.random() * 0.25; // 0.9x to 1.15x
  const shinyMultiplier = isShiny ? 2.5 : 1.0;
  const baseCPS = Math.max(1, Math.round(species.basePower * rarityConfig.multiplier * variance * shinyMultiplier));

  // Sell Price calculation
  const sellPrice = Math.max(25, Math.round(baseCPS * 10));

  return {
    id: `pet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    speciesId: species.id,
    name: `${isShiny ? '✨ Shiny ' : ''}${species.name}`,
    rarity,
    level: 1,
    baseCoinsPerSec: baseCPS,
    weightKg: Math.round(baseWeight * 10) / 10,
    sellPrice,
    traits: selectedTraits,
    locked: rarityConfig.order >= 7, // Auto-lock high rarity pets to prevent accidental selling
    equipped: false,
    shiny: isShiny,
    hatchedAt: Date.now(),
  };
}

export function rollRarityFromEgg(
  eggTierId: string,
  luckMultiplier: number = 1.0
): RarityTier {
  const egg = EGG_TIERS_MAP.get(eggTierId);
  if (!egg) return 'Common';

  const dropRates = { ...egg.dropRates };
  const entries = Object.entries(dropRates) as [RarityTier, number][];

  // Adjust high rarities with luckMultiplier
  let totalWeight = 0;
  const adjustedEntries = entries.map(([rarity, baseRate]) => {
    let weight = baseRate;
    const config = RARITIES[rarity];
    if (config.order >= 4 && luckMultiplier > 1.0) {
      weight *= luckMultiplier;
    }
    totalWeight += weight;
    return { rarity, weight };
  });

  const roll = Math.random() * totalWeight;
  let cumulative = 0;

  for (const item of adjustedEntries) {
    cumulative += item.weight;
    if (roll <= cumulative) {
      return item.rarity;
    }
  }

  return adjustedEntries[adjustedEntries.length - 1].rarity;
}
