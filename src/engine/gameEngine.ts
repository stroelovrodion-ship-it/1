import { useState, useCallback } from 'react';
import {
  GameState, HeroState, EventLogEntry,
  Item, SlotType, EnemyInstance,
  BattleLogEntry, LocationId, BodyPart,
  SpellSlot, Rune, ElementType
} from '../types/tags';
import { ITEMS } from '../data/items';
import { ENEMIES } from '../data/enemies';
import { LOCATIONS } from '../data/locations';
import { RUNES, SPELL_FORMS, SCROLL_EFFECTS } from '../data/runes';

function createInitialHero(): HeroState {
  return {
    name: 'Неофит',
    level: 1, xp: 0, xpToNext: 50, gold: 20,
    baseStats: {
      str: 3, agi: 4, int: 5, lck: 3,
      maxHp: 30, maxMp: 20, armor: 0,
      firePower: 1, waterPower: 1, earthPower: 1,
      airPower: 1, lightPower: 1, darkPower: 1,
    },
    currentHp: 30, currentMp: 20,
    osm: 4, osmMax: 4,
    equipped: {
      head: null, body: null, boots: null, weapon: null,
      extra: null, artifact: null, ring: null, necklace: null,
    },
    inventory: [
      { item: ITEMS.minor_hp_potion, count: 3 },
      { item: ITEMS.minor_mp_potion, count: 2 },
    ],
    spellSlots: [
      { name: 'Слот 1', runes: [], mpCost: 0, target: 'self' },
      { name: 'Слот 2', runes: [], mpCost: 0, target: 'enemy' },
    ],
    collectedRunes: ['time_instant', 'effect_fire'],
    knownScrolls: ['bolt', 'arrow'],
    bestiary: {},
  };
}

function createInitialState(): GameState {
  return {
    hero: createInitialHero(),
    currentLocation: 'ashen_harbor',
    battle: { active: false, enemy: null, log: [], turn: 0, playerTurn: true, selectedBodyPart: null },
    eventLog: [{ text: 'Ты очнулся среди пепла. Мир после Великого Раскола...', type: 'story', time: 0 }],
    gameTime: 0,
  };
}

