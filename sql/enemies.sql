-- ═══════════════════════════════════════════════════════════
-- ВРАГИ: шаблоны, части тела, лут, способности
-- ═══════════════════════════════════════════════════════════

CREATE TABLE enemies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('undead', 'beast', 'elemental', 'demon', 'human', 'construct', 'dragon', 'spirit') NOT NULL,
    behavior ENUM('aggressive', 'passive', 'defensive', 'magical', 'cowardly') NOT NULL,
    level INT DEFAULT 1,
    base_hp INT DEFAULT 10,
    base_damage INT DEFAULT 3,
    armor INT DEFAULT 0,
    speed INT DEFAULT 5,
    rarity ENUM('common', 'uncommon', 'rare', 'boss', 'legendary') DEFAULT 'common',
    xp_reward INT DEFAULT 10,
    gold_min INT DEFAULT 1,
    gold_max INT DEFAULT 5,
    spawn_locations TEXT,
    abilities TEXT
);

INSERT INTO enemies VALUES
-- ─── РУИНЫ ───
('skeleton', 'Скелет', 'Ожившие кости. Бродят среди руин.', 'undead', 'aggressive', 1, 15, 4, 1, 3, 'common', 10, 2, 8, 'ruins', 'bone_throw'),
('skeleton_archer', 'Скелет-лучник', 'Стреляет костяными стрелами.', 'undead', 'defensive', 2, 12, 5, 0, 5, 'common', 15, 3, 10, 'ruins', 'bone_arrow,aimed_shot'),
('ruin_golem', 'Руинный голем', 'Каменный страж.', 'construct', 'defensive', 3, 40, 6, 5, 1, 'uncommon', 30, 10, 25, 'ruins', 'stone_slam,harden'),
('ghost_knight', 'Призрак рыцаря', 'Павший воин, не знающий покоя.', 'undead', 'aggressive', 4, 30, 8, 3, 4, 'uncommon', 40, 12, 30, 'ruins', 'sword_slash,undying'),
('crypt_warden', 'Страж склепа', 'Древний хранитель подземелий.', 'undead', 'magical', 6, 55, 10, 4, 3, 'rare', 70, 20, 50, 'ruins,underground', 'dark_bolt,summon_skeletons'),

-- ─── ПРОКЛЯТЫЙ ЛЕС ───
('shadow_wolf', 'Теневой волк', 'Волк, поглощённый тьмой.', 'beast', 'aggressive', 2, 20, 5, 1, 6, 'common', 15, 3, 12, 'cursed_forest', 'shadow_bite,howl'),
('forest_spider', 'Лесной паук', 'Огромный паук с ядовитыми клыками.', 'beast', 'aggressive', 2, 18, 4, 1, 4, 'common', 15, 2, 8, 'cursed_forest', 'poison_bite,web'),
('forest_wraith', 'Лесной призрак', 'Дух погибшего в лесу.', 'undead', 'magical', 5, 35, 8, 2, 5, 'rare', 50, 15, 40, 'cursed_forest', 'life_drain,shadow_bolt'),
('treant', 'Древень', 'Ожившее дерево. Медленное, но крепкое.', 'elemental', 'defensive', 4, 50, 7, 6, 1, 'uncommon', 45, 10, 25, 'cursed_forest', 'root_slam,regenerate'),
('witch_of_woods', 'Ведьма чащи', 'Старая колдунья леса.', 'human', 'magical', 7, 40, 9, 2, 4, 'rare', 80, 25, 60, 'cursed_forest', 'curse,poison_cloud,heal_self'),
('alpha_wolf', 'Альфа-волк', 'Вожак стаи теневых волков.', 'beast', 'aggressive', 5, 45, 10, 2, 7, 'rare', 60, 20, 45, 'cursed_forest', 'pack_howl,shadow_bite,rush'),

