import { Rune } from '../types/tags';

// ═══════════════════════════════════════════════
// РУНЫ — основа конструктора магии
// ═══════════════════════════════════════════════
// Типы: Время (2 макс), Эффект, Уникальные
// ОЧСМ — стоимость размещения

export const RUNES: Record<string, Rune> = {
  // ─── РУНЫ ВРЕМЕНИ (макс 2 в слоте) ───
  time_instant: {
    id: 'time_instant',
    name: 'Руна Мгновения',
    description: 'Заклинание срабатывает мгновенно.',
    type: 'time',
    osmCost: 1,
    level: 1,
    value: 0,
  },
  time_delayed: {
    id: 'time_delayed',
    name: 'Руна Задержки',
    description: 'Эффект срабатывает через 1 ход.',
    type: 'time',
    osmCost: 1,
    duration: 1,
    level: 2,
    value: 0,
  },
  time_persistent: {
    id: 'time_persistent',
    name: 'Руна Постоянства',
    description: 'Эффект действует 3 хода.',
    type: 'time',
    osmCost: 2,
    duration: 3,
    level: 3,
    value: 0,
  },
  time_recurring: {
    id: 'time_recurring',
    name: 'Руна Повторения',
    description: 'Эффект повторяется каждый ход (5 ходов).',
    type: 'time',
    osmCost: 3,
    duration: 5,
    level: 5,
    value: 0,
  },

  // ─── РУНЫ ЭФФЕКТА (1 в слоте) ───
  effect_fire: {
    id: 'effect_fire',
    name: 'Руна Огня',
    description: 'Наносит урон огнём. Шанс поджечь.',
    type: 'effect',
    osmCost: 2,
    element: 'fire',
    effect: 'burn',
    level: 1,
    value: 8,
    chance: 30,
  },
  effect_water: {
    id: 'effect_water',
    name: 'Руна Воды',
    description: 'Наносит урон водой. Шанс заморозить.',
    type: 'effect',
    osmCost: 2,
    element: 'water',
    effect: 'freeze',
    level: 1,
    value: 7,
    chance: 25,
  },
  effect_earth: {
    id: 'effect_earth',
    name: 'Руна Земли',
    description: 'Наносит урон землёй. Шанс оглушить.',
    type: 'effect',
    osmCost: 2,
    element: 'earth',
    effect: 'debuff',
    level: 1,
    value: 9,
    chance: 20,
  },
  effect_air: {
    id: 'effect_air',
    name: 'Руна Воздуха',
    description: 'Наносит урон воздухом. Шанс ослепить.',
    type: 'effect',
    osmCost: 2,
    element: 'air',
    effect: 'blind',
    level: 1,
    value: 6,
    chance: 35,
  },
  effect_light: {
    id: 'effect_light',
    name: 'Руна Света',
    description: 'Лечит или наносит урон тьме.',
    type: 'effect',
    osmCost: 2,
    element: 'light',
    effect: 'heal',
    level: 1,
    value: 10,
  },
  effect_dark: {
    id: 'effect_dark',
    name: 'Руна Тьмы',
    description: 'Наносит урон тьмой. Крадёт жизнь.',
    type: 'effect',
    osmCost: 2,
    element: 'dark',
    effect: 'damage',
    level: 1,
    value: 10,
  },

  // ─── УНИКАЛЬНЫЕ РУНЫ (1 в слоте) ───
  unique_shield: {
    id: 'unique_shield',
    name: 'Руна Щита',
    description: 'Создаёт магический барьер.',
    type: 'unique',
    osmCost: 2,
    effect: 'shield',
    level: 1,
    value: 15,
  },
  unique_haste: {
    id: 'unique_haste',
    name: 'Руна Скорости',
    description: 'Увеличивает уклонение.',
    type: 'unique',
    osmCost: 2,
    effect: 'buff',
    level: 2,
    value: 3,
  },
  unique_drain: {
    id: 'unique_drain',
    name: 'Руна Поглощения',
    description: 'Крадёт HP врага, восстанавливая свои.',
    type: 'unique',
    osmCost: 3,
    element: 'dark',
    effect: 'damage',
    level: 3,
    value: 8,
  },
  unique_nova: {
    id: 'unique_nova',
    name: 'Руна Взрыва',
    description: 'Мощный урон по всем частям тела.',
    type: 'unique',
    osmCost: 4,
    effect: 'damage',
    level: 5,
    value: 20,
  },
};

