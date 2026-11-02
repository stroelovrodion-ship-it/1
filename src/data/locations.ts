import { Location } from '../types/tags';

// ═══════════════════════════════════════════════
// ЛОКАЦИИ — определяются тегами [тип, опасность]
// ═══════════════════════════════════════════════

export const LOCATIONS: Record<string, Location> = {
  ashen_harbor: {
    id: 'ashen_harbor',
    name: 'Пепельная Гавань',
    description: 'Стартовый город. Уцелевший порт среди пепла. Здесь можно торговать, отдыхать и получать задания. Таверна "Последний огонёк" открыта круглосуточно.',
    tags: { type: 'city', dangerLevel: 0 },
    enemies: [],
    resources: [],
    connectedTo: ['ruins', 'cursed_forest'],
    events: ['tavern_rest', 'shop', 'quest_board'],
  },
  crystal_spire: {
    id: 'crystal_spire',
    name: 'Кристальный Шпиль',
    description: 'Академия магии, выросшая из гигантского кристалла. Здесь обучают новым школам. Библиотека содержит знания до Раскола.',
    tags: { type: 'city', dangerLevel: 0 },
    enemies: [],
    resources: ['crystal_shard'],
    connectedTo: ['crystal_wastes'],
    events: ['training', 'library', 'shop'],
  },
  rusty_port: {
    id: 'rusty_port',
    name: 'Ржавый Порт',
    description: 'Порт контрабандистов. Здесь можно найти редкие товары и тёмные дела. Закон — понятие относительное.',
    tags: { type: 'city', dangerLevel: 1 },
    enemies: [],
    resources: ['metal_ore', 'leather_piece'],
    connectedTo: ['underground'],
    events: ['black_market', 'smuggle_quest'],
  },
  ruins: {
    id: 'ruins',
    name: 'Руины старого мира',
    description: 'Остатки великого города. Разрушенные башни, обрушенные мосты. Скелеты бывших жителей всё ещё бродят здесь, не зная, что мир кончился.',
    tags: { type: 'dungeon', dangerLevel: 3 },
    enemies: ['skeleton', 'ruin_golem'],
    resources: ['metal_ore', 'bone_fragment', 'crystal_shard'],
    connectedTo: ['ashen_harbor', 'underground'],
    events: ['treasure_find', 'trap'],
  },
  crystal_wastes: {
    id: 'crystal_wastes',
    name: 'Кристаллические пустоши',
    description: 'Земля, покрытая живыми кристаллами. Они растут, пульсируют, иногда стреляют разрядами. Здесь водятся элементали.',
    tags: { type: 'wild', dangerLevel: 5 },
    enemies: ['crystal_spider', 'lightning_elemental'],
    resources: ['crystal_shard', 'dark_essence'],
    connectedTo: ['crystal_spire'],
    events: ['crystal_harvest', 'energy_surge'],
  },
  cursed_forest: {
    id: 'cursed_forest',
    name: 'Проклятый лес',
    description: 'Лес, поглощённый тенью. Деревья шепчут, тропы меняются. Здесь обитают теневые твари и призраки погибших путников.',
    tags: { type: 'wild', dangerLevel: 4 },
    enemies: ['shadow_wolf', 'forest_wraith'],
    resources: ['herb', 'leather_piece', 'dark_essence'],
    connectedTo: ['ashen_harbor'],
    events: ['herb_gathering', 'ghost_whisper'],
  },
  underground: {
    id: 'underground',
    name: 'Подземные тоннели',
    description: 'Сеть тоннелей под миром. Тьма, сырость, странные звуки. Здесь прячутся те, кто не хочет быть найденным.',
    tags: { type: 'dungeon', dangerLevel: 6 },
    enemies: ['cave_bat', 'dark_slime', 'bone_lord'],
    resources: ['metal_ore', 'bone_fragment', 'dark_essence'],
    connectedTo: ['rusty_port', 'ruins'],
    events: ['cave_in', 'underground_lake'],
  },
};