-- ─── КРИСТАЛЛИЧЕСКИЕ ПУСТОШИ ───
('crystal_spider', 'Кристальный паук', 'Паук, покрытый кристаллами.', 'beast', 'aggressive', 3, 25, 6, 3, 4, 'common', 25, 5, 15, 'crystal_wastes', 'crystal_shot,web'),
('lightning_elemental', 'Элементаль воздуха', 'Сгусток энергии ветра.', 'elemental', 'magical', 6, 45, 10, 2, 7, 'rare', 60, 20, 50, 'crystal_wastes', 'lightning_bolt,chain_spark'),
('crystal_golem', 'Кристальный голем', 'Голем из живых кристаллов.', 'construct', 'defensive', 5, 60, 8, 8, 2, 'rare', 55, 15, 40, 'crystal_wastes', 'crystal_slam,reflect'),
('prism_wyrm', 'Призматический змей', 'Змей из чистого света.', 'dragon', 'magical', 8, 70, 12, 4, 6, 'rare', 100, 30, 70, 'crystal_wastes', 'prism_breath,light_refract'),
('storm_harpy', 'Штормовая гарпия', 'Крылатая тварь, повелительница ветров.', 'beast', 'aggressive', 4, 30, 7, 1, 8, 'uncommon', 35, 8, 20, 'crystal_wastes', 'wind_slash,dive_bomb'),

-- ─── ПОДЗЕМЕЛЬЕ ───
('cave_bat', 'Пещерная летучая мышь', 'Огромная мышь с клыками.', 'beast', 'aggressive', 1, 10, 3, 0, 7, 'common', 8, 1, 5, 'underground', 'screech'),
('dark_slime', 'Тёмный слайм', 'Комок тьмы.', 'elemental', 'defensive', 3, 30, 5, 4, 2, 'uncommon', 25, 5, 20, 'underground', 'acid_splash,split'),
('giant_rat', 'Гигантская крыса', 'Крыса размером с собаку.', 'beast', 'cowardly', 1, 12, 4, 0, 6, 'common', 10, 2, 6, 'underground', 'bite,flee'),
('tunnel_crawler', 'Ползун тоннелей', 'Многоногое существо.', 'beast', 'aggressive', 4, 35, 7, 3, 5, 'uncommon', 35, 8, 22, 'underground', 'multi_bite,burrow'),
('bone_lord', 'Костяной Лорд', 'Властелин нежити.', 'undead', 'magical', 8, 80, 12, 6, 4, 'boss', 150, 50, 100, 'ruins,underground', 'bone_throw,life_drain,summon_skeleton,dark_nova'),
('lava_worm', 'Лавовый червь', 'Червь, живущий в магме.', 'elemental', 'aggressive', 6, 55, 9, 5, 3, 'rare', 70, 20, 45, 'underground', 'lava_spit,burrow_strike'),

-- ─── БОССЫ ───
('ash_king', 'Пепельный Король', 'Правитель Пепельной Гавани до Раскола.', 'undead', 'magical', 10, 120, 15, 8, 5, 'boss', 250, 80, 150, 'ruins', 'ash_storm,undead_legion,royal_strike'),
('crystal_queen', 'Кристальная Королева', 'Владычица кристаллов.', 'elemental', 'magical', 12, 150, 18, 6, 6, 'legendary', 400, 120, 250, 'crystal_wastes', 'prism_nova,crystal_prison,reflect_all'),
('forest_mother', 'Мать Леса', 'Древнее божество проклятого леса.', 'spirit', 'magical', 11, 130, 14, 5, 4, 'legendary', 350, 100, 200, 'cursed_forest', 'nature_wrath,regenerate_all,summon_treants,poison_storm'),
('void_lord', 'Лорд Пустоты', 'Существо из-за грани реальности.', 'demon', 'magical', 15, 200, 20, 10, 7, 'legendary', 600, 200, 400, 'underground', 'void_collapse,reality_tear,summon_voidlings,annihilate');


-- ─────────────────────────────────────────────────────────
-- ЧАСТИ ТЕЛА ВРАГОВ
-- ─────────────────────────────────────────────────────────
CREATE TABLE enemy_body_parts (
    enemy_id VARCHAR(50),
    part ENUM('head', 'torso', 'arms', 'legs', 'wings', 'tail') NOT NULL,
    weakness VARCHAR(20),
    resistance VARCHAR(20),
    damage_multiplier DECIMAL(3,2) DEFAULT 1.0,
    PRIMARY KEY (enemy_id, part),
    FOREIGN KEY (enemy_id) REFERENCES enemies(id)
);

