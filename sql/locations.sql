-- ═══════════════════════════════════════════════════════════
-- ЛОКАЦИИ: города, лагеря, материки, подземелья
-- ═══════════════════════════════════════════════════════════

CREATE TABLE locations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('city', 'dungeon', 'wild', 'special', 'camp', 'continent') NOT NULL,
    danger_level INT DEFAULT 0,
    map_x INT DEFAULT 50,
    map_y INT DEFAULT 50,
    rest_cost INT DEFAULT 0,
    has_shop BOOLEAN DEFAULT FALSE,
    has_training BOOLEAN DEFAULT FALSE
);

INSERT INTO locations VALUES
-- Города
('ashen_harbor', 'Пепельная Гавань', 'Стартовый город. Таверна "Последний огонёк".', 'city', 0, 20, 50, 5, TRUE, FALSE),
('crystal_spire', 'Кристальный Шпиль', 'Академия магии. Обучение и библиотека.', 'city', 0, 80, 20, 5, TRUE, TRUE),
('rusty_port', 'Ржавый Порт', 'Порт контрабандистов. Чёрный рынок.', 'city', 1, 70, 75, 5, TRUE, FALSE),

-- Лагеря
('nomad_camp', 'Лагерь кочевников', 'Временное поселение торговцев. Можно отдохнуть и купить припасы.', 'camp', 1, 40, 45, 2, TRUE, FALSE),
('trader_camp', 'Лагерь торговцев', 'Караван торговцев. Редкие товары и информация.', 'camp', 1, 65, 50, 2, TRUE, FALSE),
('hunter_camp', 'Лагерь охотников', 'Охотники на монстров. Обучение и снаряжение.', 'camp', 2, 30, 60, 2, FALSE, TRUE),

-- Подземелья
('ruins', 'Руины старого мира', 'Разрушенные башни. Скелеты бродят здесь.', 'dungeon', 3, 15, 25, 0, FALSE, FALSE),
('underground', 'Подземные тоннели', 'Тьма и сырость. Костяной Лорд ждёт.', 'dungeon', 6, 50, 90, 0, FALSE, FALSE),
('forgotten_ruins', 'Забытые руины', 'Остатки древней цивилизации. Мощные артефакты.', 'dungeon', 7, 25, 15, 0, FALSE, FALSE),

-- Дикие местности
('crystal_wastes', 'Кристаллические пустоши', 'Земля живых кристаллов. Элементали.', 'wild', 5, 85, 40, 0, FALSE, FALSE),
('cursed_forest', 'Проклятый лес', 'Лес, поглощённый тенью. Призраки.', 'wild', 4, 25, 80, 0, FALSE, FALSE),

-- Материки
('northern_continent', 'Северный материк', 'Ледяные пустоши. Древние тайны и опасные существа.', 'continent', 8, 50, 10, 0, FALSE, FALSE),
('southern_continent', 'Южный материк', 'Пыльные пустыни. Забытые храмы и сокровища.', 'continent', 7, 50, 95, 0, FALSE, FALSE),
('eastern_continent', 'Восточный материк', 'Таинственные джунгли. Неизведанные земли.', 'continent', 9, 95, 50, 0, FALSE, FALSE),

-- Особые локации
('ancient_library', 'Древняя библиотека', 'Хранилище знаний прошлого. Свитки и книги.', 'special', 3, 75, 30, 0, FALSE, TRUE),
('dragon_peak', 'Пик Дракона', 'Вершина мира. Логово древнего дракона.', 'special', 10, 85, 15, 0, FALSE, FALSE);


-- ─────────────────────────────────────────────────────────
-- СВЯЗИ МЕЖДУ ЛОКАЦИЯМИ
-- ─────────────────────────────────────────────────────────
CREATE TABLE location_connections (
    location_id VARCHAR(50),
    connected_to VARCHAR(50),
    travel_time INT DEFAULT 1,
    PRIMARY KEY (location_id, connected_to),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (connected_to) REFERENCES locations(id)
);

INSERT INTO location_connections VALUES
-- Города
('ashen_harbor', 'ruins', 1),
('ashen_harbor', 'cursed_forest', 1),
('ashen_harbor', 'nomad_camp', 1),
('crystal_spire', 'crystal_wastes', 1),
('crystal_spire', 'trader_camp', 1),
('crystal_spire', 'ancient_library', 1),
('crystal_spire', 'eastern_continent', 2),
('rusty_port', 'underground', 1),
('rusty_port', 'trader_camp', 1),
('rusty_port', 'southern_continent', 2),

