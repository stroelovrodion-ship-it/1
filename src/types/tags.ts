// ═══════════════════════════════════════════════
// СИСТЕМА ТЕГОВ — ядро архитектуры
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
export type ElementType = 'fire' | 'ice' | 'lightning' | 'shadow' | 'life' | 'chaos' | 'none';

// ─── Расходники ───
export type ConsumableType = 'potion' | 'scroll' | 'bomb' | 'food';

// ─── Эффекты ───
export type EffectType = 'heal' | 'damage' | 'buff' | 'debuff' | 'shield' | 'poison' | 'stun';

// ─── Локации ───
export type LocationType = 'city' | 'dungeon' | 'wild' | 'special';
export type LocationId = 'ashen_harbor' | 'crystal_spire' | 'rusty_port' | 'ruins' | 'crystal_wastes' | 'cursed_forest' | 'underground';

// ─── Типы врагов ───
export type EnemyType = 'undead' | 'beast' | 'elemental' | 'demon' | 'human' | 'construct';
export type EnemyBehavior = 'aggressive' | 'passive' | 'defensive' | 'magical';
export type EnemyRarity = 'common' | 'uncommon' | 'rare' | 'boss';

// ─── Школы магии ───
export type MagicSchool = 'elements' | 'shadows' | 'life' | 'chaos';

// ─── Цели способностей ───
export type AbilityTarget = 'self' | 'enemy' | 'all_enemies' | 'ally';

// ═══════════════════════════════════════════════
// ИНТЕРФЕЙСЫ ТЕГИРОВАННЫХ ОБЪЕКТОВ
// ═══════════════════════════════════════════════

export interface ItemTags {
  slot?: SlotType;
  material?: MaterialType;
  rarity: RarityType;
  element?: ElementType;
  consumable?: ConsumableType;
  effect?: EffectType;
  level: number;
  craftable?: {
    tier: number;
    recipe: { materialId: string; count: number }[];
  };
}

export interface ItemStatBonus {
  str?: number;
  agi?: number;
  int?: number;
  vit?: number;
  lck?: number;
  maxHp?: number;
  maxMp?: number;
  armor?: number;
  damage?: number;
  speed?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  tags: ItemTags;
  stats?: ItemStatBonus;
  effectValue?: number;
  effectDuration?: number;
  value: number; // цена в золоте
  stackable?: boolean;
  maxStack?: number;
}

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
  speed: number;
  abilities: string[]; // ability ids
  loot: EnemyLoot;
  weaknesses: ElementType[];
  resistances: ElementType[];
}

export interface LocationTags {
  type: LocationType;
  dangerLevel: number;
}

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  tags: LocationTags;
  enemies: string[]; // enemy template ids
  resources: string[]; // material ids
  connectedTo: LocationId[];
  events: string[];
}

export interface AbilityTags {
  school: MagicSchool;
  target: AbilityTarget;
  effect: EffectType;
  element: ElementType;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  tags: AbilityTags;
  mpCost: number;
  level: number;
  basePower: number;
  cooldown: number;
}

// ═══════════════════════════════════════════════
// СОСТОЯНИЕ ИГРЫ
// ═══════════════════════════════════════════════

export interface HeroStats {
  str: number;
  agi: number;
  int: number;
  vit: number;
  lck: number;
  maxHp: number;
  maxMp: number;
  armor: number;
  damage: number;
  speed: number;
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
  equipped: Record<SlotType, Item | null>;
  inventory: InventoryItem[];
  abilities: string[]; // ability ids
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
}

export interface EnemyInstance {
  template: EnemyTemplate;
  currentHp: number;
  maxHp: number;
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
}

export interface StatusEffect {
  type: EffectType;
  value: number;
  duration: number;
  source: string;
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
