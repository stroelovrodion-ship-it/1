-- ═══════════════════════════════════════════════════════════
-- ПРЕДМЕТЫ, РЕСУРСЫ, БОНУСЫ
-- ═══════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────
-- ПРЕДМЕТЫ (экипировка, расходники, материалы)
-- ─────────────────────────────────────────────────────────
CREATE TABLE items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slot ENUM('head', 'body', 'boots', 'weapon', 'extra', 'artifact', 'ring', 'necklace'),
    material VARCHAR(30),
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'artifact') DEFAULT 'common',
    element VARCHAR(20),
    consumable_type VARCHAR(20),
    effect VARCHAR(20),
    level INT DEFAULT 1,
    value INT DEFAULT 0,
    stackable BOOLEAN DEFAULT FALSE,
    max_stack INT DEFAULT 1,
    -- Стат-бонусы
    str_bonus INT DEFAULT 0,
    agi_bonus INT DEFAULT 0,
    int_bonus INT DEFAULT 0,
    lck_bonus INT DEFAULT 0,
    max_hp_bonus INT DEFAULT 0,
    max_mp_bonus INT DEFAULT 0,
    armor_bonus INT DEFAULT 0,
    fire_power INT DEFAULT 0,
    water_power INT DEFAULT 0,
    earth_power INT DEFAULT 0,
    air_power INT DEFAULT 0,
    light_power INT DEFAULT 0,
    dark_power INT DEFAULT 0,
    -- Эффект
    effect_value INT DEFAULT 0,
    effect_duration INT DEFAULT 0
);

