import { useState, useEffect, useRef } from 'react';
import { useGameState } from './engine/gameEngine';
import { LOCATIONS } from './data/locations';
import { RUNES, SPELL_FORMS, SCROLL_EFFECTS } from './data/runes';
import { TRAJECTORIES } from './data/trajectories';
import { ITEMS } from './data/items';
import { ENEMIES } from './data/enemies';
import { SlotType, RarityType, BodyPart, ElementType, LocationId } from './types/tags';

// ═══ Компонент подсказки ═══
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ x: rect.left, y: rect.bottom + 8 });
    }
    setShow(true);
  };

  return (
    <span ref={ref} className="tt-anchor" onMouseEnter={handleMouseEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="tooltip" style={{ left: pos.x, top: pos.y }}>
          {text}
        </div>
      )}
    </span>
  );
}

function App() {
  const game = useGameState();
  const { state } = game;
  const { hero, battle, currentLocation, eventLog } = state;

  const [leftTab, setLeftTab] = useState('log-events');
  const [rightTopTab, setRightTopTab] = useState('inv');
  const [rightBottomTab, setRightBottomTab] = useState('study');
  const [showMap, setShowMap] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<LocationId | null>(null);
  const [showSpellList, setShowSpellList] = useState(false);
  const [renamingSlot, setRenamingSlot] = useState<number | null>(null);
  const [newSpellName, setNewSpellName] = useState('');

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

  const bodyPartNames: Record<BodyPart, string> = {
    head: 'Голова', torso: 'Торс', arms: 'Руки', legs: 'Ноги', wings: 'Крылья', tail: 'Хвост',
  };

  // ═══ РЕНДЕР ВЗАИМОДЕЙСТВИЯ ═══
  const renderInteraction = () => {
    if (game.interactionMode === 'spellBuilder' && game.buildingSlot !== null) {
      const bs = game.buildState;
      return (
        <div className="interaction" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', overflow: 'auto' }}>
          <div className="inv-title">// КОНСТРУКТОР ЗАКЛИНАНИЯ — Слот {game.buildingSlot + 1}</div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <Tooltip text="Руны времени + эффекты. Лечат, дают баффы.">
              <button className="btn" style={{ flex: 1, fontSize: '8px', opacity: bs.target === 'self' ? 1 : 0.4 }}
                onClick={() => game.setBuildState({ ...bs, target: 'self' })}>✨ На себя</button>
            </Tooltip>
            <Tooltip text="Элемент + траектория + форма. Атакуют врага.">
              <button className="btn" style={{ flex: 1, fontSize: '8px', opacity: bs.target === 'enemy' ? 1 : 0.4 }}
                onClick={() => game.setBuildState({ ...bs, target: 'enemy' })}>⚔️ На врага</button>
            </Tooltip>
          </div>

          {bs.target === 'self' ? (
            <>
              <div style={{ fontSize: '8px', color: '#6cf' }}>
                Руны (ОЧСМ: {bs.runes.reduce((s, id) => s + (RUNES[id]?.osmCost || 0), 0)}/{hero.osmMax})
                <Tooltip text="ОЧСМ — очки силы магии. Растут на +2 за уровень."> ~</Tooltip>
              </div>
              {bs.runes.length === 0 ? <div className="placeholder">Добавь руны ↓</div> :
                bs.runes.map((rId, idx) => {
                  const r = RUNES[rId]; if (!r) return null;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px', border: '1px solid #333', fontSize: '8px' }}>
                      <Tooltip text={r.description}>
                        <span style={{ color: r.type === 'time' ? '#6cf' : r.type === 'effect' ? '#f66' : '#c6f' }}>{r.name} [{r.osmCost}]</span>
                      </Tooltip>
                      <button className="btn danger" style={{ fontSize: '7px', padding: '1px 4px' }} onClick={() => game.removeRuneFromBuild(idx)}>✕</button>
                    </div>
                  );
                })
              }
              <div style={{ fontSize: '8px', color: '#6cf', marginTop: '4px' }}>Доступные руны:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', maxHeight: '100px' }}>
                {hero.collectedRunes.map(rId => {
                  const r = RUNES[rId]; if (!r) return null;
                  return (
                    <Tooltip key={rId} text={r.description}>
                      <button className="btn" style={{ fontSize: '7px', textAlign: 'left', padding: '3px 6px', width: '100%' }}
                        onClick={() => game.addRuneToBuild(rId)}>
                        <span style={{ color: r.type === 'time' ? '#6cf' : r.type === 'effect' ? '#f66' : '#c6f' }}>
                          [{r.type === 'time' ? 'В' : r.type === 'effect' ? 'Э' : 'У'}]
                        </span> {r.name}
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '8px', color: '#6cf' }}>
                Элемент
                <Tooltip text="Сила стихии влияет на урон. Слабости врага = x1.5 урон."> ~</Tooltip>
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {(['fire', 'water', 'earth', 'air', 'light', 'dark'] as ElementType[]).map(el => (
                  <Tooltip key={el} text={`Сила ${el}: ${effectiveStats[`${el}Power` as keyof typeof effectiveStats]}`}>
                    <button className={`btn ${bs.element === el ? 'success' : ''}`}
                      style={{ fontSize: '7px', padding: '3px 6px' }}
                      onClick={() => game.setBuildState({ ...bs, element: el })}>
                      {el === 'fire' ? '🔥' : el === 'water' ? '💧' : el === 'earth' ? '🪨' : el === 'air' ? '💨' : el === 'light' ? '✨' : '🌑'} {el}
                    </button>
                  </Tooltip>
                ))}
              </div>

              <div style={{ fontSize: '8px', color: '#6cf', marginTop: '4px' }}>
                Траектория
                <Tooltip text="Влияет на точность и урон. Все доступны сразу."> ~</Tooltip>
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {Object.values(TRAJECTORIES).map(t => (
                  <Tooltip key={t.id} text={`${t.description}\nУрон: x${t.damageMultiplier} | MP: +${t.mpCost}`}>
                    <button className={`btn ${bs.trajectory === t.id ? 'success' : ''}`}
                      style={{ fontSize: '7px', padding: '3px 6px' }}
                      onClick={() => game.setBuildState({ ...bs, trajectory: t.id })}>
                      {t.name}
                    </button>
                  </Tooltip>
                ))}
              </div>

              <div style={{ fontSize: '8px', color: '#6cf', marginTop: '4px' }}>
                Форма
                <Tooltip text="Изучаются из свитков. Влияют на урон и крит."> ~</Tooltip>
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {hero.knownScrolls.filter(s => SPELL_FORMS[s]).map(fId => {
                  const f = SPELL_FORMS[fId]; if (!f) return null;
                  return (
                    <Tooltip key={fId} text={`${f.description}\nУрон: +${f.damageBonus} | Крит: +${f.critBonus}% | MP: ${f.mpCost}`}>
                      <button className={`btn ${bs.form === fId ? 'success' : ''}`}
                        style={{ fontSize: '7px', padding: '3px 6px' }}
                        onClick={() => game.setBuildState({ ...bs, form: fId })}>
                        {f.name}
                      </button>
                    </Tooltip>
                  );
                })}
                {hero.knownScrolls.filter(s => SPELL_FORMS[s]).length === 0 && <div className="placeholder">Нет свитков форм</div>}
              </div>

              <div style={{ fontSize: '8px', color: '#6cf', marginTop: '4px' }}>
                Доп. эффект
                <Tooltip text="Изучаются из свитков. Шанс срабатывания."> ~</Tooltip>
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                <button className={`btn ${bs.scrollEffect === '' ? 'success' : ''}`}
                  style={{ fontSize: '7px', padding: '3px 6px' }}
                  onClick={() => game.setBuildState({ ...bs, scrollEffect: '' })}>—</button>
                {hero.knownScrolls.filter(s => SCROLL_EFFECTS[s]).map(sId => {
                  const s = SCROLL_EFFECTS[sId]; if (!s) return null;
                  return (
                    <Tooltip key={sId} text={`${s.description}\nШанс: ${s.chance}%`}>
                      <button className={`btn ${bs.scrollEffect === sId ? 'success' : ''}`}
                        style={{ fontSize: '7px', padding: '3px 6px' }}
                        onClick={() => game.setBuildState({ ...bs, scrollEffect: sId })}>
                        {s.name}
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            <button className="btn success" onClick={game.saveBuild}>💾 Сохранить</button>
            <button className="btn danger" onClick={game.cancelBuild}>✕ Отмена</button>
          </div>
        </div>
      );
    }

    if (game.interactionMode === 'bestiary' && game.selectedItem?.startsWith('bestiary-')) {
      const enemyId = game.selectedItem.replace('bestiary-', '');
      const entry = hero.bestiary[enemyId];
      const template = ENEMIES[enemyId];
      if (!entry || !template) return <div className="placeholder">Не найдено.</div>;
      return (
        <div className="interaction" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', overflow: 'auto' }}>
          <div className="inv-title">// БИСТЕАРИЙ — ИЗУЧЕНИЕ</div>
          <div className="info-name">{template.name} [Ур. {template.level}]</div>
          <div style={{ fontSize: '9px', color: '#888', marginBottom: '4px' }}>{template.description}</div>
          <div className="info-prop">Убито: <span>{entry.kills}</span></div>
          <div className="info-prop">Тип: <span>{template.tags.type}</span></div>
          <div className="info-prop">Элемент: <span>{template.tags.element}</span></div>
          <div className="info-block-sep">// ЧАСТИ ТЕЛА</div>
          {template.bodyParts.map(bp => {
            const studied = entry.studiedParts[bp.part];
            return (
              <div key={bp.part} style={{ fontSize: '8px', padding: '4px', border: '1px solid #333', marginBottom: '2px' }}>
                <span style={{ color: '#e0e0e0' }}>{bodyPartNames[bp.part]}</span>
                {studied?.discovered ? (
                  <>
                    {studied.weakness && <span style={{ color: '#6f6', marginLeft: '8px' }}>⚡ Слабость: {studied.weakness}</span>}
                    {studied.resistance && <span style={{ color: '#f66', marginLeft: '8px' }}>🛡 Сопротивление: {studied.resistance}</span>}
                    {!studied.weakness && !studied.resistance && <span style={{ color: '#888', marginLeft: '8px' }}>— нейтрально</span>}
                  </>
                ) : (
                  <span style={{ color: '#555', marginLeft: '8px' }}>???</span>
                )}
              </div>
            );
          })}
          <div className="info-block-sep" style={{ marginTop: '4px' }}>// ПОДСКАЗКА</div>
          <div className="placeholder">Атакуй разными стихиями чтобы изучить части тела.</div>
        </div>
      );
    }

    if (game.interactionMode === 'item' && game.selectedItem && !game.selectedItem.startsWith('eq-') && !game.selectedItem.startsWith('bestiary-')) {
      const invItem = hero.inventory[parseInt(game.selectedItem)];
      if (!invItem) return <div className="placeholder">Не найдено.</div>;
      const item = invItem.item;
      return (
        <div className="interaction" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', overflow: 'auto' }}>
          <div className="inv-title">// ПРЕДМЕТ</div>
          <div className="info-name"><span className={rarityClass(item.tags.rarity)}>{item.name}</span></div>
          <div style={{ fontSize: '9px', color: '#888' }}>{item.description}</div>
          <div className="info-prop">Редкость: <span className={rarityClass(item.tags.rarity)}>{item.tags.rarity}</span></div>
          {item.tags.slot && <div className="info-prop">Слот: <span>{slotNames[item.tags.slot]}</span></div>}
          {item.tags.element && item.tags.element !== 'none' && <div className="info-prop">Стихия: <span>{item.tags.element}</span></div>}
          {item.stats && <>
            <div className="info-block-sep">// БОНУСЫ</div>
            {Object.entries(item.stats).map(([key, val]) => val ? <div key={key} className="info-prop">{key}: <span className="val-buff">+{val}</span></div> : null)}
          </>}
          <div className="info-prop">В наличии: <span>x{invItem.count}</span></div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            {item.tags.slot && <button className="btn" onClick={() => game.equipItem(parseInt(game.selectedItem!))}>Надеть</button>}
            {item.tags.consumable && <button className="btn success" onClick={() => game.useItem(parseInt(game.selectedItem!))}>Использовать</button>}
          </div>
        </div>
      );
    }

    return <div className="placeholder">Выбери объект для взаимодействия.</div>;
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

            <div className={`pane ${leftTab === 'log-battle' ? 'active' : ''}`}>
              <div className="battle-log">
                <div className="battle-history">
                  <div className="battle-history-header"><div className="battle-history-title">// ИСТОРИЯ БОЯ</div></div>
                  <div className="battle-history-list" ref={battleLogRef}>
                    {battle.log.length === 0 ? <div className="placeholder">Нет боя.</div> :
                      battle.log.map((entry, i) => (
                        <div key={i} className="battle-history-entry fade-in">
                          <span className={entry.type === 'damage' ? 'dmg' : entry.type === 'heal' ? 'heal' : entry.type === 'loot' ? 'gold' : 'info'}>[{entry.turn}] {entry.text}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div className="battle-actions">
                  <div className="battle-actions-title">// БОЙ</div>
                  <div className="battle-vitals">
                    <div className="vital"><span className="vital-label">HP</span><span className={`vital-val ${hero.currentHp < effectiveStats.maxHp * 0.3 ? 'hp-low' : ''}`}>{hero.currentHp}/{effectiveStats.maxHp}</span></div>
                    <div className="vital"><span className="vital-label">MP</span><span className={`vital-val ${hero.currentMp < effectiveStats.maxMp * 0.3 ? 'mp-low' : ''}`}>{hero.currentMp}/{effectiveStats.maxMp}</span></div>
                  </div>
                  {battle.active && enemy && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '8px', color: '#6cf', marginBottom: '4px' }}>Цель:</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {enemy.template.bodyParts.map(bp => (
                          <button key={bp.part} className={`btn ${battle.selectedBodyPart === bp.part ? 'success' : ''}`}
                            style={{ fontSize: '8px', padding: '3px 6px' }} onClick={() => game.selectBodyPart(bp.part)}>
                            {bodyPartNames[bp.part]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="battle-actions-grid">
                    <button className="btn" disabled={!battle.active || !battle.playerTurn || !battle.selectedBodyPart}
                      onClick={() => battle.selectedBodyPart && game.playerAttack(battle.selectedBodyPart)}>⚔️ Атака</button>
                    <button className="btn" disabled={!battle.active || !battle.playerTurn}
                      onClick={() => setShowSpellList(!showSpellList)}>🔮 Магия</button>
                    <button className="btn" disabled={!battle.active || !battle.playerTurn} onClick={() => game.useItem(0)}>🧪 Предмет</button>
                    <button className="btn" disabled={!battle.active || !battle.playerTurn} onClick={game.flee}>🏃 Побег</button>
                  </div>

                  {/* Раскрывающийся список магии */}
                  {showSpellList && battle.active && (
                    <div style={{ border: '1px solid #6cf', padding: '6px', background: '#050510', marginTop: '4px' }}>
                      <div style={{ fontSize: '8px', color: '#6cf', marginBottom: '4px' }}>Выбери заклинание:</div>
                      {hero.spellSlots.slice(0, game.getMaxSlots(hero.level)).map((slot, idx) => {
                        if (slot.mpCost === 0) return null;
                        const displayName = slot.customName || slot.name;
                        const masteryStars = '★'.repeat(slot.masteryLevel || 1);
                        return (
                          <button key={idx} className="btn" style={{ fontSize: '7px', width: '100%', marginBottom: '2px', textAlign: 'left' }}
                            disabled={!battle.playerTurn || hero.currentMp < slot.mpCost}
                            onClick={() => {
                              if (slot.target === 'self') {
                                game.castSpell(idx);
                              } else if (battle.selectedBodyPart) {
                                game.castSpell(idx, battle.selectedBodyPart);
                              }
                              setShowSpellList(false);
                            }}>
                            {slot.target === 'self' ? '✨' : '⚔️'} {displayName} [{slot.mpCost} MP] <span style={{ color: '#fc6' }}>{masteryStars}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="battle-actions-hint">{battle.active ? `Ход: ${battle.turn} | ${battle.playerTurn ? 'Твой ход' : 'Ход врага...'}` : '// нет боя'}</div>
                </div>
              </div>
            </div>

            <div className={`pane ${leftTab === 'travel' ? 'active' : ''}`}>
              <div className="location-panel">
                <div className="location-name">{location?.name} {location?.tags.type === 'city' ? '🏰' : '⚔️'}</div>
                <div className="location-desc">{location?.description}</div>
                <button className="btn" onClick={() => { setShowMap(!showMap); setSelectedMapLocation(null); }} style={{ marginBottom: '8px' }}>
                  🗺️ {showMap ? 'Скрыть карту' : 'Показать карту'}
                </button>
                {showMap && (
                  <div className="fade-in" style={{ border: '1px solid #333', padding: '8px', marginBottom: '8px', position: 'relative', height: '200px', background: '#050510' }}>
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                      {Object.values(LOCATIONS).map(loc => loc.connectedTo.map(cId => {
                        const cLoc = LOCATIONS[cId]; if (!cLoc) return null;
                        return <line key={`${loc.id}-${cId}`} x1={`${loc.mapX}%`} y1={`${loc.mapY}%`} x2={`${cLoc.mapX}%`} y2={`${cLoc.mapY}%`} stroke="#222" strokeWidth="1" />;
                      }))}
                    </svg>
                    {Object.values(LOCATIONS).map(loc => (
                      <div key={loc.id} style={{
                        position: 'absolute', left: `${loc.mapX}%`, top: `${loc.mapY}%`, transform: 'translate(-50%, -50%)',
                        width: loc.id === currentLocation ? '12px' : '8px', height: loc.id === currentLocation ? '12px' : '8px',
                        borderRadius: '50%', background: loc.id === currentLocation ? '#ff0' : loc.tags.type === 'city' ? '#6cf' : '#f66',
                        cursor: 'pointer', boxShadow: loc.id === currentLocation ? '0 0 8px #ff0' : 'none', transition: 'all 0.2s',
                      }} onClick={() => setSelectedMapLocation(loc.id)}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.5)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'; }} />
                    ))}

                    {selectedMapLocation && (() => {
                      const selectedLoc = LOCATIONS[selectedMapLocation];
                      if (!selectedLoc) return null;
                      const canTravel = location?.connectedTo.includes(selectedMapLocation);
                      return (
                        <div className="fade-in" style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', background: '#0a0a1a', border: '1px solid #6cf', padding: '8px', fontSize: '9px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ color: '#6cf' }}>{selectedLoc.name}</span>
                            <button className="btn" style={{ fontSize: '7px', padding: '2px 6px' }} onClick={() => setSelectedMapLocation(null)}>✕ Назад</button>
                          </div>
                          <div style={{ color: '#e0e0e0', marginBottom: '6px', fontSize: '8px' }}>{selectedLoc.description}</div>
                          <div style={{ color: '#6cf', fontSize: '8px', marginBottom: '6px' }}>Опасность: {'⚠️'.repeat(selectedLoc.tags.dangerLevel)}</div>
                          {selectedMapLocation === currentLocation ? <div style={{ color: '#ff0', fontSize: '8px' }}>📍 Ты здесь</div> :
                            canTravel ? <button className="btn" style={{ fontSize: '8px', padding: '4px 8px' }} onClick={() => { game.travel(selectedMapLocation); setSelectedMapLocation(null); }}>→ Отправиться</button> :
                              <div style={{ color: '#555', fontSize: '8px' }}>Нет пути</div>}
                        </div>
                      );
                    })()}
                  </div>
                )}
                {!showMap && (
                  <div>
                    <div style={{ fontSize: '9px', color: '#6cf', marginBottom: '8px' }}>Куда идти:</div>
                    <div className="location-actions">
                      {location?.connectedTo.map(locId => {
                        const loc = LOCATIONS[locId];
                        return <button key={locId} className="btn" onClick={() => game.travel(locId)}>→ {loc?.name} [⚠️{loc?.tags.dangerLevel}]</button>;
                      })}
                      {location?.tags.type === 'city' && <button className="btn success" onClick={game.rest}>🏨 Отдохнуть (5 золота)</button>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`pane ${leftTab === 'locations' ? 'active' : ''}`}>
              <div className="location-panel">
                <div className="location-name">{location?.name}</div>
                <div className="location-desc">{location?.description}</div>
                <div style={{ fontSize: '9px', color: '#6cf', marginBottom: '8px' }}>Опасность: {'⚠️'.repeat(location?.tags.dangerLevel || 0)}</div>
                {enemy && battle.active ? <div style={{ fontSize: '9px', color: '#f66' }}>Идёт бой!</div> : (
                  <div className="location-actions">
                    <button className="btn" onClick={game.explore}>🔍 Исследовать</button>
                    {location?.enemies.length > 0 && <button className="btn danger" onClick={() => game.startBattle()}>⚔️ Искать врага</button>}
                  </div>
                )}
              </div>
            </div>

            <div className={`pane ${leftTab === 'interaction' ? 'active' : ''}`}>
              {renderInteraction()}
            </div>
          </div>
        </div>
        <div className="logs-footer"><button className="btn danger" onClick={game.resetGame}>Выход</button></div>
      </div>

      {/* ═══ ПРАВАЯ ПАНЕЛЬ ═══ */}
      <div className="right">
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
              <div className={`pane ${rightTopTab === 'inv' ? 'active' : ''}`}>
                <div className="inv">
                  <div className="inv-equipped">
                    <div className="inv-title">// ЭКИПИРОВАНО</div>
                    <div className="inv-equipped-list">
                      {(Object.keys(slotNames) as SlotType[]).map(slot => {
                        const item = hero.equipped[slot];
                        return (
                          <div key={slot} className={`slot ${item ? 'filled' : 'empty'}`}
                            onClick={() => { if (item) { game.openItemInteraction(-1); game.setSelectedItem(`eq-${slot}`); } }}
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
                        <div key={idx} className={`item ${rarityClass(invItem.item.tags.rarity)}`}
                          onClick={() => { game.openItemInteraction(idx); setLeftTab('interaction'); }}>
                          {invItem.item.name} {invItem.count > 1 ? `x${invItem.count}` : ''}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>

              <div className={`pane ${rightTopTab === 'mana' ? 'active' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                  <div style={{ color: '#6cf', fontSize: '9px', letterSpacing: '1px', borderBottom: '1px dashed #333', paddingBottom: '4px' }}>
                    // КОНСТРУКТОР МАГИИ [ОЧСМ: {hero.osmMax}]
                  </div>
                  {hero.spellSlots.slice(0, game.getMaxSlots(hero.level)).map((slot, idx) => (
                    <div key={idx} style={{ border: '1px solid #333', padding: '10px', background: '#050510' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ fontSize: '9px', color: '#6cf' }}>Слот {idx + 1}</div>
                        <div style={{ fontSize: '8px', color: '#c6f' }}>{slot.mpCost > 0 ? `${slot.mpCost} MP` : 'пусто'}</div>
                      </div>
                      {slot.mpCost === 0 ? (
                        <div className="placeholder" style={{ marginBottom: '6px' }}>Пусто</div>
                      ) : (
                        <>
                          {/* Имя магии */}
                          {renamingSlot === idx ? (
                            <div style={{ marginBottom: '6px' }}>
                              <input
                                type="text"
                                value={newSpellName}
                                onChange={(e) => setNewSpellName(e.target.value)}
                                placeholder="Введи имя..."
                                style={{ width: '100%', fontSize: '8px', padding: '4px', background: '#0a0a1a', border: '1px solid #6cf', color: '#fff', fontFamily: 'inherit' }}
                                maxLength={20}
                              />
                              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                <button className="btn success" style={{ fontSize: '7px', flex: 1 }} onClick={() => {
                                  if (newSpellName.trim()) {
                                    game.renameSpell(idx, newSpellName.trim());
                                    setRenamingSlot(null);
                                    setNewSpellName('');
                                  }
                                }}>✓</button>
                                <button className="btn danger" style={{ fontSize: '7px', flex: 1 }} onClick={() => {
                                  setRenamingSlot(null);
                                  setNewSpellName('');
                                }}>✕</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '9px', color: '#fff', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{slot.customName || slot.name}</span>
                              <button className="btn" style={{ fontSize: '7px', padding: '2px 6px' }} onClick={() => {
                                setRenamingSlot(idx);
                                setNewSpellName(slot.customName || '');
                              }}>✎</button>
                            </div>
                          )}

                          {/* Мастерство */}
                          {slot.masteryLevel && slot.masteryLevel > 0 && (
                            <div style={{ fontSize: '7px', color: '#fc6', marginBottom: '4px' }}>
                              Мастерство: {'★'.repeat(slot.masteryLevel)}{'☆'.repeat(7 - slot.masteryLevel)} (ур. {slot.masteryLevel}/7)
                            </div>
                          )}

                          <div style={{ fontSize: '8px', color: '#e0e0e0', marginBottom: '6px' }}>
                            {slot.target === 'self' ? `✨ На себя (${slot.runes.length} рун)` :
                              `⚔️ На врага: ${slot.element} / ${slot.trajectory}${slot.form ? ` / ${SPELL_FORMS[slot.form]?.name || ''}` : ''}${slot.scrollEffect ? ` / ${SCROLL_EFFECTS[slot.scrollEffect]?.name || ''}` : ''}`}
                          </div>
                          {slot.totalCasts > 0 && (
                            <div style={{ fontSize: '7px', color: '#888', marginBottom: '4px' }}>
                              Кастов: {slot.totalCasts}
                            </div>
                          )}
                        </>
                      )}
                      <button className="btn" style={{ fontSize: '8px', width: '100%' }} onClick={() => { game.startBuild(idx); setLeftTab('interaction'); }}>
                        {slot.mpCost === 0 ? '✦ Создать' : '✎ Изменить'}
                      </button>
                    </div>
                  ))}
                  {hero.level < 25 && (
                    <div className="placeholder" style={{ marginTop: '8px', fontSize: '8px' }}>
                      🔒 Следующий слот откроется на уровне {game.getMaxSlots(hero.level) < 7 ? [5, 10, 15, 20, 25][game.getMaxSlots(hero.level) - 2] : 'макс'}
                    </div>
                  )}
                  <div className="placeholder" style={{ marginTop: '8px' }}>
                    Нажми "Создать" → откроется вкладка Взаимодействие.
                  </div>
                </div>
              </div>

              <div className={`pane ${rightTopTab === 'stats-hero' ? 'active' : ''}`}>
                <div className="hero-stats">
                  <div className="hero-stats-title">// СТАТЫ</div>
                  <div className="hero-stats-name">{hero.name} [Ур. {hero.level}]</div>
                  <div style={{ fontSize: '9px', color: '#6cf', marginBottom: '4px' }}>XP: {hero.xp}/{hero.xpToNext} | Золото: <span style={{ color: '#fc6' }}>{hero.gold}</span></div>
                  <div style={{ fontSize: '9px', color: '#c6f', marginBottom: '8px' }}>ОЧСМ: {hero.osmMax}</div>
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

              <div className={`pane ${rightTopTab === 'bestiary' ? 'active' : ''}`}>
                <div className="bestiary-list">
                  {Object.keys(hero.bestiary).length === 0 ? <div className="placeholder">Ещё никто не встречен...</div> :
                    Object.values(hero.bestiary).map(entry => {
                      const template = ENEMIES[entry.enemyId]; if (!template) return null;
                      return (
                        <div key={entry.enemyId} className="bestiary-entry"
                          onClick={() => { game.openBestiaryEntry(entry.enemyId); setLeftTab('interaction'); }}>
                          <div className="name">{template.name} [Ур. {template.level}]</div>
                          <div className="kills">Убито: {entry.kills}</div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

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
                        {enemy.bodyPartDamage[bp.part] > 0 && <span style={{ color: '#f66', marginLeft: '6px' }}>[{enemy.bodyPartDamage[bp.part]} dmg]</span>}
                      </div>
                    ))}
                  </div>
                ) : <div className="placeholder">Нет врага.</div>}
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
                ) : <div className="placeholder">Нет врага.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
