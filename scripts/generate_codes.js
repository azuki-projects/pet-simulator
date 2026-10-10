import fs from 'fs';
import path from 'path';

// 500 unique codes total, no duplicates, case-insensitive
// 10 guaranteed named codes:
// AZUKI, FIRE, PETLOVER, TITANIC, WELCOME2026, LUCKY, HATCH, ULTIMATE, SECRET, REBIRTH

const guaranteedCodes = [
  {
    code: "WELCOME2026",
    type: "starter_pack",
    label: "Welcome Pack",
    reward: { coins: 5000, gems: 50, description: "5,000 Coins & 50 Gems" }
  },
  {
    code: "AZUKI",
    type: "azuki_exclusive_pet",
    label: "Azuki Clan Gift",
    reward: { petRarity: "Azuki Exclusive", species: "Azuki Spirit", coins: 50000, gems: 100, description: "Exclusive Azuki Spirit Pet + 50k Coins + 100 Gems" }
  },
  {
    code: "FIRE",
    type: "gem_buff_pack",
    label: "Fire Boost Pack",
    reward: { gems: 250, buffType: "coin_2x", buffDurationMinutes: 30, description: "250 Gems + 30m 2x Coins Boost" }
  },
  {
    code: "PETLOVER",
    type: "rare_epic_pet",
    label: "Pet Lover Bundle",
    reward: { petRarity: "Epic", species: "Phoenix", coins: 25000, gems: 50, description: "Epic Phoenix Pet + 25k Coins + 50 Gems" }
  },
  {
    code: "TITANIC",
    type: "titanic_pet",
    label: "Titanic Power",
    reward: { petRarity: "Titanic", species: "Cerberus", coins: 500000, gems: 300, description: "Titanic Cerberus Pet + 500k Coins + 300 Gems" }
  },
  {
    code: "LUCKY",
    type: "large_coin_pack",
    label: "Fortune Token",
    reward: { coins: 250000, gems: 150, buffType: "luck_2x", buffDurationMinutes: 20, description: "250k Coins + 150 Gems + 20m Luck Boost" }
  },
  {
    code: "HATCH",
    type: "mid_coin_pack",
    label: "Speed Incubator",
    reward: { coins: 50000, gems: 75, instantHatchPotions: 3, description: "50k Coins + 75 Gems + 3 Instant Hatch Potions" }
  },
  {
    code: "ULTIMATE",
    type: "ultimate_bundle",
    label: "The Ultimate Azuki Treasure",
    reward: {
      petRarity: "Ultimate Azuki",
      species: "Azuki Emperor",
      coins: 1000000000,
      gems: 5000,
      description: "Ultimate Azuki Emperor Pet + 1,000,000,000 Coins + 5,000 Gems!"
    }
  },
  {
    code: "SECRET",
    type: "secret_pet",
    label: "Secret Dimension Key",
    reward: { petRarity: "Secret", species: "Void Monarch", coins: 2000000, gems: 500, description: "Secret Void Monarch Pet + 2M Coins + 500 Gems" }
  },
  {
    code: "REBIRTH",
    type: "immortal_bundle",
    label: "Immortal Ascension Bundle",
    reward: {
      petRarity: "Immortal",
      species: "Golden Seraph",
      coins: 100000000,
      gems: 2500,
      description: "Immortal Golden Seraph Pet + 100M Coins + 2,500 Gems"
    }
  }
];

const generatedCodes = new Map();

// Register guaranteed codes first
guaranteedCodes.forEach(item => {
  generatedCodes.set(item.code.toUpperCase(), item);
});

// Reward distribution across the 500 codes:
// 200 × starter coin + gem packs (1 is WELCOME2026 -> 199 remaining)
// 120 × mid coin packs (1 is HATCH -> 119 remaining)
// 50 × large coin packs (1 is LUCKY -> 49 remaining)
// 40 × gem + 2x earnings buff packs (1 is FIRE -> 39 remaining)
// 30 × random rare–epic pets (1 is PETLOVER -> 29 remaining)
// 25 × random huge pets (25 remaining)
// 20 × random Azuki exclusive pets (1 is AZUKI -> 19 remaining)
// 10 × random titanic pets (1 is TITANIC -> 9 remaining)
// 4 × random secret pets (1 is SECRET -> 3 remaining)
// 1 × immortal pet + massive coin + gem bundle (REBIRTH already included)
// 1 × Ultimate Azuki pet + 1 billion coins + 5000 gems (ULTIMATE already included)

