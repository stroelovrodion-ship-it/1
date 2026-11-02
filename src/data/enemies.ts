import { EnemyTemplate } from '../types/tags';

// ═══════════════════════════════════════════════
// ВРАГИ — определяются тегами [локация, редкость]
// ═══════════════════════════════════════════════

export const ENEMIES: Record<string, EnemyTemplate> = {
  // ─── РУИНЫ ───
  skeleton: {
    id: 'skeleton',
    name: 'Скелет',
    description: 'Ожившие кости. Бродят среди руин, охраняя то, что давно забыли.',
    tags: { location: ['ruins'], rarity: 'common', element: 'shadow', type: 'undead', behavior: 'aggressive' },
    level: 1,
    baseHp: 15,
    baseDamage: 4,
    armor: 1,
    speed: 3,
    abilities: ['bone_throw'],
    loot: {
      items: [
        { itemId: 'bone_fragment', chance: 0.7 },
        { itemId: 'rusty_sword', chance: 0.1 },
      ],
      gold: { min: 2, max: 8 },
      xp: 10,
    },
    weaknesses: ['life'],
    resistances: ['shadow'],
  },
  ruin_golem: {
    id: 'ruin_golem',
    name: 'Руинный голем',
    description: 'Каменный страж, активированный остаточной магией.',
    tags: { location: ['ruins'], rarity: 'uncommon', element: 'none', type: 'construct', behavior: 'defensive' },
    level: 3,
    baseHp: 40,
    baseDamage: 6,
    armor: 5,
    speed: 1,
    abilities: ['stone_slam'],
    loot: {
      items: [
        { itemId: 'metal_ore', chance: 0.5 },
        { itemId: 'crystal_shard', chance: 0.3 },
        { itemId: 'bone_helm', chance: 0.05 },
      ],
      gold: { min: 10, max: 25 },
      xp: 30,
    },
    weaknesses: ['lightning'],
    resistances: ['fire', 'ice'],
  },

  // ─── ПРОКЛЯТЫЙ ЛЕС ───
  shadow_wolf: {
    id: 'shadow_wolf',
    name: 'Теневой волк',
    description: 'Волк, поглощённый тьмой. Глаза горят фиолетовым.',
    tags: { location: ['cursed_forest'], rarity: 'common', element: 'shadow', type: 'beast', behavior: 'aggressive' },
    level: 2,
    baseHp: 20,
    baseDamage: 5,
    armor: 1,
    speed: 6,
    abilities: ['shadow_bite'],
    loot: {
      items: [
        { itemId: 'leather_piece', chance: 0.6 },
        { itemId: 'herb', chance: 0.4 },
        { itemId: 'bone_dagger', chance: 0.08 },
      ],
      gold: { min: 3, max: 12 },
      xp: 15,
    },
    weaknesses: ['lightning', 'life'],
    resistances: ['shadow'],
  },
  forest_wraith: {
    id: 'forest_wraith',
    name: 'Лесной призрак',
    description: 'Дух погибшего в лесу. Воет по ночам.',
    tags: { location: ['cursed_forest'], rarity: 'rare', element: 'shadow', type: 'undead', behavior: 'magical' },
    level: 5,
    baseHp: 35,
    baseDamage: 8,
    armor: 2,
    speed: 5,
    abilities: ['life_drain', 'shadow_bolt'],
    loot: {
      items: [
        { itemId: 'dark_essence', chance: 0.4 },
        { itemId: 'shadow_blade', chance: 0.05 },
        { itemId: 'essence_amulet', chance: 0.08 },
      ],
      gold: { min: 15, max: 40 },
      xp: 50,
    },
    weaknesses: ['fire', 'life'],
    resistances: ['shadow', 'ice'],
  },

  // ─── КРИСТАЛЛИЧЕСКИЕ ПУСТОШИ ───
  crystal_spider: {
    id: 'crystal_spider',
    name: 'Кристальный паук',
    description: 'Паук, чьё тело покрыто кристаллами. Стреляет осколками.',
    tags: { location: ['crystal_wastes'], rarity: 'common', element: 'lightning', type: 'beast', behavior: 'aggressive' },
    level: 3,
    baseHp: 25,
    baseDamage: 6,
    armor: 3,
    speed: 4,
    abilities: ['crystal_shot'],
    loot: {
      items: [
        { itemId: 'crystal_shard', chance: 0.6 },
        { itemId: 'crystal_staff', chance: 0.05 },
      ],
      gold: { min: 5, max: 15 },
      xp: 25,
    },
    weaknesses: ['fire'],
    resistances: ['lightning', 'ice'],
  },
  lightning_elemental: {
    id: 'lightning_elemental',
    name: 'Элементаль молнии',
    description: 'Сгусток электрической энергии. Бьёт разрядом.',
    tags: { location: ['crystal_wastes'], rarity: 'rare', element: 'lightning', type: 'elemental', behavior: 'magical' },
    level: 6,
    baseHp: 45,
    baseDamage: 10,
    armor: 2,
    speed: 7,
    abilities: ['lightning_bolt', 'chain_spark'],
    loot: {
      items: [
        { itemId: 'crystal_shard', chance: 0.8 },
        { itemId: 'dark_essence', chance: 0.3 },
        { itemId: 'crystal_greaves', chance: 0.05 },
      ],
      gold: { min: 20, max: 50 },
      xp: 60,
    },
    weaknesses: ['ice'],
    resistances: ['lightning'],
  },

  // ─── ПОДЗЕМЕЛЬЕ ───
  cave_bat: {
    id: 'cave_bat',
    name: 'Пещерная летучая мышь',
    description: 'Огромная мышь с клыками. Атакует стаей.',
    tags: { location: ['underground'], rarity: 'common', element: 'none', type: 'beast', behavior: 'aggressive' },
    level: 1,
    baseHp: 10,
    baseDamage: 3,
    armor: 0,
    speed: 7,
    abilities: [],
    loot: {
      items: [
        { itemId: 'bone_fragment', chance: 0.3 },
        { itemId: 'herb', chance: 0.2 },
      ],
      gold: { min: 1, max: 5 },
      xp: 8,
    },
    weaknesses: ['lightning'],
    resistances: [],
  },
  dark_slime: {
    id: 'dark_slime',
    name: 'Тёмный слайм',
    description: 'Комок тьмы. Поглощает всё на пути.',
    tags: { location: ['underground'], rarity: 'uncommon', element: 'shadow', type: 'elemental', behavior: 'defensive' },
    level: 3,
    baseHp: 30,
    baseDamage: 5,
    armor: 4,
    speed: 2,
    abilities: ['acid_splash'],
    loot: {
      items: [
        { itemId: 'dark_essence', chance: 0.3 },
        { itemId: 'minor_hp_potion', chance: 0.4 },
      ],
      gold: { min: 5, max: 20 },
      xp: 25,
    },
    weaknesses: ['fire', 'lightning'],
    resistances: ['shadow'],
  },

  // ─── БОССЫ ───
  bone_lord: {
    id: 'bone_lord',
    name: 'Костяной Лорд',
    description: 'Властелин нежити. Собирает кости павших воинов.',
    tags: { location: ['ruins', 'underground'], rarity: 'boss', element: 'shadow', type: 'undead', behavior: 'magical' },
    level: 8,
    baseHp: 80,
    baseDamage: 12,
    armor: 6,
    speed: 4,
    abilities: ['bone_throw', 'life_drain', 'summon_skeleton'],
    loot: {
      items: [
        { itemId: 'dark_essence', chance: 1.0 },
        { itemId: 'shadow_blade', chance: 0.2 },
        { itemId: 'crystal_plate', chance: 0.15 },
      ],
      gold: { min: 50, max: 100 },
      xp: 150,
    },
    weaknesses: ['fire', 'life'],
    resistances: ['shadow', 'ice'],
  },
};
