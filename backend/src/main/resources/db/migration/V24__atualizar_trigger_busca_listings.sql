-- ============================================================
-- PECAÊ — Migração V24
-- V24__atualizar_trigger_busca_listings.sql
--
-- Atualiza a função de busca full-text para considerar a nova
-- estrutura da tabela vehicles (sem version_id)
-- ============================================================

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
    -- Busca informações associadas no veículo diretamente
    SELECT v.observations, v.city, v.state, v.marca_nome, v.modelo_nome, v.versao_nome
    INTO v_obs, v_city, v_state, v_brand, v_model, v_version
    FROM vehicles v
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
