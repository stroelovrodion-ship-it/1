import { Rune, SpellForm, ScrollEffect } from '../types/tags';

// ═══════════════════════════════════════════════
// РУНЫ v2 — улучшенный баланс
// ═══════════════════════════════════════════════

export const RUNES: Record<string, Rune> = {
  // ─── РУНЫ ВРЕМЕНИ ───
  time_instant: {
    id: 'time_instant', name: 'Руна Мгновения',
    description: 'Мгновенное срабатывание. Базовая руна времени.',
    type: 'time', osmCost: 1, level: 1, value: 0,
  },
  time_delayed: {
    id: 'time_delayed', name: 'Руна Задержки',
    description: 'Эффект через 1 ход. Враг не ожидает.',
    type: 'time', osmCost: 1, duration: 1, level: 2, value: 0,
  },
  time_persistent: {
    id: 'time_persistent', name: 'Руна Постоянства',
    description: 'Эффект действует 3 хода. Долгая магия.',
    type: 'time', osmCost: 2, duration: 3, level: 3, value: 0,
  },
  time_recurring: {
    id: 'time_recurring', name: 'Руна Повторения',
    description: 'Повторяется 5 ходов. Изматывает врага.',
    type: 'time', osmCost: 3, duration: 5, level: 5, value: 0,
  },

  // ─── РУНЫ ЭФФЕКТА ───
  effect_fire: {
    id: 'effect_fire', name: 'Руна Огня',
    description: 'Огненный урон. Шанс поджечь (30%).',
    type: 'effect', osmCost: 2, element: 'fire', effect: 'burn', level: 1, value: 10, chance: 30,
  },
  effect_water: {
    id: 'effect_water', name: 'Руна Воды',
    description: 'Водный урон. Шанс заморозить (25%).',
    type: 'effect', osmCost: 2, element: 'water', effect: 'freeze', level: 1, value: 9, chance: 25,
  },
  effect_earth: {
    id: 'effect_earth', name: 'Руна Земли',
    description: 'Земляной урон. Шанс оглушить (20%).',
    type: 'effect', osmCost: 2, element: 'earth', effect: 'debuff', level: 1, value: 11, chance: 20,
  },
  effect_air: {
    id: 'effect_air', name: 'Руна Воздуха',
    description: 'Воздушный урон. Шанс ослепить (35%).',
    type: 'effect', osmCost: 2, element: 'air', effect: 'blind', level: 1, value: 8, chance: 35,
  },
  effect_light: {
    id: 'effect_light', name: 'Руна Света',
    description: 'Светлая магия. Лечит или наносит урон тьме.',
    type: 'effect', osmCost: 2, element: 'light', effect: 'heal', level: 1, value: 12,
  },
  effect_dark: {
    id: 'effect_dark', name: 'Руна Тьмы',
    description: 'Тёмная магия. Крадёт жизнь врага.',
    type: 'effect', osmCost: 2, element: 'dark', effect: 'damage', level: 1, value: 12,
  },

  // ─── УНИКАЛЬНЫЕ РУНЫ ───
  unique_shield: {
    id: 'unique_shield', name: 'Руна Щита',
    description: 'Создаёт магический барьер (15 HP).',
    type: 'unique', osmCost: 2, effect: 'shield', level: 1, value: 15,
  },
  unique_haste: {
    id: 'unique_haste', name: 'Руна Скорости',
    description: 'Увеличивает уклонение на 3 хода.',
    type: 'unique', osmCost: 2, effect: 'buff', level: 2, value: 3,
  },
  unique_drain: {
    id: 'unique_drain', name: 'Руна Поглощения',
    description: 'Крадёт HP врага. Восстанавливает твои.',
    type: 'unique', osmCost: 3, element: 'dark', effect: 'damage', level: 3, value: 10,
  },
  unique_nova: {
    id: 'unique_nova', name: 'Руна Взрыва',
    description: 'Мощный урон по всем частям тела (20).',
    type: 'unique', osmCost: 4, effect: 'damage', level: 5, value: 20,
  },
};

// ═══════════════════════════════════════════════
// ФОРМЫ ЗАКЛИНАНИЙ v2
// ═══════════════════════════════════════════════

export const SPELL_FORMS: Record<string, SpellForm> = {
  bolt: {
    id: 'bolt', name: 'Снаряд',
    description: 'Базовая форма. +3 урона, +5% крит.',
    damageBonus: 3, critBonus: 5, mpCost: 3, level: 1,
  },
  arrow: {
    id: 'arrow', name: 'Стрела',
    description: 'Быстрая форма. +2 урона, +20% крит.',
    damageBonus: 2, critBonus: 20, mpCost: 4, level: 1,
  },
  sphere: {
    id: 'sphere', name: 'Сфера',
    description: 'Медленная, мощная. +6 урона.',
    damageBonus: 6, critBonus: 0, mpCost: 5, level: 2,
  },
  wave: {
    id: 'wave', name: 'Волна',
    description: 'Бьёт по всем частям. +1 урона.',
    damageBonus: 1, critBonus: 5, mpCost: 6, level: 3,
  },
  beam: {
    id: 'beam', name: 'Луч',
    description: 'Концентрация. +8 урона, +10% крит.',
    damageBonus: 8, critBonus: 10, mpCost: 7, level: 4,
  },
  nova: {
    id: 'nova', name: 'Нова',
    description: 'Взрыв вокруг. +12 урона.',
    damageBonus: 12, critBonus: 0, mpCost: 10, level: 5,
  },
};

// ═══════════════════════════════════════════════
// ЭФФЕКТЫ СВИТКОВ v2
// ═══════════════════════════════════════════════

export const SCROLL_EFFECTS: Record<string, ScrollEffect> = {
  burn: {
    id: 'burn', name: 'Горение',
    description: 'Враг горит 3 хода. Урон = сила огня × 1.',
    element: 'fire', effect: 'burn', chance: 50, power: 1.0, level: 1,
  },
  frost: {
    id: 'frost', name: 'Обморожение',
    description: 'Замедляет на 2 хода. -2 к урону врага.',
    element: 'water', effect: 'freeze', chance: 40, power: 0.5, level: 1,
  },
  shock: {
    id: 'shock', name: 'Шок',
    description: 'Парализует на 1 ход (шанс 30%).',
    element: 'air', effect: 'shock', chance: 30, power: 0, level: 2,
  },
  poison: {
    id: 'poison', name: 'Отравление',
    description: 'Урон землёй 4 хода. Сила земли × 0.8.',
    element: 'earth', effect: 'poison', chance: 45, power: 0.8, level: 1,
  },
  blind: {
    id: 'blind', name: 'Ослепление',
    description: 'Враг промахивается (шанс 50%, 2 хода).',
    element: 'light', effect: 'blind', chance: 50, power: 0, level: 2,
  },
  curse: {
    id: 'curse', name: 'Проклятие',
    description: 'Снижает защиту врага на 3 хода.',
    element: 'dark', effect: 'debuff', chance: 40, power: 2.0, level: 2,
  },
};
