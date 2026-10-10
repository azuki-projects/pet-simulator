import { Pet, RarityTier, Mutation } from '../types/game';
import { RARITIES, TRAIT_POOL } from '../data/rarities';
import { PET_SPECIES } from '../data/species';
import { EGG_TIERS_MAP } from '../data/eggs';
import { MUTATIONS_POOL } from '../data/mutations';

export function createPet(
  rarity: RarityTier,
  customSpeciesId?: string,
  forceShiny: boolean = false,
  forceMutation?: Mutation
): Pet {
  const species = customSpeciesId
    ? PET_SPECIES.find((s) => s.id === customSpeciesId) || PET_SPECIES[0]
    : PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];

  const rarityConfig = RARITIES[rarity] || RARITIES['Common'];
  const isShiny = forceShiny || Math.random() < 0.02; // 2% random shiny

  // Mutation roll: 12% natural mutation chance, higher for rare pets
  let mutation: Mutation | undefined = forceMutation;
  if (!mutation) {
    const mutationChance = 0.12 + Math.min(0.2, rarityConfig.order * 0.005);
    if (Math.random() < mutationChance) {
      mutation = MUTATIONS_POOL[Math.floor(Math.random() * MUTATIONS_POOL.length)];
    }
  }

  // Trait roll: 1 to 3 traits
  const numTraits = rarityConfig.order > 8 ? 3 : rarityConfig.order > 4 ? 2 : 1;
  const shuffledTraits = [...TRAIT_POOL].sort(() => 0.5 - Math.random());
  const selectedTraits = shuffledTraits.slice(0, numTraits).map((t) => t.name);

  // Weight logic
  let baseWeight = 2 + Math.random() * 8;
  if (rarity === 'Huge' || rarity === 'Colossal') baseWeight = 50 + Math.random() * 120;
  if (rarity === 'Titanic' || rarity === 'Gigantic') baseWeight = 500 + Math.random() * 1500;
  if (rarityConfig.order >= 12) baseWeight = 800 + Math.random() * 2500;
  if (rarityConfig.order >= 20) baseWeight = 3000 + Math.random() * 8000;

  // Base CPS
  const variance = 0.9 + Math.random() * 0.25; // 0.9x to 1.15x
  const shinyMultiplier = isShiny ? 2.5 : 1.0;
  const mutationMultiplier = mutation ? mutation.multiplier : 1.0;
  const baseCPS = Math.max(
    1,
    Math.round(species.basePower * rarityConfig.multiplier * variance * shinyMultiplier * mutationMultiplier)
  );

  // Sell Price calculation
  const sellPrice = Math.max(25, Math.round(baseCPS * 8));

  // Base Fusion contribution (15% - 40% based on rarity tier order and mutation)
  const baseFuseContribution = Math.min(
    45,
    Math.max(15, Math.round(18 + (rarityConfig.order / 63) * 20 + (mutation ? 5 : 0) + (isShiny ? 4 : 0)))
  );

  return {
    id: `pet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    speciesId: species.id,
    name: `${mutation ? `${mutation.icon} ` : ''}${isShiny ? '✨ Shiny ' : ''}${species.name}`,
    rarity,
    level: 1,
    baseCoinsPerSec: baseCPS,
    weightKg: Math.round(baseWeight * 10) / 10,
    sellPrice,
    traits: selectedTraits,
    mutation,
    fuseBaseChance: baseFuseContribution,
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
    const config = RARITIES[rarity] || RARITIES['Common'];
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
