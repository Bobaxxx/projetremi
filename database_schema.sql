-- =============================================================================
-- BASE DE DONNÉES : ALOBEES PLANNING & FEUILLES D'HEURES
-- Script de création des tables et d'insertion des données de test
-- Compatible : PostgreSQL, Supabase
-- =============================================================================

-- NETTOYAGE DES TABLES EXISTANTES (Reset)
DROP TABLE IF EXISTS dashboard_activities CASCADE;
DROP TABLE IF EXISTS chantier_documents CASCADE;
DROP TABLE IF EXISTS chantier_feeds CASCADE;
DROP TABLE IF EXISTS hours_allocations CASCADE;
DROP TABLE IF EXISTS planning_allocation_days CASCADE;
DROP TABLE IF EXISTS planning_allocations CASCADE;
DROP TABLE IF EXISTS chantiers CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;


-- 1. TABLE DES UTILISATEURS (COLLABORATEURS)
CREATE TABLE utilisateurs (
    id VARCHAR(50) PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,            -- Ex: 'Maçon', 'Conducteur de travaux', etc.
    type VARCHAR(50) NOT NULL DEFAULT 'Employé', -- Ex: 'Employé', 'Administrateur'
    status VARCHAR(50) NOT NULL DEFAULT 'Actif', -- Ex: 'Actif', 'Inactif'
    phone VARCHAR(20)
);

-- 2. TABLE DES CHANTIERS
CREATE TABLE chantiers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Ouvert', -- Ex: 'Ouvert', 'Fermé'
    budget_hours DECIMAL(10, 2) NOT NULL DEFAULT 150.00,
    worked_hours DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    color VARCHAR(7) NOT NULL DEFAULT '#10b981'   -- Code Couleur Hex (ex: #6050f3)
);

