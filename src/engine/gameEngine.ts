import { useState, useCallback, useRef } from 'react';
import {
  GameState, HeroState, BattleState, EventLogEntry,
  Item, SlotType, InventoryItem, EnemyInstance,
  BattleLogEntry, LocationId, StatusEffect, EffectType
} from '../types/tags';
import { ITEMS } from '../data/items';
import { ENEMIES } from '../data/enemies';
import { LOCATIONS } from '../data/locations';
import { ABILITIES } from '../data/abilities';

// ═══════════════════════════════════════════════
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ═══════════════════════════════════════════════

function createInitialHero(): HeroState {
  return {
    name: 'Неофит',
    level: 1,
    xp: 0,
    xpToNext: 50,
    gold: 20,
    baseStats: {
      str: 5, agi: 5, int: 7, vit: 5, lck: 3,
      maxHp: 30, maxMp: 15, armor: 0, damage: 3, speed: 5,
    },
    currentHp: 30,
    currentMp: 15,
    equipped: {
      head: null, body: null, boots: null, weapon: null,
      extra: null, artifact: null, ring: null, necklace: null,
    },
    inventory: [
      { item: ITEMS.minor_hp_potion, count: 3 },
      { item: ITEMS.minor_mp_potion, count: 2 },
    ],
    abilities: ['fireball', 'heal'],
    bestiary: {},
  };
}

function createInitialState(): GameState {
  return {
    hero: createInitialHero(),
    currentLocation: 'ashen_harbor',
    battle: { active: false, enemy: null, log: [], turn: 0, playerTurn: true },
    eventLog: [{
      text: 'Ты очнулся среди пепла. Вокруг — руины Пепельной Гавани. Мир изменился...',
      type: 'story',
      time: 0,
    }],
    gameTime: 0,
  };
}

// ═══════════════════════════════════════════════
// ХЕЛПЕРЫ
// ═══════════════════════════════════════════════

