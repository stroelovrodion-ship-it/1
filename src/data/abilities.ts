import { Ability } from '../types/tags';

// ═══════════════════════════════════════════════
// СПОСОБНОСТИ — определяются тегами [школа, эффект]
// ═══════════════════════════════════════════════

export const ABILITIES: Record<string, Ability> = {
  // ─── ШКОЛА СТИХИЙ ───
  fireball: {
    id: 'fireball',
    name: 'Огненный шар',
    description: 'Запускает шар огня. Наносит урон огнём.',
    tags: { school: 'elements', target: 'enemy', effect: 'damage', element: 'fire' },
    mpCost: 4,
    level: 1,
    basePower: 12,
    cooldown: 0,
  },
  ice_shard: {
    id: 'ice_shard',
    name: 'Ледяной шип',
    description: 'Острый осколок льда. Может замедлить врага.',
    tags: { school: 'elements', target: 'enemy', effect: 'damage', element: 'ice' },
    mpCost: 3,
    level: 1,
    basePower: 8,
    cooldown: 0,
  },
  lightning_bolt: {
    id: 'lightning_bolt',
    name: 'Молния',
    description: 'Разряд молнии. Высокий урон, но дорогое.',
    tags: { school: 'elements', target: 'enemy', effect: 'damage', element: 'lightning' },
    mpCost: 6,
    level: 3,
    basePower: 18,
    cooldown: 1,
  },
  flame_wall: {
    id: 'flame_wall',
    name: 'Стена пламени',
    description: 'Создаёт стену огня. Обжигает всех врагов.',
    tags: { school: 'elements', target: 'all_enemies', effect: 'damage', element: 'fire' },
    mpCost: 8,
    level: 5,
    basePower: 10,
    cooldown: 2,
  },

  // ─── ШКОЛА ТЕНЕЙ ───
  shadow_bolt: {
    id: 'shadow_bolt',
    name: 'Теневой снаряд',
    description: 'Сгусток тьмы. Наносит урон тенью.',
    tags: { school: 'shadows', target: 'enemy', effect: 'damage', element: 'shadow' },
    mpCost: 3,
    level: 1,
    basePower: 9,
    cooldown: 0,
  },
  life_drain: {
    id: 'life_drain',
    name: 'Кража жизни',
    description: 'Высасывает жизнь из врага, восстанавливая свою.',
    tags: { school: 'shadows', target: 'enemy', effect: 'damage', element: 'shadow' },
    mpCost: 5,
    level: 2,
    basePower: 8,
    cooldown: 1,
  },
  blind: {
    id: 'blind',
    name: 'Ослепление',
    description: 'Враг теряет точность на несколько ходов.',
    tags: { school: 'shadows', target: 'enemy', effect: 'debuff', element: 'shadow' },
    mpCost: 4,
    level: 3,
    basePower: 0,
    cooldown: 2,
  },

  // ─── ШКОЛА ЖИЗНИ ───
  heal: {
    id: 'heal',
    name: 'Исцеление',
    description: 'Восстанавливает HP.',
    tags: { school: 'life', target: 'self', effect: 'heal', element: 'life' },
    mpCost: 4,
    level: 1,
    basePower: 15,
    cooldown: 0,
  },
  shield_spell: {
    id: 'shield_spell',
    name: 'Магический щит',
    description: 'Создаёт барьер, поглощающий урон.',
    tags: { school: 'life', target: 'self', effect: 'shield', element: 'life' },
    mpCost: 5,
    level: 2,
    basePower: 12,
    cooldown: 2,
  },
  haste: {
    id: 'haste',
    name: 'Ускорение',
    description: 'Увеличивает скорость на несколько ходов.',
    tags: { school: 'life', target: 'self', effect: 'buff', element: 'life' },
    mpCost: 3,
    level: 3,
    basePower: 3,
    cooldown: 3,
  },

  // ─── ШКОЛА ХАОСА ───
  chaos_bolt: {
    id: 'chaos_bolt',
    name: 'Хаотический снаряд',
    description: 'Случайный элемент. Непредсказуемый урон.',
    tags: { school: 'chaos', target: 'enemy', effect: 'damage', element: 'chaos' },
    mpCost: 4,
    level: 2,
    basePower: 15,
    cooldown: 0,
  },
  mutate: {
    id: 'mutate',
    name: 'Мутация',
    description: 'Случайный эффект. Может помочь или навредить.',
    tags: { school: 'chaos', target: 'enemy', effect: 'debuff', element: 'chaos' },
    mpCost: 6,
    level: 4,
    basePower: 0,
    cooldown: 3,
  },
};