-- 3. TABLE DES AFFECTATIONS DU PLANNING (FORECAST)
CREATE TABLE planning_allocations (
    chantier_id VARCHAR(50) REFERENCES chantiers(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    start_time TIME NOT NULL DEFAULT '08:00:00',
    end_time TIME NOT NULL DEFAULT '17:00:00',
    note TEXT,
    color VARCHAR(7),
    PRIMARY KEY (chantier_id, user_id)
);

-- TABLE DE LIAISON POUR LES JOURS D'AFFECTATION DU PLANNING
CREATE TABLE planning_allocation_days (
    chantier_id VARCHAR(50),
    user_id VARCHAR(50),
    day_index INT NOT NULL, -- 0 = Lundi, 1 = Mardi, 2 = Mercredi, 3 = Jeudi, 4 = Vendredi
    PRIMARY KEY (chantier_id, user_id, day_index),
    FOREIGN KEY (chantier_id, user_id) REFERENCES planning_allocations(chantier_id, user_id) ON DELETE CASCADE
);

-- 4. TABLE DES FEUILLES D'HEURES (RÉELLEMENT RÉALISÉES)
CREATE TABLE hours_allocations (
    chantier_id VARCHAR(50) REFERENCES chantiers(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    day_index INT NOT NULL, -- 0 = Lundi, 1 = Mardi, 2 = Mercredi, 3 = Jeudi, 4 = Vendredi
    hours_value VARCHAR(20) NOT NULL DEFAULT '00:00', -- Ex: '08:00', 'À compléter'
    PRIMARY KEY (chantier_id, user_id, day_index)
);

-- 5. TABLE DES MÉMOS / FIL D'ACTUALITÉ
CREATE TABLE chantier_feeds (
    id SERIAL PRIMARY KEY,
    chantier_id VARCHAR(50) REFERENCES chantiers(id) ON DELETE CASCADE,
    author VARCHAR(200) NOT NULL,
    avatar VARCHAR(10) NOT NULL, -- Initiales (ex: 'AS')
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Moyenne',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLE DES DOCUMENTS DE CHANTIER
CREATE TABLE chantier_documents (
    id SERIAL PRIMARY KEY,
    chantier_id VARCHAR(50) REFERENCES chantiers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    author VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLE LOGS D'ACTIVITÉS DU DASHBOARD
CREATE TABLE dashboard_activities (
    id SERIAL PRIMARY KEY,
    activity_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- INSERTION DES DONNÉES INITIALES (MOCK DATA)
-- =============================================================================

-- Utilisateurs
INSERT INTO utilisateurs (id, firstname, lastname, role, type, status, phone) VALUES
('u1', 'Jules', 'Marcon', 'Conducteur de travaux', 'Chef d''équipe', 'Actif', '06 12 34 56 78'),
('u2', 'Marc', 'Lambert', 'Conducteur de travaux', 'Chef d''équipe', 'Actif', '06 98 76 54 32'),
('u3', 'Luc', 'Petit', 'Chef de chantier', 'Employé', 'Actif', '07 11 22 33 44'),
('u4', 'Pierre', 'Dubois', 'Maçon', 'Employé', 'Actif', '06 55 44 33 22'),
('u5', 'Thomas', 'Bernard', 'Électricien', 'Employé', 'Actif', '06 88 99 00 11'),
('u6', 'Jean', 'Dupont', 'Plombier', 'Employé', 'Actif', '06 77 66 55 44'),
('u7', 'Antoine', 'Rousseau', 'Manœuvre', 'Employé', 'Actif', '06 44 55 66 77');

-- Chantiers
INSERT INTO chantiers (id, name, client, address, status, budget_hours, worked_hours, color) VALUES
('c1', 'Villa Cap d''Antibes', 'M. & Mme. Grimaldi', '12 Avenue des Fleurs, 06160 Antibes', 'Ouvert', 200.00, 87.00, '#6050f3'),
('c2', 'Rénovation Appartement Nice', 'Mme. Sarah Levy', '45 Rue de la Préfecture, 06300 Nice', 'Ouvert', 120.00, 120.00, '#10b981'),
('c3', 'Extension Bureaux Sophia', 'Société Sopra', 'Route des Lucioles, 06560 Valbonne', 'Ouvert', 350.00, 0.00, '#3b82f6'),
('c4', 'Construction Hangar Cannes', 'SCI du Midi', '88 Boulevard du Midi, 06150 Cannes', 'Ouvert', 500.00, 0.00, '#f59e0b');

-- Planning Allocations (Forecasts)
INSERT INTO planning_allocations (chantier_id, user_id, start_time, end_time) VALUES
('c1', 'u4', '08:00:00', '17:00:00'),
('c1', 'u5', '08:00:00', '17:00:00'),
('c2', 'u3', '08:00:00', '17:00:00'),
('c2', 'u6', '08:00:00', '17:00:00');

-- Jours affectés au planning
INSERT INTO planning_allocation_days (chantier_id, user_id, day_index) VALUES
('c1', 'u4', 0), ('c1', 'u4', 1), ('c1', 'u4', 2), ('c1', 'u4', 3), ('c1', 'u4', 4), -- Lundi au Vendredi
('c1', 'u5', 0), ('c1', 'u5', 2), ('c1', 'u5', 4),                                 -- Lun, Mer, Ven
('c2', 'u3', 0), ('c2', 'u3', 1), ('c2', 'u3', 2), ('c2', 'u3', 3), ('c2', 'u3', 4), -- Lundi au Vendredi
('c2', 'u6', 0), ('c2', 'u6', 1), ('c2', 'u6', 2);                                 -- Lun, Mar, Mer

-- Feuilles d'heures (Saisies)
INSERT INTO hours_allocations (chantier_id, user_id, day_index, hours_value) VALUES
('c1', 'u4', 0, '08:00'),
('c1', 'u4', 1, 'À compléter'),
('c1', 'u4', 2, '00:00'),
('c1', 'u4', 3, '09:00'),
('c1', 'u4', 4, '00:00'),

('c1', 'u5', 0, '00:00'),
('c1', 'u5', 1, '06:00'),
('c1', 'u5', 2, '00:00'),
('c1', 'u5', 3, '03:00'),
('c1', 'u5', 4, '00:00'),

('c2', 'u3', 0, '08:00'),
('c2', 'u3', 1, '08:00'),
('c2', 'u3', 2, '08:00'),
('c2', 'u3', 3, '08:00'),
('c2', 'u3', 4, '08:00'),

('c2', 'u6', 0, '08:00'),
('c2', 'u6', 1, '08:00'),
('c2', 'u6', 2, '08:00'),
('c2', 'u6', 3, '00:00'),
('c2', 'u6', 4, '00:00');

-- Mémos de chantiers
INSERT INTO chantier_feeds (chantier_id, author, avatar, content) VALUES
('c1', 'Alobees Support', 'AS', 'Il s''agit d''un exemple de chantier que vous pourrez fermer lorsque vous le souhaitez.'),
('c2', 'Luc Petit', 'LP', 'Point d''étape : Fondation terminée, coulage de dalle prévu demain matin.');

-- Documents de chantiers
INSERT INTO chantier_documents (chantier_id, name, file_size, author) VALUES
('c1', 'Plan_Maconnerie_V1.pdf', '4.2 MB', 'Jules Marcon'),
('c1', 'Devis_Signe_Fermeture.pdf', '1.8 MB', 'Marc Lambert'),
('c2', 'Plan_Architecte_Villa.pdf', '12.4 MB', 'Marc Lambert');

-- Activités
INSERT INTO dashboard_activities (activity_text) VALUES
('Jules Marcon a créé le planning de la semaine'),
('Nouveau chantier créé : Sophia Antipolis'),
('Affectation de Pierre Dubois modifiée');
