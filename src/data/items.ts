import { Item } from '../types/tags';

export const ITEMS: Record<string, Item> = {
  // ─── ОРУЖИЕ ───
  rusty_sword: {
    id: 'rusty_sword', name: 'Ржавый меч',
    description: 'Старый меч. Ещё режет.',
    tags: { slot: 'weapon', material: 'metal', rarity: 'common', element: 'none', level: 1 },
    stats: { str: 1 },
    value: 10,
  },
  crystal_staff: {
    id: 'crystal_staff', name: 'Кристальный посох',
    description: 'Посох из живого кристалла.',
    tags: { slot: 'weapon', material: 'crystal', rarity: 'uncommon', element: 'water', level: 3 },
    stats: { int: 3, maxMp: 5, waterPower: 2 },
    value: 50,
  },
  shadow_blade: {
    id: 'shadow_blade', name: 'Клинок теней',
    description: 'Лезвие из чистой тьмы.',
    tags: { slot: 'weapon', material: 'essence', rarity: 'rare', element: 'dark', level: 5 },
    stats: { str: 2, agi: 2, darkPower: 3 },
    value: 150,
  },
  bone_dagger: {
    id: 'bone_dagger', name: 'Костяной кинжал',
    description: 'Вырезан из кости.',
    tags: { slot: 'weapon', material: 'bone', rarity: 'common', element: 'dark', level: 2 },
    stats: { agi: 1, darkPower: 1 },
    value: 25,
  },

  // ─── БРОНЯ ───
  cloth_robe: {
    id: 'cloth_robe', name: 'Тканевая мантия',
    description: 'Мантия начинающего мага.',
    tags: { slot: 'body', material: 'cloth', rarity: 'common', element: 'none', level: 1 },
    stats: { armor: 1, int: 1, lightPower: 1 },
    value: 15,
  },
  leather_armor: {
    id: 'leather_armor', name: 'Кожаный доспех',
    description: 'Прочная кожа.',
    tags: { slot: 'body', material: 'leather', rarity: 'uncommon', element: 'none', level: 3 },
    stats: { armor: 4, agi: 1, earthPower: 1 },
    value: 60,
  },
  crystal_plate: {
    id: 'crystal_plate', name: 'Кристальный нагрудник',
    description: 'Пластины из живого кристалла.',
    tags: { slot: 'body', material: 'crystal', rarity: 'rare', element: 'water', level: 5 },
    stats: { armor: 7, maxHp: 10, waterPower: 2 },
    value: 200,
  },
  cloth_hood: {
    id: 'cloth_hood', name: 'Тканевый капюшон',
    description: 'Простой капюшон.',
    tags: { slot: 'head', material: 'cloth', rarity: 'common', element: 'none', level: 1 },
    stats: { armor: 1, int: 1 },
    value: 10,
  },
  bone_helm: {
    id: 'bone_helm', name: 'Костяной шлем',
    description: 'Шлем из костей.',
    tags: { slot: 'head', material: 'bone', rarity: 'uncommon', element: 'dark', level: 3 },
    stats: { armor: 3, darkPower: 1 },
    value: 45,
  },
  leather_boots: {
    id: 'leather_boots', name: 'Кожаные сапоги',
    description: 'Удобные сапоги.',
    tags: { slot: 'boots', material: 'leather', rarity: 'common', element: 'none', level: 1 },
    stats: { armor: 1, agi: 1, airPower: 1 },
    value: 12,
  },
  iron_ring: {
    id: 'iron_ring', name: 'Железное кольцо',
    description: 'Простое кольцо.',
    tags: { slot: 'ring', material: 'metal', rarity: 'common', element: 'none', level: 1 },
    stats: { str: 1, firePower: 1 },
    value: 20,
  },
  essence_amulet: {
    id: 'essence_amulet', name: 'Амулет эссенции',
    description: 'Пульсирует энергией.',
    tags: { slot: 'necklace', material: 'essence', rarity: 'uncommon', element: 'light', level: 3 },
    stats: { int: 2, maxMp: 8, lightPower: 2 },
    value: 80,
  },

  // ─── РАСХОДНИКИ ───
  minor_hp_potion: {
    id: 'minor_hp_potion', name: 'Малое зелье здоровья',
    description: 'Восстанавливает HP.',
    tags: { consumable: 'potion', effect: 'heal', rarity: 'common', material: 'herb', level: 1 },
    effectValue: 15,
    value: 5, stackable: true, maxStack: 99,
  },
  minor_mp_potion: {
    id: 'minor_mp_potion', name: 'Малое зелье маны',
    description: 'Восстанавливает MP.',
    tags: { consumable: 'potion', effect: 'heal', rarity: 'common', material: 'herb', element: 'water', level: 1 },
    effectValue: 10,
    value: 8, stackable: true, maxStack: 99,
  },
  fire_bomb: {
    id: 'fire_bomb', name: 'Огненная бомба',
    description: 'Взрывается огнём.',
    tags: { consumable: 'bomb', effect: 'damage', rarity: 'uncommon', material: 'essence', element: 'fire', level: 2 },
    effectValue: 25,
    value: 15, stackable: true, maxStack: 20,
  },

  // ─── МАТЕРИАЛЫ ───
  herb: {
    id: 'herb', name: 'Целебная трава',
    description: 'Основа зелий.',
    tags: { material: 'herb', rarity: 'common', element: 'light', level: 1 },
    value: 2, stackable: true, maxStack: 99,
  },
  crystal_shard: {
    id: 'crystal_shard', name: 'Осколок кристалла',
    description: 'Содержит магию.',
    tags: { material: 'crystal', rarity: 'uncommon', element: 'water', level: 2 },
    value: 8, stackable: true, maxStack: 99,
  },
  bone_fragment: {
    id: 'bone_fragment', name: 'Фрагмент кости',
    description: 'Кость мёртвого существа.',
    tags: { material: 'bone', rarity: 'common', element: 'dark', level: 1 },
    value: 3, stackable: true, maxStack: 99,
  },
  dark_essence: {
    id: 'dark_essence', name: 'Тёмная эссенция',
    description: 'Сгусток магической энергии.',
    tags: { material: 'essence', rarity: 'rare', element: 'dark', level: 4 },
    value: 25, stackable: true, maxStack: 50,
  },
  leather_piece: {
    id: 'leather_piece', name: 'Кусок кожи',
    description: 'Для брони.',
    tags: { material: 'leather', rarity: 'common', element: 'earth', level: 1 },
    value: 3, stackable: true, maxStack: 99,
  },
  metal_ore: {
    id: 'metal_ore', name: 'Руда',
    description: 'Можно выковать оружие.',
    tags: { material: 'metal', rarity: 'common', element: 'fire', level: 1 },
    value: 4, stackable: true, maxStack: 99,
  },
};
