import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Pet, RarityTier } from '../../types/game';
import { RARITIES, RARITY_ORDER } from '../../data/rarities';
import { PET_SPECIES } from '../../data/species';
import { formatNumber } from '../../utils/format';
import {
  Sparkles,
  Lock,
  Unlock,
  ArrowUpCircle,
  Coins,
  Check,
  Edit2,
  Trash2,
  Layers,
  BookOpen,
  Filter,
  ArrowUpDown,
  Zap,
  Flame,
} from 'lucide-react';

export const InventoryView: React.FC<{ onOpenTraining: (petId: string) => void }> = ({
  onOpenTraining,
}) => {
  const {
    state,
    equipPet,
    unequipPet,
    levelUpPet,
    sellPet,
    toggleLockPet,
    renamePet,
    fusePets,
    getFusionChance,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'owned' | 'fusion' | 'collection'>('owned');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState<'rarity' | 'cps' | 'level' | 'name'>('rarity');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  // Fusion selection
  const [fusionSelectedIds, setFusionSelectedIds] = useState<string[]>([]);
  const [fusionMessage, setFusionMessage] = useState<{ success: boolean; text: string } | null>(null);

  const fusionOdds = getFusionChance(fusionSelectedIds);

  // Filtered and sorted pets
  const filteredPets = state.inventory
    .filter((p) => (filterRarity === 'all' ? true : p.rarity === filterRarity))
    .sort((a, b) => {
      if (sortBy === 'rarity') {
        const orderA = RARITIES[a.rarity]?.order || 0;
        const orderB = RARITIES[b.rarity]?.order || 0;
        return orderB - orderA;
      }
      if (sortBy === 'cps') {
        return b.baseCoinsPerSec * b.level - a.baseCoinsPerSec * a.level;
      }
      if (sortBy === 'level') {
        return b.level - a.level;
      }
      return a.name.localeCompare(b.name);
    });

  const handleOpenPetDetails = (pet: Pet) => {
    setSelectedPet(pet);
    setRenameInput(pet.name);
    setIsRenaming(false);
  };

  const handleSaveRename = () => {
    if (selectedPet && renameInput.trim()) {
      renamePet(selectedPet.id, renameInput);
      setSelectedPet({ ...selectedPet, name: renameInput.trim() });
      setIsRenaming(false);
    }
  };

  const handleToggleFusionSelect = (petId: string) => {
    const pet = state.inventory.find((p) => p.id === petId);
    if (!pet || pet.locked || pet.equipped) return;

    if (fusionSelectedIds.includes(petId)) {
      setFusionSelectedIds(fusionSelectedIds.filter((id) => id !== petId));
      return;
    }

    if (fusionSelectedIds.length >= 5) {
      setFusionMessage({ success: false, text: 'Maximum 5 pets can be selected for fusion.' });
      return;
    }

    setFusionSelectedIds([...fusionSelectedIds, petId]);
    setFusionMessage(null);
  };

  const handleExecuteFusion = () => {
    const res = fusePets(fusionSelectedIds);
    setFusionMessage({ success: res.success, text: res.message || '' });
    if (res.success) {
      setFusionSelectedIds([]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 pb-36 sm:pb-32 text-slate-100">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>Pet Management</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 font-bold border border-slate-700">
              {state.inventory.length} Owned
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Equip, fuse, level up, and complete your collection log.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'owned'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Pets
          </button>
          <button
            onClick={() => setActiveTab('fusion')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'fusion'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fusion Tab
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'collection'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Collection Log
          </button>
        </div>
      </div>

      {/* TAB 1: OWNED PETS */}
      {activeTab === 'owned' && (
        <div>
          {/* Filter & Sort Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
            {/* Filter by Rarity */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Rarities ({state.inventory.length})</option>
                {RARITY_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
              >
                <option value="rarity">Sort by Rarity</option>
                <option value="cps">Sort by Earnings (CPS)</option>
                <option value="level">Sort by Level</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Pets Grid */}
          {filteredPets.length === 0 ? (
            <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-12 text-center text-slate-400">
              No pets match the current filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredPets.map((pet) => {
                const rarityConfig = RARITIES[pet.rarity];
                const species = PET_SPECIES.find((s) => s.id === pet.speciesId) || PET_SPECIES[0];
                const isEquipped = state.equippedPetIds.includes(pet.id);
                const isTrained = pet.trainedUntil && pet.trainedUntil > Date.now();

                return (
                  <div
                    key={pet.id}
                    onClick={() => handleOpenPetDetails(pet)}
                    className={`relative rounded-2xl p-3 border cursor-pointer transition-all duration-200 flex flex-col justify-between hover:scale-[1.02] shadow-md ${
                      isEquipped
                        ? 'ring-2 ring-amber-400/80 bg-slate-900'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                    style={{
                      borderColor: isEquipped ? '#fbbf24' : rarityConfig.color + '55',
                    }}
                  >
                    {/* Top status icons */}
                    <div className="flex items-center justify-between w-full mb-1">
                      {isEquipped ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40">
                          EQUIPPED
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Lv.{pet.level}
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        {isTrained && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                        {pet.locked && <Lock className="w-3 h-3 text-slate-400" />}
                      </div>
                    </div>

                    {/* Pet Avatar Box */}
                    <div
                      className="w-full aspect-square rounded-xl flex items-center justify-center text-3xl my-2 shadow-inner border relative"
                      style={{
                        backgroundColor: rarityConfig.color + '20',
                        borderColor: rarityConfig.color + '66',
                      }}
                    >
                      {pet.shiny && (
                        <Sparkles className="absolute -top-1.5 -right-1.5 w-4 h-4 text-amber-300 animate-spin" />
                      )}
                      <span className="select-none">{species.iconSvg}</span>
                    </div>

                    {/* Pet Info */}
                    <div>
                      <div className="font-extrabold text-xs text-white truncate flex items-center gap-1">
                        {pet.mutation && (
                          <span className="text-[10px]" title={pet.mutation.name}>
                            {pet.mutation.icon}
                          </span>
                        )}
                        <span className="truncate">{pet.name}</span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="text-[10px] font-bold uppercase truncate"
                          style={{ color: rarityConfig.color }}
                        >
                          {pet.rarity}
                        </span>
                        {pet.fuseBaseChance && (
                          <span className="text-[9px] font-mono font-bold text-cyan-300">
                            +{pet.fuseBaseChance}%
                          </span>
                        )}
                      </div>

                      {pet.mutation && (
                        <div className="mt-0.5 px-1 py-0.2 rounded bg-purple-950/60 border border-purple-500/30 text-[9px] font-bold text-purple-200 truncate flex items-center gap-0.5">
                          <span>{pet.mutation.name}</span>
                          <span className="text-purple-300 font-extrabold">x{pet.mutation.multiplier}</span>
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-between text-[10px] text-amber-300 font-semibold tabular-nums">
                        <span className="flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 text-amber-400" />
                          +{formatNumber(pet.baseCoinsPerSec * (1 + (pet.level - 1) * 0.18))}/s
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FUSION CHAMBER */}
      {activeTab === 'fusion' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2 mb-2">
              <Layers className="w-6 h-6 text-amber-400" />
              <span>Pet Fusion Chamber</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Combine any 3 or 5 pets (different rarities and species welcome!) to ascend to the next rarity tier!
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-1">3 Pets Fusion</span>
                <span className="text-slate-300">
                  Select any 3 pets = Upgrades to next tier above the highest pet!
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40">
                <span className="font-bold text-yellow-300 block mb-1">
                  ✨ 5 Pets Super Fusion
                </span>
                <span className="text-amber-200">
                  Select any 5 pets = Next tier + SHINY boost (x2.5 CPS)!
                </span>
              </div>
            </div>
          </div>

          {/* Fusion Slots Preview */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-6">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-300">
                Selected for Fusion ({fusionSelectedIds.length}/5):
              </span>
              {fusionSelectedIds.length > 0 && (
                <button
                  onClick={() => setFusionSelectedIds([])}
                  className="text-rose-400 hover:underline font-semibold"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, idx) => {
                const petId = fusionSelectedIds[idx];
                const pet = state.inventory.find((p) => p.id === petId);

                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl border border-dashed border-slate-700 bg-slate-900/60 flex flex-col items-center justify-center p-1 relative text-center"
                  >
                    {pet ? (
                      <>
                        <span className="text-2xl mb-1">
                          {PET_SPECIES.find((s) => s.id === pet.speciesId)?.iconSvg || '🐾'}
                        </span>
                        <span className="text-[9px] font-bold text-white truncate max-w-full">
                          {pet.name}
                        </span>
                        <span
                          className="text-[8px] font-extrabold uppercase truncate"
                          style={{ color: RARITIES[pet.rarity]?.color }}
                        >
                          {pet.rarity}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-600 text-xs font-bold">Slot {idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Fusion Action Button & Live Preview */}
            <div className="mt-4">
              {/* LIVE FUSION SUCCESS CHANCE GAUGE */}
              {fusionSelectedIds.length > 0 && (
                <div className="mb-3 p-3 rounded-2xl bg-slate-900 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Fusion Success Probability:
                    </span>
                    <span
                      className={`font-black text-sm tabular-nums ${
                        fusionOdds.chance >= 75
                          ? 'text-emerald-400'
                          : fusionOdds.chance >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {fusionOdds.chance}% CHANCE
                    </span>
                  </div>

                  {/* Probability Bar */}
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        fusionOdds.chance >= 75
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : fusionOdds.chance >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-500 to-orange-500'
                      }`}
                      style={{ width: `${fusionOdds.chance}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Base: +{fusionOdds.base}%</span>
                    <span>Same Tier Bonus: +{fusionOdds.sameRarityBonus}%</span>
                    <span>Luck Boost: +{fusionOdds.luckBonus}%</span>
                  </div>
                </div>
              )}

              {(fusionSelectedIds.length === 3 || fusionSelectedIds.length === 5) && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-200 flex items-center justify-between">
                  <span>Target Outcome on Success:</span>
                  <span className="font-black text-amber-300">
                    {fusionSelectedIds.length === 5 ? '✨ SHINY ' : ''}
                    {
                      RARITY_ORDER[
                        Math.min(
                          RARITY_ORDER.length - 1,
                          Math.max(
                            ...state.inventory
                              .filter((p) => fusionSelectedIds.includes(p.id))
                              .map((p) => RARITY_ORDER.indexOf(p.rarity))
                          ) + 1
                        )
                      ]
                    } Tier!
                  </span>
                </div>
              )}

              <button
                onClick={handleExecuteFusion}
                disabled={fusionSelectedIds.length !== 3 && fusionSelectedIds.length !== 5}
                className={`w-full py-3 rounded-xl font-black text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  fusionSelectedIds.length === 3 || fusionSelectedIds.length === 5
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 active:scale-98'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>
                  {fusionSelectedIds.length === 5
                    ? `✨ FUSE 5 PETS (${fusionOdds.chance}% SUCCESS)`
                    : fusionSelectedIds.length === 3
                    ? `FUSE 3 PETS (${fusionOdds.chance}% SUCCESS)`
                    : 'Select Any 3 or 5 Pets (Different Rarities Allowed)'}
                </span>
              </button>

              {fusionMessage && (
                <div
                  className={`mt-3 p-3 rounded-xl text-xs font-semibold ${
                    fusionMessage.success
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {fusionMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* Available Pets for Fusion selection */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Unlocked & Unequipped Pets to Fuse:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {state.inventory
                .filter((p) => !p.locked && !p.equipped)
                .map((pet) => {
                  const isSelected = fusionSelectedIds.includes(pet.id);
                  const species = PET_SPECIES.find((s) => s.id === pet.speciesId) || PET_SPECIES[0];
                  const rarityCfg = RARITIES[pet.rarity];

                  return (
                    <div
                      key={pet.id}
                      onClick={() => handleToggleFusionSelect(pet.id)}
                      className={`p-2 rounded-xl border cursor-pointer transition-all text-center relative ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-2xl mb-1">{species.iconSvg}</div>
                      <div className="text-[10px] font-bold text-white truncate">{pet.name}</div>
                      <div
                        className="text-[9px] font-semibold uppercase"
                        style={{ color: rarityCfg.color }}
                      >
                        {pet.rarity}
                      </div>
                      <div className="text-[9px] font-mono text-cyan-300 font-extrabold mt-0.5">
                        +{pet.fuseBaseChance || 25}% Chance
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COLLECTION LOG */}
      {activeTab === 'collection' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-400" />
                <span>Collection Log Catalog</span>
              </h3>
              <p className="text-xs text-slate-400">
                Collect all 36 species across all 12 rarities to unlock mastery!
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Discovered:</span>
              <span className="text-base font-black text-amber-400 tabular-nums">
                {Object.keys(state.collectionLog).length} / {PET_SPECIES.length * 12}
              </span>
            </div>
          </div>

          {/* Species List */}
          <div className="space-y-6">
            {PET_SPECIES.map((species) => {
              const ownedRaritiesForSpecies = RARITY_ORDER.filter(
                (r) => state.collectionLog[`${species.id}_${r}`]
              );

              return (
                <div
                  key={species.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl">
                        {species.iconSvg}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{species.name}</h4>
                        <span className="text-[10px] text-slate-400">{species.description}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-300">
                      {ownedRaritiesForSpecies.length} / 12 Discovered
                    </span>
                  </div>

                  {/* 12 Rarities Row */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
                    {RARITY_ORDER.map((rarity) => {
                      const isDiscovered = !!state.collectionLog[`${species.id}_${rarity}`];
                      const rarityCfg = RARITIES[rarity];

                      return (
                        <div
                          key={rarity}
                          className={`p-1.5 rounded-lg border text-center transition-all ${
                            isDiscovered
                              ? 'bg-slate-900 shadow-sm'
                              : 'bg-slate-950/40 border-slate-900 opacity-40'
                          }`}
                          style={{
                            borderColor: isDiscovered ? rarityCfg.color + '88' : undefined,
                          }}
                        >
                          <div className="text-xs">{isDiscovered ? species.iconSvg : '❓'}</div>
                          <div
                            className="text-[8px] font-bold uppercase truncate"
                            style={{ color: isDiscovered ? rarityCfg.color : '#64748b' }}
                          >
                            {rarity}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PET DETAIL ACTION MODAL */}
      {selectedPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 p-6 shadow-2xl text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border shadow-inner"
                  style={{
                    backgroundColor: RARITIES[selectedPet.rarity].color + '22',
                    borderColor: RARITIES[selectedPet.rarity].color,
                  }}
                >
                  {PET_SPECIES.find((s) => s.id === selectedPet.speciesId)?.iconSvg || '🐾'}
                </div>
                <div>
                  {isRenaming ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-bold focus:outline-none"
                      />
                      <button
                        onClick={handleSaveRename}
                        className="p-1 rounded bg-amber-500 text-slate-950 font-bold"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-white">{selectedPet.name}</h3>
                      <button
                        onClick={() => setIsRenaming(true)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span
                    className="text-xs font-bold uppercase"
                    style={{ color: RARITIES[selectedPet.rarity].color }}
                  >
                    {selectedPet.rarity} · Lv.{selectedPet.level}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedPet(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Stats Card */}
            <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-slate-500 block text-[10px]">Current Passive</span>
                <span className="font-extrabold text-amber-300 text-sm">
                  +{formatNumber(selectedPet.baseCoinsPerSec * (1 + (selectedPet.level - 1) * 0.18))}/s
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Weight</span>
                <span className="font-bold text-slate-200 text-sm">
                  ⚖️ {selectedPet.weightKg} kg
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-900 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Base Fusion Chance Contribution:</span>
                <span className="font-black text-cyan-300">+{selectedPet.fuseBaseChance || 25}%</span>
              </div>
            </div>

            {/* Mutation Card if present */}
            {selectedPet.mutation && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-fuchsia-950/40 border border-purple-500/40 mb-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-purple-200 flex items-center gap-1.5">
                    <span className="text-base">{selectedPet.mutation.icon}</span>
                    <span>{selectedPet.mutation.name} Mutation</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold text-[10px]">
                    x{selectedPet.mutation.multiplier} Multiplier
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {selectedPet.mutation.description}
                </p>
              </div>
            )}

            {/* Level up section */}
            <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 mb-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-300 block">Level {selectedPet.level}/100</span>
                <span className="text-[10px] text-slate-400">
                  Upgrade: 🪙 {formatNumber(Math.round(selectedPet.baseCoinsPerSec * selectedPet.level * 25))}
                </span>
              </div>

              <button
                onClick={() => {
                  const leveled = levelUpPet(selectedPet.id);
                  if (leveled) {
                    setSelectedPet({ ...selectedPet, level: selectedPet.level + 1 });
                  }
                }}
                disabled={selectedPet.level >= 100}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                <span>Level Up</span>
              </button>
            </div>

            {/* Actions Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Equip / Unequip */}
                {state.equippedPetIds.includes(selectedPet.id) ? (
                  <button
                    onClick={() => {
                      unequipPet(selectedPet.id);
                      setSelectedPet(null);
                    }}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                  >
                    Unequip Pet
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      equipPet(selectedPet.id);
                      setSelectedPet(null);
                    }}
                    disabled={state.equippedPetIds.length >= state.upgrades.equipSlots}
                    className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    Equip Pet
                  </button>
                )}

                {/* Lock / Unlock */}
                <button
                  onClick={() => {
                    toggleLockPet(selectedPet.id);
                    setSelectedPet({ ...selectedPet, locked: !selectedPet.locked });
                  }}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {selectedPet.locked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Unlocked</span>
                    </>
                  )}
                </button>
              </div>

              {/* Training Mini-game trigger */}
              <button
                onClick={() => {
                  onOpenTraining(selectedPet.id);
                  setSelectedPet(null);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>Pet Training Mini-Game (+20% 1h Boost)</span>
              </button>

              {/* Sell Pet */}
              {!state.equippedPetIds.includes(selectedPet.id) && !selectedPet.locked && (
                <button
                  onClick={() => {
                    sellPet(selectedPet.id);
                    setSelectedPet(null);
                  }}
                  className="w-full py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 border border-rose-600/40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sell for 🪙 {formatNumber(selectedPet.sellPrice)}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
