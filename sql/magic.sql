-- ═══════════════════════════════════════════════════════════
-- МАГИЯ: РУНЫ, ФОРМЫ, ТРАЕКТОРИИ, ЭФФЕКТЫ, ЗАКЛИНАНИЯ
-- ═══════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────
-- РУНЫ (для слотов "На себя")
-- Типы: time (время), effect (эффект), unique (уникальная)
-- ─────────────────────────────────────────────────────────
CREATE TABLE runes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('time', 'effect', 'unique') NOT NULL,
    osm_cost INT DEFAULT 1,
    element VARCHAR(20),
    effect VARCHAR(30),
    value INT DEFAULT 0,
    duration INT DEFAULT 0,
    chance INT DEFAULT 0,
    level INT DEFAULT 1,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'artifact') DEFAULT 'common'
);

INSERT INTO runes VALUES
-- РУНЫ ВРЕМЕНИ
('time_instant', 'Руна Мгновения', 'Мгновенное срабатывание.', 'time', 1, NULL, NULL, 0, 0, 0, 1, 'common'),
('time_delayed', 'Руна Задержки', 'Эффект через 1 ход. Враг не ожидает.', 'time', 1, NULL, NULL, 0, 1, 0, 2, 'common'),
('time_persistent', 'Руна Постоянства', 'Эффект действует 3 хода.', 'time', 2, NULL, NULL, 0, 3, 0, 3, 'uncommon'),
('time_recurring', 'Руна Повторения', 'Повторяется 5 ходов. Изматывает врага.', 'time', 3, NULL, NULL, 0, 5, 0, 5, 'rare'),
('time_chain', 'Руна Цепи', 'Эффект переходит на соседние части тела.', 'time', 3, NULL, NULL, 0, 2, 0, 7, 'rare'),
('time_echo', 'Руна Эха', 'Эффект повторяется с 50% силы.', 'time', 4, NULL, NULL, 0, 3, 0, 9, 'epic'),

-- РУНЫ ЭФФЕКТА (ОГОНЬ)
('effect_fireball', 'Руна Огня', 'Огненный урон. Шанс поджечь (30%).', 'effect', 2, 'fire', 'burn', 10, 0, 30, 1, 'common'),
('effect_inferno', 'Руна Инферно', 'Мощный огонь. Шанс поджечь (50%).', 'effect', 3, 'fire', 'burn', 18, 0, 50, 4, 'rare'),
('effect_phoenix', 'Руна Феникса', 'Возрождение из пепла. Огненный взрыв.', 'effect', 5, 'fire', 'burn', 30, 0, 70, 8, 'epic'),

-- РУНЫ ЭФФЕКТА (ВОДА)
('effect_frost', 'Руна Мороза', 'Водный урон. Шанс заморозить (25%).', 'effect', 2, 'water', 'freeze', 9, 0, 25, 1, 'common'),
('effect_blizzard', 'Руна Метели', 'Ледяная буря. Шанс заморозить (45%).', 'effect', 3, 'water', 'freeze', 16, 0, 45, 4, 'rare'),
('effect_abyss', 'Руна Бездны', 'Давление глубин. Замораживает навсегда (шанс 10%).', 'effect', 5, 'water', 'freeze', 28, 0, 10, 8, 'epic'),

-- РУНЫ ЭФФЕКТА (ЗЕМЛЯ)
('effect_quake', 'Руна Землетрясения', 'Земляной урон. Шанс оглушить (20%).', 'effect', 2, 'earth', 'stun', 11, 0, 20, 1, 'common'),
('effect_mountain', 'Руна Горы', 'Сила гор. Шанс оглушить (40%).', 'effect', 3, 'earth', 'stun', 20, 0, 40, 4, 'rare'),
('effect_golem', 'Руна Голема', 'Каменная кожа на 3 хода.', 'effect', 4, 'earth', 'shield', 25, 3, 0, 6, 'rare'),

-- РУНЫ ЭФФЕКТА (ВОЗДУХ)
('effect_gale', 'Руна Вихря', 'Воздушный урон. Шанс ослепить (35%).', 'effect', 2, 'air', 'blind', 8, 0, 35, 1, 'common'),
('effect_storm', 'Руна Бури', 'Грозовой удар. Шанс парализовать (30%).', 'effect', 3, 'air', 'shock', 15, 0, 30, 4, 'rare'),
('effect_tornado', 'Руна Торнадо', 'Бьёт по всем частям тела.', 'effect', 4, 'air', 'blind', 12, 0, 50, 7, 'epic'),