function getEffectiveStats(hero: HeroState) {
  const stats = { ...hero.baseStats };
  Object.values(hero.equipped).forEach(item => {
    if (item?.stats) {
      Object.entries(item.stats).forEach(([key, val]) => {
        if (val && key in stats) (stats as any)[key] += val;
      });
    }
  });
  return stats;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T extends string>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getElementPower(stats: ReturnType<typeof getEffectiveStats>, element: ElementType): number {
  switch (element) {
    case 'fire': return stats.firePower;
    case 'water': return stats.waterPower;
    case 'earth': return stats.earthPower;
    case 'air': return stats.airPower;
    case 'light': return stats.lightPower;
    case 'dark': return stats.darkPower;
    default: return 0;
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [spellBuilder, setSpellBuilder] = useState<{ slotIndex: number; runes: string[]; form: string; scrollEffect: string; targetPart: BodyPart | null; element: ElementType }>({
    slotIndex: 0, runes: [], form: 'bolt', scrollEffect: '', targetPart: null, element: 'fire'
  });

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
      battle: { ...prev.battle, log: [...prev.battle.log, { text, type, turn: prev.battle.turn }] },
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
      if (oldEquipped) {
        const existingIdx = newInventory.findIndex(i => i.item.id === oldEquipped.id);
        if (existingIdx >= 0) newInventory[existingIdx] = { ...newInventory[existingIdx], count: newInventory[existingIdx].count + 1 };
        else newInventory.push({ item: oldEquipped, count: 1 });
      }
      newInventory[invIndex] = { ...invItem, count: invItem.count - 1 };
      return { ...prev, hero: { ...prev.hero, inventory: newInventory.filter(i => i.count > 0), equipped: { ...prev.hero.equipped, [slot]: invItem.item } } };
    });
    addLog('Предмет экипирован.', 'system');
  }, [addLog]);

  const unequipItem = useCallback((slot: SlotType) => {
    setState(prev => {
      const item = prev.hero.equipped[slot];
      if (!item) return prev;
      const newInventory = [...prev.hero.inventory];
      const existingIdx = newInventory.findIndex(i => i.item.id === item.id);
      if (existingIdx >= 0) newInventory[existingIdx] = { ...newInventory[existingIdx], count: newInventory[existingIdx].count + 1 };
      else newInventory.push({ item, count: 1 });
      return { ...prev, hero: { ...prev.hero, equipped: { ...prev.hero.equipped, [slot]: null }, inventory: newInventory } };
    });
    addLog('Предмет снят.', 'system');
  }, [addLog]);

  const useItem = useCallback((invIndex: number) => {
    setState(prev => {
      const invItem = prev.hero.inventory[invIndex];
      if (!invItem || !invItem.item.tags.consumable) return prev;
      const item = invItem.item;
      const stats = getEffectiveStats(prev.hero);
      let newHp = prev.hero.currentHp;
      let newMp = prev.hero.currentMp;
      if (item.tags.effect === 'heal') {
        if (item.id.includes('mp')) newMp = Math.min(stats.maxMp, newMp + (item.effectValue || 0));
        else newHp = Math.min(stats.maxHp, newHp + (item.effectValue || 0));
      }
      const newInventory = [...prev.hero.inventory];
      newInventory[invIndex] = { ...invItem, count: invItem.count - 1 };
      return { ...prev, hero: { ...prev.hero, currentHp: newHp, currentMp: newMp, inventory: newInventory.filter(i => i.count > 0) } };
    });
  }, []);

  // ─── ПЕРЕДВИЖЕНИЕ ───
  const travel = useCallback((locationId: LocationId) => {
    const location = LOCATIONS[locationId];
    if (!location) return;
    setState(prev => ({ ...prev, currentLocation: locationId }));
    addLog(`Ты прибыл в: ${location.name}`, 'story');
    if (location.enemies.length > 0 && Math.random() < 0.6) {
      setTimeout(() => startBattle(locationId), 500);
    }
  }, [addLog]);

  // ─── БОЙ ───
  const startBattle = useCallback((locationId?: LocationId) => {
    const locId = locationId || state.currentLocation;
    const location = LOCATIONS[locId];
    if (!location || location.enemies.length === 0) return;
    const enemyId = pickRandom(location.enemies);
    const template = ENEMIES[enemyId];
    if (!template) return;
    const bodyPartDamage: Record<string, number> = {};
    template.bodyParts.forEach(bp => { bodyPartDamage[bp.part] = 0; });
    const enemyInstance: EnemyInstance = {
      template, currentHp: template.baseHp, maxHp: template.baseHp,
      buffs: [], debuffs: [], bodyPartDamage: bodyPartDamage as Record<BodyPart, number>,
    };
    setState(prev => ({
      ...prev,
      battle: { active: true, enemy: enemyInstance, log: [], turn: 1, playerTurn: true, selectedBodyPart: null },
      hero: { ...prev.hero, bestiary: { ...prev.hero.bestiary, [enemyId]: { enemyId, kills: prev.hero.bestiary[enemyId]?.kills || 0, discovered: true } } },
    }));
    addLog(`⚔️ Встречен: ${template.name}!`, 'combat');
    addBattleLog(`Появляется ${template.name} (Ур. ${template.level})`, 'system');
  }, [state.currentLocation, addLog, addBattleLog]);

  // ─── АТАКА (базовая — по выбранной части тела) ───
  const playerAttack = useCallback((targetPart: BodyPart) => {
    if (!state.battle.active || !state.battle.enemy || !state.battle.playerTurn) return;
    const stats = getEffectiveStats(state.hero);
    const enemy = state.battle.enemy;
    const bpData = enemy.template.bodyParts.find(bp => bp.part === targetPart);
    let baseDmg = stats.str + rand(0, 2);
    let multiplier = 1;
    // Базовая атака не имеет стихии, но всё равно проверяем общие модификаторы
    if (bpData?.weakness) { multiplier = 1.1; addBattleLog(`💡 Эта часть уязвима! x1.1`, 'info'); }
    if (bpData?.resistance) { multiplier = 0.9; addBattleLog(`🛡 Эта часть защищена! x0.9`, 'info'); }
    const finalDmg = Math.max(1, Math.floor((baseDmg - Math.floor(enemy.template.armor / 2)) * multiplier));
    const newEnemyHp = Math.max(0, enemy.currentHp - finalDmg);
    addBattleLog(`Атака в ${targetPart}! Урон: ${finalDmg}`, 'damage');
    const newBodyPartDmg = { ...enemy.bodyPartDamage, [targetPart]: (enemy.bodyPartDamage[targetPart] || 0) + finalDmg };
    setState(prev => ({
      ...prev,
      battle: { ...prev.battle, enemy: prev.battle.enemy ? { ...prev.battle.enemy, currentHp: newEnemyHp, bodyPartDamage: newBodyPartDmg } : null, playerTurn: false },
    }));
    if (newEnemyHp <= 0) setTimeout(() => endBattle(true), 600);
    else setTimeout(() => enemyTurn(), 800);
  }, [state.battle, state.hero, addBattleLog]);

  // ─── КАСТ ЗАКЛИНАНИЯ ───
  const castSpell = useCallback((slotIndex: number, targetPart?: BodyPart) => {
    if (!state.battle.active || !state.battle.enemy || !state.battle.playerTurn) return;
    const slot = state.hero.spellSlots[slotIndex];
    if (!slot || slot.runes.length === 0) { addBattleLog('Слот пуст!', 'info'); return; }
    if (state.hero.currentMp < slot.mpCost) { addBattleLog('Недостаточно маны!', 'info'); return; }

    const stats = getEffectiveStats(state.hero);
    const enemy = state.battle.enemy;

    // Рассчитываем урон/эффект по рунам
    let totalDamage = 0;
    let totalHeal = 0;
    let element: ElementType = 'none';
    let effect: string | undefined;
    let effectChance = 0;

    slot.runes.forEach(runeId => {
      const rune = RUNES[runeId];
      if (!rune) return;
      if (rune.element) element = rune.element;
      if (rune.effect) effect = rune.effect;
      if (rune.chance) effectChance = Math.max(effectChance, rune.chance);
      if (rune.type === 'effect' || rune.type === 'unique') {
        const elemPower = getElementPower(stats, rune.element || 'none');
        totalDamage += rune.value + elemPower * 2;
        if (rune.effect === 'heal') { totalHeal = rune.value + Math.floor(stats.int * 1.5); totalDamage = 0; }
      }
    });

    setState(prev => ({ ...prev, hero: { ...prev.hero, currentMp: prev.hero.currentMp - slot.mpCost } }));

    if (slot.target === 'self') {
      if (totalHeal > 0) {
        const maxHp = getEffectiveStats(state.hero).maxHp;
        const newHp = Math.min(maxHp, state.hero.currentHp + totalHeal);
        addBattleLog(`Заклинание: +${totalHeal} HP`, 'heal');
        setState(prev => ({ ...prev, hero: { ...prev.hero, currentHp: newHp }, battle: { ...prev.battle, playerTurn: false } }));
      } else {
        addBattleLog('Заклинание на себя активировано!', 'info');
        setState(prev => ({ ...prev, battle: { ...prev.battle, playerTurn: false } }));
      }
      setTimeout(() => enemyTurn(), 800);
    } else {
      // На врага — нужна часть тела
      const part = targetPart || state.battle.selectedBodyPart;
      if (!part) { addBattleLog('Выбери часть тела!', 'info'); return; }

      const bpData = enemy.template.bodyParts.find(bp => bp.part === part);
      let multiplier = 1;
      if (element !== 'none') {
        if (bpData?.weakness === element) { multiplier = 1.5; addBattleLog(`💥 ОБНАРУЖЕНА СЛАБОСТЬ к ${element}! x1.5 урон!`, 'info'); }
        else if (bpData?.resistance === element) { multiplier = 0.5; addBattleLog(`🛡 ОБНАРУЖЕНО СОПРОТИВЛЕНИЕ к ${element}! x0.5 урон...`, 'info'); }
      }

      const finalDmg = Math.max(1, Math.floor(totalDamage * multiplier));
      const newEnemyHp = Math.max(0, enemy.currentHp - finalDmg);
      addBattleLog(`Заклинание в ${part}! ${element} урон: ${finalDmg}`, 'damage');

      // Доп.эффект
      if (effect && Math.random() * 100 < effectChance) {
        addBattleLog(`Эффект ${effect} сработал!`, 'info');
      }

      const newBodyPartDmg = { ...enemy.bodyPartDamage, [part]: (enemy.bodyPartDamage[part] || 0) + finalDmg };
      setState(prev => ({
        ...prev,
        battle: { ...prev.battle, enemy: prev.battle.enemy ? { ...prev.battle.enemy, currentHp: newEnemyHp, bodyPartDamage: newBodyPartDmg } : null, playerTurn: false },
      }));

      if (newEnemyHp <= 0) setTimeout(() => endBattle(true), 600);
      else setTimeout(() => enemyTurn(), 800);
    }
  }, [state.battle, state.hero, addBattleLog]);

  // ─── ХОД ВРАГА ───
  const enemyTurn = useCallback(() => {
    setState(prev => {
      if (!prev.battle.enemy || prev.battle.enemy.currentHp <= 0) return prev;
      const enemy = prev.battle.enemy;
      const stats = getEffectiveStats(prev.hero);
      const dodgeChance = stats.agi * 3;
      if (rand(1, 100) <= dodgeChance) {
        return { ...prev, battle: { ...prev.battle, log: [...prev.battle.log, { text: `${enemy.template.name} промахивается!`, type: 'info' as const, turn: prev.battle.turn }], playerTurn: true, turn: prev.battle.turn + 1 } };
      }
      const finalDmg = Math.max(1, enemy.template.baseDamage + rand(-1, 2) - Math.floor(stats.armor / 2));
      const newHp = Math.max(0, prev.hero.currentHp - finalDmg);
      const newLog: BattleLogEntry = { text: `${enemy.template.name} атакует! Урон: ${finalDmg}`, type: 'damage', turn: prev.battle.turn };
      if (newHp <= 0) {
        return { ...prev, hero: { ...prev.hero, currentHp: 0 }, battle: { ...prev.battle, log: [...prev.battle.log, newLog], active: false, enemy: null, turn: prev.battle.turn + 1 }, eventLog: [...prev.eventLog, { text: '💀 Ты пал в бою...', type: 'combat' as const, time: prev.gameTime }] };
      }
      return { ...prev, hero: { ...prev.hero, currentHp: newHp }, battle: { ...prev.battle, log: [...prev.battle.log, newLog], playerTurn: true, turn: prev.battle.turn + 1 } };
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

      setState(prev => {
        const newInventory = [...prev.hero.inventory];
        loot.items.forEach(drop => {
          if (Math.random() < drop.chance) {
            const item = ITEMS[drop.itemId];
            if (item) {
              const idx = newInventory.findIndex(i => i.item.id === item.id);
              if (idx >= 0 && item.stackable) newInventory[idx] = { ...newInventory[idx], count: Math.min(newInventory[idx].count + 1, item.maxStack || 99) };
              else newInventory.push({ item, count: 1 });
              addLog(`Получен: ${item.name}`, 'loot');
            }
          }
        });

        // Шанс найти руну
        const location = LOCATIONS[prev.currentLocation];
        if (location?.runeDrops && location.runeDrops.length > 0 && Math.random() < 0.2) {
          const runeId = pickRandom(location.runeDrops);
          if (!prev.hero.collectedRunes.includes(runeId)) {
            const rune = RUNES[runeId];
            if (rune) {
              addLog(`🔮 Найдена руна: ${rune.name}!`, 'loot');
              return {
                ...prev,
                hero: {
                  ...prev.hero,
                  level: prev.hero.level,
                  xp: prev.hero.xp + xpGained,
                  gold: prev.hero.gold + goldGained,
                  inventory: newInventory,
                  collectedRunes: [...prev.hero.collectedRunes, runeId],
                  bestiary: { ...prev.hero.bestiary, [enemy.template.id]: { ...prev.hero.bestiary[enemy.template.id], kills: (prev.hero.bestiary[enemy.template.id]?.kills || 0) + 1 } },
                },
                battle: { active: false, enemy: null, log: [], turn: 0, playerTurn: true, selectedBodyPart: null },
              };
            }
          }
        }

        // Левелап
        let newXp = prev.hero.xp + xpGained;
        let newLevel = prev.hero.level;
        let newXpToNext = prev.hero.xpToNext;
        let newBaseStats = { ...prev.hero.baseStats };
        while (newXp >= newXpToNext) {
          newXp -= newXpToNext;
          newLevel++;
          newXpToNext = Math.floor(newXpToNext * 1.5);
          newBaseStats = {
            ...newBaseStats,
            str: newBaseStats.str + 1, agi: newBaseStats.agi + 1, int: newBaseStats.int + 1,
            maxHp: newBaseStats.maxHp + 5, maxMp: newBaseStats.maxMp + 3,
            firePower: newBaseStats.firePower + (Math.random() < 0.3 ? 1 : 0),
            waterPower: newBaseStats.waterPower + (Math.random() < 0.3 ? 1 : 0),
            earthPower: newBaseStats.earthPower + (Math.random() < 0.3 ? 1 : 0),
            airPower: newBaseStats.airPower + (Math.random() < 0.3 ? 1 : 0),
            lightPower: newBaseStats.lightPower + (Math.random() < 0.3 ? 1 : 0),
            darkPower: newBaseStats.darkPower + (Math.random() < 0.3 ? 1 : 0),
          };
          addLog(`⬆️ Уровень ${newLevel}!`, 'system');
        }
        const newOsmMax = 4 + (newLevel - 1) * 2;

        return {
          ...prev,
          hero: {
            ...prev.hero, level: newLevel, xp: newXp, xpToNext: newXpToNext,
            gold: prev.hero.gold + goldGained, baseStats: newBaseStats,
            osmMax: newOsmMax, inventory: newInventory,
            bestiary: { ...prev.hero.bestiary, [enemy.template.id]: { ...prev.hero.bestiary[enemy.template.id], kills: (prev.hero.bestiary[enemy.template.id]?.kills || 0) + 1 } },
          },
          battle: { active: false, enemy: null, log: [], turn: 0, playerTurn: true, selectedBodyPart: null },
        };
      });
      addLog(`Победа над ${enemy.template.name}!`, 'loot');
    }
  }, [state.battle.enemy, addBattleLog, addLog]);

  const flee = useCallback(() => {
    if (!state.battle.active || !state.battle.enemy) return;
    const stats = getEffectiveStats(state.hero);
    if (rand(1, 100) <= 30 + stats.agi * 3) {
      addBattleLog('Ты сбежал!', 'info');
      addLog('Удалось сбежать.', 'system');
      setState(prev => ({ ...prev, battle: { active: false, enemy: null, log: [], turn: 0, playerTurn: true, selectedBodyPart: null } }));
    } else {
      addBattleLog('Побег не удался!', 'info');
      setState(prev => ({ ...prev, battle: { ...prev.battle, playerTurn: false } }));
      setTimeout(() => enemyTurn(), 800);
    }
  }, [state.battle, addBattleLog, addLog, enemyTurn]);

  const explore = useCallback(() => {
    const location = LOCATIONS[state.currentLocation];
    if (!location) return;
    if (location.tags.type === 'city') {
      addLog(`Ты осматриваешь ${location.name}. Всё спокойно.`, 'story');
      if (location.resources.length > 0 && Math.random() < 0.3) {
        const resId = pickRandom(location.resources);
        const item = ITEMS[resId];
        if (item) {
          setState(prev => {
            const newInv = [...prev.hero.inventory];
            const idx = newInv.findIndex(i => i.item.id === item.id);
            if (idx >= 0 && item.stackable) newInv[idx] = { ...newInv[idx], count: Math.min(newInv[idx].count + 1, item.maxStack || 99) };
            else newInv.push({ item, count: 1 });
            return { ...prev, hero: { ...prev.hero, inventory: newInv } };
          });
          addLog(`Найдено: ${item.name}`, 'loot');
        }
      }
      return;
    }
    if (location.enemies.length > 0 && Math.random() < 0.7) {
      startBattle();
    } else {
      addLog(`Исследуя ${location.name}, пока никого...`, 'story');
      if (location.resources.length > 0 && Math.random() < 0.5) {
        const resId = pickRandom(location.resources);
        const item = ITEMS[resId];
        if (item) {
          setState(prev => {
            const newInv = [...prev.hero.inventory];
            const idx = newInv.findIndex(i => i.item.id === item.id);
            if (idx >= 0 && item.stackable) newInv[idx] = { ...newInv[idx], count: Math.min(newInv[idx].count + 1, item.maxStack || 99) };
            else newInv.push({ item, count: 1 });
            return { ...prev, hero: { ...prev.hero, inventory: newInv } };
          });
          addLog(`Найдено: ${item.name}`, 'loot');
        }
      }
    }
  }, [state.currentLocation, addLog, startBattle]);

  const rest = useCallback(() => {
    const location = LOCATIONS[state.currentLocation];
    if (!location || location.tags.type !== 'city') return;
    if (state.hero.gold < 5) { addLog('Недостаточно золота (нужно 5).', 'system'); return; }
    const stats = getEffectiveStats(state.hero);
    setState(prev => ({ ...prev, hero: { ...prev.hero, currentHp: stats.maxHp, currentMp: stats.maxMp, gold: prev.hero.gold - 5 } }));
    addLog('Отдых в таверне. HP/MP восстановлены. (-5 золота)', 'system');
  }, [state.hero, state.currentLocation, addLog]);

  // ─── КОНСТРУКТОР ЗАКЛИНАНИЙ ───
  const addRuneToSlot = useCallback((slotIndex: number, runeId: string) => {
    const rune = RUNES[runeId];
    if (!rune) return;
    setState(prev => {
      const slot = prev.hero.spellSlots[slotIndex];
      if (!slot) return prev;
      const currentOsm = slot.runes.reduce((sum, rId) => sum + (RUNES[rId]?.osmCost || 0), 0);
      if (currentOsm + rune.osmCost > prev.hero.osmMax) return prev;
      const timeRunes = slot.runes.filter(rId => RUNES[rId]?.type === 'time').length;
      if (rune.type === 'time' && timeRunes >= 2) return prev;
      const nonTimeRunes = slot.runes.filter(rId => RUNES[rId]?.type !== 'time').length;
      if (rune.type !== 'time' && nonTimeRunes >= 1) return prev;
      const newSlots = [...prev.hero.spellSlots];
      newSlots[slotIndex] = { ...slot, runes: [...slot.runes, runeId] };
      // Пересчёт маны
      const totalOsm = newSlots[slotIndex].runes.reduce((sum, rId) => sum + (RUNES[rId]?.osmCost || 0), 0);
      newSlots[slotIndex] = { ...newSlots[slotIndex], mpCost: totalOsm * 2 + 2 };
      return { ...prev, hero: { ...prev.hero, spellSlots: newSlots } };
    });
  }, []);

  const removeRuneFromSlot = useCallback((slotIndex: number, runeIndex: number) => {
    setState(prev => {
      const newSlots = [...prev.hero.spellSlots];
      const slot = newSlots[slotIndex];
      if (!slot) return prev;
      const newRunes = [...slot.runes];
      newRunes.splice(runeIndex, 1);
      const totalOsm = newRunes.reduce((sum, rId) => sum + (RUNES[rId]?.osmCost || 0), 0);
      newSlots[slotIndex] = { ...slot, runes: newRunes, mpCost: totalOsm * 2 + 2 };
      return { ...prev, hero: { ...prev.hero, spellSlots: newSlots } };
    });
  }, []);

  const setSpellTarget = useCallback((slotIndex: number, target: 'self' | 'enemy') => {
    setState(prev => {
      const newSlots = [...prev.hero.spellSlots];
      newSlots[slotIndex] = { ...newSlots[slotIndex], target };
      return { ...prev, hero: { ...prev.hero, spellSlots: newSlots } };
    });
  }, []);

  const selectBodyPart = useCallback((part: BodyPart) => {
    setState(prev => ({ ...prev, battle: { ...prev.battle, selectedBodyPart: part } }));
  }, []);

  const resetGame = useCallback(() => {
    setState(createInitialState());
    setSelectedItem(null);
  }, []);

  return {
    state, selectedItem, setSelectedItem, spellBuilder, setSpellBuilder,
    getEffectiveStats: () => getEffectiveStats(state.hero),
    equipItem, unequipItem, useItem,
    travel, startBattle, playerAttack, castSpell, flee,
    explore, rest, endBattle, addLog, resetGame,
    addRuneToSlot, removeRuneFromSlot, setSpellTarget, selectBodyPart,
  };
}
