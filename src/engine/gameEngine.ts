import { useState, useCallback } from 'react';
import {
  GameState, HeroState, EventLogEntry,
  SlotType, EnemyInstance,
  BattleLogEntry, LocationId, BodyPart,
  SpellSlot, ElementType, Trajectory, BestiaryEntry, StudiedBodyPart
} from '../types/tags';
import { ITEMS } from '../data/items';
import { ENEMIES } from '../data/enemies';
import { LOCATIONS } from '../data/locations';
import { RUNES, SPELL_FORMS, SCROLL_EFFECTS } from '../data/runes';
import { TRAJECTORIES } from '../data/trajectories';

function createInitialHero(): HeroState {
  return {
    name: 'Неофит', level: 1, xp: 0, xpToNext: 50, gold: 20,
    baseStats: {
      str: 3, agi: 4, int: 5, lck: 3,
      maxHp: 30, maxMp: 20, armor: 0,
      firePower: 1, waterPower: 1, earthPower: 1,
      airPower: 1, lightPower: 1, darkPower: 1,
    },
    currentHp: 30, currentMp: 20,
    osm: 4, osmMax: 4,
    equipped: { head: null, body: null, boots: null, weapon: null, extra: null, artifact: null, ring: null, necklace: null },
    inventory: [
      { item: ITEMS.minor_hp_potion, count: 3 },
      { item: ITEMS.minor_mp_potion, count: 2 },
    ],
    spellSlots: [
      { name: 'Слот 1', runes: [], target: 'self', mpCost: 0 },
      { name: 'Слот 2', target: 'enemy', mpCost: 0, runes: [], element: 'fire', trajectory: 'direct' },
    ],
    collectedRunes: ['time_instant', 'effect_fire'],
    knownScrolls: ['bolt', 'arrow', 'burn'],
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

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickRandom<T extends string>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

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

function createStudiedParts(template: any): Record<BodyPart, StudiedBodyPart> {
  const parts: any = {};
  template.bodyParts.forEach((bp: any) => {
    parts[bp.part] = { part: bp.part, discovered: false };
  });
  return parts;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<'none' | 'item' | 'bestiary' | 'spellBuilder'>('none');
  const [buildingSlot, setBuildingSlot] = useState<number | null>(null);
  const [buildState, setBuildState] = useState<{
    target: 'self' | 'enemy';
    runes: string[];
    element: ElementType;
    trajectory: Trajectory;
    form: string;
    scrollEffect: string;
  }>({ target: 'self', runes: [], element: 'fire', trajectory: 'direct', form: '', scrollEffect: '' });

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
        const idx = newInventory.findIndex(i => i.item.id === oldEquipped.id);
        if (idx >= 0) newInventory[idx] = { ...newInventory[idx], count: newInventory[idx].count + 1 };
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
      const idx = newInventory.findIndex(i => i.item.id === item.id);
      if (idx >= 0) newInventory[idx] = { ...newInventory[idx], count: newInventory[idx].count + 1 };
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
      let newHp = prev.hero.currentHp, newMp = prev.hero.currentMp;
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
    const bodyPartDamage: any = {};
    template.bodyParts.forEach((bp: any) => { bodyPartDamage[bp.part] = 0; });
    const enemyInstance: EnemyInstance = {
      template, currentHp: template.baseHp, maxHp: template.baseHp,
      buffs: [], debuffs: [], bodyPartDamage,
    };
    setState(prev => {
      const existingBestiary = prev.hero.bestiary[enemyId];
      return {
        ...prev,
        battle: { active: true, enemy: enemyInstance, log: [], turn: 1, playerTurn: true, selectedBodyPart: null },
        hero: {
          ...prev.hero,
          bestiary: {
            ...prev.hero.bestiary,
            [enemyId]: existingBestiary
              ? { ...existingBestiary, discovered: true }
              : { enemyId, kills: 0, discovered: true, studiedParts: createStudiedParts(template) },
          },
        },
      };
    });
    addLog(`⚔️ Встречен: ${template.name}!`, 'combat');
    addBattleLog(`Появляется ${template.name} (Ур. ${template.level})`, 'system');
  }, [state.currentLocation, addLog, addBattleLog]);

  // ─── ИЗУЧЕНИЕ ЧАСТИ ТЕЛА (при атаке элементом) ───
  const studyBodyPart = useCallback((enemyId: string, part: BodyPart, element: ElementType) => {
    setState(prev => {
      const entry = prev.hero.bestiary[enemyId];
      if (!entry) return prev;
      const template = ENEMIES[enemyId];
      if (!template) return prev;
      const bpData = template.bodyParts.find(bp => bp.part === part);
      if (!bpData) return prev;
      const studiedParts = { ...entry.studiedParts };
      studiedParts[part] = {
        part,
        discovered: true,
        weakness: bpData.weakness,
        resistance: bpData.resistance,
      };
      return {
        ...prev,
        hero: { ...prev.hero, bestiary: { ...prev.hero.bestiary, [enemyId]: { ...entry, studiedParts } } },
      };
    });
  }, []);

  // ─── АТАКА ───
  const playerAttack = useCallback((targetPart: BodyPart) => {
    if (!state.battle.active || !state.battle.enemy || !state.battle.playerTurn) return;
    const stats = getEffectiveStats(state.hero);
    const enemy = state.battle.enemy;
    let baseDmg = stats.str + rand(0, 2);
    const finalDmg = Math.max(1, baseDmg - Math.floor(enemy.template.armor / 2));
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
    if (!slot) return;
    if (state.hero.currentMp < slot.mpCost) { addBattleLog('Недостаточно маны!', 'info'); return; }

    const stats = getEffectiveStats(state.hero);
    const enemy = state.battle.enemy;

    setState(prev => ({ ...prev, hero: { ...prev.hero, currentMp: prev.hero.currentMp - slot.mpCost } }));

    if (slot.target === 'self') {
      // Заклинание на себя — руны
      let totalHeal = 0;
      slot.runes.forEach(runeId => {
        const rune = RUNES[runeId];
        if (!rune) return;
        if (rune.effect === 'heal') totalHeal += rune.value + Math.floor(stats.int * 1.5);
      });
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
      // Заклинание на врага — конструктор
      const part = targetPart || state.battle.selectedBodyPart;
      if (!part) { addBattleLog('Выбери часть тела!', 'info'); return; }
      if (!slot.element) { addBattleLog('Нет элемента!', 'info'); return; }

      const elemPower = getElementPower(stats, slot.element);
      let baseDmg = 5 + elemPower * 2;

      // Форма
      if (slot.form && SPELL_FORMS[slot.form]) {
        baseDmg += SPELL_FORMS[slot.form].damageBonus;
      }

      // Траектория
      if (slot.trajectory && TRAJECTORIES[slot.trajectory]) {
        baseDmg = Math.floor(baseDmg * TRAJECTORIES[slot.trajectory].damageMultiplier);
      }

      // Проверка слабости/сопротивления
      const bpData = enemy.template.bodyParts.find(bp => bp.part === part);
      let multiplier = 1;
      if (bpData?.weakness === slot.element) {
        multiplier = 1.5;
        addBattleLog(`💥 СЛАБОСТЬ к ${slot.element}! x1.5`, 'info');
        // Изучаем часть тела
        studyBodyPart(enemy.template.id, part, slot.element);
      } else if (bpData?.resistance === slot.element) {
        multiplier = 0.5;
        addBattleLog(`🛡 СОПРОТИВЛЕНИЕ к ${slot.element}! x0.5`, 'info');
        studyBodyPart(enemy.template.id, part, slot.element);
      }

      const finalDmg = Math.max(1, Math.floor(baseDmg * multiplier));
      const newEnemyHp = Math.max(0, enemy.currentHp - finalDmg);
      addBattleLog(`${slot.element} в ${part}! Урон: ${finalDmg}`, 'damage');

      // Доп. эффект от свитка
      if (slot.scrollEffect && SCROLL_EFFECTS[slot.scrollEffect]) {
        const scroll = SCROLL_EFFECTS[slot.scrollEffect];
        if (Math.random() * 100 < scroll.chance) {
          const effectDmg = Math.floor(elemPower * scroll.power);
          addBattleLog(`✨ ${scroll.name}! Доп. урон: ${effectDmg}`, 'damage');
        }
      }

      const newBodyPartDmg = { ...enemy.bodyPartDamage, [part]: (enemy.bodyPartDamage[part] || 0) + finalDmg };
      setState(prev => ({
        ...prev,
        battle: { ...prev.battle, enemy: prev.battle.enemy ? { ...prev.battle.enemy, currentHp: newEnemyHp, bodyPartDamage: newBodyPartDmg } : null, playerTurn: false },
      }));

      if (newEnemyHp <= 0) setTimeout(() => endBattle(true), 600);
      else setTimeout(() => enemyTurn(), 800);
    }
  }, [state.battle, state.hero, addBattleLog, studyBodyPart]);

  // ─── ХОД ВРАГА ───
  const enemyTurn = useCallback(() => {
    setState(prev => {
      if (!prev.battle.enemy || prev.battle.enemy.currentHp <= 0) return prev;
      const enemy = prev.battle.enemy;
      const stats = getEffectiveStats(prev.hero);
      if (rand(1, 100) <= stats.agi * 3) {
        return { ...prev, battle: { ...prev.battle, log: [...prev.battle.log, { text: `${enemy.template.name} промахивается!`, type: 'info' as const, turn: prev.battle.turn }], playerTurn: true, turn: prev.battle.turn + 1 } };
      }
      const finalDmg = Math.max(1, enemy.template.baseDamage + rand(-1, 2) - Math.floor(stats.armor / 2));
      const newHp = Math.max(0, prev.hero.currentHp - finalDmg);
      const newLog: BattleLogEntry = { text: `${enemy.template.name} атакует! Урон: ${finalDmg}`, type: 'damage', turn: prev.battle.turn };
      if (newHp <= 0) {
        return { ...prev, hero: { ...prev.hero, currentHp: 0 }, battle: { ...prev.battle, log: [...prev.battle.log, newLog], active: false, enemy: null, turn: prev.battle.turn + 1 }, eventLog: [...prev.eventLog, { text: '💀 Ты пал...', type: 'combat' as const, time: prev.gameTime }] };
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
        const loc = LOCATIONS[prev.currentLocation];
        if (loc?.runeDrops && loc.runeDrops.length > 0 && Math.random() < 0.2) {
          const runeId = pickRandom(loc.runeDrops);
          if (!prev.hero.collectedRunes.includes(runeId)) {
            const rune = RUNES[runeId];
            if (rune) addLog(`🔮 Найдена руна: ${rune.name}!`, 'loot');
            let newXp = prev.hero.xp + xpGained;
            let newLevel = prev.hero.level;
            let newXpToNext = prev.hero.xpToNext;
            let newBaseStats = { ...prev.hero.baseStats };
            while (newXp >= newXpToNext) {
              newXp -= newXpToNext; newLevel++; newXpToNext = Math.floor(newXpToNext * 1.5);
              newBaseStats = { ...newBaseStats, str: newBaseStats.str + 1, agi: newBaseStats.agi + 1, int: newBaseStats.int + 1, maxHp: newBaseStats.maxHp + 5, maxMp: newBaseStats.maxMp + 3,
                firePower: newBaseStats.firePower + (Math.random() < 0.3 ? 1 : 0), waterPower: newBaseStats.waterPower + (Math.random() < 0.3 ? 1 : 0),
                earthPower: newBaseStats.earthPower + (Math.random() < 0.3 ? 1 : 0), airPower: newBaseStats.airPower + (Math.random() < 0.3 ? 1 : 0),
                lightPower: newBaseStats.lightPower + (Math.random() < 0.3 ? 1 : 0), darkPower: newBaseStats.darkPower + (Math.random() < 0.3 ? 1 : 0) };
              addLog(`⬆️ Уровень ${newLevel}!`, 'system');
            }
            return { ...prev, hero: { ...prev.hero, level: newLevel, xp: newXp, xpToNext: newXpToNext, gold: prev.hero.gold + goldGained, baseStats: newBaseStats, osmMax: 4 + (newLevel - 1) * 2, inventory: newInventory, collectedRunes: [...prev.hero.collectedRunes, runeId],
              bestiary: { ...prev.hero.bestiary, [enemy.template.id]: { ...prev.hero.bestiary[enemy.template.id], kills: (prev.hero.bestiary[enemy.template.id]?.kills || 0) + 1 } } },
              battle: { active: false, enemy: null, log: [], turn: 0, playerTurn: true, selectedBodyPart: null } };
          }
        }

        let newXp = prev.hero.xp + xpGained;
        let newLevel = prev.hero.level;
        let newXpToNext = prev.hero.xpToNext;
        let newBaseStats = { ...prev.hero.baseStats };
        while (newXp >= newXpToNext) {
          newXp -= newXpToNext; newLevel++; newXpToNext = Math.floor(newXpToNext * 1.5);
          newBaseStats = { ...newBaseStats, str: newBaseStats.str + 1, agi: newBaseStats.agi + 1, int: newBaseStats.int + 1, maxHp: newBaseStats.maxHp + 5, maxMp: newBaseStats.maxMp + 3,
            firePower: newBaseStats.firePower + (Math.random() < 0.3 ? 1 : 0), waterPower: newBaseStats.waterPower + (Math.random() < 0.3 ? 1 : 0),
            earthPower: newBaseStats.earthPower + (Math.random() < 0.3 ? 1 : 0), airPower: newBaseStats.airPower + (Math.random() < 0.3 ? 1 : 0),
            lightPower: newBaseStats.lightPower + (Math.random() < 0.3 ? 1 : 0), darkPower: newBaseStats.darkPower + (Math.random() < 0.3 ? 1 : 0) };
          addLog(`⬆️ Уровень ${newLevel}!`, 'system');
        }
        return { ...prev, hero: { ...prev.hero, level: newLevel, xp: newXp, xpToNext: newXpToNext, gold: prev.hero.gold + goldGained, baseStats: newBaseStats, osmMax: 4 + (newLevel - 1) * 2, inventory: newInventory,
          bestiary: { ...prev.hero.bestiary, [enemy.template.id]: { ...prev.hero.bestiary[enemy.template.id], kills: (prev.hero.bestiary[enemy.template.id]?.kills || 0) + 1 } } },
          battle: { active: false, enemy: null, log: [], turn: 0, playerTurn: true, selectedBodyPart: null } };
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
      addLog(`Осматриваешь ${location.name}.`, 'story');
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
    if (location.enemies.length > 0 && Math.random() < 0.7) { startBattle(); }
    else {
      addLog(`Исследуя ${location.name}, пока никого...`, 'story');
    }
  }, [state.currentLocation, addLog, startBattle]);

  const rest = useCallback(() => {
    const location = LOCATIONS[state.currentLocation];
    if (!location || location.tags.type !== 'city') return;
    if (state.hero.gold < 5) { addLog('Недостаточно золота (нужно 5).', 'system'); return; }
    const stats = getEffectiveStats(state.hero);
    setState(prev => ({ ...prev, hero: { ...prev.hero, currentHp: stats.maxHp, currentMp: stats.maxMp, gold: prev.hero.gold - 5 } }));
    addLog('Отдых. HP/MP восстановлены. (-5 золота)', 'system');
  }, [state.hero, state.currentLocation, addLog]);

  // ─── КОНСТРУКТОР: запуск сборки ───
  const startBuild = useCallback((slotIndex: number) => {
    const slot = state.hero.spellSlots[slotIndex];
    setBuildingSlot(slotIndex);
    setBuildState({
      target: slot.target,
      runes: [...slot.runes],
      element: slot.element || 'fire',
      trajectory: slot.trajectory || 'direct',
      form: slot.form || '',
      scrollEffect: slot.scrollEffect || '',
    });
    setInteractionMode('spellBuilder');
  }, [state.hero.spellSlots]);

  // ─── КОНСТРУКТОР: сохранить ───
  const saveBuild = useCallback(() => {
    if (buildingSlot === null) return;
    setState(prev => {
      const newSlots = [...prev.hero.spellSlots];
      let mpCost = 0;
      if (buildState.target === 'self') {
        const totalOsm = buildState.runes.reduce((sum, rId) => sum + (RUNES[rId]?.osmCost || 0), 0);
        mpCost = totalOsm * 2 + 2;
      } else {
        mpCost = 3;
        if (buildState.trajectory && TRAJECTORIES[buildState.trajectory]) mpCost += TRAJECTORIES[buildState.trajectory].mpCost;
        if (buildState.form && SPELL_FORMS[buildState.form]) mpCost += SPELL_FORMS[buildState.form].mpCost - 3;
      }
      newSlots[buildingSlot] = {
        name: `Слот ${buildingSlot + 1}`,
        target: buildState.target,
        runes: buildState.target === 'self' ? buildState.runes : [],
        element: buildState.target === 'enemy' ? buildState.element : undefined,
        trajectory: buildState.target === 'enemy' ? buildState.trajectory : undefined,
        form: buildState.target === 'enemy' ? buildState.form : undefined,
        scrollEffect: buildState.target === 'enemy' ? buildState.scrollEffect : undefined,
        mpCost,
      };
      return { ...prev, hero: { ...prev.hero, spellSlots: newSlots } };
    });
    addLog('Заклинание сохранено!', 'system');
    setBuildingSlot(null);
    setInteractionMode('none');
  }, [buildingSlot, buildState, addLog]);

  // ─── КОНСТРУКТОР: добавить руну ───
  const addRuneToBuild = useCallback((runeId: string) => {
    const rune = RUNES[runeId];
    if (!rune) return;
    const currentOsm = buildState.runes.reduce((sum, rId) => sum + (RUNES[rId]?.osmCost || 0), 0);
    if (currentOsm + rune.osmCost > state.hero.osmMax) { addLog('Недостаточно ОЧСМ!', 'system'); return; }
    const timeRunes = buildState.runes.filter(rId => RUNES[rId]?.type === 'time').length;
    if (rune.type === 'time' && timeRunes >= 2) { addLog('Макс 2 руны времени!', 'system'); return; }
    const nonTimeRunes = buildState.runes.filter(rId => RUNES[rId]?.type !== 'time').length;
    if (rune.type !== 'time' && nonTimeRunes >= 1) { addLog('Макс 1 руна эффекта/уникальная!', 'system'); return; }
    setBuildState(prev => ({ ...prev, runes: [...prev.runes, runeId] }));
  }, [buildState.runes, state.hero.osmMax, addLog]);

  const removeRuneFromBuild = useCallback((idx: number) => {
    setBuildState(prev => ({ ...prev, runes: prev.runes.filter((_, i) => i !== idx) }));
  }, []);

  const cancelBuild = useCallback(() => {
    setBuildingSlot(null);
    setInteractionMode('none');
  }, []);

  const selectBodyPart = useCallback((part: BodyPart) => {
    setState(prev => ({ ...prev, battle: { ...prev.battle, selectedBodyPart: part } }));
  }, []);

  const openBestiaryEntry = useCallback((enemyId: string) => {
    setSelectedItem(`bestiary-${enemyId}`);
    setInteractionMode('bestiary');
  }, []);

  const openItemInteraction = useCallback((idx: number) => {
    setSelectedItem(String(idx));
    setInteractionMode('item');
  }, []);

  const resetGame = useCallback(() => {
    setState(createInitialState());
    setSelectedItem(null);
    setInteractionMode('none');
    setBuildingSlot(null);
  }, []);

  return {
    state, selectedItem, setSelectedItem,
    interactionMode, setInteractionMode,
    buildingSlot, buildState, setBuildState,
    getEffectiveStats: () => getEffectiveStats(state.hero),
    equipItem, unequipItem, useItem,
    travel, startBattle, playerAttack, castSpell, flee,
    explore, rest, endBattle, addLog, resetGame,
    startBuild, saveBuild, addRuneToBuild, removeRuneFromBuild, cancelBuild,
    selectBodyPart, openBestiaryEntry, openItemInteraction,
  };
}