-- РУНЫ ЭФФЕКТА (СВЕТ)
('effect_heal', 'Руна Исцеления', 'Восстанавливает HP.', 'effect', 2, 'light', 'heal', 15, 0, 0, 1, 'common'),
('effect_purify', 'Руна Очищения', 'Снимает дебаффы + лечит.', 'effect', 3, 'light', 'heal', 20, 0, 0, 3, 'uncommon'),
('effect_resurrect', 'Руна Воскрешения', 'Полное восстановление (1 раз в бой).', 'effect', 6, 'light', 'heal', 100, 0, 0, 10, 'artifact'),

-- РУНЫ ЭФФЕКТА (ТЬМА)
('effect_drain', 'Руна Истощения', 'Крадёт HP врага.', 'effect', 2, 'dark', 'drain', 12, 0, 0, 1, 'common'),
('effect_curse', 'Руна Проклятия', 'Снижает защиту врага.', 'effect', 3, 'dark', 'curse', 0, 3, 60, 3, 'uncommon'),
('effect_soul', 'Руна Души', 'Крадёт MP врага.', 'effect', 4, 'dark', 'drain', 8, 0, 40, 6, 'rare'),

-- УНИКАЛЬНЫЕ РУНЫ
('unique_shield', 'Руна Щита', 'Создаёт магический барьер (15 HP).', 'unique', 2, NULL, 'shield', 15, 0, 0, 1, 'common'),
('unique_haste', 'Руна Скорости', 'Увеличивает уклонение на 3 хода.', 'unique', 2, NULL, 'buff', 3, 3, 0, 2, 'uncommon'),
('unique_drain', 'Руна Поглощения', 'Крадёт HP. Восстанавливает свои.', 'unique', 3, 'dark', 'drain', 10, 0, 0, 3, 'uncommon'),
('unique_nova', 'Руна Взрыва', 'Мощный урон по всем частям (20).', 'unique', 4, NULL, 'damage', 20, 0, 0, 5, 'rare'),
('unique_meditation', 'Руна Медитации', 'Восстанавливает 10 MP.', 'unique', 2, NULL, 'heal_mp', 10, 0, 0, 2, 'uncommon'),
('unique_berserk', 'Руна Берсерка', '+50% урона, -20% защиты на 3 хода.', 'unique', 3, NULL, 'berserk', 0, 3, 0, 4, 'rare'),
('unique_time_stop', 'Руна Остановки Времени', 'Дополнительный ход.', 'unique', 6, NULL, 'extra_turn', 0, 0, 0, 10, 'artifact');


-- ─────────────────────────────────────────────────────────
-- ТРАЕКТОРИИ (для слотов "На врага")
-- ─────────────────────────────────────────────────────────
CREATE TABLE trajectories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    damage_multiplier DECIMAL(3,2) DEFAULT 1.0,
    accuracy_bonus INT DEFAULT 0,
    mp_cost INT DEFAULT 0,
    unlock_level INT DEFAULT 1,
    rarity ENUM('common', 'uncommon', 'rare', 'epic') DEFAULT 'common'
);

INSERT INTO trajectories VALUES
('direct', 'Прямая', 'Прямой полёт. Точная, но предсказуемая.', 1.0, 10, 0, 1, 'common'),
('arc', 'Дуга', 'Летит по дуге. Сложнее уклониться.', 1.1, 5, 1, 1, 'common'),
('homing', 'Самонаведение', 'Следует за целью. Не промахнётся.', 0.9, 30, 2, 3, 'uncommon'),
('spread', 'Рассеивание', 'Несколько снарядов. Бьёт по всем частям.', 0.6, 0, 3, 5, 'rare'),
('pierce', 'Пронзающая', 'Проходит насквозь. Игнорирует часть брони.', 1.2, -5, 2, 3, 'uncommon'),
('ricochet', 'Рикошет', 'Отскакивает между частями тела.', 0.8, 15, 3, 7, 'rare'),
('vortex', 'Вихрь', 'Закручивается вокруг цели.', 1.3, 0, 4, 9, 'epic');