// Total: 10 guaranteed + 199 + 119 + 49 + 39 + 29 + 25 + 19 + 9 + 3 = 492 + 8 = 500 total!
const remainingCategories = [
  {
    count: 198,
    type: "starter_pack",
    label: "Starter Supplies",
    makeReward: (i) => ({
      coins: 1000 + (i % 5) * 500,
      gems: 10 + (i % 4) * 5,
      description: `${(1000 + (i % 5) * 500).toLocaleString()} Coins & ${10 + (i % 4) * 5} Gems`
    }),
    prefix: "START"
  },
  {
    count: 119,
    type: "mid_coin_pack",
    label: "Adventurer Stash",
    makeReward: (i) => ({
      coins: 15000 + (i % 7) * 5000,
      gems: 30 + (i % 5) * 10,
      description: `${(15000 + (i % 7) * 5000).toLocaleString()} Coins & ${30 + (i % 5) * 10} Gems`
    }),
    prefix: "COIN"
  },
  {
    count: 49,
    type: "large_coin_pack",
    label: "Grand Vault",
    makeReward: (i) => ({
      coins: 100000 + (i % 10) * 20000,
      gems: 100 + (i % 6) * 25,
      description: `${(100000 + (i % 10) * 20000).toLocaleString()} Coins & ${100 + (i % 6) * 25} Gems`
    }),
    prefix: "VAULT"
  },
  {
    count: 39,
    type: "gem_buff_pack",
    label: "Overdrive Buff Pack",
    makeReward: (i) => ({
      gems: 150 + (i % 5) * 25,
      buffType: "coin_2x",
      buffDurationMinutes: 15,
      description: `${150 + (i % 5) * 25} Gems + 15m 2x Coins Boost`
    }),
    prefix: "BOOST"
  },
  {
    count: 29,
    type: "rare_epic_pet",
    label: "Rare Hatchling Ticket",
    makeReward: (i) => ({
      petRarity: i % 2 === 0 ? "Rare" : "Epic",
      coins: 20000,
      gems: 40,
      description: `Random ${i % 2 === 0 ? "Rare" : "Epic"} Pet + 20k Coins`
    }),
    prefix: "BEAST"
  },
  {
    count: 25,
    type: "huge_pet",
    label: "Colossal Egg Ticket",
    makeReward: (i) => ({
      petRarity: "Huge",
      coins: 150000,
      gems: 150,
      description: "Random Huge Pet + 150k Coins + 150 Gems"
    }),
    prefix: "HUGE"
  },
  {
    count: 19,
    type: "azuki_exclusive_pet",
    label: "Azuki Ancestor Gift",
    makeReward: (i) => ({
      petRarity: "Azuki Exclusive",
      coins: 500000,
      gems: 300,
      description: "Random Azuki Exclusive Pet + 500k Coins + 300 Gems"
    }),
    prefix: "CLAN"
  },
  {
    count: 9,
    type: "titanic_pet",
    label: "Titanic Relic Ticket",
    makeReward: (i) => ({
      petRarity: "Titanic",
      coins: 2000000,
      gems: 600,
      description: "Random Titanic Pet + 2M Coins + 600 Gems"
    }),
    prefix: "TITAN"
  },
  {
    count: 3,
    type: "secret_pet",
    label: "Cosmic Secret Rift",
    makeReward: (i) => ({
      petRarity: "Secret",
      coins: 10000000,
      gems: 1200,
      description: "Random Secret Pet + 10M Coins + 1,200 Gems"
    }),
    prefix: "MYSTIC"
  }
];

let salt = 100;
remainingCategories.forEach(cat => {
  for (let i = 0; i < cat.count; i++) {
    let candidateCode = "";
    do {
      salt++;
      candidateCode = `${cat.prefix}${Math.floor(salt * 13 + i * 37).toString(36).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
    } while (generatedCodes.has(candidateCode));

    generatedCodes.set(candidateCode, {
      code: candidateCode,
      type: cat.type,
      label: cat.label,
      reward: cat.makeReward(i)
    });
  }
});

const codesArray = Array.from(generatedCodes.values());

console.log(`Generated ${codesArray.length} unique redemption codes.`);

const outDir = path.resolve('src/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'codes.json'), JSON.stringify(codesArray, null, 2));
fs.writeFileSync(path.resolve('codes.json'), JSON.stringify(codesArray, null, 2));

console.log('Saved to src/data/codes.json and codes.json successfully.');