// ═══════════════════════════════════════════════
// ФОРМЫ ЗАКЛИНАНИЙ (изучаются свитками)
// ═══════════════════════════════════════════════

export interface SpellForm {
  id: string;
  name: string;
  description: string;
  damageBonus: number;
  critBonus: number;
  mpCost: number;
  level: number;
}

export const SPELL_FORMS: Record<string, SpellForm> = {
  bolt: {
    id: 'bolt',
    name: 'Снаряд',
    description: 'Базовая форма. Прямой урон.',
    damageBonus: 3,
    critBonus: 5,
    mpCost: 3,
    level: 1,
  },
  arrow: {
    id: 'arrow',
    name: 'Стрела',
    description: 'Быстрая форма. Повышенный крит.',
    damageBonus: 2,
    critBonus: 20,
    mpCost: 4,
    level: 1,
  },
  sphere: {
    id: 'sphere',
    name: 'Сфера',
    description: 'Медленная, но мощная.',
    damageBonus: 6,
    critBonus: 0,
    mpCost: 5,
    level: 2,
  },
  wave: {
    id: 'wave',
    name: 'Волна',
    description: 'Бьёт по всем частям тела.',
    damageBonus: 1,
    critBonus: 5,
    mpCost: 6,
    level: 3,
  },
  beam: {
    id: 'beam',
    name: 'Луч',
    description: 'Концентрированный урон в одну точку.',
    damageBonus: 8,
    critBonus: 10,
    mpCost: 7,
    level: 4,
  },
  nova: {
    id: 'nova',
    name: 'Нова',
    description: 'Взрыв вокруг. Максимальный урон.',
    damageBonus: 12,
    critBonus: 0,
    mpCost: 10,
    level: 5,
  },
};

// ═══════════════════════════════════════════════
// ДОП. ЭФФЕКТЫ (изучаются свитками)
// ═══════════════════════════════════════════════

export interface ScrollEffect {
  id: string;
  name: string;
  description: string;
  element: string;
  effect: string;
  chance: number;
  power: number; // множитель от силы стихии
  level: number;
}

export const SCROLL_EFFECTS: Record<string, ScrollEffect> = {
  burn: {
    id: 'burn',
    name: 'Горение',
    description: 'Враг горит. Урон = сила огня * 1 за ход.',
    element: 'fire',
    effect: 'burn',
    chance: 50,
    power: 1,
    level: 1,
  },
  frost: {
    id: 'frost',
    name: 'Обморожение',
    description: 'Замедляет врага. -2 к урону на 2 хода.',
    element: 'water',
    effect: 'freeze',
    chance: 40,
    power: 0.5,
    level: 1,
  },
  shock: {
    id: 'shock',
    name: 'Шок',
    description: 'Парализует на 1 ход (шанс 30%).',
    element: 'air',
    effect: 'shock',
    chance: 30,
    power: 0,
    level: 2,
  },
  poison: {
    id: 'poison',
    name: 'Отравление',
    description: 'Урон землёй за каждый ход.',
    element: 'earth',
    effect: 'poison',
    chance: 45,
    power: 0.8,
    level: 1,
  },
  blind: {
    id: 'blind',
    name: 'Ослепление',
    description: 'Враг промахивается (шанс 50%).',
    element: 'light',
    effect: 'blind',
    chance: 50,
    power: 0,
    level: 2,
  },
  curse: {
    id: 'curse',
    name: 'Проклятие',
    description: 'Снижает защиту врага.',
    element: 'dark',
    effect: 'debuff',
    chance: 40,
    power: 2,
    level: 2,
  },
};