-- Лагеря
('nomad_camp', 'ashen_harbor', 1),
('nomad_camp', 'crystal_wastes', 1),
('trader_camp', 'crystal_spire', 1),
('trader_camp', 'rusty_port', 1),
('hunter_camp', 'cursed_forest', 1),
('hunter_camp', 'ruins', 1),

-- Подземелья
('ruins', 'ashen_harbor', 1),
('ruins', 'underground', 1),
('ruins', 'hunter_camp', 1),
('ruins', 'forgotten_ruins', 2),
('underground', 'rusty_port', 1),
('underground', 'ruins', 1),
('forgotten_ruins', 'northern_continent', 2),
('forgotten_ruins', 'ruins', 2),

-- Дикие местности
('crystal_wastes', 'crystal_spire', 1),
('crystal_wastes', 'nomad_camp', 1),
('cursed_forest', 'ashen_harbor', 1),
('cursed_forest', 'hunter_camp', 1),

-- Материки
('northern_continent', 'forgotten_ruins', 2),
('northern_continent', 'dragon_peak', 2),
('southern_continent', 'rusty_port', 2),
('eastern_continent', 'crystal_spire', 2),
('eastern_continent', 'dragon_peak', 2),

-- Особые локации
('ancient_library', 'crystal_spire', 1),
('ancient_library', 'forgotten_ruins', 2),
('dragon_peak', 'northern_continent', 2),
('dragon_peak', 'eastern_continent', 2);


