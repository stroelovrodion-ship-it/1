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
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', border: '1px solid #333', fontSize: '8px', background: '#0a0a1a' }}>
                      <div style={{ flex: 1 }}>
                        <Tooltip text={r.description}>
                          <div style={{ color: r.type === 'time' ? '#6cf' : r.type === 'effect' ? '#f66' : '#c6f', marginBottom: '2px' }}>
                            {r.name}
                          </div>
                        </Tooltip>
                        <div style={{ fontSize: '7px', color: '#888' }}>
                          ОЧСМ: <span style={{ color: '#fc6' }}>{r.osmCost}</span> | Тип: {r.type === 'time' ? 'Время' : r.type === 'effect' ? 'Эффект' : 'Уникальная'}
                          {r.element && ` | Стихия: ${r.element}`}
                          {r.value > 0 && ` | Сила: ${r.value}`}
                          {r.chance && r.chance > 0 && ` | Шанс: ${r.chance}%`}
                        </div>
                      </div>
                      <button className="btn danger" style={{ fontSize: '7px', padding: '2px 6px' }} onClick={() => game.removeRuneFromBuild(idx)}>✕</button>
                    </div>
                  );
                })
              }
              <div style={{ fontSize: '8px', color: '#6cf', marginTop: '4px' }}>Доступные руны:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '120px' }}>
                {hero.collectedRunes.map(rId => {
                  const r = RUNES[rId]; if (!r) return null;
                  return (
                    <Tooltip key={rId} text={`${r.description}\n\nОЧСМ: ${r.osmCost}\nТип: ${r.type === 'time' ? 'Время' : r.type === 'effect' ? 'Эффект' : 'Уникальная'}${r.element ? `\nСтихия: ${r.element}` : ''}${r.value > 0 ? `\nСила: ${r.value}` : ''}${r.chance && r.chance > 0 ? `\nШанс: ${r.chance}%` : ''}`}>
                      <button className="btn" style={{ fontSize: '7px', textAlign: 'left', padding: '4px 6px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onClick={() => game.addRuneToBuild(rId)}>
                        <div>
                          <span style={{ color: r.type === 'time' ? '#6cf' : r.type === 'effect' ? '#f66' : '#c6f' }}>
                            [{r.type === 'time' ? 'В' : r.type === 'effect' ? 'Э' : 'У'}]
                          </span> {r.name}
                        </div>
                        <span style={{ color: '#fc6', fontSize: '7px' }}>⚡{r.osmCost}</span>
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
                {(['fire', 'water', 'earth', 'air', 'light', 'dark'] as ElementType[]).map(el => {
                  const descriptions: Record<ElementType, string> = {
                    fire: 'Огонь: прямой урон, поджог',
                    water: 'Вода: заморозка, замедление',
                    earth: 'Земля: оглушение, яд',
                    air: 'Воздух: ослепление, шок',
                    light: 'Свет: лечение, очищение',
                    dark: 'Тьма: кража жизни, проклятие',
                    none: ''
                  };
                  const power = effectiveStats[`${el}Power` as keyof typeof effectiveStats];
                  return (
                    <Tooltip key={el} text={`${descriptions[el]}\n\nТвоя сила: ${power}\nУрон: +${power * 3}\n\nСлабости/сопротивления зависят от части тела врага.`}>
                      <button className={`btn ${bs.element === el ? 'success' : ''}`}
                        style={{ fontSize: '7px', padding: '4px 8px' }}
                        onClick={() => game.setBuildState({ ...bs, element: el })}>
                        <div>{el === 'fire' ? '🔥' : el === 'water' ? '💧' : el === 'earth' ? '🪨' : el === 'air' ? '💨' : el === 'light' ? '✨' : '🌑'} {el}</div>
                        <div style={{ fontSize: '6px', color: '#fc6' }}>⚡{power}</div>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>

              <div style={{ fontSize: '8px', color: '#6cf', marginTop: '4px' }}>
                Траектория
                <Tooltip text="Влияет на точность и урон. Все доступны сразу."> ~</Tooltip>
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                {Object.values(TRAJECTORIES).map(t => (
                  <Tooltip key={t.id} text={`${t.description}\n\nМножитель урона: x${t.damageMultiplier}\nТочность: ${t.accuracyBonus > 0 ? '+' : ''}${t.accuracyBonus}%\nДоп. MP: +${t.mpCost}\n\n${t.accuracyBonus > 20 ? '✓ Высокая точность' : t.accuracyBonus < 0 ? '⚠ Низкая точность' : '→ Средняя точность'}`}>
                    <button className={`btn ${bs.trajectory === t.id ? 'success' : ''}`}
                      style={{ fontSize: '7px', padding: '4px 8px', textAlign: 'left' }}
                      onClick={() => game.setBuildState({ ...bs, trajectory: t.id })}>
                      <div>{t.name}</div>
                      <div style={{ fontSize: '6px', color: '#888' }}>x{t.damageMultiplier} | +{t.mpCost}MP</div>
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
                    <Tooltip key={fId} text={`${f.description}\n\nБазовый урон: +${f.damageBonus}\nШанс крита: +${f.critBonus}%\nБазовая стоимость: ${f.mpCost} MP\nУровень: ${f.level}/5\n\nНайди больше свитков чтобы повысить уровень формы!`}>
                      <button className={`btn ${bs.form === fId ? 'success' : ''}`}
                        style={{ fontSize: '7px', padding: '4px 8px', textAlign: 'left' }}
                        onClick={() => game.setBuildState({ ...bs, form: fId })}>
                        <div>{f.name}</div>
                        <div style={{ fontSize: '6px', color: '#888' }}>+{f.damageBonus} урон | +{f.critBonus}% крит</div>
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
                  style={{ fontSize: '7px', padding: '4px 8px' }}
                  onClick={() => game.setBuildState({ ...bs, scrollEffect: '' })}>
                  <div>Без эффекта</div>
                  <div style={{ fontSize: '6px', color: '#888' }}>Только урон</div>
                </button>
                {hero.knownScrolls.filter(s => SCROLL_EFFECTS[s]).map(sId => {
                  const s = SCROLL_EFFECTS[sId]; if (!s) return null;
                  return (
                    <Tooltip key={sId} text={`${s.description}\n\nШанс срабатывания: ${s.chance}%\nМножитель силы: x${s.power}\nУровень эффекта: ${s.level}\nСтихия: ${s.element}\n\n⚠️ Эффекты не стакаются - если уже активен, не применится!`}>
                      <button className={`btn ${bs.scrollEffect === sId ? 'success' : ''}`}
                        style={{ fontSize: '7px', padding: '4px 8px', textAlign: 'left' }}
                        onClick={() => game.setBuildState({ ...bs, scrollEffect: sId })}>
                        <div>{s.name}</div>
                        <div style={{ fontSize: '6px', color: '#888' }}>{s.chance}% | ур.{s.level}</div>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </>
          )}

          {/* Превью результата */}
          {(bs.target === 'enemy' && bs.element && bs.form) || (bs.target === 'self' && bs.runes.length > 0) ? (
            <div style={{ border: '1px solid #6cf', padding: '8px', background: '#0a0a1a', marginTop: '8px' }}>
              <div style={{ fontSize: '8px', color: '#6cf', marginBottom: '6px' }}>📊 Превью заклинания:</div>
              {bs.target === 'enemy' ? (
                <div style={{ fontSize: '7px', color: '#e0e0e0' }}>
                  {(() => {
                    const form = SPELL_FORMS[bs.form || 'bolt'];
                    const traj = TRAJECTORIES[bs.trajectory || 'direct'];
                    const elemPower = effectiveStats[`${bs.element}Power` as keyof typeof effectiveStats] as number;
                    const baseDmg = 8 + elemPower * 3 + (form?.damageBonus || 0);
                    const finalDmg = Math.floor(baseDmg * (traj?.damageMultiplier || 1));
                    const critChance = (form?.critBonus || 0);
                    const mpCost = 5 + (traj?.mpCost || 0) + ((form?.mpCost || 3) - 3);
                    
                    return (
                      <>
                        <div>Базовый урон: <span style={{ color: '#f66' }}>{finalDmg}</span></div>
                        <div>Шанс крита: <span style={{ color: '#fc6' }}>{critChance}%</span></div>
                        <div>Стоимость MP: <span style={{ color: '#c6f' }}>{mpCost}</span></div>
                        {bs.scrollEffect && SCROLL_EFFECTS[bs.scrollEffect] && (
                          <div>Доп. эффект: <span style={{ color: '#6f6' }}>{SCROLL_EFFECTS[bs.scrollEffect].name} ({SCROLL_EFFECTS[bs.scrollEffect].chance}%)</span></div>
                        )}
                        <div style={{ marginTop: '4px', color: '#888', fontSize: '6px' }}>
                          * Финальный урон зависит от слабостей/сопротивлений части тела
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ fontSize: '7px', color: '#e0e0e0' }}>
                  {(() => {
                    const totalOsm = bs.runes.reduce((sum, rId) => sum + (RUNES[rId]?.osmCost || 0), 0);
                    const mpCost = totalOsm * 3 + 3;
                    const hasHeal = bs.runes.some(rId => RUNES[rId]?.effect === 'heal');
                    const healAmount = hasHeal ? bs.runes.reduce((sum, rId) => {
                      const r = RUNES[rId];
                      return r?.effect === 'heal' ? sum + r.value + Math.floor(effectiveStats.int * 2) : sum;
                    }, 0) : 0;
                    
                    return (
                      <>
                        <div>ОЧСМ использовано: <span style={{ color: '#fc6' }}>{totalOsm}/{hero.osmMax}</span></div>
                        <div>Стоимость MP: <span style={{ color: '#c6f' }}>{mpCost}</span></div>
                        {healAmount > 0 && <div>Лечение: <span style={{ color: '#6f6' }}>+{healAmount} HP</span></div>}
                        <div style={{ marginTop: '4px', color: '#888', fontSize: '6px' }}>
                          Руны: {bs.runes.length} | Типы: {bs.runes.map(rId => RUNES[rId]?.type).join(', ')}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : null}

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
      
      const studiedCount = Object.values(entry.studiedParts).filter(p => p.discovered).length;
      const totalParts = template.bodyParts.length;
      const progressPct = Math.floor((studiedCount / totalParts) * 100);
      
      return (
        <div className="interaction" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', overflow: 'auto' }}>
          <div className="inv-title">// БИСТЕАРИЙ — ИЗУЧЕНИЕ</div>
          <div className="info-name">{template.name} [Ур. {template.level}]</div>
          <div style={{ fontSize: '9px', color: '#888', marginBottom: '4px', lineHeight: '1.6' }}>{template.description}</div>
          
          <div style={{ fontSize: '8px', color: '#6cf', borderBottom: '1px dashed #333', paddingBottom: '4px' }}>
            📊 СТАТИСТИКА
          </div>
          <div className="info-prop">Убито: <span style={{ color: '#fc6' }}>{entry.kills}</span></div>
          <div className="info-prop">Тип: <span>{template.tags.type}</span></div>
          <div className="info-prop">Элемент: <span>{template.tags.element}</span></div>
          <div className="info-prop">Поведение: <span>{template.tags.behavior}</span></div>
          
          <div className="info-block-sep">// ЧАСТИ ТЕЛА [{studiedCount}/{totalParts} изучено - {progressPct}%]</div>
          {template.bodyParts.map(bp => {
            const studied = entry.studiedParts[bp.part];
            return (
              <div key={bp.part} style={{ fontSize: '8px', padding: '6px', border: '1px solid #333', marginBottom: '3px', background: studied?.discovered ? '#0a0a1a' : 'transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#e0e0e0' }}>{bodyPartNames[bp.part]}</span>
                  {studied?.discovered && <span style={{ color: '#6f6', fontSize: '7px' }}>✓</span>}
                </div>
                {studied?.discovered ? (
                  <div style={{ marginTop: '3px', fontSize: '7px' }}>
                    {studied.weakness && <div style={{ color: '#6f6' }}>⚡ Слабость к: {studied.weakness} (x1.5 урона)</div>}
                    {studied.resistance && <div style={{ color: '#f66' }}>🛡 Сопротивление к: {studied.resistance} (x0.5 урона)</div>}
                    {!studied.weakness && !studied.resistance && <div style={{ color: '#888' }}>— Нейтрально ко всем стихиям</div>}
                  </div>
                ) : (
                  <div style={{ color: '#555', marginLeft: '0', fontSize: '7px', marginTop: '3px' }}>
                    ??? - Атакуй разными стихиями чтобы изучить
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="info-block-sep" style={{ marginTop: '4px' }}>// СОВЕТЫ</div>
          <div style={{ fontSize: '7px', color: '#888', lineHeight: '1.6' }}>
            • Атакуй части тела магией разных стихий<br/>
            • Слабости дают x1.5 урона<br/>
            • Сопротивления снижают урон до x0.5<br/>
            • Эффекты не стакаются - проверяй активные дебаффы<br/>
            • {progressPct < 100 ? `Изучи ещё ${totalParts - studiedCount} частей для полного знания` : '✓ Полностью изучен!'}
          </div>
        </div>
      );
    }

    if (game.interactionMode === 'item' && game.selectedItem && !game.selectedItem.startsWith('eq-') && !game.selectedItem.startsWith('bestiary-')) {
      const invItem = hero.inventory[parseInt(game.selectedItem)];
      if (!invItem) return <div className="placeholder">Не найдено.</div>;
      const item = invItem.item;
      
      const rarityNames = {
        common: 'Обычный',
        uncommon: 'Необычный',
        rare: 'Редкий',
        epic: 'Эпический',
        artifact: 'Артефакт'
      };
      
      return (
        <div className="interaction" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', overflow: 'auto' }}>
          <div className="inv-title">// ПРЕДМЕТ</div>
          <div className="info-name"><span className={rarityClass(item.tags.rarity)}>{item.name}</span></div>
          <div style={{ fontSize: '9px', color: '#888', lineHeight: '1.6', marginBottom: '4px' }}>{item.description}</div>
          
          <div style={{ fontSize: '8px', color: '#6cf', borderBottom: '1px dashed #333', paddingBottom: '4px' }}>
            📊 ХАРАКТЕРИСТИКИ
          </div>
          <div className="info-prop">Редкость: <span className={rarityClass(item.tags.rarity)}>{rarityNames[item.tags.rarity]}</span></div>
          <div className="info-prop">Уровень: <span>{item.tags.level}</span></div>
          {item.tags.slot && <div className="info-prop">Слот экипировки: <span>{slotNames[item.tags.slot]}</span></div>}
          {item.tags.element && item.tags.element !== 'none' && <div className="info-prop">Стихия: <span>{item.tags.element}</span></div>}
          {item.tags.material && <div className="info-prop">Материал: <span>{item.tags.material}</span></div>}
          {item.tags.consumable && <div className="info-prop">Тип: <span>{item.tags.consumable}</span></div>}
          
          {item.stats && Object.values(item.stats).some(v => v) && (
            <>
              <div className="info-block-sep">// БОНУСЫ К СТАТАМ</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {Object.entries(item.stats).map(([key, val]) => {
                  if (!val) return null;
                  const statNames: Record<string, string> = {
                    str: '💪 Сила',
                    agi: '🏃 Ловкость',
                    int: '🧠 Интеллект',
                    lck: '🍀 Удача',
                    maxHp: '❤️ Макс HP',
                    maxMp: '💎 Макс MP',
                    armor: '🛡️ Броня',
                    firePower: '🔥 Сила огня',
                    waterPower: '💧 Сила воды',
                    earthPower: '🪨 Сила земли',
                    airPower: '💨 Сила воздуха',
                    lightPower: '✨ Сила света',
                    darkPower: '🌑 Сила тьмы'
                  };
                  return (
                    <div key={key} className="info-prop" style={{ fontSize: '8px' }}>
                      {statNames[key] || key}: <span className="val-buff">+{val}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          
          {item.effectValue && (
            <>
              <div className="info-block-sep">// ЭФФЕКТ</div>
              <div className="info-prop">
                {item.tags.effect === 'heal' ? 'Восстанавливает' : 'Урон'}: <span className="val-buff">{item.effectValue}</span>
                {item.tags.effect === 'heal' && <span style={{ color: '#888', fontSize: '7px' }}> {item.id.includes('hp') ? 'HP' : 'MP'}</span>}
              </div>
            </>
          )}
          
          <div className="info-block-sep">// ИНФОРМАЦИЯ</div>
          <div className="info-prop">В наличии: <span style={{ color: '#fc6' }}>x{invItem.count}</span></div>
          <div className="info-prop">Цена: <span style={{ color: '#fc6' }}>{item.value} золота</span></div>
          
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            {item.tags.slot && <button className="btn" onClick={() => game.equipItem(parseInt(game.selectedItem!))}>🎽 Надеть</button>}
            {item.tags.consumable && <button className="btn success" onClick={() => game.useItem(parseInt(game.selectedItem!))}>🧪 Использовать</button>}
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
                  <div className="fade-in" style={{ border: '1px solid #333', padding: '8px', marginBottom: '8px', position: 'relative', height: '280px', background: '#050510' }}>
                    {/* Легенда карты */}
                    <div style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '7px', color: '#888', background: '#0a0a1a', padding: '4px', border: '1px solid #333', zIndex: 10 }}>
                      <div style={{ color: '#6cf', marginBottom: '2px' }}>Легенда:</div>
                      <div>🏰 Город</div>
                      <div>⛺ Лагерь</div>
                      <div>⚔️ Опасная зона</div>
                      <div>🏛️ Подземелье</div>
                      <div>🌍 Материк</div>
                      <div>✨ Особая</div>
                    </div>
                    
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                      {Object.values(LOCATIONS).map(loc => loc.connectedTo.map(cId => {
                        const cLoc = LOCATIONS[cId]; if (!cLoc) return null;
                        const isCurrentRoute = (loc.id === currentLocation && cId === selectedMapLocation) || 
                                             (cId === currentLocation && loc.id === selectedMapLocation);
                        return <line key={`${loc.id}-${cId}`} x1={`${loc.mapX}%`} y1={`${loc.mapY}%`} x2={`${cLoc.mapX}%`} y2={`${cLoc.mapY}%`} 
                          stroke={isCurrentRoute ? '#6cf' : '#222'} strokeWidth={isCurrentRoute ? '2' : '1'} 
                          strokeDasharray={isCurrentRoute ? '5,5' : 'none'} />;
                      }))}
                    </svg>
                    
                    {Object.values(LOCATIONS).map(loc => {
                      const getIcon = () => {
                        if (loc.id === currentLocation) return '📍';
                        switch(loc.tags.type) {
                          case 'city': return '🏰';
                          case 'camp': return '⛺';
                          case 'dungeon': return '🏛️';
                          case 'continent': return '🌍';
                          case 'special': return '✨';
                          default: return '⚔️';
                        }
                      };
                      
                      const getColor = () => {
                        if (loc.id === currentLocation) return '#ff0';
                        switch(loc.tags.type) {
                          case 'city': return '#6cf';
                          case 'camp': return '#6f6';
                          case 'dungeon': return '#f66';
                          case 'continent': return '#c6f';
                          case 'special': return '#fc6';
                          default: return '#f86';
                        }
                      };
                      
                      const isAccessible = location?.connectedTo.includes(loc.id) || loc.id === currentLocation;
                      
                      return (
                        <div key={loc.id} style={{
                          position: 'absolute', left: `${loc.mapX}%`, top: `${loc.mapY}%`, transform: 'translate(-50%, -50%)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                          cursor: 'pointer', transition: 'all 0.2s',
                          opacity: isAccessible ? 1 : 0.4,
                        }} onClick={() => setSelectedMapLocation(loc.id)}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.3)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'; }}>
                          <div style={{ fontSize: loc.id === currentLocation ? '16px' : '12px', filter: loc.id === currentLocation ? 'drop-shadow(0 0 4px #ff0)' : 'none' }}>
                            {getIcon()}
                          </div>
                          <div style={{ 
                            fontSize: '6px', color: getColor(), 
                            textShadow: loc.id === currentLocation ? '0 0 4px #ff0' : 'none',
                            whiteSpace: 'nowrap',
                            background: '#0a0a1a',
                            padding: '1px 3px',
                            borderRadius: '2px',
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
                        <div className="fade-in" style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', background: '#0a0a1a', border: '1px solid #6cf', padding: '10px', fontSize: '9px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ color: '#6cf', fontSize: '10px' }}>{selectedLoc.name}</span>
                            <button className="btn" style={{ fontSize: '7px', padding: '2px 6px' }} onClick={() => setSelectedMapLocation(null)}>✕ Назад</button>
                          </div>
                          <div style={{ color: '#888', fontSize: '8px', marginBottom: '4px' }}>{getTypeName()}</div>
                          <div style={{ color: '#e0e0e0', marginBottom: '8px', fontSize: '8px', lineHeight: '1.4' }}>{selectedLoc.description}</div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px', fontSize: '8px' }}>
                            <div>
                              <div style={{ color: '#6cf', marginBottom: '2px' }}>⚠️ Опасность:</div>
                              <div style={{ color: '#f66' }}>{'⚠️'.repeat(selectedLoc.tags.dangerLevel)} ({selectedLoc.tags.dangerLevel}/10)</div>
                            </div>
                            <div>
                              <div style={{ color: '#6cf', marginBottom: '2px' }}>🔗 Связи:</div>
                              <div style={{ color: '#e0e0e0' }}>{selectedLoc.connectedTo.length} локации</div>
                            </div>
                          </div>
                          
                          {selectedLoc.enemies.length > 0 && (
                            <div style={{ marginBottom: '6px', fontSize: '8px' }}>
                              <div style={{ color: '#f66', marginBottom: '2px' }}>👹 Враги:</div>
                              <div style={{ color: '#e0e0e0' }}>{selectedLoc.enemies.map(eId => ENEMIES[eId]?.name).join(', ')}</div>
                            </div>
                          )}
                          
                          {selectedLoc.resources.length > 0 && (
                            <div style={{ marginBottom: '6px', fontSize: '8px' }}>
                              <div style={{ color: '#6f6', marginBottom: '2px' }}>📦 Ресурсы:</div>
                              <div style={{ color: '#e0e0e0' }}>{selectedLoc.resources.map(rId => ITEMS[rId]?.name).join(', ')}</div>
                            </div>
                          )}
                          
                          {selectedMapLocation === currentLocation ? 
                            <div style={{ color: '#ff0', fontSize: '9px', textAlign: 'center', padding: '4px', background: '#1a1a0a', border: '1px solid #ff0' }}>
                              📍 Ты здесь
                            </div> :
                            canTravel ? 
                              <button className="btn success" style={{ fontSize: '9px', padding: '6px 12px', width: '100%' }} 
                                onClick={() => { game.travel(selectedMapLocation); setSelectedMapLocation(null); }}>
                                → Отправиться в {selectedLoc.name}
                              </button> :
                              <div style={{ color: '#555', fontSize: '8px', textAlign: 'center', padding: '4px', background: '#0a0a0a' }}>
                                🔒 Нет прямого пути (нужно идти через связанные локации)
                              </div>
                          }
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
                        <button className="btn success" onClick={game.rest}>
                          🏨 Отдохнуть ({location?.tags.type === 'city' ? 5 : 2} золота)
                        </button>
                      }
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
                  <div className="hero-stats-title">// СТАТЫ ПЕРСОНАЖА</div>
                  <div className="hero-stats-name">{hero.name} [Ур. {hero.level}]</div>
                  
                  <div style={{ fontSize: '8px', color: '#6cf', marginBottom: '6px' }}>
                    📊 ПРОГРЕСС
                  </div>
                  <div style={{ fontSize: '8px', marginBottom: '8px' }}>
                    <div className="stat-row">
                      <span className="stat-key">Опыт:</span>
                      <span className="stat-total">{hero.xp} / {hero.xpToNext}</span>
                    </div>
                    <div style={{ height: '4px', background: '#1a1a1a', marginTop: '2px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(hero.xp / hero.xpToNext) * 100}%`, background: 'linear-gradient(90deg, #6cf, #c6f)' }} />
                    </div>
                    <div className="stat-row" style={{ marginTop: '4px' }}>
                      <span className="stat-key">Золото:</span>
                      <span style={{ color: '#fc6' }}>{hero.gold}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-key">ОЧСМ:</span>
                      <span style={{ color: '#c6f' }}>{hero.osmMax}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-key">Слоты магии:</span>
                      <span style={{ color: '#6cf' }}>{game.getMaxSlots(hero.level)} / 7</span>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '8px', color: '#6cf', borderBottom: '1px dashed #333', paddingBottom: '4px', marginBottom: '6px' }}>
                    ❤️ ЖИЗНЕННЫЕ ПОКАЗАТЕЛИ
                  </div>
                  <div className="hero-stats-list">
                    <div className="stat-row">
                      <Tooltip text="Здоровье. Достигнув 0, ты проиграешь.">
                        <span className="stat-key">❤️ HP</span>
                      </Tooltip>
                      <span className="stat-total">{hero.currentHp} / {effectiveStats.maxHp}</span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Мана. Тратится на заклинания.">
                        <span className="stat-key">💎 MP</span>
                      </Tooltip>
                      <span className="stat-total">{hero.currentMp} / {effectiveStats.maxMp}</span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Регенерация HP за ход. Восстанавливается вне боя.">
                        <span className="stat-key">💚 Реген. HP</span>
                      </Tooltip>
                      <span className="stat-total" style={{ color: '#6f6' }}>+{effectiveStats.hpRegen}/ход</span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Регенерация MP за ход. Восстанавливается вне боя.">
                        <span className="stat-key">💙 Реген. MP</span>
                      </Tooltip>
                      <span className="stat-total" style={{ color: '#6cf' }}>+{effectiveStats.mpRegen}/ход</span>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '8px', color: '#6cf', borderBottom: '1px dashed #333', paddingBottom: '4px', marginTop: '8px', marginBottom: '6px' }}>
                    💪 БАЗОВЫЕ ХАРАКТЕРИСТИКИ
                  </div>
                  <div className="hero-stats-list">
                    <div className="stat-row">
                      <Tooltip text="Сила увеличивает физический урон.">
                        <span className="stat-key">💪 Сила</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.str}</span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Ловкость даёт шанс уклонения и влияет на побег.">
                        <span className="stat-key">🏃 Ловкость</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.agi}</span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Интеллект усиливает лечение и магические эффекты.">
                        <span className="stat-key">🧠 Интеллект</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.int}</span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Удача увеличивает шанс крита.">
                        <span className="stat-key">🍀 Удача</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.lck}</span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Броня снижает получаемый урон.">
                        <span className="stat-key">🛡️ Броня</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.armor}</span>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '8px', color: '#6cf', borderBottom: '1px dashed #333', paddingBottom: '4px', marginTop: '8px', marginBottom: '6px' }}>
                    🔮 СИЛА СТИХИЙ
                  </div>
                  <div style={{ fontSize: '7px', color: '#888', marginBottom: '6px' }}>
                    Влияет на урон магии соответствующей стихии (+3 урона за каждую единицу)
                  </div>
                  <div className="hero-stats-list">
                    <div className="stat-row">
                      <Tooltip text="Огонь: прямой урон, поджог. Слабость: вода.">
                        <span className="stat-key">🔥 Огонь</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.firePower} <span style={{ color: '#888', fontSize: '7px' }}>(+{effectiveStats.firePower * 3} урона)</span></span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Вода: заморозка, замедление. Слабость: огонь.">
                        <span className="stat-key">💧 Вода</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.waterPower} <span style={{ color: '#888', fontSize: '7px' }}>(+{effectiveStats.waterPower * 3} урона)</span></span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Земля: оглушение, яд. Слабость: воздух.">
                        <span className="stat-key">🪨 Земля</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.earthPower} <span style={{ color: '#888', fontSize: '7px' }}>(+{effectiveStats.earthPower * 3} урона)</span></span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Воздух: ослепление, шок. Слабость: земля.">
                        <span className="stat-key">💨 Воздух</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.airPower} <span style={{ color: '#888', fontSize: '7px' }}>(+{effectiveStats.airPower * 3} урона)</span></span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Свет: лечение, очищение. Слабость: тьма.">
                        <span className="stat-key">✨ Свет</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.lightPower} <span style={{ color: '#888', fontSize: '7px' }}>(+{effectiveStats.lightPower * 3} урона)</span></span>
                    </div>
                    <div className="stat-row">
                      <Tooltip text="Тьма: кража жизни, проклятие. Слабость: свет.">
                        <span className="stat-key">🌑 Тьма</span>
                      </Tooltip>
                      <span className="stat-total">{effectiveStats.darkPower} <span style={{ color: '#888', fontSize: '7px' }}>(+{effectiveStats.darkPower * 3} урона)</span></span>
                    </div>
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