-- ─────────────────────────────────────────────────────────
-- ФОРМЫ ЗАКЛИНАНИЙ (изучаются из свитков, имеют уровни)
-- ─────────────────────────────────────────────────────────
CREATE TABLE spell_forms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_damage_bonus INT DEFAULT 0,
    base_crit_bonus INT DEFAULT 0,
    base_mp_cost INT DEFAULT 3,
    max_level INT DEFAULT 5,
    scrolls_per_level INT DEFAULT 1,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'artifact') DEFAULT 'common'
);

INSERT INTO spell_forms VALUES
('bolt', 'Снаряд', 'Базовая форма. Прямой урон.', 3, 5, 3, 5, 1, 'common'),
('arrow', 'Стрела', 'Быстрая форма. Повышенный крит.', 2, 20, 4, 5, 1, 'common'),
('sphere', 'Сфера', 'Медленная, но мощная.', 6, 0, 5, 5, 2, 'uncommon'),
('wave', 'Волна', 'Бьёт по всем частям тела.', 1, 5, 6, 5, 2, 'uncommon'),
('beam', 'Луч', 'Концентрированный урон в одну точку.', 8, 10, 7, 5, 3, 'rare'),
('nova', 'Нова', 'Взрыв вокруг. Максимальный урон.', 12, 0, 10, 5, 3, 'rare'),
('lance', 'Копьё', 'Пронзает все части тела насквозь.', 10, 15, 8, 5, 4, 'epic'),
('meteor', 'Метеор', 'Падает с неба. Огромный урон по торсу.', 20, 5, 15, 3, 5, 'epic'),
('whisper', 'Шёпот', 'Невидимая атака. 100% точность.', 0, 30, 6, 5, 3, 'rare');


-- ─────────────────────────────────────────────────────────
-- УРОВНИ ФОРМ (бонусы за прокачку)
-- ─────────────────────────────────────────────────────────
CREATE TABLE spell_form_levels (
    form_id VARCHAR(50),
    level INT,
    damage_bonus INT,
    crit_bonus INT,
    mp_cost INT,
    special_effect TEXT,
    PRIMARY KEY (form_id, level),
    FOREIGN KEY (form_id) REFERENCES spell_forms(id)
);

INSERT INTO spell_form_levels VALUES
-- БОЛТ
('bolt', 1, 3, 5, 3, NULL),
('bolt', 2, 5, 8, 4, '+10% урона'),
('bolt', 3, 8, 10, 5, 'Шанс двойного выстрела 15%'),
('bolt', 4, 12, 12, 6, 'Игнорирует 20% брони'),
('bolt', 5, 18, 15, 7, 'Шанс тройного выстрела 10%'),
-- СТРЕЛА
('arrow', 1, 2, 20, 4, NULL),
('arrow', 2, 3, 25, 4, '+5% крита'),
('arrow', 3, 5, 30, 5, 'Шанс пронзить насквозь 20%'),
('arrow', 4, 7, 35, 6, 'Крит = x3 урона'),
('arrow', 5, 10, 40, 7, 'Стрела возвращается (2-й удар 50%)'),
-- СФЕРА
('sphere', 1, 6, 0, 5, NULL),
('sphere', 2, 9, 0, 5, '+15% урона'),
('sphere', 3, 13, 5, 6, 'Взрыв по соседним частям 30%'),
('sphere', 4, 18, 5, 7, 'Шанс оглушить 25%'),
('sphere', 5, 25, 10, 8, 'Взрыв по всем частям'),
-- ВОЛНА
('wave', 1, 1, 5, 6, NULL),
('wave', 2, 2, 8, 6, '+100% урона по всем частям'),
('wave', 3, 4, 10, 7, 'Шанс сбить с ног 30%'),
('wave', 4, 6, 12, 8, 'Замедление на 2 хода'),
('wave', 5, 10, 15, 9, 'Волна возвращается (2-й проход)'),
-- ЛУЧ
('beam', 1, 8, 10, 7, NULL),
('beam', 2, 12, 12, 7, '+20% урона'),
('beam', 3, 16, 15, 8, 'Прожигает броню -50%'),
('beam', 4, 22, 18, 9, 'Шанс парализовать 20%'),
('beam', 5, 30, 20, 10, 'Луч разделяется на 3'),
-- НОВА
('nova', 1, 12, 0, 10, NULL),
('nova', 2, 18, 0, 10, '+50% урона'),
('nova', 3, 25, 5, 11, 'Шанс поджечь всех 40%'),
('nova', 4, 35, 5, 12, 'Оглушение на 1 ход'),
('nova', 5, 50, 10, 15, 'Апокалипсис: x2 урона, но -30% HP тебе');


