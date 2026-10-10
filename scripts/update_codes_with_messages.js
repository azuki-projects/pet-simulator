import fs from 'fs';
import path from 'path';

// Read current /codes.json to preserve user edits (like AZUKIPREM, coins, gems)
let existingCodes = [];
try {
  if (fs.existsSync('/codes.json')) {
    existingCodes = JSON.parse(fs.readFileSync('/codes.json', 'utf8'));
  } else if (fs.existsSync('codes.json')) {
    existingCodes = JSON.parse(fs.readFileSync('codes.json', 'utf8'));
  }
} catch (e) {
  console.warn('Could not read existing codes.json, recreating:', e);
}

const codesMap = new Map();

// If user already edited AZUKIPREM or others, preserve them
existingCodes.forEach((c) => {
  if (c && c.code) {
    codesMap.set(c.code.toUpperCase(), c);
  }
});

// Guaranteed base codes with real strings and custom messages
const guaranteed = [
  {
    code: "AZUKIPREM",
    type: "azuki_exclusive_pet",
    label: "Azuki Clan Gift",
    message: "Claimed 1 Trillion Coins & 100 Million Gems! You are now Azuki royalty!",
    reward: {
      petRarity: "Azuki Exclusive",
      species: "azuki_spirit",
      coins: 1000000000000,
      gems: 100000000,
      description: "Exclusive Azuki Spirit Pet + 1T Coins + 100M Gems"
    }
  },
  {
    code: "WELCOME2026",
    type: "starter_pack",
    label: "Welcome Pack",
    message: "Welcome to Azuki Pet Simulator! Enjoy your starter stash!",
    reward: {
      coins: 5000,
      gems: 50,
      description: "5,000 Coins & 50 Gems"
    }
  },
  {
    code: "FIRE",
    type: "gem_buff_pack",
    label: "Fire Boost Pack",
    message: "Solar Flare energy ignited! 250 Gems and 30m of 2x Coins active!",
    reward: {
      gems: 250,
      buffType: "coin_2x",
      buffDurationMinutes: 30,
      description: "250 Gems + 30m 2x Coins Boost"
    }
  },
  {
    code: "PETLOVER",
    type: "rare_epic_pet",
    label: "Pet Lover Bundle",
    message: "An Epic Phoenix has joined your squad with coins and gems!",
    reward: {
      petRarity: "Epic",
      species: "phoenix",
      coins: 25000,
      gems: 50,
      description: "Epic Phoenix Pet + 25k Coins + 50 Gems"
    }
  },
  {
    code: "TITANIC",
    type: "titanic_pet",
    label: "Titanic Power",
    message: "The Underworld trembles! A Titanic Cerberus is now yours!",
    reward: {
      petRarity: "Titanic",
      species: "cerberus",
      coins: 500000,
      gems: 300,
      description: "Titanic Cerberus Pet + 500k Coins + 300 Gems"
    }
  },
  {
    code: "LUCKY",
    type: "large_coin_pack",
    label: "Fortune Token",
    message: "Fortune smiles on you! Large coin vault unlocked + Luck boost!",
    reward: {
      coins: 250000,
      gems: 150,
      buffType: "luck_2x",
      buffDurationMinutes: 20,
      description: "250k Coins + 150 Gems + 20m Luck Boost"
    }
  },
  {
    code: "HATCH",
    type: "mid_coin_pack",
    label: "Speed Incubator",
    message: "Incubation overdrive! Instant hatch potions and coins granted!",
    reward: {
      coins: 50000,
      gems: 75,
      instantHatchPotions: 3,
      description: "50k Coins + 75 Gems + 3 Instant Hatch Potions"
    }
  },
  {
    code: "ULTIMATE",
    type: "ultimate_bundle",
    label: "The Ultimate Azuki Treasure",
    message: "THE SUPREME REALM TREASURE! 1 Billion Coins + Ultimate Azuki Emperor Pet!",
    reward: {
      petRarity: "Ultimate Azuki",
      species: "azuki_emperor",
      coins: 1000000000,
      gems: 5000,
      description: "Ultimate Azuki Emperor Pet + 1,000,000,000 Coins + 5,000 Gems!"
    }
  },
  {
    code: "SECRET",
    type: "secret_pet",
    label: "Secret Dimension Key",
    message: "A cosmic rift opens! Secret Void Monarch Pet unlocked!",
    reward: {
      petRarity: "Secret",
      species: "void_monarch",
      coins: 2000000,
      gems: 500,
      description: "Secret Void Monarch Pet + 2M Coins + 500 Gems"
    }
  },
  {
    code: "REBIRTH",
    type: "immortal_bundle",
    label: "Immortal Ascension Bundle",
    message: "Immortal divinity achieved! Golden Seraph and massive vault granted!",
    reward: {
      petRarity: "Immortal",
      species: "golden_seraph",
      coins: 100000000,
      gems: 2500,
      description: "Immortal Golden Seraph Pet + 100M Coins + 2,500 Gems"
    }
  }
];

guaranteed.forEach((item) => {
  // If user had existing custom values for this code, merge them
  const existing = codesMap.get(item.code.toUpperCase());
  if (existing) {
    codesMap.set(item.code.toUpperCase(), {
      ...item,
      ...existing,
      message: existing.message || item.message,
      reward: { ...item.reward, ...(existing.reward || {}) }
    });
  } else {
    codesMap.set(item.code.toUpperCase(), item);
  }
});

// Ensure every single code in the map has a friendly "message" field
for (const [codeKey, codeObj] of codesMap.entries()) {
  if (!codeObj.message) {
    codeObj.message = `Successfully claimed ${codeObj.label || 'Reward'}! (${codeObj.reward?.description || 'Bonus items added to inventory'})`;
  }
}

// If we need to fill up to 500 codes:
let salt = 100;
const prefixes = ['START', 'COIN', 'VAULT', 'BOOST', 'BEAST', 'HUGE', 'CLAN', 'TITAN', 'MYSTIC'];
while (codesMap.size < 500) {
  salt++;
  const pref = prefixes[salt % prefixes.length];
  const candidate = `${pref}${Math.floor(salt * 17).toString(36).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
  if (!codesMap.has(candidate)) {
    codesMap.set(candidate, {
      code: candidate,
      type: "stashed_reward",
      label: "Secret Realm Stash",
      message: `Awesome! You uncovered secret code ${candidate} and claimed bonus Coins & Gems!`,
      reward: {
        coins: 10000 + (salt % 10) * 5000,
        gems: 25 + (salt % 5) * 10,
        description: `${(10000 + (salt % 10) * 5000).toLocaleString()} Coins & ${25 + (salt % 5) * 10} Gems`
      }
    });
  }
}

const finalCodes = Array.from(codesMap.values());
console.log(`Writing ${finalCodes.length} codes with real editable keys and messages.`);

fs.writeFileSync('/codes.json', JSON.stringify(finalCodes, null, 2));
fs.writeFileSync('codes.json', JSON.stringify(finalCodes, null, 2));

const srcDataDir = path.resolve('src/data');
if (!fs.existsSync(srcDataDir)) {
  fs.mkdirSync(srcDataDir, { recursive: true });
}
fs.writeFileSync(path.join(srcDataDir, 'codes.json'), JSON.stringify(finalCodes, null, 2));

console.log('Successfully saved to /codes.json, codes.json, and src/data/codes.json!');
