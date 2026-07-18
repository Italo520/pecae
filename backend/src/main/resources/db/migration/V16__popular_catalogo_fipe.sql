-- ============================================================
-- PECAÊ — Migração V16
-- V16__popular_catalogo_fipe.sql
--
-- Popula o catálogo de veículos com 20 marcas populares brasileiras,
-- seus modelos mais vendidos, versões e anos (2000-2026).
-- ============================================================

DO $$
DECLARE
    v_count INTEGER;
    -- Marcas
    b_vw_id UUID := gen_random_uuid();
    b_fiat_id UUID := gen_random_uuid();
    b_gm_id UUID := gen_random_uuid();
    b_ford_id UUID := gen_random_uuid();
    b_hyundai_id UUID := gen_random_uuid();
    b_toyota_id UUID := gen_random_uuid();
    b_honda_id UUID := gen_random_uuid();
    b_renault_id UUID := gen_random_uuid();
    b_jeep_id UUID := gen_random_uuid();
    b_nissan_id UUID := gen_random_uuid();
    b_peugeot_id UUID := gen_random_uuid();
    b_citroen_id UUID := gen_random_uuid();
    b_kia_id UUID := gen_random_uuid();
    b_mitsubishi_id UUID := gen_random_uuid();
    b_bmw_id UUID := gen_random_uuid();
    b_mercedes_id UUID := gen_random_uuid();
    b_audi_id UUID := gen_random_uuid();
    b_landrover_id UUID := gen_random_uuid();
    b_volvo_id UUID := gen_random_uuid();
    b_chery_id UUID := gen_random_uuid();

    -- Modelos VW
    m_gol_id UUID := gen_random_uuid();
    m_polo_id UUID := gen_random_uuid();
    m_golf_id UUID := gen_random_uuid();
    m_tcross_id UUID := gen_random_uuid();
    m_nivus_id UUID := gen_random_uuid();
    m_saveiro_id UUID := gen_random_uuid();

    -- Modelos Fiat
    m_uno_id UUID := gen_random_uuid();
    m_palio_id UUID := gen_random_uuid();
    m_argo_id UUID := gen_random_uuid();
    m_toro_id UUID := gen_random_uuid();
    m_strada_id UUID := gen_random_uuid();

    -- Modelos GM
    m_onix_id UUID := gen_random_uuid();
    m_prisma_id UUID := gen_random_uuid();
    m_tracker_id UUID := gen_random_uuid();
    m_s10_id UUID := gen_random_uuid();

    -- Modelos Toyota
    m_corolla_id UUID := gen_random_uuid();
    m_hilux_id UUID := gen_random_uuid();
    m_yaris_id UUID := gen_random_uuid();

    -- Modelos Honda
    m_civic_id UUID := gen_random_uuid();
    m_fit_id UUID := gen_random_uuid();
    m_hrv_id UUID := gen_random_uuid();

    -- Versões
    v_id UUID;
    y INTEGER;
