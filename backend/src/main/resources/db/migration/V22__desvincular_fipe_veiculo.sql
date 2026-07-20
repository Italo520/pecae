-- ============================================================
-- PECAÊ — Migração V22
-- V22__desvincular_fipe_veiculo.sql
--
-- Remove a dependência estrita do catálogo interno (versões/anos)
-- e permite armazenar as strings vindas da FIPE (API Parallelum)
-- diretamente na tabela de veículos para busca via texto.
-- ============================================================

-- 1. Adicionar colunas textuais na tabela vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS marca_nome VARCHAR(255);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS modelo_nome VARCHAR(255);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ano_nome VARCHAR(255);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS versao_nome VARCHAR(255);

-- 2. Migrar dados existentes das chaves estrangeiras para as novas colunas
UPDATE vehicles v
SET marca_nome = b.name,
    modelo_nome = m.name,
    versao_nome = ver.name,
    ano_nome = CAST(y.year AS VARCHAR)
FROM vehicle_versions ver
JOIN vehicle_models m ON ver.model_id = m.id
JOIN vehicle_brands b ON m.brand_id = b.id
JOIN vehicle_years y ON v.year_fab_id = y.id
WHERE v.version_id = ver.id;

-- Tratamento para veículos que possam ter falhado no update acima
UPDATE vehicles SET marca_nome = 'Desconhecida' WHERE marca_nome IS NULL;
UPDATE vehicles SET modelo_nome = 'Desconhecido' WHERE modelo_nome IS NULL;
UPDATE vehicles SET ano_nome = '0000' WHERE ano_nome IS NULL;

-- 3. Aplicar NOT NULL após a migração dos dados
ALTER TABLE vehicles ALTER COLUMN marca_nome SET NOT NULL;
ALTER TABLE vehicles ALTER COLUMN modelo_nome SET NOT NULL;
ALTER TABLE vehicles ALTER COLUMN ano_nome SET NOT NULL;

-- 4. Remover as restrições de chave estrangeira antigas
-- Se houverem nomes customizados gerados pelo JPA/Hibernate, iremos remover a coluna diretamente que cascadeia a fk.
ALTER TABLE vehicles DROP COLUMN IF EXISTS version_id CASCADE;
ALTER TABLE vehicles DROP COLUMN IF EXISTS year_fab_id CASCADE;
