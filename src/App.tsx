import { useState, useEffect, useRef } from 'react';
import { useGameState } from './engine/gameEngine';
import { LOCATIONS } from './data/locations';
import { RUNES, SPELL_FORMS, SCROLL_EFFECTS } from './data/runes';
import { ITEMS } from './data/items';
import { ENEMIES } from './data/enemies';
import { SlotType, RarityType, BodyPart, ElementType } from './types/tags';

function App() {
  const game = useGameState();
  const { state } = game;
  const { hero, battle, currentLocation, eventLog } = state;

  const [leftTab, setLeftTab] = useState('log-events');
  const [rightTopTab, setRightTopTab] = useState('inv');
  const [rightBottomTab, setRightBottomTab] = useState('study');
  const [showMap, setShowMap] = useState(false);
  const [activeSpellSlot, setActiveSpellSlot] = useState(0);

  const battleLogRef = useRef<HTMLDivElement>(null);
  const eventLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (battleLogRef.current) battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight; }, [battle.log]);
  useEffect(() => { if (eventLogRef.current) eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight; }, [eventLog]);

  const effectiveStats = game.getEffectiveStats();
  const location = LOCATIONS[currentLocation];
  const enemy = battle.enemy;
  const rarityClass = (r: RarityType) => `rarity-${r}`;

  const slotNames: Record<SlotType, string> = {
    head: 'Голова', body: 'Тело', boots: 'Обувь', weapon: 'Оружие',
    extra: 'Доп', artifact: 'Артефакт', ring: 'Кольцо', necklace: 'Ожерелье',
  };

  const elementEmoji: Record<ElementType, string> = {
    fire: '🔥', water: '💧', earth: '🪨', air: '💨', light: '✨', dark: '🌑', none: '—',
  };

  const bodyPartNames: Record<BodyPart, string> = {
    head: 'Голова', torso: 'Торс', arms: 'Руки', legs: 'Ноги', wings: 'Крылья', tail: 'Хвост',
  };

  return (
    <div className="game">
      {/* ═══ ЛЕВАЯ ПАНЕЛЬ ═══ */}
      <div className="left">
        <div className="block">
          <div className="tabs-wrap">
            <div className="tabs">
              <span className={`tab ${leftTab === 'log-events' ? 'active' : ''}`} onClick={() => setLeftTab('log-events')}>&gt;&gt;Лог событий</span>
              <span className={`tab ${leftTab === 'log-battle' ? 'active' : ''}`} onClick={() => setLeftTab('log-battle')}>&gt;&gt;Лог боя</span>
              <span className={`tab ${leftTab === 'travel' ? 'active' : ''}`} onClick={() => setLeftTab('travel')}>&gt;&gt;Путешествие</span>
              <span className={`tab ${leftTab === 'locations' ? 'active' : ''}`} onClick={() => setLeftTab('locations')}>&gt;&gt;Локации</span>
              <span className={`tab ${leftTab === 'interaction' ? 'active' : ''}`} onClick={() => setLeftTab('interaction')}>&gt;&gt;Взаимодействие</span>
            </div>
          </div>

          <div className="tab-content">
            {/* ЛОГ СОБЫТИЙ */}
            <div className={`pane ${leftTab === 'log-events' ? 'active' : ''}`}>
              <div className="event-log" ref={eventLogRef}>
                {eventLog.map((entry, i) => (
                  <div key={i} className="event-entry fade-in">
                    <span className="time">[{entry.time}] </span>
                    <span className={`text ${entry.type}`}>{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ЛОГ БОЯ */}
            <div className={`pane ${leftTab === 'log-battle' ? 'active' : ''}`}>
              <div className="battle-log">
                <div className="battle-history">
                  <div className="battle-history-header"><div className="battle-history-title">// ИСТОРИЯ БОЯ</div></div>
                  <div className="battle-history-list" ref={battleLogRef}>
                    {battle.log.length === 0 ? <div className="placeholder">Нет активного боя.</div> :
                      battle.log.map((entry, i) => (
                        <div key={i} className="battle-history-entry fade-in">
                          <span className={entry.type === 'damage' ? 'dmg' : entry.type === 'heal' ? 'heal' : entry.type === 'loot' ? 'gold' : 'info'}>
                            [{entry.turn}] {entry.text}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div className="battle-actions">
                  <div className="battle-actions-title">// БОЙ</div>
                  <div className="battle-vitals">
                    <div className="vital">
                      <span className="vital-label">HP</span>
                      <span className={`vital-val ${hero.currentHp < effectiveStats.maxHp * 0.3 ? 'hp-low' : ''}`}>{hero.currentHp}/{effectiveStats.maxHp}</span>
                    </div>
                    <div className="vital">
                      <span className="vital-label">MP</span>
                      <span className={`vital-val ${hero.currentMp < effectiveStats.maxMp * 0.3 ? 'mp-low' : ''}`}>{hero.currentMp}/{effectiveStats.maxMp}</span>
                    </div>
                  </div>

                  {/* Выбор части тела для атаки */}
                  {battle.active && enemy && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '8px', color: '#6cf', marginBottom: '4px' }}>Цель:</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {enemy.template.bodyParts.map(bp => (
                          <button key={bp.part} className={`btn ${battle.selectedBodyPart === bp.part ? 'success' : ''}`}
                            style={{ fontSize: '8px', padding: '3px 6px' }}
                            onClick={() => game.selectBodyPart(bp.part)}>
                            {bodyPartNames[bp.part]}
                            {bp.weakness && <span style={{ color: '#6f6' }}>⚡</span>}
                            {bp.resistance && <span style={{ color: '#f66' }}>🛡</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="battle-actions-grid">
                    <button className="btn" disabled={!battle.active || !battle.playerTurn || !battle.selectedBodyPart}
                      onClick={() => battle.selectedBodyPart && game.playerAttack(battle.selectedBodyPart)}>
                      ⚔️ Атака
                    </button>
                    <button className="btn" disabled={!battle.active || !battle.playerTurn || !battle.selectedBodyPart}
                      onClick={() => battle.selectedBodyPart && game.castSpell(1, battle.selectedBodyPart)}>
                      🔮 Слот 2
                    </button>
                    <button className="btn" disabled={!battle.active || !battle.playerTurn}
                      onClick={() => { game.useItem(0); }}>
                      🧪 Предмет
                    </button>
                    <button className="btn" disabled={!battle.active || !battle.playerTurn} onClick={game.flee}>
                      🏃 Побег
                    </button>
                  </div>

                  {/* Слот 1 — на себя */}
                  {battle.active && hero.spellSlots[0]?.runes.length > 0 && (
                    <button className="btn success" disabled={!battle.playerTurn}
                      onClick={() => game.castSpell(0)} style={{ fontSize: '8px' }}>
                      ✨ Слот 1 (на себя) [{hero.spellSlots[0].mpCost} MP]
                    </button>
                  )}

                  <div className="battle-actions-hint">
                    {battle.active ? `Ход: ${battle.turn} | ${battle.playerTurn ? 'Твой ход' : 'Ход врага...'}` : '// нет боя'}
                  </div>
                </div>
              </div>
            </div>

            {/* ПУТЕШЕСТВИЕ (бывш. Города) */}
            <div className={`pane ${leftTab === 'travel' ? 'active' : ''}`}>
              <div className="location-panel">
                <div className="location-name">{location?.name} {location?.tags.type === 'city' ? '🏰' : '⚔️'}</div>
                <div className="location-desc">{location?.description}</div>
                <button className="btn" onClick={() => setShowMap(!showMap)} style={{ marginBottom: '8px' }}>
                  🗺️ {showMap ? 'Скрыть карту' : 'Показать карту'}
                </button>
                {showMap && (
                  <div className="fade-in" style={{ border: '1px solid #333', padding: '8px', marginBottom: '8px', position: 'relative', height: '150px', background: '#050510' }}>
                    {Object.values(LOCATIONS).map(loc => (
                      <div key={loc.id}
                        style={{
                          position: 'absolute',
                          left: `${loc.mapX}%`, top: `${loc.mapY}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: '7px',
                          color: loc.id === currentLocation ? '#ff0' : loc.tags.type === 'city' ? '#6cf' : '#f66',
                          cursor: 'pointer',
                          textShadow: loc.id === currentLocation ? '0 0 6px #ff0' : 'none',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => {
                          if (location?.connectedTo.includes(loc.id as any)) game.travel(loc.id);
                        }}
                      >
                        {loc.tags.type === 'city' ? '🏰' : '⚔️'} {loc.name}
                      </div>
                    ))}
                    {/* Линии связей */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                      {Object.values(LOCATIONS).map(loc => loc.connectedTo.map(cId => {
                        const cLoc = LOCATIONS[cId];
                        if (!cLoc) return null;
                        return <line key={`${loc.id}-${cId}`} x1={`${loc.mapX}%`} y1={`${loc.mapY}%`} x2={`${cLoc.mapX}%`} y2={`${cLoc.mapY}%`} stroke="#333" strokeWidth="1" />;
                      }))}
                    </svg>
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#6cf', marginBottom: '8px' }}>Куда идти:</div>
                <div className="location-actions">
                  {location?.connectedTo.map(locId => {
                    const loc = LOCATIONS[locId];
                    return (
                      <button key={locId} className="btn" onClick={() => game.travel(locId)}>
                        → {loc?.name} [⚠️{loc?.tags.dangerLevel}]
                      </button>
                    );
                  })}
                  {location?.tags.type === 'city' && (
                    <button className="btn success" onClick={game.rest}>🏨 Отдохнуть (5 золота)</button>
                  )}
                </div>
              </div>
            </div>

            {/* ЛОКАЦИИ */}
            <div className={`pane ${leftTab === 'locations' ? 'active' : ''}`}>
              <div className="location-panel">
                <div className="location-name">{location?.name}</div>
                <div className="location-desc">{location?.description}</div>
                <div style={{ fontSize: '9px', color: '#6cf', marginBottom: '8px' }}>Опасность: {'⚠️'.repeat(location?.tags.dangerLevel || 0)}</div>
                {enemy && battle.active ? (
                  <div style={{ fontSize: '9px', color: '#f66' }}>Идёт бой!</div>
                ) : (
                  <div className="location-actions">
                    <button className="btn" onClick={game.explore}>🔍 Исследовать</button>
                    {location?.enemies.length > 0 && (
                      <button className="btn danger" onClick={() => game.startBattle()}>⚔️ Искать врага</button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ВЗАИМОДЕЙСТВИЕ */}
            <div className={`pane ${leftTab === 'interaction' ? 'active' : ''}`}>
              <div className="interaction">
                <div className="interaction-info">
                  {game.selectedItem && !game.selectedItem.startsWith('eq-') ? (() => {
                    const invItem = hero.inventory[parseInt(game.selectedItem)];
                    if (!invItem) return <div className="placeholder">Не найдено.</div>;
                    const item = invItem.item;
                    return (
                      <div className="fade-in">
                        <div className="info-name"><span className={rarityClass(item.tags.rarity)}>{item.name}</span></div>
                        <div style={{ fontSize: '9px', color: '#888', marginBottom: '8px' }}>{item.description}</div>
                        <div className="info-block">
                          <div className="info-prop">Редкость: <span className={rarityClass(item.tags.rarity)}>{item.tags.rarity}</span></div>
                          {item.tags.slot && <div className="info-prop">Слот: <span>{slotNames[item.tags.slot]}</span></div>}
                          {item.tags.element && item.tags.element !== 'none' && <div className="info-prop">Стихия: <span>{elementEmoji[item.tags.element]} {item.tags.element}</span></div>}
                        </div>
                        {item.stats && <div className="info-block"><div className="info-block-sep">// БОНУСЫ</div>
                          {Object.entries(item.stats).map(([key, val]) => val ? <div key={key} className="info-prop">{key}: <span className="val-buff">+{val}</span></div> : null)}
                        </div>}
                        <div className="info-prop">В наличии: <span>x{invItem.count}</span></div>
                      </div>
                    );
                  })() : <div className="placeholder">Выбери предмет.</div>}
                </div>
                <div className="interaction-actions">
                  {game.selectedItem && !game.selectedItem.startsWith('eq-') && (() => {
                    const invItem = hero.inventory[parseInt(game.selectedItem)];
                    if (!invItem) return null;
                    return (<>
                      {invItem.item.tags.slot && <button className="btn" onClick={() => game.equipItem(parseInt(game.selectedItem!))}>Надеть</button>}
                      {invItem.item.tags.consumable && <button className="btn success" onClick={() => game.useItem(parseInt(game.selectedItem!))}>Использовать</button>}
                    </>);
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="logs-footer">
          <button className="btn danger" onClick={game.resetGame}>Выход</button>
        </div>
      </div>

      {/* ═══ ПРАВАЯ ПАНЕЛЬ ═══ */}
      <div className="right">
        {/* ПЕРСОНАЖ */}
        <div className="right-top">
          <div className="block">
            <div className="tabs-wrap">
              <div className="tabs">
                <span className={`tab ${rightTopTab === 'inv' ? 'active' : ''}`} onClick={() => setRightTopTab('inv')}>&gt;&gt;Инвентарь</span>
                <span className={`tab ${rightTopTab === 'mana' ? 'active' : ''}`} onClick={() => setRightTopTab('mana')}>&gt;&gt;Конструктор</span>
                <span className={`tab ${rightTopTab === 'stats-hero' ? 'active' : ''}`} onClick={() => setRightTopTab('stats-hero')}>&gt;&gt;Статы</span>
                <span className={`tab ${rightTopTab === 'bestiary' ? 'active' : ''}`} onClick={() => setRightTopTab('bestiary')}>&gt;&gt;Бистеарий</span>
              </div>
            </div>

            <div className="tab-content">
              {/* ИНВЕНТАРЬ */}
              <div className={`pane ${rightTopTab === 'inv' ? 'active' : ''}`}>
                <div className="inv">
                  <div className="inv-equipped">
                    <div className="inv-title">// ЭКИПИРОВАНО</div>
                    <div className="inv-equipped-list">
                      {(Object.keys(slotNames) as SlotType[]).map(slot => {
                        const item = hero.equipped[slot];
                        return (
                          <div key={slot} className={`slot ${item ? 'filled' : 'empty'}`}
                            onClick={() => { if (item) game.setSelectedItem(game.selectedItem === `eq-${slot}` ? null : `eq-${slot}`); }}
                            onDoubleClick={() => { if (item) game.unequipItem(slot); }}>
                            {slotNames[slot]}:: {item ? <span className={rarityClass(item.tags.rarity)}>{item.name}</span> : '—'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="inv-bag">
                    <div className="inv-title">// СУМКА</div>
                    {hero.inventory.length === 0 ? <div className="placeholder">Пусто.</div> :
                      hero.inventory.map((invItem, idx) => (
                        <div key={idx} className={`item ${game.selectedItem === String(idx) ? 'selected' : ''} ${rarityClass(invItem.item.tags.rarity)}`}
                          onClick={() => game.setSelectedItem(game.selectedItem === String(idx) ? null : String(idx))}>
                          {invItem.item.name} {invItem.count > 1 ? `x${invItem.count}` : ''}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>

              {/* КОНСТРУКТОР МАГИИ */}
              <div className={`pane ${rightTopTab === 'mana' ? 'active' : ''}`}>
                <div className="mana-tech">
                  <div className="mana-tech-title">// КОНСТРУКТОР МАГИИ [ОЧСМ: {hero.osmMax}]</div>

                  {/* Выбор слота */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {hero.spellSlots.map((slot, idx) => (
                      <button key={idx} className={`btn ${activeSpellSlot === idx ? 'success' : ''}`}
                        onClick={() => setActiveSpellSlot(idx)} style={{ fontSize: '8px' }}>
                        Слот {idx + 1} [{slot.target === 'self' ? 'на себя' : 'на врага'}]
                        {slot.runes.length > 0 && ` (${slot.mpCost} MP)`}
                      </button>
                    ))}
                  </div>

                  {/* Переключатель цели */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    <button className={`btn ${hero.spellSlots[activeSpellSlot]?.target === 'self' ? '' : ''}`}
                      style={{ fontSize: '8px', opacity: hero.spellSlots[activeSpellSlot]?.target === 'self' ? 1 : 0.5 }}
                      onClick={() => game.setSpellTarget(activeSpellSlot, 'self')}>
                      На себя
                    </button>
                    <button className={`btn`}
                      style={{ fontSize: '8px', opacity: hero.spellSlots[activeSpellSlot]?.target === 'enemy' ? 1 : 0.5 }}
                      onClick={() => game.setSpellTarget(activeSpellSlot, 'enemy')}>
                      На врага
                    </button>
                  </div>

                  {/* Размещённые руны */}
                  <div style={{ border: '1px solid #333', padding: '6px', marginBottom: '8px', minHeight: '40px' }}>
                    <div style={{ fontSize: '8px', color: '#6cf', marginBottom: '4px' }}>Руны в слоте {activeSpellSlot + 1}:</div>
                    {hero.spellSlots[activeSpellSlot]?.runes.length === 0 ? <div className="placeholder">Пусто. Добавь руны ↓</div> :
                      hero.spellSlots[activeSpellSlot]?.runes.map((runeId, idx) => {
                        const rune = RUNES[runeId];
                        if (!rune) return null;
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', marginBottom: '2px' }}>
                            <span style={{ color: rune.type === 'time' ? '#6cf' : rune.type === 'effect' ? '#f66' : '#c6f' }}>
                              {rune.name} [{rune.osmCost} ОЧСМ]
                            </span>
                            <button className="btn danger" style={{ fontSize: '7px', padding: '1px 4px' }}
                              onClick={() => game.removeRuneFromSlot(activeSpellSlot, idx)}>✕</button>
                          </div>
                        );
                      })
                    }
                  </div>

                  {/* Доступные руны */}
                  <div style={{ fontSize: '8px', color: '#6cf', marginBottom: '4px' }}>Доступные руны:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '120px' }}>
                    {hero.collectedRunes.map(runeId => {
                      const rune = RUNES[runeId];
                      if (!rune) return null;
                      return (
                        <button key={runeId} className="btn" style={{ fontSize: '7px', textAlign: 'left', padding: '3px 6px' }}
                          onClick={() => game.addRuneToSlot(activeSpellSlot, runeId)}>
                          <span style={{ color: rune.type === 'time' ? '#6cf' : rune.type === 'effect' ? '#f66' : '#c6f' }}>
                            [{rune.type === 'time' ? 'В' : rune.type === 'effect' ? 'Э' : 'У'}]
                          </span> {rune.name} [{rune.osmCost}]
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* СТАТЫ */}
              <div className={`pane ${rightTopTab === 'stats-hero' ? 'active' : ''}`}>
                <div className="hero-stats">
                  <div className="hero-stats-title">// СТАТЫ ПЕРСОНАЖА</div>
                  <div className="hero-stats-name">{hero.name} [Ур. {hero.level}]</div>
                  <div style={{ fontSize: '9px', color: '#6cf', marginBottom: '4px' }}>
                    XP: {hero.xp}/{hero.xpToNext} | Золото: <span style={{ color: '#fc6' }}>{hero.gold}</span>
                  </div>
                  <div style={{ fontSize: '9px', color: '#c6f', marginBottom: '8px' }}>
                    ОЧСМ: {hero.osmMax} (руны за уровень +2)
                  </div>
                  <div className="hero-stats-list">
                    <div className="stat-row"><span className="stat-key">HP</span><span className="stat-total">{hero.currentHp}/{effectiveStats.maxHp}</span></div>
                    <div className="stat-row"><span className="stat-key">MP</span><span className="stat-total">{hero.currentMp}/{effectiveStats.maxMp}</span></div>
                    <div className="stat-row"><span className="stat-key">Сила</span><span className="stat-total">{effectiveStats.str}</span></div>
                    <div className="stat-row"><span className="stat-key">Ловкость</span><span className="stat-total">{effectiveStats.agi}</span></div>
                    <div className="stat-row"><span className="stat-key">Интеллект</span><span className="stat-total">{effectiveStats.int}</span></div>
                    <div className="stat-row"><span className="stat-key">Удача</span><span className="stat-total">{effectiveStats.lck}</span></div>
                    <div className="stat-row"><span className="stat-key">Броня</span><span className="stat-total">{effectiveStats.armor}</span></div>
                  </div>
                  <div className="info-block-sep" style={{ marginTop: '8px' }}>// СИЛА СТИХИЙ</div>
                  <div className="hero-stats-list">
                    <div className="stat-row"><span className="stat-key">🔥 Огонь</span><span className="stat-total">{effectiveStats.firePower}</span></div>
                    <div className="stat-row"><span className="stat-key">💧 Вода</span><span className="stat-total">{effectiveStats.waterPower}</span></div>
                    <div className="stat-row"><span className="stat-key">🪨 Земля</span><span className="stat-total">{effectiveStats.earthPower}</span></div>
                    <div className="stat-row"><span className="stat-key">💨 Воздух</span><span className="stat-total">{effectiveStats.airPower}</span></div>
                    <div className="stat-row"><span className="stat-key">✨ Свет</span><span className="stat-total">{effectiveStats.lightPower}</span></div>
                    <div className="stat-row"><span className="stat-key">🌑 Тьма</span><span className="stat-total">{effectiveStats.darkPower}</span></div>
                  </div>
                </div>
              </div>

              {/* БИСТЕАРИЙ */}
              <div className={`pane ${rightTopTab === 'bestiary' ? 'active' : ''}`}>
                <div className="bestiary-list">
                  {Object.keys(hero.bestiary).length === 0 ? <div className="placeholder">Ещё никто не встречен...</div> :
                    Object.values(hero.bestiary).map(entry => {
                      const template = ENEMIES[entry.enemyId];
                      if (!template) return null;
                      return (
                        <div key={entry.enemyId} className="bestiary-entry">
                          <div className="name">{template.name} [Ур. {template.level}]</div>
                          <div className="kills">Убито: {entry.kills}</div>
                          <div style={{ fontSize: '8px', color: '#6cf', marginTop: '4px' }}>Части тела:</div>
                          {template.bodyParts.map(bp => (
                            <div key={bp.part} style={{ fontSize: '8px', color: '#e0e0e0', paddingLeft: '8px' }}>
                              {bodyPartNames[bp.part]}
                              {bp.weakness && <span style={{ color: '#6f6' }}> ⚡{bp.weakness}</span>}
                              {bp.resistance && <span style={{ color: '#f66' }}> 🛡{bp.resistance}</span>}
                            </div>
                          ))}
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ВРАГ */}
        <div className="right-bottom">
          <div className="block">
            <div className="tabs-wrap">
              <div className="tabs">
                <span className={`tab ${rightBottomTab === 'study' ? 'active' : ''}`} onClick={() => setRightBottomTab('study')}>&gt;&gt;Изучение</span>
                <span className={`tab ${rightBottomTab === 'stats-enemy' ? 'active' : ''}`} onClick={() => setRightBottomTab('stats-enemy')}>&gt;&gt;Статы</span>
              </div>
            </div>
            <div className="tab-content">
              <div className={`pane ${rightBottomTab === 'study' ? 'active' : ''}`}>
                {enemy ? (
                  <div className="enemy-panel fade-in">
                    <div className="enemy-name">{enemy.template.name}</div>
                    <div className="enemy-hp-bar">
                      <div className="enemy-hp-fill" style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }} />
                      <div className="enemy-hp-text">{enemy.currentHp}/{enemy.maxHp}</div>
                    </div>
                    <div style={{ fontSize: '9px', color: '#e0e0e0', marginTop: '8px', lineHeight: '1.8' }}>{enemy.template.description}</div>
                    <div style={{ fontSize: '9px', marginTop: '8px', color: '#6cf' }}>Части тела:</div>
                    {enemy.template.bodyParts.map(bp => (
                      <div key={bp.part} style={{
                        fontSize: '9px', padding: '3px 6px', marginTop: '2px',
                        border: battle.selectedBodyPart === bp.part ? '1px solid #ff0' : '1px solid #333',
                        cursor: battle.active ? 'pointer' : 'default',
                        background: battle.selectedBodyPart === bp.part ? '#1a1a0a' : 'transparent',
                      }} onClick={() => battle.active && game.selectBodyPart(bp.part)}>
                        <span style={{ color: '#e0e0e0' }}>{bodyPartNames[bp.part]}</span>
                        {bp.weakness && <span style={{ color: '#6f6', marginLeft: '6px' }}>⚡{bp.weakness}</span>}
                        {bp.resistance && <span style={{ color: '#f66', marginLeft: '6px' }}>🛡{bp.resistance}</span>}
                        {enemy.bodyPartDamage[bp.part] > 0 && <span style={{ color: '#f66', marginLeft: '6px' }}>[{enemy.bodyPartDamage[bp.part]} dmg]</span>}
                      </div>
                    ))}
                  </div>
                ) : <div className="placeholder">Нет активного врага.</div>}
              </div>
              <div className={`pane ${rightBottomTab === 'stats-enemy' ? 'active' : ''}`}>
                {enemy ? (
                  <div className="enemy-panel fade-in">
                    <div className="enemy-name">{enemy.template.name} [Ур. {enemy.template.level}]</div>
                    <div className="enemy-stats">
                      <div className="enemy-stat"><span className="key">HP</span><span className="val">{enemy.currentHp}/{enemy.maxHp}</span></div>
                      <div className="enemy-stat"><span className="key">Урон</span><span className="val">{enemy.template.baseDamage}</span></div>
                      <div className="enemy-stat"><span className="key">Броня</span><span className="val">{enemy.template.armor}</span></div>
                      <div className="enemy-stat"><span className="key">Тип</span><span className="val">{enemy.template.tags.type}</span></div>
                    </div>
                  </div>
                ) : <div className="placeholder">Нет активного врага.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