INSERT INTO items VALUES
-- ─── ОРУЖИЕ ───
('rusty_sword', 'Ржавый меч', 'Старый меч. Ещё режет.', 'weapon', 'metal', 'common', 'none', NULL, NULL, 1, 10, FALSE, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
('crystal_staff', 'Кристальный посох', 'Посох из живого кристалла.', 'weapon', 'crystal', 'uncommon', 'water', NULL, NULL, 3, 50, FALSE, 1, 0, 0, 3, 0, 0, 5, 0, 2, 0, 0, 0, 0, 0, 0, 0),
('shadow_blade', 'Клинок теней', 'Лезвие из чистой тьмы.', 'weapon', 'essence', 'rare', 'dark', NULL, NULL, 5, 150, FALSE, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0),
('bone_dagger', 'Костяной кинжал', 'Вырезан из кости.', 'weapon', 'bone', 'common', 'dark', NULL, NULL, 2, 25, FALSE, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0),
('flame_sword', 'Пламенный меч', 'Меч, пылающий вечным огнём.', 'weapon', 'metal', 'rare', 'fire', NULL, NULL, 5, 180, FALSE, 1, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0),
('storm_bow', 'Штормовой лук', 'Лук, стреляющий молниями.', 'weapon', 'wood', 'rare', 'air', NULL, NULL, 5, 170, FALSE, 1, 0, 3, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0),
('void_scythe', 'Коса пустоты', 'Оружие из-за грани.', 'weapon', 'essence', 'epic', 'dark', NULL, NULL, 8, 500, FALSE, 1, 4, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0),

-- ─── БРОНЯ: ТЕЛО ───
('cloth_robe', 'Тканевая мантия', 'Мантия начинающего мага.', 'body', 'cloth', 'common', 'none', NULL, NULL, 1, 15, FALSE, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0),
('leather_armor', 'Кожаный доспех', 'Прочная кожа.', 'body', 'leather', 'uncommon', 'none', NULL, NULL, 3, 60, FALSE, 1, 0, 1, 0, 0, 0, 4, 0, 0, 1, 0, 0, 0, 0, 0, 0),
('crystal_plate', 'Кристальный нагрудник', 'Пластины из живого кристалла.', 'body', 'crystal', 'rare', 'water', NULL, NULL, 5, 200, FALSE, 1, 0, 0, 0, 0, 10, 7, 0, 2, 0, 0, 0, 0, 0, 0, 0),
('shadow_cloak', 'Теневой плащ', 'Плащ из чистой тьмы.', 'body', 'essence', 'rare', 'dark', NULL, NULL, 5, 220, FALSE, 1, 0, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0),
('dragon_scale', 'Драконья чешуя', 'Чешуя древнего дракона.', 'body', 'metal', 'epic', 'fire', NULL, NULL, 8, 600, FALSE, 1, 2, 0, 0, 0, 20, 12, 5, 0, 0, 0, 0, 0, 0, 0, 0),

-- ─── БРОНЯ: ГОЛОВА ───
('cloth_hood', 'Тканевый капюшон', 'Простой капюшон.', 'head', 'cloth', 'common', 'none', NULL, NULL, 1, 10, FALSE, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
('bone_helm', 'Костяной шлем', 'Шлем из костей.', 'head', 'bone', 'uncommon', 'dark', NULL, NULL, 3, 45, FALSE, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 0, 0),
('crystal_crown', 'Кристальная корона', 'Корона из чистого кристалла.', 'head', 'crystal', 'rare', 'light', NULL, NULL, 5, 180, FALSE, 1, 0, 0, 2, 0, 5, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0),

-- ─── БРОНЯ: ОБУВЬ ───
('leather_boots', 'Кожаные сапоги', 'Удобные сапоги.', 'boots', 'leather', 'common', 'none', NULL, NULL, 1, 12, FALSE, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0),
('wind_treads', 'Ветровые ступни', 'Сапоги, лёгкие как ветер.', 'boots', 'essence', 'rare', 'air', NULL, NULL, 5, 150, FALSE, 1, 0, 3, 0, 1, 0, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0),

-- ─── АКСЕССУАРЫ ───
('iron_ring', 'Железное кольцо', 'Простое кольцо.', 'ring', 'metal', 'common', 'none', NULL, NULL, 1, 20, FALSE, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
('essence_amulet', 'Амулет эссенции', 'Пульсирует энергией.', 'necklace', 'essence', 'uncommon', 'light', NULL, NULL, 3, 80, FALSE, 1, 0, 0, 2, 0, 8, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0),
('fire_ring', 'Кольцо пламени', 'Пышет жаром.', 'ring', 'metal', 'uncommon', 'fire', NULL, NULL, 3, 70, FALSE, 1, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0),
('void_pendant', 'Подвеска пустоты', 'Содержит осколок пустоты.', 'necklace', 'essence', 'epic', 'dark', NULL, NULL, 7, 400, FALSE, 1, 0, 2, 3, 2, 15, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0),

-- ─── РАСХОДНИКИ ───
('minor_hp_potion', 'Малое зелье здоровья', 'Восстанавливает HP.', NULL, 'herb', 'common', 'none', 'potion', 'heal', 1, 5, TRUE, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0),
('major_hp_potion', 'Большое зелье здоровья', 'Восстанавливает много HP.', NULL, 'herb', 'uncommon', 'none', 'potion', 'heal', 3, 20, TRUE, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40, 0),
('minor_mp_potion', 'Малое зелье маны', 'Восстанавливает MP.', NULL, 'herb', 'common', 'water', 'potion', 'heal', 1, 8, TRUE, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0),
('major_mp_potion', 'Большое зелье маны', 'Восстанавливает много MP.', NULL, 'herb', 'uncommon', 'water', 'potion', 'heal', 3, 25, TRUE, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 0),
('fire_bomb', 'Огненная бомба', 'Взрывается огнём.', NULL, 'essence', 'uncommon', 'fire', 'bomb', 'damage', 2, 15, TRUE, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0),
('frost_bomb', 'Ледяная бомба', 'Замораживает всё вокруг.', NULL, 'essence', 'uncommon', 'water', 'bomb', 'damage', 2, 18, TRUE, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0),

-- ─── МАТЕРИАЛЫ ───
('herb', 'Целебная трава', 'Основа зелий.', NULL, 'herb', 'common', 'light', NULL, NULL, 1, 2, TRUE, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
('crystal_shard', 'Осколок кристалла', 'Содержит магию.', NULL, 'crystal', 'uncommon', 'water', NULL, NULL, 2, 8, TRUE, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
('bone_fragment', 'Фрагмент кости', 'Кость мёртвого существа.', NULL, 'bone', 'common', 'dark', NULL, NULL, 1, 3, TRUE, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0),
('dark_essence', 'Тёмная эссенция', 'Сгусток магической энергии.', NULL, 'essence', 'rare', 'dark', NULL, NULL, 4, 25, TRUE, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0),
('leather_piece', 'Кусок кожи', 'Для брони.', NULL, 'leather', 'common', 'earth', NULL, NULL, 1, 3, TRUE, 99, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0),
('metal_ore', 'Руда', 'Можно выковать оружие.', NULL, 'metal', 'common', 'fire', NULL, NULL, 1, 4, TRUE, 99, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
('fire_essence', 'Эссенция огня', 'Пылающий сгусток.', NULL, 'essence', 'rare', 'fire', NULL, NULL, 4, 30, TRUE, 50, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0),
('water_essence', 'Эссенция воды', 'Капля живой воды.', NULL, 'essence', 'rare', 'water', NULL, NULL, 4, 30, TRUE, 50, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0),
('light_crystal', 'Кристалл света', 'Сияет вечным светом.', NULL, 'crystal', 'epic', 'light', NULL, NULL, 6, 80, TRUE, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0);


-- ─────────────────────────────────────────────────────────
-- СВИТКИ (для изучения форм и эффектов)
-- ─────────────────────────────────────────────────────────
CREATE TABLE scrolls (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    scroll_type ENUM('form', 'effect') NOT NULL,
    teaches_id VARCHAR(50),
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'artifact') DEFAULT 'common',
    value INT DEFAULT 0,
    drop_locations TEXT
);

INSERT INTO scrolls VALUES
-- Свитки форм
('scroll_bolt', 'Свиток Снаряда', 'Обучает форме Снаряд.', 'form', 'bolt', 'common', 20, 'ashen_harbor,ruins'),
('scroll_arrow', 'Свиток Стрелы', 'Обучает форме Стрела.', 'form', 'arrow', 'common', 25, 'ashen_harbor,cursed_forest'),
('scroll_sphere', 'Свиток Сферы', 'Обучает форме Сфера.', 'form', 'sphere', 'uncommon', 60, 'crystal_spire,crystal_wastes'),
('scroll_wave', 'Свиток Волны', 'Обучает форме Волна.', 'form', 'wave', 'uncommon', 70, 'crystal_spire,cursed_forest'),
('scroll_beam', 'Свиток Луча', 'Обучает форме Луч.', 'form', 'beam', 'rare', 150, 'crystal_spire'),
('scroll_nova', 'Свиток Новы', 'Обучает форме Нова.', 'form', 'nova', 'rare', 200, 'crystal_spire,underground'),
('scroll_lance', 'Свиток Копья', 'Обучает форме Копьё.', 'form', 'lance', 'epic', 400, 'underground'),
('scroll_meteor', 'Свиток Метеора', 'Обучает форме Метеор.', 'form', 'meteor', 'epic', 500, 'underground'),
('scroll_whisper', 'Свиток Шёпота', 'Обучает форме Шёпот.', 'form', 'whisper', 'rare', 180, 'cursed_forest'),

-- Свитки эффектов
('scroll_burn', 'Свиток Горения', 'Обучает эффекту Горение.', 'effect', 'burn', 'common', 30, 'ashen_harbor,ruins'),
('scroll_frost', 'Свиток Обморожения', 'Обучает эффекту Обморожение.', 'effect', 'frost', 'common', 30, 'ashen_harbor,cursed_forest'),
('scroll_poison', 'Свиток Отравления', 'Обучает эффекту Отравление.', 'effect', 'poison', 'common', 30, 'cursed_forest'),
('scroll_shock', 'Свиток Шока', 'Обучает эффекту Шок.', 'effect', 'shock', 'uncommon', 60, 'crystal_wastes'),
('scroll_blind', 'Свиток Ослепления', 'Обучает эффекту Ослепление.', 'effect', 'blind', 'uncommon', 60, 'crystal_spire'),
('scroll_curse', 'Свиток Проклятия', 'Обучает эффекту Проклятие.', 'effect', 'curse', 'uncommon', 65, 'underground'),
('scroll_life_steal', 'Свиток Кражи Жизни', 'Обучает эффекту Кража Жизни.', 'effect', 'life_steal', 'rare', 150, 'underground'),
('scroll_holy', 'Свиток Святого Удара', 'Обучает эффекту Святой Удар.', 'effect', 'holy', 'rare', 160, 'crystal_spire');


-- ─────────────────────────────────────────────────────────
-- БОНУСЫ ЗА УРОВНИ МАГИИ (мастерство)
-- ─────────────────────────────────────────────────────────
CREATE TABLE magic_bonuses (
    level INT PRIMARY KEY,
    title VARCHAR(50),
    casts_required INT,
    damage_bonus_pct INT,
    mp_discount_pct INT,
    crit_bonus_pct INT,
    special_perk TEXT
);

INSERT INTO magic_bonuses VALUES
(1, 'Новичок', 0, 0, 0, 0, NULL),
(2, 'Ученик', 10, 10, 5, 0, '+10% урона, -5% MP'),
(3, 'Адепт', 25, 20, 10, 5, '+20% урона, -10% MP, +5% крит'),
(4, 'Мастер', 50, 35, 15, 10, '+35% урона, -15% MP, +10% крит'),
(5, 'Виртуоз', 100, 50, 20, 15, '+50% урона, -20% MP, +15% крит'),
(6, 'Магистр', 200, 75, 25, 20, '+75% урона, -25% MP, +20% крит, крит x3'),
(7, 'Архимаг', 500, 100, 30, 25, 'МАСТЕР: +100% урона, -30% MP, +25% крит, крит x4');


-- ─────────────────────────────────────────────────────────
-- БОНУСЫ ЗА УРОВНИ ПЕРСОНАЖА (открытие слотов)
-- ─────────────────────────────────────────────────────────
CREATE TABLE level_bonuses (
    level INT PRIMARY KEY,
    spell_slots_unlocked INT,
    osm_bonus INT,
    stat_bonus TEXT,
    perk TEXT
);

INSERT INTO level_bonuses VALUES
(1, 2, 0, NULL, 'Старт игры'),
(5, 3, 2, '+1 ко всем стихиям', 'Открыт 3-й слот магии'),
(10, 4, 4, '+2 ко всем стихиям', 'Открыт 4-й слот магии'),
(15, 5, 6, '+3 ко всем стихиям, +10 HP, +5 MP', 'Открыт 5-й слот магии'),
(20, 6, 8, '+5 ко всем стихиям, +20 HP, +10 MP', 'Открыт 6-й слот магии'),
(25, 7, 10, '+7 ко всем стихиям, +30 HP, +15 MP', 'Открыт 7-й слот магии (макс)'),
(30, 7, 12, '+10 ко всем стихиям, +50 HP, +25 MP', 'МАКС: все слоты, все бонусы');


-- ─────────────────────────────────────────────────────────
-- РЕЦЕПТЫ КРАФТА
-- ─────────────────────────────────────────────────────────
CREATE TABLE craft_recipes (
    result_item VARCHAR(50),
    material_1 VARCHAR(50),
    count_1 INT,
    material_2 VARCHAR(50),
    count_2 INT,
    material_3 VARCHAR(50),
    count_3 INT,
    required_level INT DEFAULT 1,
    PRIMARY KEY (result_item)
);

INSERT INTO craft_recipes VALUES
('minor_hp_potion', 'herb', 2, NULL, 0, NULL, 0, 1),
('major_hp_potion', 'herb', 3, 'dark_essence', 1, NULL, 0, 3),
('minor_mp_potion', 'herb', 1, 'crystal_shard', 1, NULL, 0, 1),
('major_mp_potion', 'herb', 2, 'crystal_shard', 2, NULL, 0, 3),
('fire_bomb', 'fire_essence', 1, 'metal_ore', 1, NULL, 0, 2),
('frost_bomb', 'water_essence', 1, 'crystal_shard', 1, NULL, 0, 2),
('leather_armor', 'leather_piece', 5, 'bone_fragment', 2, NULL, 0, 3),
('crystal_plate', 'crystal_shard', 8, 'dark_essence', 2, NULL, 0, 5),
('shadow_blade', 'dark_essence', 5, 'bone_fragment', 3, 'metal_ore', 2, 5),
('flame_sword', 'fire_essence', 5, 'metal_ore', 3, NULL, 0, 5),
('crystal_crown', 'crystal_shard', 5, 'light_crystal', 1, NULL, 0, 5),
('essence_amulet', 'dark_essence', 2, 'crystal_shard', 3, NULL, 0, 3);