-- ─────────────────────────────────────────────────────────
-- РЕСУРСЫ ЛОКАЦИЙ
-- ─────────────────────────────────────────────────────────
CREATE TABLE location_resources (
    location_id VARCHAR(50),
    resource_id VARCHAR(50),
    spawn_chance DECIMAL(4,3) DEFAULT 0.3,
    PRIMARY KEY (location_id, resource_id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

INSERT INTO location_resources VALUES
-- Города
('ashen_harbor', 'herb', 0.200),
('ashen_harbor', 'metal_ore', 0.150),
('crystal_spire', 'crystal_shard', 0.300),
('rusty_port', 'metal_ore', 0.250),
('rusty_port', 'leather_piece', 0.200),

-- Лагеря
('nomad_camp', 'herb', 0.300),
('nomad_camp', 'leather_piece', 0.250),
('trader_camp', 'crystal_shard', 0.200),
('trader_camp', 'metal_ore', 0.200),
('hunter_camp', 'bone_fragment', 0.300),
('hunter_camp', 'leather_piece', 0.250),

-- Подземелья
('ruins', 'metal_ore', 0.400),
('ruins', 'bone_fragment', 0.350),
('underground', 'metal_ore', 0.350),
('underground', 'bone_fragment', 0.400),
('underground', 'dark_essence', 0.200),
('forgotten_ruins', 'ancient_relic', 0.150),
('forgotten_ruins', 'crystal_shard', 0.300),

-- Дикие местности
('crystal_wastes', 'crystal_shard', 0.500),
('crystal_wastes', 'dark_essence', 0.250),
('cursed_forest', 'herb', 0.450),
('cursed_forest', 'leather_piece', 0.300),
('cursed_forest', 'dark_essence', 0.200),

-- Материки
('northern_continent', 'crystal_shard', 0.400),
('northern_continent', 'dark_essence', 0.350),
('southern_continent', 'gem', 0.200),
('southern_continent', 'ancient_relic', 0.150),
('eastern_continent', 'rare_herb', 0.300),
('eastern_continent', 'exotic_wood', 0.250),

-- Особые локации
('ancient_library', 'scroll', 0.400),
('ancient_library', 'ancient_tome', 0.100),
('dragon_peak', 'dragon_scale', 0.100),
('dragon_peak', 'fire_essence', 0.300);


-- ─────────────────────────────────────────────────────────
-- ВРАГИ ПО ЛОКАЦИЯМ
-- ─────────────────────────────────────────────────────────
CREATE TABLE location_enemies (
    location_id VARCHAR(50),
    enemy_id VARCHAR(50),
    spawn_weight INT DEFAULT 1,
    PRIMARY KEY (location_id, enemy_id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (enemy_id) REFERENCES enemies(id)
);

INSERT INTO location_enemies VALUES
-- Подземелья
('ruins', 'skeleton', 3),
('ruins', 'skeleton_archer', 2),
('ruins', 'ruin_golem', 1),
('ruins', 'ghost_knight', 1),
('underground', 'cave_bat', 3),
('underground', 'dark_slime', 2),
('underground', 'giant_rat', 3),
('underground', 'tunnel_crawler', 2),
('underground', 'bone_lord', 1),
('underground', 'lava_worm', 1),
('forgotten_ruins', 'ancient_guardian', 2),
('forgotten_ruins', 'stone_golem', 2),

-- Дикие местности
('crystal_wastes', 'crystal_spider', 3),
('crystal_wastes', 'lightning_elemental', 2),
('crystal_wastes', 'crystal_golem', 1),
('cursed_forest', 'shadow_wolf', 3),
('cursed_forest', 'forest_spider', 2),
('cursed_forest', 'forest_wraith', 1),
('cursed_forest', 'treant', 1),
('cursed_forest', 'witch_of_woods', 1),

-- Материки
('northern_continent', 'frost_wraith', 2),
('northern_continent', 'ice_golem', 2),
('southern_continent', 'sand_worm', 2),
('southern_continent', 'desert_spirit', 2),
('eastern_continent', 'jungle_beast', 2),
('eastern_continent', 'poisonous_plant', 2),

-- Особые локации
('ancient_library', 'book_wraith', 2),
('ancient_library', 'ink_spirit', 2),
('dragon_peak', 'young_dragon', 2),
('dragon_peak', 'dragon_guardian', 1);


-- ─────────────────────────────────────────────────────────
-- СОБЫТИЯ ЛОКАЦИЙ
-- ─────────────────────────────────────────────────────────
CREATE TABLE location_events (
    location_id VARCHAR(50),
    event_id VARCHAR(50),
    event_type ENUM('rest', 'trade', 'training', 'quest', 'discovery', 'hazard') NOT NULL,
    description TEXT,
    PRIMARY KEY (location_id, event_id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

INSERT INTO location_events VALUES
-- Города
('ashen_harbor', 'tavern_rest', 'rest', 'Отдых в таверне восстанавливает HP и MP'),
('ashen_harbor', 'shop', 'trade', 'Магазин с базовыми товарами'),
('crystal_spire', 'training', 'training', 'Обучение магии у мастеров'),
('crystal_spire', 'library', 'discovery', 'Доступ к древним знаниям'),
('rusty_port', 'black_market', 'trade', 'Чёрный рынок с редкими товарами'),

-- Лагеря
('nomad_camp', 'rest', 'rest', 'Простой отдых у костра'),
('nomad_camp', 'trade', 'trade', 'Торговля с кочевниками'),
('trader_camp', 'rare_goods', 'trade', 'Редкие товары от торговцев'),
('trader_camp', 'quests', 'quest', 'Задания от торговцев'),
('hunter_camp', 'training', 'training', 'Обучение охоте и выживанию'),
('hunter_camp', 'bounties', 'quest', 'Охота на монстров за награду'),

-- Подземелья
('ruins', 'treasure_find', 'discovery', 'Шанс найти сокровища'),
('underground', 'cave_in', 'hazard', 'Опасность обвала'),
('forgotten_ruins', 'artifact_discovery', 'discovery', 'Шанс найти древний артефакт'),
('forgotten_ruins', 'trap', 'hazard', 'Древние ловушки'),

-- Дикие местности
('crystal_wastes', 'crystal_harvest', 'discovery', 'Сбор кристаллов'),
('cursed_forest', 'herb_gathering', 'discovery', 'Сбор редких трав'),

-- Материки
('northern_continent', 'ancient_ruins', 'discovery', 'Исследование древних руин'),
('northern_continent', 'frost_storm', 'hazard', 'Ледяные бури'),
('southern_continent', 'temple_discovery', 'discovery', 'Обнаружение забытых храмов'),
('southern_continent', 'sandstorm', 'hazard', 'Песчаные бури'),
('eastern_continent', 'jungle_exploration', 'discovery', 'Исследование джунглей'),
('eastern_continent', 'ancient_civilization', 'discovery', 'Следы древней цивилизации'),

-- Особые локации
('ancient_library', 'learn_spell', 'training', 'Изучение новых заклинаний'),
('ancient_library', 'ancient_secret', 'discovery', 'Раскрытие древних тайн'),
('dragon_peak', 'dragon_fight', 'hazard', 'Битва с драконом'),
('dragon_peak', 'treasure_hoard', 'discovery', 'Сокровища дракона');
