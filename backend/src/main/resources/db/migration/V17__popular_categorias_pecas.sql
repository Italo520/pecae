-- ============================================================
-- PECAÊ — Migração V17
-- V17__popular_categorias_pecas.sql
--
-- Popula a tabela de categorias de peças (part_categories)
-- com no mínimo 20 categorias padrão do mercado brasileiro.
-- ============================================================

INSERT INTO part_categories (id, name, slug, icon, created_at) VALUES
(gen_random_uuid(), 'Motor', 'motor', 'engine', NOW()),
(gen_random_uuid(), 'Câmbio/Transmissão', 'cambio-transmissao', 'transmission', NOW()),
(gen_random_uuid(), 'Suspensão', 'suspensao', 'suspension', NOW()),
(gen_random_uuid(), 'Freios', 'freios', 'brake', NOW()),
(gen_random_uuid(), 'Direção', 'direcao', 'steering-wheel', NOW()),
(gen_random_uuid(), 'Sistema Elétrico', 'sistema-eletrico', 'zap', NOW()),
(gen_random_uuid(), 'Carroceria', 'carroceria', 'car', NOW()),
(gen_random_uuid(), 'Vidros', 'vidros', 'glass', NOW()),
(gen_random_uuid(), 'Faróis/Lanternas', 'farois-lanternas', 'lightbulb', NOW()),
(gen_random_uuid(), 'Rodas/Pneus', 'rodas-pneus', 'disc', NOW()),
(gen_random_uuid(), 'Interior/Bancos', 'interior-bancos', 'armchair', NOW()),
(gen_random_uuid(), 'Ar Condicionado', 'ar-condicionado', 'wind', NOW()),
(gen_random_uuid(), 'Escapamento', 'escapamento', 'gauge', NOW()),
(gen_random_uuid(), 'Radiador', 'radiador', 'thermometer', NOW()),
(gen_random_uuid(), 'Para-choques', 'para-choques', 'shield', NOW()),
(gen_random_uuid(), 'Portas', 'portas', 'door', NOW()),
(gen_random_uuid(), 'Capô', 'capo', 'cap', NOW()),
(gen_random_uuid(), 'Tampa Traseira', 'tampa-traseira', 'archive', NOW()),
(gen_random_uuid(), 'Painel', 'painel', 'layout', NOW()),
(gen_random_uuid(), 'Retrovisores', 'retrovisores', 'eye', NOW())
ON CONFLICT (name) DO NOTHING;