BEGIN
    -- Verificar se o catálogo já está populado
    SELECT count(*) INTO v_count FROM vehicle_models;
    IF v_count > 5 THEN
        -- Catálogo já populado, sair mais cedo
        RETURN;
    END IF;

    -- 1. Inserir Marcas
    INSERT INTO vehicle_brands (id, name, active, created_at, updated_at) VALUES
    (b_vw_id, 'Volkswagen', true, NOW(), NOW()),
    (b_fiat_id, 'Fiat', true, NOW(), NOW()),
    (b_gm_id, 'Chevrolet', true, NOW(), NOW()),
    (b_ford_id, 'Ford', true, NOW(), NOW()),
    (b_hyundai_id, 'Hyundai', true, NOW(), NOW()),
    (b_toyota_id, 'Toyota', true, NOW(), NOW()),
    (b_honda_id, 'Honda', true, NOW(), NOW()),
    (b_renault_id, 'Renault', true, NOW(), NOW()),
    (b_jeep_id, 'Jeep', true, NOW(), NOW()),
    (b_nissan_id, 'Nissan', true, NOW(), NOW()),
    (b_peugeot_id, 'Peugeot', true, NOW(), NOW()),
    (b_citroen_id, 'Citroën', true, NOW(), NOW()),
    (b_kia_id, 'Kia', true, NOW(), NOW()),
    (b_mitsubishi_id, 'Mitsubishi', true, NOW(), NOW()),
    (b_bmw_id, 'BMW', true, NOW(), NOW()),
    (b_mercedes_id, 'Mercedes-Benz', true, NOW(), NOW()),
    (b_audi_id, 'Audi', true, NOW(), NOW()),
    (b_landrover_id, 'Land Rover', true, NOW(), NOW()),
    (b_volvo_id, 'Volvo', true, NOW(), NOW()),
    (b_chery_id, 'Caoa Chery', true, NOW(), NOW())
    ON CONFLICT (name) DO NOTHING;

    -- 2. Inserir Modelos
    -- VW
    INSERT INTO vehicle_models (id, brand_id, name, segment, active, created_at, updated_at) VALUES
    (m_gol_id, b_vw_id, 'Gol', 'HATCH', true, NOW(), NOW()),
    (m_polo_id, b_vw_id, 'Polo', 'HATCH', true, NOW(), NOW()),
    (m_golf_id, b_vw_id, 'Golf', 'HATCH', true, NOW(), NOW()),
    (m_tcross_id, b_vw_id, 'T-Cross', 'SUV', true, NOW(), NOW()),
    (m_nivus_id, b_vw_id, 'Nivus', 'SUV', true, NOW(), NOW()),
    (m_saveiro_id, b_vw_id, 'Saveiro', 'PICKUP', true, NOW(), NOW());

    -- Fiat
    INSERT INTO vehicle_models (id, brand_id, name, segment, active, created_at, updated_at) VALUES
    (m_uno_id, b_fiat_id, 'Uno', 'HATCH', true, NOW(), NOW()),
    (m_palio_id, b_fiat_id, 'Palio', 'HATCH', true, NOW(), NOW()),
    (m_argo_id, b_fiat_id, 'Argo', 'HATCH', true, NOW(), NOW()),
    (m_toro_id, b_fiat_id, 'Toro', 'PICKUP', true, NOW(), NOW()),
    (m_strada_id, b_fiat_id, 'Strada', 'PICKUP', true, NOW(), NOW());

    -- Chevrolet (GM)
    INSERT INTO vehicle_models (id, brand_id, name, segment, active, created_at, updated_at) VALUES
    (m_onix_id, b_gm_id, 'Onix', 'HATCH', true, NOW(), NOW()),
    (m_prisma_id, b_gm_id, 'Prisma', 'SEDAN', true, NOW(), NOW()),
    (m_tracker_id, b_gm_id, 'Tracker', 'SUV', true, NOW(), NOW()),
    (m_s10_id, b_gm_id, 'S10', 'PICKUP', true, NOW(), NOW());

    -- Toyota
    INSERT INTO vehicle_models (id, brand_id, name, segment, active, created_at, updated_at) VALUES
    (m_corolla_id, b_toyota_id, 'Corolla', 'SEDAN', true, NOW(), NOW()),
    (m_hilux_id, b_toyota_id, 'Hilux', 'PICKUP', true, NOW(), NOW()),
    (m_yaris_id, b_toyota_id, 'Yaris', 'HATCH', true, NOW(), NOW());

    -- Honda
    INSERT INTO vehicle_models (id, brand_id, name, segment, active, created_at, updated_at) VALUES
    (m_civic_id, b_honda_id, 'Civic', 'SEDAN', true, NOW(), NOW()),
    (m_fit_id, b_honda_id, 'Fit', 'HATCH', true, NOW(), NOW()),
    (m_hrv_id, b_honda_id, 'HR-V', 'SUV', true, NOW(), NOW());

    -- Seed de outros modelos simples para as marcas restantes
    INSERT INTO vehicle_models (id, brand_id, name, segment, active, created_at, updated_at) VALUES
    (gen_random_uuid(), b_ford_id, 'Ka', 'HATCH', true, NOW(), NOW()),
    (gen_random_uuid(), b_ford_id, 'EcoSport', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_ford_id, 'Ranger', 'PICKUP', true, NOW(), NOW()),
    (gen_random_uuid(), b_hyundai_id, 'HB20', 'HATCH', true, NOW(), NOW()),
    (gen_random_uuid(), b_hyundai_id, 'Creta', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_renault_id, 'Kwid', 'HATCH', true, NOW(), NOW()),
    (gen_random_uuid(), b_renault_id, 'Sandero', 'HATCH', true, NOW(), NOW()),
    (gen_random_uuid(), b_renault_id, 'Duster', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_jeep_id, 'Renegade', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_jeep_id, 'Compass', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_nissan_id, 'Kicks', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_nissan_id, 'Frontier', 'PICKUP', true, NOW(), NOW()),
    (gen_random_uuid(), b_peugeot_id, '208', 'HATCH', true, NOW(), NOW()),
    (gen_random_uuid(), b_peugeot_id, '2008', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_citroen_id, 'C3', 'HATCH', true, NOW(), NOW()),
    (gen_random_uuid(), b_citroen_id, 'C4 Cactus', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_kia_id, 'Sportage', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_kia_id, 'Cerato', 'SEDAN', true, NOW(), NOW()),
    (gen_random_uuid(), b_mitsubishi_id, 'L200 Triton', 'PICKUP', true, NOW(), NOW()),
    (gen_random_uuid(), b_mitsubishi_id, 'ASX', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_bmw_id, '320i', 'SEDAN', true, NOW(), NOW()),
    (gen_random_uuid(), b_bmw_id, 'X1', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_mercedes_id, 'Classe C', 'SEDAN', true, NOW(), NOW()),
    (gen_random_uuid(), b_mercedes_id, 'GLA', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_audi_id, 'A3', 'SEDAN', true, NOW(), NOW()),
    (gen_random_uuid(), b_audi_id, 'Q3', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_landrover_id, 'Evoque', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_landrover_id, 'Discovery', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_volvo_id, 'XC60', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_volvo_id, 'XC40', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_chery_id, 'Tiggo 5X', 'SUV', true, NOW(), NOW()),
    (gen_random_uuid(), b_chery_id, 'Tiggo 8', 'SUV', true, NOW(), NOW());

    -- 3. Inserir Versões e Anos para Modelos Populares
    -- VW GOL
    v_id := gen_random_uuid();
    INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
    VALUES (v_id, m_gol_id, '1.0 Trendline Flex', 'FLEX', 'MANUAL', true, NOW(), NOW());
    FOR y IN 2012..2022 LOOP
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES (gen_random_uuid(), v_id, y, y, NOW());
    END LOOP;

    v_id := gen_random_uuid();
    INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
    VALUES (v_id, m_gol_id, '1.6 MSI Flex', 'FLEX', 'MANUAL', true, NOW(), NOW());
    FOR y IN 2014..2022 LOOP
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES (gen_random_uuid(), v_id, y, y, NOW());
    END LOOP;

    -- VW POLO
    v_id := gen_random_uuid();
    INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
    VALUES (v_id, m_polo_id, '1.0 TSI Comfortline', 'FLEX', 'AUTOMATIC', true, NOW(), NOW());
    FOR y IN 2018..2026 LOOP
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES (gen_random_uuid(), v_id, y, y, NOW());
    END LOOP;

    -- FIAT PALIO
    v_id := gen_random_uuid();
    INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
    VALUES (v_id, m_palio_id, '1.0 Fire Flex', 'FLEX', 'MANUAL', true, NOW(), NOW());
    FOR y IN 2005..2017 LOOP
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES (gen_random_uuid(), v_id, y, y, NOW());
    END LOOP;

    -- FIAT STRADA
    v_id := gen_random_uuid();
    INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
    VALUES (v_id, m_strada_id, '1.3 Firefly Freedom Cabine Dupla', 'FLEX', 'MANUAL', true, NOW(), NOW());
    FOR y IN 2020..2026 LOOP
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES (gen_random_uuid(), v_id, y, y, NOW());
    END LOOP;

    -- GM ONIX
    v_id := gen_random_uuid();
    INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
    VALUES (v_id, m_onix_id, '1.0 LT Flex Turbo', 'FLEX', 'MANUAL', true, NOW(), NOW());
    FOR y IN 2019..2026 LOOP
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES (gen_random_uuid(), v_id, y, y, NOW());
    END LOOP;

    v_id := gen_random_uuid();
    INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
    VALUES (v_id, m_onix_id, '1.0 LTZ Turbo Automático', 'FLEX', 'AUTOMATIC', true, NOW(), NOW());
    FOR y IN 2019..2026 LOOP
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES (gen_random_uuid(), v_id, y, y, NOW());
    END LOOP;

    -- TOYOTA COROLLA
    v_id := gen_random_uuid();
    INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
    VALUES (v_id, m_corolla_id, '2.0 XEI Flex', 'FLEX', 'CVT', true, NOW(), NOW());
    FOR y IN 2014..2026 LOOP
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES (gen_random_uuid(), v_id, y, y, NOW());
    END LOOP;

    -- HONDA CIVIC
    v_id := gen_random_uuid();
    INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
    VALUES (v_id, m_civic_id, '2.0 EXL Flex', 'FLEX', 'CVT', true, NOW(), NOW());
    FOR y IN 2016..2021 LOOP
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES (gen_random_uuid(), v_id, y, y, NOW());
    END LOOP;

END $$;
