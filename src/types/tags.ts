// ═══════════════════════════════════════════════
// СИСТЕМА ТЕГОВ v2 — Конструктор магии
// ═══════════════════════════════════════════════

// ─── Слоты экипировки ───
export type SlotType = 
  | 'head' | 'body' | 'boots' | 'weapon' 
  | 'extra' | 'artifact' | 'ring' | 'necklace';

// ─── Материалы ───
export type MaterialType = 
  | 'cloth' | 'leather' | 'metal' | 'crystal' 
  | 'bone' | 'herb' | 'essence' | 'wood' | 'gem';

// ─── Редкость ───
export type RarityType = 'common' | 'uncommon' | 'rare' | 'epic' | 'artifact';

// ─── Стихии ───
export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark' | 'none';

// ─── Расходники ───
export type ConsumableType = 'potion' | 'scroll' | 'bomb' | 'food';

// ─── Эффекты ───
export type EffectType = 'heal' | 'damage' | 'buff' | 'debuff' | 'shield' | 'burn' | 'freeze' | 'shock' | 'blind' | 'poison';

// ─── Части тела врага ───
export type BodyPart = 'head' | 'torso' | 'arms' | 'legs' | 'wings' | 'tail';

// ─── Формы заклинаний ───
export type SpellForm = 'bolt' | 'arrow' | 'sphere' | 'wave' | 'beam' | 'nova';

// ─── Типы рун ───
export type RuneType = 'time' | 'effect' | 'unique';

// ─── Локации ───
export type LocationType = 'city' | 'dungeon' | 'wild' | 'special';
export type LocationId = 'ashen_harbor' | 'crystal_spire' | 'rusty_port' | 'ruins' | 'crystal_wastes' | 'cursed_forest' | 'underground';

// ─── Типы врагов ───
export type EnemyType = 'undead' | 'beast' | 'elemental' | 'demon' | 'human' | 'construct';
export type EnemyBehavior = 'aggressive' | 'passive' | 'defensive' | 'magical';
export type EnemyRarity = 'common' | 'uncommon' | 'rare' | 'boss';

// ═══════════════════════════════════════════════
// РУНЫ
// ═══════════════════════════════════════════════

export interface Rune {
  id: string;
  name: string;
  description: string;
  type: RuneType;
  osmCost: number; // очки силы магии
  element?: ElementType;
  effect?: EffectType;
  form?: SpellForm;
  bodyPart?: BodyPart;
  value: number; // урон/лечение/бафф
  duration?: number;
  chance?: number; // шанс срабатывания эффекта
  level: number;
}

// ═══════════════════════════════════════════════
// КОНСТРУКТОР ЗАКЛИНАНИЙ
// ═══════════════════════════════════════════════

export interface SpellSlot {
  name: string;
  runes: string[]; // id рун, макс 3: 2 времени + 1 эффект/уникальная
  mpCost: number;
  target: 'self' | 'enemy';
}

// Заклинание на себя: руны времени + эффект/уникальная
// Заклинание на врага: элемент + часть тела + форма + доп.эффект

export interface EnemyBodyPartData {
  part: BodyPart;
  weakness?: ElementType;
  resistance?: ElementType;
  multiplier?: number; // доп множитель
}

// ═══════════════════════════════════════════════
// ПРЕДМЕТЫ
// ═══════════════════════════════════════════════

export interface ItemTags {
  slot?: SlotType;
  material?: MaterialType;
  rarity: RarityType;
  element?: ElementType;
  consumable?: ConsumableType;
  effect?: EffectType;
  level: number;
  isRune?: boolean;
  isScroll?: boolean;
  craftable?: {
    tier: number;
    recipe: { materialId: string; count: number }[];
  };
}

export interface ItemStatBonus {
  str?: number;
  agi?: number;
  int?: number;
  lck?: number;
  maxHp?: number;
  maxMp?: number;
  armor?: number;
  firePower?: number;
  waterPower?: number;
  earthPower?: number;
  airPower?: number;
  lightPower?: number;
  darkPower?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  tags: ItemTags;
  stats?: ItemStatBonus;
  effectValue?: number;
  effectDuration?: number;
  value: number;
  stackable?: boolean;
  maxStack?: number;
}

// ═══════════════════════════════════════════════
// ВРАГИ
// ═══════════════════════════════════════════════

export interface EnemyTags {
  location: LocationId[];
  rarity: EnemyRarity;
  element?: ElementType;
  type: EnemyType;
  behavior: EnemyBehavior;
}

export interface EnemyLoot {
  items: { itemId: string; chance: number }[];
  gold: { min: number; max: number };
  xp: number;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  description: string;
  tags: EnemyTags;
  level: number;
  baseHp: number;
  baseDamage: number;
  armor: number;
  bodyParts: EnemyBodyPartData[];
  loot: EnemyLoot;
  abilities: string[];
}

// ═══════════════════════════════════════════════
// ЛОКАЦИИ
// ═══════════════════════════════════════════════

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  tags: { type: LocationType; dangerLevel: number };
  enemies: string[];
  resources: string[];
  runeDrops?: string[];
  connectedTo: LocationId[];
  events: string[];
  mapX: number;
  mapY: number;
}

// ═══════════════════════════════════════════════
// СОСТОЯНИЕ ИГРЫ
// ═══════════════════════════════════════════════

export interface HeroStats {
  str: number;
  agi: number;
  int: number;
  lck: number;
  maxHp: number;
  maxMp: number;
  armor: number;
  // Сила стихий
  firePower: number;
  waterPower: number;
  earthPower: number;
  airPower: number;
  lightPower: number;
  darkPower: number;
}

export interface HeroState {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  baseStats: HeroStats;
  currentHp: number;
  currentMp: number;
  osm: number; // очки силы магии (макс слотов рун)
  osmMax: number;
  equipped: Record<SlotType, Item | null>;
  inventory: InventoryItem[];
  spellSlots: SpellSlot[]; // 2 слота в начале
  collectedRunes: string[]; // id рун, которые найдены
  knownScrolls: string[]; // id свитков (доп.эффекты)
  bestiary: Record<string, BestiaryEntry>;
}

export interface InventoryItem {
  item: Item;
  count: number;
}

export interface BestiaryEntry {
  enemyId: string;
  kills: number;
  discovered: boolean;
}

export interface BattleState {
  active: boolean;
  enemy: EnemyInstance | null;
  log: BattleLogEntry[];
  turn: number;
  playerTurn: boolean;
  selectedBodyPart: BodyPart | null;
}

export interface EnemyInstance {
  template: EnemyTemplate;
  currentHp: number;
  maxHp: number;
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
  bodyPartDamage: Record<BodyPart, number>; // урон по частям
}

export interface StatusEffect {
  type: EffectType;
  value: number;
  duration: number;
  source: string;
  element?: ElementType;
}

export interface BattleLogEntry {
  text: string;
  type: 'damage' | 'heal' | 'info' | 'loot' | 'system';
  turn: number;
}

export interface GameState {
  hero: HeroState;
  currentLocation: LocationId;
  battle: BattleState;
  eventLog: EventLogEntry[];
  gameTime: number;
}

export interface EventLogEntry {
  text: string;
  type: 'combat' | 'loot' | 'story' | 'system';
  time: number;
}