function getEffectiveStats(hero: HeroState) {
  const stats = { ...hero.baseStats };
  Object.values(hero.equipped).forEach(item => {
    if (item?.stats) {
      Object.entries(item.stats).forEach(([key, val]) => {
        if (val && key in stats) {
          (stats as any)[key] += val;
        }
      });
    }
  });
  return stats;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══════════════════════════════════════════════
// ХУК ИГРОВОГО СОСТОЯНИЯ
// ═══════════════════════════════════════════════

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [abilityMenu, setAbilityMenu] = useState(false);
  const [itemMenu, setItemMenu] = useState(false);
  const cooldownsRef = useRef<Record<string, number>>({});

  const addLog = useCallback((text: string, type: EventLogEntry['type'] = 'system') => {
    setState(prev => ({
      ...prev,
      eventLog: [...prev.eventLog.slice(-50), { text, type, time: prev.gameTime }],
      gameTime: prev.gameTime + 1,
    }));
  }, []);

  const addBattleLog = useCallback((text: string, type: BattleLogEntry['type'] = 'info') => {
    setState(prev => ({
      ...prev,
      battle: {
        ...prev.battle,
        log: [...prev.battle.log, { text, type, turn: prev.battle.turn }],
      },
    }));
  }, []);

  // ─── ЭКИПИРОВКА ───
  const equipItem = useCallback((invIndex: number) => {
    setState(prev => {
      const invItem = prev.hero.inventory[invIndex];
      if (!invItem || !invItem.item.tags.slot) return prev;

      const slot = invItem.item.tags.slot as SlotType;
      const newInventory = [...prev.hero.inventory];
      const oldEquipped = prev.hero.equipped[slot];

      // Снимаем старое
      if (oldEquipped) {
        const existingIdx = newInventory.findIndex(i => i.item.id === oldEquipped.id);
        if (existingIdx >= 0) {
          newInventory[existingIdx] = { ...newInventory[existingIdx], count: newInventory[existingIdx].count + 1 };
        } else {
          newInventory.push({ item: oldEquipped, count: 1 });
        }
      }

      // Надеваем новое
      newInventory[invIndex] = { ...invItem, count: invItem.count - 1 };
      const filtered = newInventory.filter(i => i.count > 0);

      const newEquipped = { ...prev.hero.equipped, [slot]: invItem.item };

      return {
        ...prev,
        hero: { ...prev.hero, inventory: filtered, equipped: newEquipped },
      };
    });
    addLog('Предмет экипирован.', 'system');
  }, [addLog]);

  const unequipItem = useCallback((slot: SlotType) => {
    setState(prev => {
      const item = prev.hero.equipped[slot];
      if (!item) return prev;

      const newInventory = [...prev.hero.inventory];
      const existingIdx = newInventory.findIndex(i => i.item.id === item.id);
      if (existingIdx >= 0) {
        newInventory[existingIdx] = { ...newInventory[existingIdx], count: newInventory[existingIdx].count + 1 };
      } else {
        newInventory.push({ item, count: 1 });
      }

      return {
        ...prev,
        hero: {
          ...prev.hero,
          equipped: { ...prev.hero.equipped, [slot]: null },
          inventory: newInventory,
        },
      };
    });
    addLog('Предмет снят.', 'system');
  }, [addLog]);

  // ─── ИСПОЛЬЗОВАНИЕ ПРЕДМЕТА ───
  const useItem = useCallback((invIndex: number, inBattle = false) => {
    setState(prev => {
      const invItem = prev.hero.inventory[invIndex];
      if (!invItem) return prev;
      const item = invItem.item;

      if (!item.tags.consumable) return prev;

      let newHp = prev.hero.currentHp;
      let newMp = prev.hero.currentMp;
      const stats = getEffectiveStats(prev.hero);

      if (item.tags.effect === 'heal') {
        if (item.tags.element === 'life' || item.id.includes('mp')) {
          newMp = Math.min(stats.maxMp, newMp + (item.effectValue || 0));
        } else {
          newHp = Math.min(stats.maxHp, newHp + (item.effectValue || 0));
        }
      }

      const newInventory = [...prev.hero.inventory];
      newInventory[invIndex] = { ...invItem, count: invItem.count - 1 };
      const filtered = newInventory.filter(i => i.count > 0);

      return {
        ...prev,
        hero: { ...prev.hero, currentHp: newHp, currentMp: newMp, inventory: filtered },
      };
    });
  }, []);

  // ─── ПЕРЕДВИЖЕНИЕ ───
  const travel = useCallback((locationId: LocationId) => {
    const location = LOCATIONS[locationId];
    if (!location) return;

    setState(prev => ({
      ...prev,
      currentLocation: locationId,
    }));

    addLog(`Ты прибыл в: ${location.name}`, 'story');

    // Шанс встречи с врагом
    if (location.enemies.length > 0) {
      setTimeout(() => {
        const encounterChance = 0.6;
        if (Math.random() < encounterChance) {
          startBattle(locationId);
        }
      }, 500);
    }
  }, [addLog]);

  // ─── БОЙ ───
  const startBattle = useCallback((locationId?: LocationId) => {
    const locId = locationId || state.currentLocation;
    const location = LOCATIONS[locId];
    if (!location || location.enemies.length === 0) return;

    // Выбираем врага по редкости
    const enemyId = pickRandom(location.enemies);
    const template = ENEMIES[enemyId];
    if (!template) return;

    const enemyInstance: EnemyInstance = {
      template,
      currentHp: template.baseHp,
      maxHp: template.baseHp,
      buffs: [],
      debuffs: [],
    };

    setState(prev => ({
      ...prev,
      battle: {
        active: true,
        enemy: enemyInstance,
        log: [],
        turn: 1,
        playerTurn: true,
      },
    }));

    addLog(`⚔️ Встречен враг: ${template.name}!`, 'combat');
    addBattleLog(`Появляется ${template.name} (Ур. ${template.level})`, 'system');

    // Добавляем в бистеарий
    setState(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        bestiary: {
          ...prev.hero.bestiary,
          [enemyId]: {
            enemyId,
            kills: prev.hero.bestiary[enemyId]?.kills || 0,
            discovered: true,
          },
        },
      },
    }));
  }, [state.currentLocation, addLog, addBattleLog]);

  // ─── АТАКА ───
  const playerAttack = useCallback(() => {
    if (!state.battle.active || !state.battle.enemy || !state.battle.playerTurn) return;

    const stats = getEffectiveStats(state.hero);
    const enemy = state.battle.enemy;
    const baseDmg = stats.damage + stats.str;
    const damage = Math.max(1, baseDmg - Math.floor(enemy.template.armor / 2) + rand(-1, 2));

    // Крит
    const critChance = stats.lck * 2;
    const isCrit = rand(1, 100) <= critChance;
    const finalDmg = isCrit ? damage * 2 : damage;

    const newEnemyHp = Math.max(0, enemy.currentHp - finalDmg);

    addBattleLog(
      `Ты атакуешь! ${isCrit ? '💥 КРИТ! ' : ''}Урон: ${finalDmg}`,
      'damage'
    );

    setState(prev => ({
      ...prev,
      battle: {
        ...prev.battle,
        enemy: prev.battle.enemy ? { ...prev.battle.enemy, currentHp: newEnemyHp } : null,
        playerTurn: false,
      },
    }));

    if (newEnemyHp <= 0) {
      setTimeout(() => endBattle(true), 600);
    } else {
      setTimeout(() => enemyTurn(), 800);
    }
  }, [state.battle, state.hero, addBattleLog]);

  // ─── СПОСОБНОСТЬ ───
  const useAbility = useCallback((abilityId: string) => {
    if (!state.battle.active || !state.battle.enemy || !state.battle.playerTurn) return;

    const ability = ABILITIES[abilityId];
    if (!ability) return;
    if (state.hero.currentMp < ability.mpCost) {
      addBattleLog('Недостаточно маны!', 'info');
      return;
    }
    if (cooldownsRef.current[abilityId] > 0) {
      addBattleLog('Способность на перезарядке!', 'info');
      return;
    }

    const stats = getEffectiveStats(state.hero);
    const enemy = state.battle.enemy;

    setState(prev => ({
      ...prev,
      hero: { ...prev.hero, currentMp: prev.hero.currentMp - ability.mpCost },
    }));

    if (ability.cooldown > 0) {
      cooldownsRef.current[abilityId] = ability.cooldown;
    }

    if (ability.tags.effect === 'damage') {
      const magDmg = ability.basePower + Math.floor(stats.int * 1.5);
      let finalDmg = magDmg;

      // Проверка слабостей/сопротивлений
      if (enemy.template.weaknesses.includes(ability.tags.element)) {
        finalDmg = Math.floor(finalDmg * 1.5);
        addBattleLog('Слабость! x1.5 урон!', 'info');
      }
      if (enemy.template.resistances.includes(ability.tags.element)) {
        finalDmg = Math.floor(finalDmg * 0.5);
        addBattleLog('Сопротивление! x0.5 урон...', 'info');
      }

      // Кража жизни
      let healAmount = 0;
      if (abilityId === 'life_drain') {
        healAmount = Math.floor(finalDmg * 0.5);
      }

      const newEnemyHp = Math.max(0, enemy.currentHp - finalDmg);

      addBattleLog(`${ability.name}! Урон: ${finalDmg}`, 'damage');

      setState(prev => ({
        ...prev,
        battle: {
          ...prev.battle,
          enemy: prev.battle.enemy ? { ...prev.battle.enemy, currentHp: newEnemyHp } : null,
          playerTurn: false,
        },
        hero: {
          ...prev.hero,
          currentHp: healAmount > 0 ? Math.min(getEffectiveStats(prev.hero).maxHp, prev.hero.currentHp + healAmount) : prev.hero.currentHp,
        },
      }));

      if (healAmount > 0) {
        addBattleLog(`Ты восстановил ${healAmount} HP!`, 'heal');
      }

      if (newEnemyHp <= 0) {
        setTimeout(() => endBattle(true), 600);
      } else {
        setTimeout(() => enemyTurn(), 800);
      }
    } else if (ability.tags.effect === 'heal') {
      const healAmount = ability.basePower + Math.floor(stats.int * 0.5);
      const maxHp = getEffectiveStats(state.hero).maxHp;
      const newHp = Math.min(maxHp, state.hero.currentHp + healAmount);

      addBattleLog(`${ability.name}! +${healAmount} HP`, 'heal');

      setState(prev => ({
        ...prev,
        hero: { ...prev.hero, currentHp: newHp },
        battle: { ...prev.battle, playerTurn: false },
      }));

      setTimeout(() => enemyTurn(), 800);
    } else if (ability.tags.effect === 'shield') {
      addBattleLog(`${ability.name}! Щит: ${ability.basePower}`, 'info');

      setState(prev => ({
        ...prev,
        battle: {
          ...prev.battle,
          enemy: prev.battle.enemy ? {
            ...prev.battle.enemy,
            buffs: [...prev.battle.enemy.buffs],
          } : null,
          playerTurn: false,
        },
      }));

      setTimeout(() => enemyTurn(), 800);
    } else if (ability.tags.effect === 'debuff') {
      addBattleLog(`${ability.name}! Враг ослаблен!`, 'info');

      setState(prev => ({
        ...prev,
        battle: {
          ...prev.battle,
          enemy: prev.battle.enemy ? {
            ...prev.battle.enemy,
            debuffs: [...prev.battle.enemy.debuffs, { type: 'debuff' as EffectType, value: 3, duration: 3, source: abilityId }],
          } : null,
          playerTurn: false,
        },
      }));

      setTimeout(() => enemyTurn(), 800);
    } else if (ability.tags.effect === 'buff') {
      addBattleLog(`${ability.name}! Ты ускорен!`, 'info');
      setState(prev => ({
        ...prev,
        battle: { ...prev.battle, playerTurn: false },
      }));
      setTimeout(() => enemyTurn(), 800);
    }

    setAbilityMenu(false);
  }, [state.battle, state.hero, addBattleLog]);

  // ─── ХОД ВРАГА ───
  const enemyTurn = useCallback(() => {
    setState(prev => {
      if (!prev.battle.enemy || prev.battle.enemy.currentHp <= 0) return prev;

      const enemy = prev.battle.enemy;
      const stats = getEffectiveStats(prev.hero);

      // Уменьшаем кулдауны
      Object.keys(cooldownsRef.current).forEach(key => {
        if (cooldownsRef.current[key] > 0) cooldownsRef.current[key]--;
      });

      // Враг атакует
      let enemyDmg = enemy.template.baseDamage + rand(-1, 2);

      // Дебаффы снижают урон врага
      if (enemy.debuffs.length > 0) {
        enemyDmg = Math.max(1, enemyDmg - 2);
      }

      // Уклонение
      const dodgeChance = stats.agi * 2;
      if (rand(1, 100) <= dodgeChance) {
        return {
          ...prev,
          battle: {
            ...prev.battle,
            log: [...prev.battle.log, { text: `${enemy.template.name} атакует, но ты уклоняешься!`, type: 'info' as const, turn: prev.battle.turn }],
            playerTurn: true,
            turn: prev.battle.turn + 1,
          },
        };
      }

      const finalDmg = Math.max(1, enemyDmg - Math.floor(stats.armor / 2));
      const newHp = Math.max(0, prev.hero.currentHp - finalDmg);

      const newLog: BattleLogEntry = {
        text: `${enemy.template.name} атакует! Урон: ${finalDmg}`,
        type: 'damage',
        turn: prev.battle.turn,
      };

      if (newHp <= 0) {
        return {
          ...prev,
          hero: { ...prev.hero, currentHp: 0 },
          battle: {
            ...prev.battle,
            log: [...prev.battle.log, newLog],
            active: false,
            enemy: null,
            turn: prev.battle.turn + 1,
          },
          eventLog: [...prev.eventLog, { text: '💀 Ты пал в бою...', type: 'combat' as const, time: prev.gameTime }],
        };
      }

      return {
        ...prev,
        hero: { ...prev.hero, currentHp: newHp },
        battle: {
          ...prev.battle,
          log: [...prev.battle.log, newLog],
          playerTurn: true,
          turn: prev.battle.turn + 1,
        },
      };
    });
  }, []);

  // ─── КОНЕЦ БОЯ ───
  const endBattle = useCallback((victory: boolean) => {
    if (!state.battle.enemy) return;
    const enemy = state.battle.enemy;

    if (victory) {
      const loot = enemy.template.loot;
      const goldGained = rand(loot.gold.min, loot.gold.max);
      const xpGained = loot.xp;

      addBattleLog(`🎉 Победа! +${xpGained} XP, +${goldGained} золота`, 'loot');

      // Обновляем бистеарий
      setState(prev => {
        const newInventory = [...prev.hero.inventory];

        // Дроп предметов
        loot.items.forEach(drop => {
          if (Math.random() < drop.chance) {
            const item = ITEMS[drop.itemId];
            if (item) {
              const existingIdx = newInventory.findIndex(i => i.item.id === item.id);
              if (existingIdx >= 0 && item.stackable) {
                newInventory[existingIdx] = {
                  ...newInventory[existingIdx],
                  count: Math.min(newInventory[existingIdx].count + 1, item.maxStack || 99),
                };
              } else {
                newInventory.push({ item, count: 1 });
              }
              addLog(`Получен предмет: ${item.name}`, 'loot');
            }
          }
        });

        let newXp = prev.hero.xp + xpGained;
        let newLevel = prev.hero.level;
        let newXpToNext = prev.hero.xpToNext;
        let newBaseStats = { ...prev.hero.baseStats };

        // Левелап
        while (newXp >= newXpToNext) {
          newXp -= newXpToNext;
          newLevel++;
          newXpToNext = Math.floor(newXpToNext * 1.5);
          newBaseStats = {
            ...newBaseStats,
            str: newBaseStats.str + 1,
            agi: newBaseStats.agi + 1,
            int: newBaseStats.int + 1,
            vit: newBaseStats.vit + 1,
            maxHp: newBaseStats.maxHp + 5,
            maxMp: newBaseStats.maxMp + 3,
          };
          addLog(`⬆️ Уровень ${newLevel}! Статы повышены!`, 'system');
        }

        const effectiveStats = { ...newBaseStats };
        // Пересчёт с экипировкой
        Object.values(prev.hero.equipped).forEach(item => {
          if (item?.stats) {
            Object.entries(item.stats).forEach(([key, val]) => {
              if (val && key in effectiveStats) {
                (effectiveStats as any)[key] += val;
              }
            });
          }
        });

        return {
          ...prev,
          hero: {
            ...prev.hero,
            level: newLevel,
            xp: newXp,
            xpToNext: newXpToNext,
            gold: prev.hero.gold + goldGained,
            baseStats: newBaseStats,
            currentHp: Math.min(effectiveStats.maxHp, prev.hero.currentHp),
            currentMp: Math.min(effectiveStats.maxMp, prev.hero.currentMp),
            inventory: newInventory,
            bestiary: {
              ...prev.hero.bestiary,
              [enemy.template.id]: {
                ...prev.hero.bestiary[enemy.template.id],
                kills: (prev.hero.bestiary[enemy.template.id]?.kills || 0) + 1,
              },
            },
          },
          battle: { active: false, enemy: null, log: [], turn: 0, playerTurn: true },
        };
      });

      addLog(`Победа над ${enemy.template.name}! +${goldGained} золота, +${xpGained} опыта`, 'loot');
    }

    setAbilityMenu(false);
    setItemMenu(false);
    cooldownsRef.current = {};
  }, [state.battle.enemy, addBattleLog, addLog]);

  // ─── ПОБЕГ ───
  const flee = useCallback(() => {
    if (!state.battle.active || !state.battle.enemy) return;

    const stats = getEffectiveStats(state.hero);
    const fleeChance = 30 + stats.agi * 3 - state.battle.enemy.template.speed * 2;

    if (rand(1, 100) <= fleeChance) {
      addBattleLog('Ты сбежал!', 'info');
      addLog('Удалось сбежать из боя.', 'system');
      setState(prev => ({
        ...prev,
        battle: { active: false, enemy: null, log: [], turn: 0, playerTurn: true },
      }));
    } else {
      addBattleLog('Побег не удался!', 'info');
      setState(prev => ({
        ...prev,
        battle: { ...prev.battle, playerTurn: false },
      }));
      setTimeout(() => enemyTurn(), 800);
    }
  }, [state.battle, addBattleLog, addLog, enemyTurn]);

  // ─── ИССЛЕДОВАНИЕ ───
  const explore = useCallback(() => {
    const location = LOCATIONS[state.currentLocation];
    if (!location) return;

    if (location.tags.type === 'city') {
      addLog(`Ты осматриваешь ${location.name}. Всё спокойно.`, 'story');
      // В городе — шанс найти ресурс
      if (location.resources.length > 0 && Math.random() < 0.3) {
        const resId = pickRandom(location.resources);
        const item = ITEMS[resId];
        if (item) {
          setState(prev => {
            const newInv = [...prev.hero.inventory];
            const idx = newInv.findIndex(i => i.item.id === item.id);
            if (idx >= 0 && item.stackable) {
              newInv[idx] = { ...newInv[idx], count: Math.min(newInv[idx].count + 1, item.maxStack || 99) };
            } else {
              newInv.push({ item, count: 1 });
            }
            return { ...prev, hero: { ...prev.hero, inventory: newInv } };
          });
          addLog(`Найдено: ${item.name}!`, 'loot');
        }
      }
      return;
    }

    // Опасная локация — встреча с врагом
    if (location.enemies.length > 0) {
      const encounterChance = 0.7;
      if (Math.random() < encounterChance) {
        startBattle();
      } else {
        // Нашли ресурс
        if (location.resources.length > 0 && Math.random() < 0.5) {
          const resId = pickRandom(location.resources);
          const item = ITEMS[resId];
          if (item) {
            setState(prev => {
              const newInv = [...prev.hero.inventory];
              const idx = newInv.findIndex(i => i.item.id === item.id);
              if (idx >= 0 && item.stackable) {
                newInv[idx] = { ...newInv[idx], count: Math.min(newInv[idx].count + 1, item.maxStack || 99) };
              } else {
                newInv.push({ item, count: 1 });
              }
              return { ...prev, hero: { ...prev.hero, inventory: newInv } };
            });
            addLog(`Исследуя ${location.name}, ты находишь: ${item.name}`, 'loot');
          }
        } else {
          addLog(`Ты исследуешь ${location.name}. Пока никого...`, 'story');
        }
      }
    }
  }, [state.currentLocation, addLog, startBattle]);

  // ─── ОТДЫХ (в городе) ───
  const rest = useCallback(() => {
    const location = LOCATIONS[state.currentLocation];
    if (!location || location.tags.type !== 'city') return;

    const stats = getEffectiveStats(state.hero);
    const cost = 5;

    if (state.hero.gold < cost) {
      addLog('Недостаточно золота для отдыха (нужно 5).', 'system');
      return;
    }

    setState(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        currentHp: stats.maxHp,
        currentMp: stats.maxMp,
        gold: prev.hero.gold - cost,
      },
    }));

    addLog('Ты отдохнул в таверне. HP и MP восстановлены. (-5 золота)', 'system');
  }, [state.hero, state.currentLocation, addLog]);

  // ─── СБРОС ───
  const resetGame = useCallback(() => {
    setState(createInitialState());
    setSelectedItem(null);
    setAbilityMenu(false);
    setItemMenu(false);
    cooldownsRef.current = {};
  }, []);

  return {
    state,
    selectedItem, setSelectedItem,
    abilityMenu, setAbilityMenu,
    itemMenu, setItemMenu,
    cooldownsRef,
    getEffectiveStats: () => getEffectiveStats(state.hero),
    equipItem, unequipItem, useItem,
    travel, startBattle, playerAttack,
    useAbility, flee, explore, rest,
    endBattle, addLog, resetGame,
  };
}