-- ─────────────────────────────────────────────────────────
-- ДОП. ЭФФЕКТЫ (из свитков)
-- ─────────────────────────────────────────────────────────
CREATE TABLE scroll_effects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    element VARCHAR(20),
    effect_type VARCHAR(30),
    chance INT DEFAULT 0,
    power_multiplier DECIMAL(3,2) DEFAULT 1.0,
    duration INT DEFAULT 0,
    level INT DEFAULT 1,
    max_level INT DEFAULT 3,
    rarity ENUM('common', 'uncommon', 'rare', 'epic') DEFAULT 'common',
    stackable BOOLEAN DEFAULT FALSE
);

INSERT INTO scroll_effects VALUES
-- ОГНЕННЫЕ
('burn', 'Горение', 'Враг горит. Урон = сила огня × 1 за ход.', 'fire', 'burn', 50, 1.0, 3, 1, 3, 'common', FALSE),
('melt', 'Плавление', 'Снижает броню врага на 30%.', 'fire', 'melt', 40, 0.0, 3, 1, 3, 'uncommon', FALSE),
('explosion', 'Взрыв', 'Мгновенный урон огнём x2.', 'fire', 'explosion', 25, 2.0, 0, 1, 3, 'rare', FALSE),

-- ВОДЯНЫЕ
('frost', 'Обморожение', 'Замедляет. -2 к урону врага.', 'water', 'freeze', 40, 0.5, 2, 1, 3, 'common', FALSE),
('flood', 'Потоп', 'Затапливает. Шанс утопить 15%.', 'water', 'flood', 15, 0.0, 0, 1, 3, 'rare', FALSE),
('ice_prison', 'Ледяная тюрьма', 'Полная заморозка на 1 ход.', 'water', 'freeze', 20, 0.0, 1, 1, 3, 'epic', FALSE),

-- ЗЕМЛЯНЫЕ
('poison', 'Отравление', 'Урон землёй за каждый ход.', 'earth', 'poison', 45, 0.8, 4, 1, 3, 'common', FALSE),
('entangle', 'Опутывание', 'Снижает скорость. -3 уклонения.', 'earth', 'entangle', 50, 0.0, 3, 1, 3, 'uncommon', FALSE),
('petrify', 'Окаменение', 'Шанс превратить в камень 10%.', 'earth', 'petrify', 10, 0.0, 2, 1, 3, 'epic', FALSE),

-- ВОЗДУШНЫЕ
('shock', 'Шок', 'Парализует на 1 ход (шанс 30%).', 'air', 'shock', 30, 0.0, 1, 1, 3, 'uncommon', FALSE),
('wind_cut', 'Ветрорез', 'Дополнительный урон воздухом.', 'air', 'damage', 60, 0.5, 0, 1, 3, 'common', FALSE),
('vacuum', 'Вакуум', 'Лишает врага воздуха. -50% урона.', 'air', 'weaken', 35, 0.0, 2, 1, 3, 'rare', FALSE),

-- СВЕТЛЫЕ
('blind', 'Ослепление', 'Враг промахивается (шанс 50%).', 'light', 'blind', 50, 0.0, 2, 1, 3, 'uncommon', FALSE),
('holy', 'Святой удар', 'Доп. урон по нежити x2.', 'light', 'holy', 70, 1.5, 0, 1, 3, 'rare', FALSE),
('purify_aura', 'Священная аура', 'Лечит 5 HP за ход.', 'light', 'regen', 100, 5.0, 3, 1, 3, 'rare', FALSE),

