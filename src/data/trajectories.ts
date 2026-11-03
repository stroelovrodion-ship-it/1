import { Trajectory } from '../types/tags';

// ═══════════════════════════════════════════════
// ТРАЕКТОРИИ — доступны с начала
// ═══════════════════════════════════════════════

export interface TrajectoryData {
  id: Trajectory;
  name: string;
  description: string;
  damageMultiplier: number;
  accuracyBonus: number;
  mpCost: number;
}

export const TRAJECTORIES: Record<Trajectory, TrajectoryData> = {
  direct: {
    id: 'direct',
    name: 'Прямая',
    description: 'Прямой полёт. Точная, но предсказуемая.',
    damageMultiplier: 1.0,
    accuracyBonus: 10,
    mpCost: 0,
  },
  arc: {
    id: 'arc',
    name: 'Дуга',
    description: 'Летит по дуге. Сложнее уклониться.',
    damageMultiplier: 1.1,
    accuracyBonus: 5,
    mpCost: 1,
  },
  homing: {
    id: 'homing',
    name: 'Самонаведение',
    description: 'Следует за целью. Не промахнётся.',
    damageMultiplier: 0.9,
    accuracyBonus: 30,
    mpCost: 2,
  },
  spread: {
    id: 'spread',
    name: 'Рассеивание',
    description: 'Несколько снарядов. Бьёт по всем частям.',
    damageMultiplier: 0.6,
    accuracyBonus: 0,
    mpCost: 3,
  },
  pierce: {
    id: 'pierce',
    name: 'Пронзающая',
    description: 'Проходит насквозь. Игнорирует часть брони.',
    damageMultiplier: 1.2,
    accuracyBonus: -5,
    mpCost: 2,
  },
};