INSERT INTO enemy_body_parts VALUES
-- Скелет
('skeleton', 'head', 'light', 'dark', 1.2),
('skeleton', 'torso', NULL, NULL, 1.0),
('skeleton', 'arms', NULL, NULL, 0.9),
('skeleton', 'legs', NULL, NULL, 0.8),
-- Скелет-лучник
('skeleton_archer', 'head', 'light', 'dark', 1.2),
('skeleton_archer', 'torso', NULL, NULL, 1.0),
('skeleton_archer', 'arms', NULL, 'earth', 0.9),
('skeleton_archer', 'legs', NULL, NULL, 0.8),
-- Руинный голем
('ruin_golem', 'head', NULL, 'earth', 0.9),
('ruin_golem', 'torso', 'water', 'earth', 1.1),
('ruin_golem', 'arms', NULL, NULL, 1.0),
('ruin_golem', 'legs', 'fire', NULL, 0.8),
-- Призрак рыцаря
('ghost_knight', 'head', 'light', 'dark', 1.3),
('ghost_knight', 'torso', NULL, 'dark', 1.0),
('ghost_knight', 'arms', 'fire', NULL, 0.9),
('ghost_knight', 'legs', NULL, NULL, 0.8),
-- Страж склепа
('crypt_warden', 'head', 'light', 'dark', 1.2),
('crypt_warden', 'torso', NULL, 'dark', 1.1),
('crypt_warden', 'arms', 'fire', NULL, 0.9),
('crypt_warden', 'legs', NULL, NULL, 0.8),
-- Теневой волк
('shadow_wolf', 'head', 'light', NULL, 1.2),
('shadow_wolf', 'torso', NULL, NULL, 1.0),
('shadow_wolf', 'legs', NULL, NULL, 0.9),
('shadow_wolf', 'tail', NULL, 'dark', 0.8),
-- Лесной паук
('forest_spider', 'head', 'fire', NULL, 1.2),
('forest_spider', 'torso', NULL, NULL, 1.0),
('forest_spider', 'legs', NULL, 'earth', 0.9),
-- Лесной призрак
('forest_wraith', 'head', 'light', 'dark', 1.3),
('forest_wraith', 'torso', 'fire', NULL, 1.1),
-- Древень
('treant', 'head', 'fire', 'water', 1.2),
('treant', 'torso', 'fire', 'earth', 1.1),
('treant', 'arms', NULL, NULL, 1.0),
('treant', 'legs', 'fire', 'earth', 0.8),
-- Ведьма чащи
('witch_of_woods', 'head', 'light', 'dark', 1.3),
('witch_of_woods', 'torso', NULL, NULL, 1.0),
('witch_of_woods', 'arms', NULL, NULL, 0.9),
-- Альфа-волк
('alpha_wolf', 'head', 'light', NULL, 1.2),
('alpha_wolf', 'torso', NULL, NULL, 1.1),
('alpha_wolf', 'legs', NULL, NULL, 0.9),
('alpha_wolf', 'tail', NULL, 'dark', 0.8),
-- Кристальный паук
('crystal_spider', 'head', 'fire', NULL, 1.2),
('crystal_spider', 'torso', NULL, 'water', 1.1),
('crystal_spider', 'legs', NULL, NULL, 0.9),
-- Элементаль воздуха
('lightning_elemental', 'torso', 'earth', 'air', 1.2),
-- Кристальный голем
('crystal_golem', 'head', 'fire', NULL, 1.1),
('crystal_golem', 'torso', NULL, 'water', 1.2),
('crystal_golem', 'arms', 'earth', NULL, 1.0),
('crystal_golem', 'legs', 'fire', NULL, 0.8),
-- Призматический змей
('prism_wyrm', 'head', 'dark', 'light', 1.3),
('prism_wyrm', 'torso', NULL, NULL, 1.1),
('prism_wyrm', 'tail', 'earth', NULL, 0.9),
('prism_wyrm', 'wings', 'air', NULL, 0.8),
-- Штормовая гарпия
('storm_harpy', 'head', 'earth', NULL, 1.2),
('storm_harpy', 'torso', NULL, NULL, 1.0),
('storm_harpy', 'wings', 'fire', 'air', 0.8),
('storm_harpy', 'legs', NULL, NULL, 0.9),
-- Пещерная летучая мышь
('cave_bat', 'head', NULL, NULL, 1.1),
('cave_bat', 'torso', NULL, NULL, 1.0),
('cave_bat', 'wings', 'air', NULL, 0.7),
-- Тёмный слайм
('dark_slime', 'torso', 'light', 'dark', 1.2),
-- Гигантская крыса
('giant_rat', 'head', NULL, NULL, 1.2),
('giant_rat', 'torso', NULL, NULL, 1.0),
('giant_rat', 'legs', NULL, NULL, 0.9),
-- Ползун тоннелей
('tunnel_crawler', 'head', 'light', NULL, 1.2),
('tunnel_crawler', 'torso', NULL, 'earth', 1.1),
('tunnel_crawler', 'legs', NULL, NULL, 0.9),
-- Костяной Лорд
('bone_lord', 'head', 'light', 'dark', 1.3),
('bone_lord', 'torso', NULL, 'dark', 1.2),
('bone_lord', 'arms', 'fire', NULL, 1.0),
('bone_lord', 'legs', NULL, NULL, 0.9),
-- Лавовый червь
('lava_worm', 'head', 'water', 'fire', 1.3),
('lava_worm', 'torso', 'water', 'fire', 1.1),
-- БОССЫ
('ash_king', 'head', 'light', 'dark', 1.3),
('ash_king', 'torso', 'water', 'fire', 1.2),
('ash_king', 'arms', 'fire', NULL, 1.0),
('ash_king', 'legs', NULL, NULL, 0.9),
('crystal_queen', 'head', 'dark', 'light', 1.4),
('crystal_queen', 'torso', NULL, 'water', 1.2),
('crystal_queen', 'arms', 'earth', NULL, 1.0),
('crystal_queen', 'legs', 'fire', NULL, 0.9),
('forest_mother', 'head', 'fire', 'water', 1.3),
('forest_mother', 'torso', 'fire', 'earth', 1.2),
('forest_mother', 'arms', NULL, NULL, 1.0),
('forest_mother', 'legs', 'fire', 'earth', 0.9),
('void_lord', 'head', 'light', 'dark', 1.5),
('void_lord', 'torso', NULL, 'dark', 1.3),
('void_lord', 'arms', 'light', NULL, 1.1),
('void_lord', 'legs', NULL, NULL, 1.0);


