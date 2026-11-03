import { EnemyTemplate } from '../types/tags';

export const ENEMIES: Record<string, EnemyTemplate> = {
  skeleton: {
    id: 'skeleton', name: 'Скелет',
    description: 'Ожившие кости. Бродят среди руин.',
    tags: { location: ['ruins'], rarity: 'common', element: 'dark', type: 'undead', behavior: 'aggressive' },
    level: 1, baseHp: 15, baseDamage: 4, armor: 1,
    bodyParts: [
      { part: 'head', weakness: 'light', resistance: 'dark' },
      { part: 'torso' },
      { part: 'arms' },
      { part: 'legs' },
    ],
    loot: {
      items: [{ itemId: 'bone_fragment', chance: 0.7 }, { itemId: 'rusty_sword', chance: 0.1 }],
      gold: { min: 2, max: 8 }, xp: 10,
    },
    abilities: [],
  },
  ruin_golem: {
    id: 'ruin_golem', name: 'Руинный голем',
    description: 'Каменный страж.',
    tags: { location: ['ruins'], rarity: 'uncommon', element: 'earth', type: 'construct', behavior: 'defensive' },
    level: 3, baseHp: 40, baseDamage: 6, armor: 5,
    bodyParts: [
      { part: 'head', resistance: 'earth' },
      { part: 'torso', resistance: 'earth', weakness: 'water' },
      { part: 'arms' },
      { part: 'legs', weakness: 'fire' },
    ],
    loot: {
      items: [{ itemId: 'metal_ore', chance: 0.5 }, { itemId: 'crystal_shard', chance: 0.3 }],
      gold: { min: 10, max: 25 }, xp: 30,
    },
    abilities: [],
  },
  shadow_wolf: {
    id: 'shadow_wolf', name: 'Теневой волк',
    description: 'Волк, поглощённый тьмой.',
    tags: { location: ['cursed_forest'], rarity: 'common', element: 'dark', type: 'beast', behavior: 'aggressive' },
    level: 2, baseHp: 20, baseDamage: 5, armor: 1,
    bodyParts: [
      { part: 'head', weakness: 'light' },
      { part: 'torso' },
      { part: 'legs' },
      { part: 'tail', resistance: 'dark' },
    ],
    loot: {
      items: [{ itemId: 'leather_piece', chance: 0.6 }, { itemId: 'herb', chance: 0.4 }],
      gold: { min: 3, max: 12 }, xp: 15,
    },
    abilities: [],
  },
  forest_wraith: {
    id: 'forest_wraith', name: 'Лесной призрак',
    description: 'Дух погибшего в лесу.',
    tags: { location: ['cursed_forest'], rarity: 'rare', element: 'dark', type: 'undead', behavior: 'magical' },
    level: 5, baseHp: 35, baseDamage: 8, armor: 2,
    bodyParts: [
      { part: 'head', weakness: 'light', resistance: 'dark' },
      { part: 'torso', weakness: 'fire' },
    ],
    loot: {
      items: [{ itemId: 'dark_essence', chance: 0.4 }, { itemId: 'shadow_blade', chance: 0.05 }],
      gold: { min: 15, max: 40 }, xp: 50,
    },
    abilities: [],
  },
  crystal_spider: {
    id: 'crystal_spider', name: 'Кристальный паук',
    description: 'Паук, покрытый кристаллами.',
    tags: { location: ['crystal_wastes'], rarity: 'common', element: 'water', type: 'beast', behavior: 'aggressive' },
    level: 3, baseHp: 25, baseDamage: 6, armor: 3,
    bodyParts: [
      { part: 'head', weakness: 'fire' },
      { part: 'torso', resistance: 'water' },
      { part: 'legs' },
    ],
    loot: {
      items: [{ itemId: 'crystal_shard', chance: 0.6 }],
      gold: { min: 5, max: 15 }, xp: 25,
    },
    abilities: [],
  },
  lightning_elemental: {
    id: 'lightning_elemental', name: 'Элементаль воздуха',
    description: 'Сгусток энергии ветра.',
    tags: { location: ['crystal_wastes'], rarity: 'rare', element: 'air', type: 'elemental', behavior: 'magical' },
    level: 6, baseHp: 45, baseDamage: 10, armor: 2,
    bodyParts: [
      { part: 'torso', weakness: 'earth', resistance: 'air' },
    ],
    loot: {
      items: [{ itemId: 'crystal_shard', chance: 0.8 }, { itemId: 'dark_essence', chance: 0.3 }],
      gold: { min: 20, max: 50 }, xp: 60,
    },
    abilities: [],
  },
  cave_bat: {
    id: 'cave_bat', name: 'Пещерная летучая мышь',
    description: 'Огромная мышь с клыками.',
    tags: { location: ['underground'], rarity: 'common', element: 'none', type: 'beast', behavior: 'aggressive' },
    level: 1, baseHp: 10, baseDamage: 3, armor: 0,
    bodyParts: [
      { part: 'head' },
      { part: 'torso' },
      { part: 'wings', weakness: 'air' },
    ],
    loot: {
      items: [{ itemId: 'bone_fragment', chance: 0.3 }],
      gold: { min: 1, max: 5 }, xp: 8,
    },
    abilities: [],
  },
  dark_slime: {
    id: 'dark_slime', name: 'Тёмный слайм',
    description: 'Комок тьмы.',
    tags: { location: ['underground'], rarity: 'uncommon', element: 'dark', type: 'elemental', behavior: 'defensive' },
    level: 3, baseHp: 30, baseDamage: 5, armor: 4,
    bodyParts: [
      { part: 'torso', weakness: 'light', resistance: 'dark' },
    ],
    loot: {
      items: [{ itemId: 'dark_essence', chance: 0.3 }, { itemId: 'minor_hp_potion', chance: 0.4 }],
      gold: { min: 5, max: 20 }, xp: 25,
    },
    abilities: [],
  },
  bone_lord: {
    id: 'bone_lord', name: 'Костяной Лорд',
    description: 'Властелин нежити.',
    tags: { location: ['ruins', 'underground'], rarity: 'boss', element: 'dark', type: 'undead', behavior: 'magical' },
    level: 8, baseHp: 80, baseDamage: 12, armor: 6,
    bodyParts: [
      { part: 'head', weakness: 'light', resistance: 'dark' },
      { part: 'torso', resistance: 'dark' },
      { part: 'arms', weakness: 'fire' },
      { part: 'legs' },
    ],
    loot: {
      items: [{ itemId: 'dark_essence', chance: 1.0 }, { itemId: 'shadow_blade', chance: 0.2 }],
      gold: { min: 50, max: 100 }, xp: 150,
    },
    abilities: [],
  },
};
