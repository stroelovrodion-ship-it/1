import { useState, useEffect, useRef } from 'react';
import { useGameState, loadGame, hasSaveGame } from './engine/gameEngine';
import { MainMenu } from './MainMenu';
import { LOCATIONS } from './data/locations';
import { RUNES, SPELL_FORMS, SCROLL_EFFECTS } from './data/runes';
import { TRAJECTORIES } from './data/trajectories';
import { ITEMS } from './data/items';
import { ENEMIES } from './data/enemies';
import { SlotType, RarityType, BodyPart, ElementType, LocationId } from './types/tags';

function App() {
  const [showMainMenu, setShowMainMenu] = useState(true);
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
  const [showSaveMessage, setShowSaveMessage] = useState(false);

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

  // Обработчики главного меню
  const handleNewGame = () => {
    game.resetGame();
    setShowMainMenu(false);
  };

  const handleLoadGame = () => {
    const loadedState = loadGame();
    if (loadedState) {
      game.loadState(loadedState);
      setShowMainMenu(false);
    }
  };

  const handleSaveGame = () => {
    const success = game.saveGame();
    if (success) {
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 2000);
    }
  };

  const handleExitToMenu = () => {
    setShowMainMenu(true);
  };

  // Показываем главное меню
  if (showMainMenu) {
    return <MainMenu onNewGame={handleNewGame} onLoadGame={handleLoadGame} />;
  }

  return (
    <div className="game">
      {/* ЛЕВАЯ ПАНЕЛЬ */}
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
                  {showSpellList && battle.active && (
                    <div style={{ border: '1px solid #6cf', padding: '6px', background: '#050510', marginTop: '4px' }}>
                      <div style={{ fontSize: '8px', color: '#6cf', marginBottom: '4px' }}>Выбери заклинание:</div>
                      {hero.spellSlots.slice(0, game.getMaxSlots(hero.level)).map((slot, idx) => {
                        if (slot.mpCost === 0) return null;
                        const displayName = slot.customName || slot.name;
                        return (
                          <button key={idx} className="btn" style={{ fontSize: '7px', width: '100%', marginBottom: '2px', textAlign: 'left' }}
                            disabled={!battle.playerTurn || hero.currentMp < slot.mpCost}
                            onClick={() => {
                              if (slot.target === 'self') game.castSpell(idx);
                              else if (battle.selectedBodyPart) game.castSpell(idx, battle.selectedBodyPart);
                              setShowSpellList(false);
                            }}>
                            {slot.target === 'self' ? '✨' : '⚔️'} {displayName} [{slot.mpCost} MP]
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="battle-actions-hint">{battle.active ? `Ход: ${battle.turn} | ${battle.playerTurn ? 'Твой ход' : 'Ход врага...'}` : '// нет боя'}</div>
                </div>
              </div>
            </div>

            {/* ПУТЕШЕСТВИЕ */}
            <div className={`pane ${leftTab === 'travel' ? 'active' : ''}`}>
              <div className="location-panel">
                <div className="location-name">{location?.name} {location?.tags.type === 'city' ? '🏰' : '⚔️'}</div>
                <div className="location-desc">{location?.description}</div>
                <button className="btn" onClick={() => { setShowMap(!showMap); setSelectedMapLocation(null); }} style={{ marginBottom: '8px' }}>
                  🗺️ {showMap ? 'Скрыть карту' : 'Показать карту'}
                </button>
                {showMap && (
                  <div style={{ border: '1px solid #333', padding: '8px', marginBottom: '8px', position: 'relative', height: '400px', background: '#050510', overflow: 'hidden' }}>
                    {/* Панель управления */}
                    <div style={{ position: 'absolute', top: '4px', left: '4px', zIndex: 30, display: 'flex', gap: '4px' }}>
                      <button className="btn" style={{ fontSize: '7px', padding: '2px 6px' }} onClick={() => setShowMap(false)}>✕ Закрыть</button>
                      <button className="btn" style={{ fontSize: '7px', padding: '2px 6px' }} onClick={() => setSelectedMapLocation(currentLocation)}>📍 Моя позиция</button>
                    </div>
                    
                    {/* Легенда */}
                    <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '7px', color: '#888', background: 'rgba(10, 10, 26, 0.95)', padding: '6px', border: '1px solid #333', zIndex: 20, borderRadius: '3px' }}>
                      <div style={{ color: '#6cf', marginBottom: '3px', fontSize: '8px', fontWeight: 'bold' }}>Легенда:</div>
                      <div style={{ marginBottom: '2px' }}>🏰 <span style={{ color: '#6cf' }}>Город</span></div>
                      <div style={{ marginBottom: '2px' }}>⛺ <span style={{ color: '#6f6' }}>Лагерь</span></div>
                      <div style={{ marginBottom: '2px' }}>⚔️ <span style={{ color: '#f86' }}>Опасная</span></div>
                      <div style={{ marginBottom: '2px' }}>🏛️ <span style={{ color: '#f66' }}>Подземелье</span></div>
                      <div style={{ marginBottom: '2px' }}>🌍 <span style={{ color: '#c6f' }}>Материк</span></div>
                      <div>✨ <span style={{ color: '#fc6' }}>Особая</span></div>
                    </div>
                    
                    {/* SVG линии связей */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                      {Object.values(LOCATIONS).map(loc => loc.connectedTo.map(cId => {
                        const cLoc = LOCATIONS[cId]; if (!cLoc) return null;
                        const isCurrentRoute = (loc.id === currentLocation && cId === selectedMapLocation) || 
                                             (cId === currentLocation && loc.id === selectedMapLocation);
                        const isConnected = loc.id === currentLocation || cId === currentLocation;
                        return <line key={`${loc.id}-${cId}`} 
                          x1={`${loc.mapX}%`} y1={`${loc.mapY}%`} 
                          x2={`${cLoc.mapX}%`} y2={`${cLoc.mapY}%`} 
                          stroke={isCurrentRoute ? '#6cf' : isConnected ? '#444' : '#222'} 
                          strokeWidth={isCurrentRoute ? '2' : isConnected ? '1.5' : '1'} 
                          strokeDasharray={isCurrentRoute ? '5,5' : 'none'} />;
                      }))}
                    </svg>
                    
                    {/* Точки локаций */}
                    {Object.values(LOCATIONS).map(loc => {
                      const isCurrent = loc.id === currentLocation;
                      const isSelected = selectedMapLocation === loc.id;
                      const isAccessible = location?.connectedTo.includes(loc.id) || isCurrent;
                      
                      const getIcon = () => {
                        if (isCurrent) return '📍';
                        switch(loc.tags.type) {
                          case 'city': return '🏰';
                          case 'camp': return '⛺';
                          case 'dungeon': return '🏛️';
                          case 'continent': return '🌍';
                          case 'special': return '✨';
                          default: return '⚔️';
                        }
                      };
                      
                      return (
                        <div key={loc.id} style={{
                          position: 'absolute', left: `${loc.mapX}%`, top: `${loc.mapY}%`, transform: 'translate(-50%, -50%)',
                          fontSize: isCurrent ? '24px' : isSelected ? '18px' : '14px', 
                          cursor: isAccessible ? 'pointer' : 'not-allowed',
                          opacity: isAccessible ? 1 : 0.3, 
                          zIndex: isSelected ? 15 : isCurrent ? 10 : 5,
                          transition: 'all 0.2s ease',
                          filter: isCurrent ? 'drop-shadow(0 0 6px #ff0)' : isSelected ? 'drop-shadow(0 0 4px #6cf)' : 'none',
                        }} onClick={() => isAccessible && setSelectedMapLocation(loc.id)}
                          onMouseEnter={(e) => { if (isAccessible) e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.3)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'; }}>
                          {getIcon()}
                          <div style={{ 
                            fontSize: '6px', 
                            color: isCurrent ? '#ff0' : isSelected ? '#6cf' : '#888',
                            textAlign: 'center',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            textShadow: '0 0 2px #000',
                          }}>
                            {loc.name}
                          </div>
                        </div>
                      );
                    })}
                    {selectedMapLocation && (() => {
                      const selectedLoc = LOCATIONS[selectedMapLocation];
                      if (!selectedLoc) return null;
                      const canTravel = location?.connectedTo.includes(selectedMapLocation);
                      const isCurrent = selectedMapLocation === currentLocation;
                      
                      const getTypeName = () => {
                        switch(selectedLoc.tags.type) {
                          case 'city': return '🏰 Город';
                          case 'camp': return '⛺ Лагерь';
                          case 'dungeon': return '🏛️ Подземелье';
                          case 'continent': return '🌍 Материк';
                          case 'special': return '✨ Особая локация';
                          default: return '⚔️ Дикая местность';
                        }
                      };
                      
                      return (
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '8px', 
                          left: '8px', 
                          right: '8px', 
                          background: 'rgba(10, 10, 26, 0.98)', 
                          border: isCurrent ? '2px solid #ff0' : '2px solid #6cf', 
                          padding: '12px', 
                          fontSize: '9px', 
                          zIndex: 25,
                          borderRadius: '4px',
                          boxShadow: isCurrent ? '0 0 12px rgba(255, 255, 0, 0.3)' : '0 0 12px rgba(102, 204, 255, 0.3)',
                          maxHeight: '180px',
                          overflowY: 'auto',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '6px' }}>
                            <div>
                              <div style={{ color: isCurrent ? '#ff0' : '#6cf', fontSize: '11px', fontWeight: 'bold' }}>{selectedLoc.name}</div>
                              <div style={{ color: '#888', fontSize: '8px', marginTop: '2px' }}>{getTypeName()}</div>
                            </div>
                            <button className="btn" style={{ fontSize: '8px', padding: '3px 8px' }} onClick={() => setSelectedMapLocation(null)}>✕</button>
                          </div>
                          
                          <div style={{ color: '#e0e0e0', marginBottom: '10px', fontSize: '8px', lineHeight: '1.5', fontStyle: 'italic' }}>
                            {selectedLoc.description}
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px', fontSize: '8px' }}>
                            <div style={{ background: '#0a0a1a', padding: '6px', borderRadius: '3px', border: '1px solid #333' }}>
                              <div style={{ color: '#f66', marginBottom: '3px', fontSize: '7px' }}>⚠️ ОПАСНОСТЬ</div>
                              <div style={{ color: '#fff', fontSize: '10px' }}>
                                {'⚠️'.repeat(Math.min(selectedLoc.tags.dangerLevel, 5))}
                                <span style={{ fontSize: '8px', marginLeft: '4px' }}>({selectedLoc.tags.dangerLevel}/10)</span>
                              </div>
                            </div>
                            <div style={{ background: '#0a0a1a', padding: '6px', borderRadius: '3px', border: '1px solid #333' }}>
                              <div style={{ color: '#6cf', marginBottom: '3px', fontSize: '7px' }}>🔗 СВЯЗИ</div>
                              <div style={{ color: '#fff', fontSize: '10px' }}>{selectedLoc.connectedTo.length}</div>
                            </div>
                          </div>
                          
                          {selectedLoc.enemies.length > 0 && (
                            <div style={{ marginBottom: '8px', fontSize: '8px' }}>
                              <div style={{ color: '#f66', marginBottom: '3px', fontSize: '7px' }}>👹 ВРАГИ:</div>
                              <div style={{ color: '#e0e0e0', fontSize: '7px', lineHeight: '1.6' }}>
                                {selectedLoc.enemies.slice(0, 5).map(eId => {
                                  const enemy = ENEMIES[eId];
                                  return enemy ? enemy.name : eId;
                                }).join(', ')}
                                {selectedLoc.enemies.length > 5 && <span style={{ color: '#888' }}> +{selectedLoc.enemies.length - 5} ещё</span>}
                              </div>
                            </div>
                          )}
                          
                          {selectedLoc.resources.length > 0 && (
                            <div style={{ marginBottom: '8px', fontSize: '8px' }}>
                              <div style={{ color: '#6f6', marginBottom: '3px', fontSize: '7px' }}>📦 РЕСУРСЫ:</div>
                              <div style={{ color: '#e0e0e0', fontSize: '7px', lineHeight: '1.6' }}>
                                {selectedLoc.resources.slice(0, 5).map(rId => {
                                  const item = ITEMS[rId];
                                  return item ? item.name : rId;
                                }).join(', ')}
                                {selectedLoc.resources.length > 5 && <span style={{ color: '#888' }}> +{selectedLoc.resources.length - 5} ещё</span>}
                              </div>
                            </div>
                          )}
                          
                          <div style={{ marginTop: '10px' }}>
                            {isCurrent ? 
                              <div style={{ 
                                color: '#ff0', 
                                fontSize: '10px', 
                                textAlign: 'center', 
                                padding: '8px', 
                                background: 'rgba(255, 255, 0, 0.1)', 
                                border: '1px solid #ff0',
                                borderRadius: '3px',
                                fontWeight: 'bold',
                              }}>
                                📍 ТЫ ЗДЕСЬ
                              </div> :
                              canTravel ? 
                                <button className="btn success" style={{ 
                                  fontSize: '10px', 
                                  padding: '8px 16px', 
                                  width: '100%',
                                  fontWeight: 'bold',
                                }} onClick={() => { game.travel(selectedMapLocation); setSelectedMapLocation(null); }}>
                                  → ОТПРАВИТЬСЯ В {selectedLoc.name.toUpperCase()}
                                </button> :
                                <div style={{ 
                                  color: '#888', 
                                  fontSize: '8px', 
                                  textAlign: 'center', 
                                  padding: '8px', 
                                  background: '#0a0a0a',
                                  border: '1px solid #333',
                                  borderRadius: '3px',
                                }}>
                                  🔒 Нет прямого пути<br/>
                                  <span style={{ fontSize: '7px', color: '#666' }}>Иди через связанные локации</span>
                                </div>
                            }
                          </div>
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
                      {(location?.tags.type === 'city' || location?.tags.type === 'camp') &&
                        <button className="btn success" onClick={game.rest}>🏨 Отдохнуть ({location?.tags.type === 'city' ? 5 : 2} золота)</button>
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ЛОКАЦИИ */}
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

            {/* ВЗАИМОДЕЙСТВИЕ */}
            <div className={`pane ${leftTab === 'interaction' ? 'active' : ''}`}>
              <div className="placeholder">Выбери объект для взаимодействия.</div>
            </div>
          </div>
        </div>
        <div className="logs-footer">
          <button className="btn" onClick={handleSaveGame}>💾 Сохранить</button>
          <button className="btn danger" onClick={handleExitToMenu}>🚪 В меню</button>
        </div>
        
        {/* Сообщение о сохранении */}
        {showSaveMessage && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(10, 10, 26, 0.95)',
            border: '2px solid #6f6',
            padding: '20px 40px',
            fontSize: '12px',
            color: '#6f6',
            zIndex: 1000,
            boxShadow: '0 0 20px rgba(102, 255, 102, 0.5)',
            animation: 'fadeIn 0.3s ease',
          }}>
            ✅ Игра сохранена!
          </div>
        )}
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ */}
      <div className="right">
        <div className="right-top">
          <div className="block">
            <div className="tabs-wrap">
              <div className="tabs">
                <span className={`tab ${rightTopTab === 'inv' ? 'active' : ''}`} onClick={() => setRightTopTab('inv')}>&gt;&gt;Инвентарь</span>
                <span className={`tab ${rightTopTab === 'mana' ? 'active' : ''}`} onClick={() => setRightTopTab('mana')}>&gt;&gt;Конструктор</span>
                <span className={`tab ${rightTopTab === 'stats-hero' ? 'active' : ''}`} onClick={() => setRightTopTab('stats-hero')}>&gt;&gt;Статы</span>
              </div>
            </div>
            <div className="tab-content">
              <div className={`pane ${rightTopTab === 'inv' ? 'active' : ''}`}>
                <div className="placeholder">Инвентарь</div>
              </div>
              <div className={`pane ${rightTopTab === 'mana' ? 'active' : ''}`}>
                <div className="placeholder">Конструктор магии</div>
              </div>
              <div className={`pane ${rightTopTab === 'stats-hero' ? 'active' : ''}`}>
                <div className="placeholder">Статы</div>
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
                {enemy ? <div className="placeholder">{enemy.template.name}</div> : <div className="placeholder">Нет врага.</div>}
              </div>
              <div className={`pane ${rightBottomTab === 'stats-enemy' ? 'active' : ''}`}>
                {enemy ? <div className="placeholder">{enemy.template.name}</div> : <div className="placeholder">Нет врага.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
