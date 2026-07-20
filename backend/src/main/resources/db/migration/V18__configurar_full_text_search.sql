-- ============================================================
-- PECAÊ — Migração V18
-- V18__configurar_full_text_search.sql
--
-- Configura Full-Text Search no PostgreSQL para busca rápida e flexível.
-- Adiciona vetor de busca nas listings e configura triggers de sincronização.
-- ============================================================

-- 1. Adicionar a coluna search_vector na tabela listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Criar índice GIN sobre search_vector para busca super rápida
CREATE INDEX IF NOT EXISTS idx_listings_search_vector ON listings USING gin(search_vector);

-- 3. Função para recalcular o vetor de busca de um anúncio
CREATE OR REPLACE FUNCTION fill_listing_search_vector()
RETURNS TRIGGER AS $$
DECLARE
    v_obs TEXT;
    v_city TEXT;
    v_state TEXT;
    v_brand TEXT;
    v_model TEXT;
    v_version TEXT;
BEGIN
    -- Busca informações associadas no veículo e no catálogo
    SELECT v.observations, v.city, v.state, vb.name, vm.name, vv.name
    INTO v_obs, v_city, v_state, v_brand, v_model, v_version
    FROM vehicles v
    JOIN vehicle_versions vv ON v.version_id = vv.id
    JOIN vehicle_models vm ON vv.model_id = vm.id
    JOIN vehicle_brands vb ON vm.brand_id = vb.id
    WHERE v.id = NEW.vehicle_id;

    -- Concatena tudo num tsvector usando o dicionário portuguese do Postgres
    NEW.search_vector := 
        to_tsvector('portuguese', coalesce(NEW.title, '')) ||
        to_tsvector('portuguese', coalesce(NEW.description, '')) ||
        to_tsvector('portuguese', coalesce(v_obs, '')) ||
        to_tsvector('portuguese', coalesce(v_city, '')) ||
        to_tsvector('portuguese', coalesce(v_state, '')) ||
        to_tsvector('portuguese', coalesce(v_brand, '')) ||
        to_tsvector('portuguese', coalesce(v_model, '')) ||
        to_tsvector('portuguese', coalesce(v_version, ''));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar o trigger de atualização automática no insert/update do anúncio
DROP TRIGGER IF EXISTS trg_listings_search_vector_update ON listings;
CREATE TRIGGER trg_listings_search_vector_update
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION fill_listing_search_vector();

-- 5. Função para forçar atualização no anúncio quando o veículo mudar
CREATE OR REPLACE FUNCTION ref_vehicle_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE listings 
    SET updated_at = NOW() 
    WHERE vehicle_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar o trigger no veículo para recalcular os dados relacionados
DROP TRIGGER IF EXISTS trg_vehicles_search_vector_update ON vehicles;
CREATE TRIGGER trg_vehicles_search_vector_update
AFTER UPDATE ON vehicles
FOR EACH ROW
WHEN (
    OLD.observations IS DISTINCT FROM NEW.observations OR 
    OLD.city IS DISTINCT FROM NEW.city OR 
    OLD.state IS DISTINCT FROM NEW.state
)
EXECUTE FUNCTION ref_vehicle_listing_search_vector();

-- 7. Popular os registros existentes com o novo vetor
UPDATE listings SET updated_at = NOW();
