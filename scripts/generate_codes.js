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
    message: "Welcome to Azuki Pet Simulator! You unlocked 5,000 Coins & 50 Gems to begin your adventure!",
    reward: { coins: 5000, gems: 50, description: "5,000 Coins & 50 Gems" }
  },
  {
    code: "AZUKI",
    type: "azuki_exclusive_pet",
    label: "Azuki Clan Gift",
    message: "Honor to the Azuki Clan! You unlocked the Exclusive Azuki Spirit Pet, 50,000 Coins, and 100 Gems!",
    reward: { petRarity: "Azuki Exclusive", species: "Azuki Spirit", coins: 50000, gems: 100, description: "Exclusive Azuki Spirit Pet + 50k Coins + 100 Gems" }
  },
  {
    code: "FIRE",
    type: "gem_buff_pack",
    label: "Fire Boost Pack",
    message: "Solar Fire ignited! You received 250 Gems and a 30-minute 2x Coins Boost!",
    reward: { gems: 250, buffType: "coin_2x", buffDurationMinutes: 30, description: "250 Gems + 30m 2x Coins Boost" }
  },
  {
    code: "PETLOVER",
    type: "rare_epic_pet",
    label: "Pet Lover Bundle",
    message: "A magnificent Epic Phoenix has joined your squad with 25,000 Coins and 50 Gems!",
    reward: { petRarity: "Epic", species: "Phoenix", coins: 25000, gems: 50, description: "Epic Phoenix Pet + 25k Coins + 50 Gems" }
  },
  {
    code: "TITANIC",
    type: "titanic_pet",
    label: "Titanic Power",
    message: "The earth trembles! A Titanic Cerberus Pet has awakened with 500,000 Coins and 300 Gems!",
    reward: { petRarity: "Titanic", species: "Cerberus", coins: 500000, gems: 300, description: "Titanic Cerberus Pet + 500k Coins + 300 Gems" }
  },
  {
    code: "LUCKY",
    type: "large_coin_pack",
    label: "Fortune Token",
    message: "Good luck shines bright! 250,000 Coins, 150 Gems, and a 20-minute Luck Boost granted!",
    reward: { coins: 250000, gems: 150, buffType: "luck_2x", buffDurationMinutes: 20, description: "250k Coins + 150 Gems + 20m Luck Boost" }
  },
  {
    code: "HATCH",
    type: "mid_coin_pack",
    label: "Speed Incubator",
    message: "Hatching overdrive activated! 50,000 Coins, 75 Gems, and 3 Instant Hatch Potions granted!",
    reward: { coins: 50000, gems: 75, instantHatchPotions: 3, description: "50k Coins + 75 Gems + 3 Instant Hatch Potions" }
  },
  {
    code: "ULTIMATE",
    type: "ultimate_bundle",
    label: "The Ultimate Azuki Treasure",
    message: "SUPREME AZUKI ASCENSION! You claimed the legendary Ultimate Azuki Emperor Pet, 1 Billion Coins, and 5,000 Gems!",
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
    message: "A cosmic rift opens! Secret Void Monarch Pet unlocked with 2 Million Coins and 500 Gems!",
    reward: { petRarity: "Secret", species: "Void Monarch", coins: 2000000, gems: 500, description: "Secret Void Monarch Pet + 2M Coins + 500 Gems" }
  },
  {
    code: "REBIRTH",
    type: "immortal_bundle",
    label: "Immortal Ascension Bundle",
    message: "Ascended into immortality! You received the Immortal Golden Seraph Pet, 100 Million Coins, and 2,500 Gems!",
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

// Distribution across the 500 codes:
// 200 × starter coin + gem packs (1 is WELCOME2026 -> 199 remaining)
// 120 × mid coin packs (1 is HATCH -> 119 remaining)
// 50 × large coin packs (1 is LUCKY -> 49 remaining)
// 40 × gem + 2x earnings buff packs (1 is FIRE -> 39 remaining)
// 30 × random rare–epic pets (1 is PETLOVER -> 29 remaining)
// 25 × random huge pets (25 remaining)
// 20 × random Azuki exclusive pets (1 is AZUKI -> 19 remaining)
// 10 × random titanic pets (1 is TITANIC -> 9 remaining)
// 4 × random secret pets (1 is SECRET -> 3 remaining)
// 1 × immortal bundle (REBIRTH already included)
// 1 × Ultimate Azuki bundle (ULTIMATE already included)
// Total: 10 + 199 + 119 + 49 + 39 + 29 + 25 + 19 + 9 + 3 = 500!

const remainingCategories = [
  {
    count: 198,
    type: "starter_pack",
    label: "Starter Supplies",
    prefix: "START",
    startNum: 101,
    makeItem: (i, code) => {
      const coins = 1000 + (i % 5) * 500;
      const gems = 10 + (i % 4) * 5;
      return {
        code,
        message: `Claimed Starter Supplies! You received ${coins.toLocaleString()} Coins and ${gems} Gems!`,
        reward: {
          coins,
          gems,
          description: `${coins.toLocaleString()} Coins & ${gems} Gems`
        }
      };
    }
  },
  {
    count: 119,
    type: "mid_coin_pack",
    label: "Adventurer Stash",
    prefix: "COIN",
    startNum: 201,
    makeItem: (i, code) => {
      const coins = 15000 + (i % 7) * 5000;
      const gems = 30 + (i % 5) * 10;
      return {
        code,
        message: `Unlocked Adventurer Stash! You received ${coins.toLocaleString()} Coins and ${gems} Gems!`,
        reward: {
          coins,
          gems,
          description: `${coins.toLocaleString()} Coins & ${gems} Gems`
        }
      };
    }
  },
  {
    count: 49,
    type: "large_coin_pack",
    label: "Grand Vault",
    prefix: "VAULT",
    startNum: 301,
    makeItem: (i, code) => {
      const coins = 100000 + (i % 10) * 20000;
      const gems = 100 + (i % 6) * 25;
      return {
        code,
        message: `Opened Grand Vault! You received ${coins.toLocaleString()} Coins and ${gems} Gems!`,
        reward: {
          coins,
          gems,
          description: `${coins.toLocaleString()} Coins & ${gems} Gems`
        }
      };
    }
  },
  {
    count: 39,
    type: "gem_buff_pack",
    label: "Overdrive Buff Pack",
    prefix: "BOOST",
    startNum: 401,
    makeItem: (i, code) => {
      const gems = 150 + (i % 5) * 25;
      return {
        code,
        message: `Overdrive boost engaged! You received ${gems} Gems and 15 minutes of 2x Coins!`,
        reward: {
          gems,
          buffType: "coin_2x",
          buffDurationMinutes: 15,
          description: `${gems} Gems + 15m 2x Coins Boost`
        }
      };
    }
  },
  {
    count: 29,
    type: "rare_epic_pet",
    label: "Rare Hatchling Ticket",
    prefix: "BEAST",
    startNum: 501,
    makeItem: (i, code) => {
      const petRarity = i % 2 === 0 ? "Rare" : "Epic";
      return {
        code,
        message: `Hatchling ticket verified! You received a random ${petRarity} pet + 20,000 Coins!`,
        reward: {
          petRarity,
          coins: 20000,
          gems: 40,
          description: `Random ${petRarity} Pet + 20k Coins`
        }
      };
    }
  },
  {
    count: 25,
    type: "huge_pet",
    label: "Colossal Egg Ticket",
    prefix: "HUGE",
    startNum: 601,
    makeItem: (i, code) => ({
      code,
      message: "COLOSSAL EGG DROP! You received a random Huge Pet + 150,000 Coins + 150 Gems!",
      reward: {
        petRarity: "Huge",
        coins: 150000,
        gems: 150,
        description: "Random Huge Pet + 150k Coins + 150 Gems"
      }
    })
  },
  {
    count: 19,
    type: "azuki_exclusive_pet",
    label: "Azuki Ancestor Gift",
    prefix: "CLAN",
    startNum: 701,
    makeItem: (i, code) => ({
      code,
      message: "Azuki Ancestor blessing! You received an Exclusive Azuki Pet + 500,000 Coins + 300 Gems!",
      reward: {
        petRarity: "Azuki Exclusive",
        coins: 500000,
        gems: 300,
        description: "Random Azuki Exclusive Pet + 500k Coins + 300 Gems"
      }
    })
  },
  {
    count: 9,
    type: "titanic_pet",
    label: "Titanic Relic Ticket",
    prefix: "TITAN",
    startNum: 801,
    makeItem: (i, code) => ({
      code,
      message: "TITANIC RELIC UNLOCKED! A massive Titanic Pet has been added to your inventory!",
      reward: {
        petRarity: "Titanic",
        coins: 2000000,
        gems: 600,
        description: "Random Titanic Pet + 2M Coins + 600 Gems"
      }
    })
  },
  {
    count: 3,
    type: "secret_pet",
    label: "Cosmic Secret Rift",
    prefix: "MYSTIC",
    startNum: 901,
    makeItem: (i, code) => ({
      code,
      message: "SECRET DIMENSIONAL RIFT OPENED! You received a Secret Pet + 10 Million Coins + 1,200 Gems!",
      reward: {
        petRarity: "Secret",
        coins: 10000000,
        gems: 1200,
        description: "Random Secret Pet + 10M Coins + 1,200 Gems"
      }
    })
  }
];

remainingCategories.forEach(cat => {
  for (let i = 0; i < cat.count; i++) {
    const codeNum = cat.startNum + i;
    const candidateCode = `${cat.prefix}${codeNum}`;
    const itemData = cat.makeItem(i, candidateCode);
    generatedCodes.set(candidateCode, {
      code: candidateCode,
      message: itemData.message,
      label: cat.label,
      type: cat.type,
      reward: itemData.reward
    });
  }
});

const codesArray = Array.from(generatedCodes.values());

console.log(`Generated exactly ${codesArray.length} unique redemption codes.`);

const outDir = path.resolve('src/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'codes.json'), JSON.stringify(codesArray, null, 2));
fs.writeFileSync(path.join(outDir, 'code.json'), JSON.stringify(codesArray, null, 2));
fs.writeFileSync(path.resolve('codes.json'), JSON.stringify(codesArray, null, 2));
fs.writeFileSync(path.resolve('code.json'), JSON.stringify(codesArray, null, 2));

console.log('Saved to code.json and codes.json successfully with clean editable codes and messages.');