-- ТЁМНЫЕ
('curse', 'Проклятие', 'Снижает защиту врага.', 'dark', 'curse', 40, 2.0, 3, 1, 3, 'uncommon', FALSE),
('life_steal', 'Кража жизни', 'Крадёт 30% урона как HP.', 'dark', 'lifesteal', 60, 0.3, 0, 1, 3, 'rare', FALSE),
('soul_rend', 'Разрыв души', 'Мгновенный урон = 20% макс HP врага.', 'dark', 'percent_damage', 20, 0.2, 0, 1, 3, 'epic', FALSE);


-- ─────────────────────────────────────────────────────────
-- СИНЕРГИИ (комбинации элементов + форм)
-- ─────────────────────────────────────────────────────────
CREATE TABLE synergies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    element VARCHAR(20),
    form VARCHAR(50),
    bonus_damage_pct INT DEFAULT 0,
    bonus_crit_pct INT DEFAULT 0,
    special_effect TEXT,
    unlock_uses INT DEFAULT 5
);

INSERT INTO synergies VALUES
('burning_arrow', 'Горящая стрела', 'Стрела поджигает при попадании.', 'fire', 'arrow', 15, 5, 'Поджог на 2 хода', 5),
('frost_lance', 'Ледяное копьё', 'Пронзает и замораживает.', 'water', 'lance', 10, 10, 'Заморозка на 1 ход', 5),
('earthquake_nova', 'Землетрясение', 'Трясёт всех врагов.', 'earth', 'nova', 25, 0, 'Оглушение 1 ход', 8),
('storm_arrow', 'Штормовая стрела', 'Стрела с вихрем.', 'air', 'arrow', 20, 15, 'Шанс парализовать 25%', 5),
('holy_beam', 'Святой луч', 'Очищающий луч света.', 'light', 'beam', 30, 20, 'x2 урона по нежити', 10),
('dark_drain', 'Тёмный поток', 'Высасывает жизнь потоком.', 'dark', 'wave', 10, 0, 'Кража 50% урона как HP', 5),
('inferno_sphere', 'Сфера Инферно', 'Огненная сфера взрывается.', 'fire', 'sphere', 20, 0, 'Поджог всех частей', 8),
('blizzard_wave', 'Метель', 'Ледяная волна.', 'water', 'wave', 15, 5, 'Замедление всех на 2 хода', 8),
('stone_bullet', 'Каменный снаряд', 'Каменный снаряд с рикошетом.', 'earth', 'bolt', 10, 10, 'Игнорирует 30% брони', 5),
('wind_whisper', 'Шёпот ветра', 'Невидимая атака.', 'air', 'whisper', 5, 25, '100% точность', 3),
('sun_strike', 'Солнечный удар', 'Луч солнца с неба.', 'light', 'meteor', 40, 10, 'Ослепление на 2 хода', 15),
('void_bolt', 'Пустотный снаряд', 'Снаряд из пустоты.', 'dark', 'bolt', 15, 15, 'Игнорирует всю броню', 10);


-- ─────────────────────────────────────────────────────────
-- ЗАКЛИНАНИЯ ИГРОКА (сохранённые слоты)
-- ─────────────────────────────────────────────────────────
CREATE TABLE player_spells (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_index INT NOT NULL,
    custom_name VARCHAR(100),
    target ENUM('self', 'enemy') NOT NULL,
    element VARCHAR(20),
    trajectory VARCHAR(50),
    form VARCHAR(50),
    form_level INT DEFAULT 1,
    scroll_effect VARCHAR(50),
    mp_cost INT DEFAULT 0,
    total_casts INT DEFAULT 0,
    mastery_level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Уровни мастерства заклинания
CREATE TABLE spell_mastery (
    level INT PRIMARY KEY,
    casts_required INT,
    damage_bonus_pct INT,
    mp_discount_pct INT,
    special_perk TEXT
);

INSERT INTO spell_mastery VALUES
(1, 0, 0, 0, NULL),
(2, 10, 10, 5, '+10% урона, -5% MP'),
(3, 25, 20, 10, '+20% урона, -10% MP'),
(4, 50, 35, 15, '+35% урона, -15% MP, шанс крита +10%'),
(5, 100, 50, 20, '+50% урона, -20% MP, шанс крита +20%'),
(6, 200, 75, 25, '+75% урона, -25% MP, крит x3'),
(7, 500, 100, 30, 'МАСТЕР: +100% урона, -30% MP, крит x4');