-- ─────────────────────────────────────────────────────────
-- ЛУТ С ВРАГОВ
-- ─────────────────────────────────────────────────────────
CREATE TABLE enemy_loot (
    enemy_id VARCHAR(50),
    item_id VARCHAR(50),
    drop_chance DECIMAL(4,3) DEFAULT 0.1,
    min_count INT DEFAULT 1,
    max_count INT DEFAULT 1,
    PRIMARY KEY (enemy_id, item_id)
);

INSERT INTO enemy_loot VALUES
('skeleton', 'bone_fragment', 0.700, 1, 2),
('skeleton', 'rusty_sword', 0.100, 1, 1),
('skeleton_archer', 'bone_fragment', 0.600, 1, 3),
('ruin_golem', 'metal_ore', 0.500, 1, 2),
('ruin_golem', 'crystal_shard', 0.300, 1, 1),
('ghost_knight', 'bone_fragment', 0.500, 2, 4),
('ghost_knight', 'bone_helm', 0.080, 1, 1),
('shadow_wolf', 'leather_piece', 0.600, 1, 2),
('shadow_wolf', 'herb', 0.400, 1, 2),
('forest_spider', 'herb', 0.500, 1, 3),
('forest_wraith', 'dark_essence', 0.400, 1, 1),
('forest_wraith', 'shadow_blade', 0.050, 1, 1),
('treant', 'herb', 0.700, 2, 4),
('treant', 'leather_piece', 0.300, 1, 2),
('crystal_spider', 'crystal_shard', 0.600, 1, 2),
('lightning_elemental', 'crystal_shard', 0.800, 1, 3),
('lightning_elemental', 'dark_essence', 0.300, 1, 1),
('crystal_golem', 'crystal_shard', 0.700, 2, 4),
('crystal_golem', 'crystal_plate', 0.050, 1, 1),
('dark_slime', 'dark_essence', 0.300, 1, 1),
('dark_slime', 'minor_hp_potion', 0.400, 1, 2),
('bone_lord', 'dark_essence', 1.000, 2, 3),
('bone_lord', 'shadow_blade', 0.200, 1, 1),
('bone_lord', 'crystal_plate', 0.150, 1, 1),
('ash_king', 'dark_essence', 1.000, 3, 5),
('ash_king', 'shadow_blade', 0.400, 1, 1),
('crystal_queen', 'crystal_shard', 1.000, 5, 8),
('crystal_queen', 'crystal_plate', 0.500, 1, 1),
('forest_mother', 'herb', 1.000, 5, 10),
('forest_mother', 'essence_amulet', 0.300, 1, 1),
('void_lord', 'dark_essence', 1.000, 5, 10),
('void_lord', 'shadow_blade', 0.600, 1, 1);
