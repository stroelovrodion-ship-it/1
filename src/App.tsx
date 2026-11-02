import { useState, useEffect, useRef } from 'react';
import { useGameState } from './engine/gameEngine';
import { LOCATIONS } from './data/locations';
import { ABILITIES } from './data/abilities';
import { ITEMS } from './data/items';
import { ENEMIES } from './data/enemies';
import { SlotType, RarityType } from './types/tags';

function App() {
  const game = useGameState();
  const { state } = game;
  const { hero, battle, currentLocation, eventLog } = state;

  // Tab states
  const [leftTab, setLeftTab] = useState('log-events');
  const [rightTopTab, setRightTopTab] = useState('inv');
  const [rightBottomTab, setRightBottomTab] = useState('study');

  const battleLogRef = useRef<HTMLDivElement>(null);
  const eventLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battle.log]);

  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [eventLog]);

  const effectiveStats = game.getEffectiveStats();
  const location = LOCATIONS[currentLocation];
  const enemy = battle.enemy;

  const rarityClass = (r: RarityType) => `rarity-${r}`;

  const slotNames: Record<SlotType, string> = {
    head: 'Голова', body: 'Тело', boots: 'Обувь', weapon: 'Оружие',
    extra: 'Доп', artifact: 'Артефакт', ring: 'Кольцо', necklace: 'Ожерелье',
  };

  return (
    <div className="game">
      {/* ═══ ЛЕВАЯ ПАНЕЛЬ ═══ */}
      <div className="left">
        <div className="block">
          <div className="tabs-wrap">
            <div className="tabs">
              <span className={`tab ${leftTab === 'log-events' ? 'active' : ''}`} onClick={() => setLeftTab('log-events')}>
                &gt;&gt;Лог событий
              </span>
              <span className={`tab ${leftTab === 'log-battle' ? 'active' : ''}`} onClick={() => setLeftTab('log-battle')}>
                &gt;&gt;Лог боя
              </span>
              <span className={`tab ${leftTab === 'cities' ? 'active' : ''}`} onClick={() => setLeftTab('cities')}>
                &gt;&gt;Города
              </span>
              <span className={`tab ${leftTab === 'locations' ? 'active' : ''}`} onClick={() => setLeftTab('locations')}>
                &gt;&gt;Локации
              </span>
              <span className={`tab ${leftTab === 'interaction' ? 'active' : ''}`} onClick={() => setLeftTab('interaction')}>
                &gt;&gt;Взаимодействие
              </span>
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
                  <div className="battle-history-header">
                    <div className="battle-history-title">// ИСТОРИЯ БОЯ</div>
                  </div>
                  <div className="battle-history-list" ref={battleLogRef}>
                    {battle.log.length === 0 ? (
                      <div className="placeholder">Нет активного боя.</div>
                    ) : (
                      battle.log.map((entry, i) => (
                        <div key={i} className={`battle-history-entry fade-in`}>
                          <span className={entry.type === 'damage' ? 'dmg' : entry.type === 'heal' ? 'heal' : entry.type === 'loot' ? 'gold' : 'info'}>
                            [{entry.turn}] {entry.text}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="battle-actions">
                  <div className="battle-actions-title">// БОЙ</div>

                  <div className="battle-vitals">
                    <div className="vital">
                      <span className="vital-label">HP</span>
                      <span className={`vital-val ${hero.currentHp < effectiveStats.maxHp * 0.3 ? 'hp-low' : ''}`}>
                        {hero.currentHp} / {effectiveStats.maxHp}
                      </span>
                    </div>
                    <div className="vital">
                      <span className="vital-label">MP</span>
                      <span className={`vital-val ${hero.currentMp < effectiveStats.maxMp * 0.3 ? 'mp-low' : ''}`}>
                        {hero.currentMp} / {effectiveStats.maxMp}
                      </span>
                    </div>
                  </div>

                  <div className="battle-actions-grid">
                    <button
                      className="btn"
                      onClick={game.playerAttack}
                      disabled={!battle.active || !battle.playerTurn}
                    >
                      Атака
                    </button>
                    <button
                      className="btn"
                      onClick={() => game.setAbilityMenu(!game.abilityMenu)}
                      disabled={!battle.active || !battle.playerTurn}
                    >
                      Способность
                    </button>
                    <button
                      className="btn"
                      onClick={() => game.setItemMenu(!game.itemMenu)}
                      disabled={!battle.active || !battle.playerTurn}
                    >
                      Предмет
                    </button>
                    <button
                      className="btn"
                      onClick={game.flee}
                      disabled={!battle.active || !battle.playerTurn}
                    >
                      Побег
                    </button>
                  </div>

                  {/* Меню способностей */}
                  {game.abilityMenu && battle.active && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {hero.abilities.map(abId => {
                        const ab = ABILITIES[abId];
                        if (!ab) return null;
                        const canUse = hero.currentMp >= ab.mpCost;
                        return (
                          <button
                            key={abId}
                            className={`btn ${canUse ? '' : ''}`}
                            onClick={() => canUse && game.useAbility(abId)}
                            disabled={!canUse}
                            style={{ textAlign: 'left', fontSize: '8px' }}
                          >
                            {ab.name} [{ab.mpCost} MP]
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Меню предметов в бою */}
                  {game.itemMenu && battle.active && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {hero.inventory.filter(i => i.item.tags.consumable).map((invItem, idx) => (
                        <button
                          key={idx}
                          className="btn"
                          onClick={() => {
                            const realIdx = hero.inventory.indexOf(invItem);
                            game.useItem(realIdx, true);
                            game.setItemMenu(false);
                          }}
                          style={{ textAlign: 'left', fontSize: '8px' }}
                        >
                          {invItem.item.name} x{invItem.count}
                        </button>
                      ))}
                      {hero.inventory.filter(i => i.item.tags.consumable).length === 0 && (
                        <div className="placeholder">Нет расходников.</div>
                      )}
                    </div>
                  )}

                  <div className="battle-actions-hint">
                    {battle.active ? `Ход: ${battle.turn} | ${battle.playerTurn ? 'Твой ход' : 'Ход врага...'}` : '// нет активного боя'}
                  </div>
                </div>
              </div>
            </div>

            {/* ГОРОДА */}
            <div className={`pane ${leftTab === 'cities' ? 'active' : ''}`}>
              <div className="location-panel">
                <div className="location-name">{location?.name}</div>
                <div className="location-desc">{location?.description}</div>
                <div className="location-actions">
                  {location?.connectedTo.map(locId => {
                    const loc = LOCATIONS[locId];
                    return (
                      <button key={locId} className="btn" onClick={() => game.travel(locId)}>
                        → {loc?.name} [Опасность: {loc?.tags.dangerLevel}]
                      </button>
                    );
                  })}
                  {location?.tags.type === 'city' && (
                    <>
                      <button className="btn success" onClick={game.rest}>
                        🏨 Отдохнуть (5 золота)
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ЛОКАЦИИ */}
            <div className={`pane ${leftTab === 'locations' ? 'active' : ''}`}>
              <div className="location-panel">
                <div className="location-name">
                  {location?.name} {location?.tags.type === 'city' ? '🏰' : '⚔️'}
                </div>
                <div className="location-desc">{location?.description}</div>
                <div style={{ fontSize: '9px', color: '#6cf', marginBottom: '8px' }}>
                  Опасность: {'⚠️'.repeat(location?.tags.dangerLevel || 0)}
                </div>
                {location?.enemies.length > 0 && (
                  <div style={{ fontSize: '9px', color: '#f66', marginBottom: '8px' }}>
                    Враги: {location.enemies.map(eId => ENEMIES[eId]?.name).join(', ')}
                  </div>
                )}
                {location?.resources.length > 0 && (
                  <div style={{ fontSize: '9px', color: '#6f6', marginBottom: '8px' }}>
                    Ресурсы: {location.resources.map(rId => ITEMS[rId]?.name).join(', ')}
                  </div>
                )}
                <div className="location-actions">
                  <button className="btn" onClick={game.explore}>
                    🔍 Исследовать
                  </button>
                  {location?.enemies.length > 0 && !battle.active && (
                    <button className="btn danger" onClick={() => game.startBattle()}>
                      ⚔️ Искать врага
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ВЗАИМОДЕЙСТВИЕ */}
            <div className={`pane ${leftTab === 'interaction' ? 'active' : ''}`}>
              <div className="interaction">
                <div className="interaction-info">
                  {game.selectedItem ? (() => {
                    const invItem = hero.inventory[parseInt(game.selectedItem)];
                    if (!invItem) return <div className="placeholder">Предмет не найден.</div>;
                    const item = invItem.item;
                    return (
                      <div className="fade-in">
                        <div className="info-name">
                          <span className={rarityClass(item.tags.rarity)}>{item.name}</span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#888', marginBottom: '8px' }}>{item.description}</div>
                        <div className="info-block">
                          <div className="info-prop">Редкость: <span className={rarityClass(item.tags.rarity)}>{item.tags.rarity}</span></div>
                          <div className="info-prop">Уровень: <span>{item.tags.level}</span></div>
                          {item.tags.slot && <div className="info-prop">Слот: <span>{slotNames[item.tags.slot]}</span></div>}
                          {item.tags.element && item.tags.element !== 'none' && <div className="info-prop">Стихия: <span>{item.tags.element}</span></div>}
                          {item.tags.material && <div className="info-prop">Материал: <span>{item.tags.material}</span></div>}
                          {item.tags.consumable && <div className="info-prop">Тип: <span>{item.tags.consumable}</span></div>}
                        </div>
                        {item.stats && (
                          <>
                            <div className="info-block-sep">// БОНУСЫ</div>
                            <div className="info-block">
                              {Object.entries(item.stats).map(([key, val]) => (
                                val ? <div key={key} className="info-prop">
                                  {key}: <span className="val-buff">+{val}</span>
                                </div> : null
                              ))}
                            </div>
                          </>
                        )}
                        {item.effectValue && (
                          <div className="info-prop">Эффект: <span className="val-buff">{item.effectValue}</span></div>
                        )}
                        {item.tags.craftable && (
                          <>
                            <div className="info-block-sep">// КРАФТ (тир {item.tags.craftable.tier})</div>
                            <div className="info-block">
                              {item.tags.craftable.recipe.map((r, i) => (
                                <div key={i} className="info-prop">
                                  {ITEMS[r.materialId]?.name || r.materialId}: <span>{r.count} шт.</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        <div className="info-prop">Цена: <span style={{ color: '#fc6' }}>{item.value} золота</span></div>
                        <div className="info-prop">В наличии: <span>x{invItem.count}</span></div>
                      </div>
                    );
                  })() : (
                    <div className="placeholder">Выбери предмет для взаимодействия.</div>
                  )}
                </div>
                <div className="interaction-actions">
                  {game.selectedItem && (() => {
                    const invItem = hero.inventory[parseInt(game.selectedItem)];
                    if (!invItem) return null;
                    const item = invItem.item;
                    return (
                      <>
                        {item.tags.slot && (
                          <button className="btn" onClick={() => {
                            game.equipItem(parseInt(game.selectedItem!));
                          }}>
                            Надеть
                          </button>
                        )}
                        {item.tags.consumable && (
                          <button className="btn success" onClick={() => {
                            game.useItem(parseInt(game.selectedItem!));
                          }}>
                            Использовать
                          </button>
                        )}
                      </>
                    );
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
                <span className={`tab ${rightTopTab === 'inv' ? 'active' : ''}`} onClick={() => setRightTopTab('inv')}>
                  &gt;&gt;Инвентарь
                </span>
                <span className={`tab ${rightTopTab === 'mana' ? 'active' : ''}`} onClick={() => setRightTopTab('mana')}>
                  &gt;&gt;Мана тех
                </span>
                <span className={`tab ${rightTopTab === 'stats-hero' ? 'active' : ''}`} onClick={() => setRightTopTab('stats-hero')}>
                  &gt;&gt;Статы
                </span>
                <span className={`tab ${rightTopTab === 'bestiary' ? 'active' : ''}`} onClick={() => setRightTopTab('bestiary')}>
                  &gt;&gt;Бистеарий
                </span>
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
                          <div
                            key={slot}
                            className={`slot ${item ? 'filled' : 'empty'} ${game.selectedItem === `eq-${slot}` ? 'selected' : ''}`}
                            onClick={() => {
                              if (item) {
                                game.setSelectedItem(game.selectedItem === `eq-${slot}` ? null : `eq-${slot}`);
                              }
                            }}
                            onDoubleClick={() => {
                              if (item) game.unequipItem(slot);
                            }}
                          >
                            {slotNames[slot]}:: {item ? <span className={rarityClass(item.tags.rarity)}>{item.name}</span> : '—'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="inv-bag">
                    <div className="inv-title">// НЕ ЭКИПИРОВАНО</div>
                    {hero.inventory.length === 0 ? (
                      <div className="placeholder">Сумка пуста.</div>
                    ) : (
                      hero.inventory.map((invItem, idx) => (
                        <div
                          key={idx}
                          className={`item ${game.selectedItem === String(idx) ? 'selected' : ''} ${rarityClass(invItem.item.tags.rarity)}`}
                          onClick={() => {
                            game.setSelectedItem(game.selectedItem === String(idx) ? null : String(idx));
                          }}
                        >
                          {invItem.item.name} {invItem.count > 1 ? `x${invItem.count}` : ''}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* МАНА ТЕХ */}
              <div className={`pane ${rightTopTab === 'mana' ? 'active' : ''}`}>
                <div className="mana-tech">
                  <div className="mana-tech-title">// МАНА ТЕХ</div>
                  <div className="abilities-grid">
                    {hero.abilities.map(abId => {
                      const ab = ABILITIES[abId];
                      if (!ab) return null;
                      return (
                        <div key={abId} className="ability-card">
                          <div className="ability-name">{ab.name}</div>
                          <div className="ability-cost">{ab.mpCost} MP</div>
                          <div className="ability-desc">{ab.description}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="placeholder" style={{ marginTop: '8px' }}>
                    Новые способности открываются с уровнем.
                  </div>
                </div>
              </div>

              {/* СТАТЫ */}
              <div className={`pane ${rightTopTab === 'stats-hero' ? 'active' : ''}`}>
                <div className="hero-stats">
                  <div className="hero-stats-title">// СТАТЫ ПЕРСОНАЖА</div>
                  <div className="hero-stats-name">{hero.name} [Ур. {hero.level}]</div>
                  <div style={{ fontSize: '9px', color: '#6cf', marginBottom: '8px' }}>
                    XP: {hero.xp}/{hero.xpToNext} | Золото: <span style={{ color: '#fc6' }}>{hero.gold}</span>
                  </div>
                  <div className="hero-stats-list">
                    {([
                      ['HP', `${hero.currentHp}/${effectiveStats.maxHp}`],
                      ['MP', `${hero.currentMp}/${effectiveStats.maxMp}`],
                      ['Сила', effectiveStats.str, hero.baseStats.str],
                      ['Ловкость', effectiveStats.agi, hero.baseStats.agi],
                      ['Интеллект', effectiveStats.int, hero.baseStats.int],
                      ['Выносливость', effectiveStats.vit, hero.baseStats.vit],
                      ['Удача', effectiveStats.lck, hero.baseStats.lck],
                      ['Урон', effectiveStats.damage, hero.baseStats.damage],
                      ['Броня', effectiveStats.armor, hero.baseStats.armor],
                      ['Скорость', effectiveStats.speed, hero.baseStats.speed],
                    ] as any[]).map(([label, total, base]) => (
                      <div key={label} className="stat-row">
                        <span className="stat-key">{label}</span>
                        <span>
                          {base !== undefined && base !== total ? (
                            <><span className="stat-val">{base}</span> + <span className="stat-bonus">{total - base}</span> = <span className="stat-total">{total}</span></>
                          ) : (
                            <span className="stat-total">{total}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* БИСТЕАРИЙ */}
              <div className={`pane ${rightTopTab === 'bestiary' ? 'active' : ''}`}>
                <div className="bestiary-list">
                  {Object.keys(hero.bestiary).length === 0 ? (
                    <div className="placeholder">Ещё никто не встречен...</div>
                  ) : (
                    Object.values(hero.bestiary).map(entry => {
                      const template = ENEMIES[entry.enemyId];
                      if (!template) return null;
                      return (
                        <div key={entry.enemyId} className="bestiary-entry">
                          <div className="name">{template.name} [Ур. {template.level}]</div>
                          <div className="kills">Убито: {entry.kills}</div>
                          <div style={{ fontSize: '8px', color: '#6f6', marginTop: '2px' }}>
                            Слабости: {template.weaknesses.join(', ') || 'нет'}
                          </div>
                          <div style={{ fontSize: '8px', color: '#f66' }}>
                            Сопротивления: {template.resistances.join(', ') || 'нет'}
                          </div>
                        </div>
                      );
                    })
                  )}
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
                <span className={`tab ${rightBottomTab === 'study' ? 'active' : ''}`} onClick={() => setRightBottomTab('study')}>
                  &gt;&gt;Изучение
                </span>
                <span className={`tab ${rightBottomTab === 'stats-enemy' ? 'active' : ''}`} onClick={() => setRightBottomTab('stats-enemy')}>
                  &gt;&gt;Статы
                </span>
              </div>
            </div>

            <div className="tab-content">
              {/* ИЗУЧЕНИЕ */}
              <div className={`pane ${rightBottomTab === 'study' ? 'active' : ''}`}>
                {enemy ? (
                  <div className="enemy-panel fade-in">
                    <div className="enemy-name">{enemy.template.name}</div>
                    <div className="enemy-hp-bar">
                      <div className="enemy-hp-fill" style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }} />
                      <div className="enemy-hp-text">{enemy.currentHp} / {enemy.maxHp}</div>
                    </div>
                    <div style={{ fontSize: '9px', color: '#e0e0e0', marginTop: '8px', lineHeight: '1.8' }}>
                      {enemy.template.description}
                    </div>
                    <div style={{ fontSize: '9px', marginTop: '8px' }}>
                      <div style={{ color: '#6cf' }}>Тип: <span style={{ color: '#e0e0e0' }}>{enemy.template.tags.type}</span></div>
                      <div style={{ color: '#6cf' }}>Стихия: <span style={{ color: '#e0e0e0' }}>{enemy.template.tags.element}</span></div>
                      <div style={{ color: '#6cf' }}>Поведение: <span style={{ color: '#e0e0e0' }}>{enemy.template.tags.behavior}</span></div>
                      <div style={{ color: '#6f6', marginTop: '4px' }}>Слабости: {enemy.template.weaknesses.join(', ') || 'нет'}</div>
                      <div style={{ color: '#f66' }}>Сопротивления: {enemy.template.resistances.join(', ') || 'нет'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="placeholder">Нет активного врага.</div>
                )}
              </div>

              {/* СТАТЫ ВРАГА */}
              <div className={`pane ${rightBottomTab === 'stats-enemy' ? 'active' : ''}`}>
                {enemy ? (
                  <div className="enemy-panel fade-in">
                    <div className="enemy-name">{enemy.template.name} [Ур. {enemy.template.level}]</div>
                    <div className="enemy-stats">
                      <div className="enemy-stat">
                        <span className="key">HP</span>
                        <span className="val">{enemy.currentHp}/{enemy.maxHp}</span>
                      </div>
                      <div className="enemy-stat">
                        <span className="key">Урон</span>
                        <span className="val">{enemy.template.baseDamage}</span>
                      </div>
                      <div className="enemy-stat">
                        <span className="key">Броня</span>
                        <span className="val">{enemy.template.armor}</span>
                      </div>
                      <div className="enemy-stat">
                        <span className="key">Скорость</span>
                        <span className="val">{enemy.template.speed}</span>
                      </div>
                    </div>
                    {enemy.debuffs.length > 0 && (
                      <div style={{ fontSize: '9px', color: '#c6f', marginTop: '8px' }}>
                        Дебаффы: {enemy.debuffs.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="placeholder">Нет активного врага.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
