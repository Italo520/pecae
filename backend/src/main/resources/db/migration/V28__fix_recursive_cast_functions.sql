-- ============================================================
-- PECAÊ — Migração V28
-- V28__fix_recursive_cast_functions.sql
--
-- Corrige funções de CAST implícito que causam recursão infinita
-- (stack depth limit exceeded) ao usar ColumnTransformer do
-- Hibernate com enums customizados do PostgreSQL.
--
-- Com stringtype=unspecified na URL JDBC, o driver PG não envia
-- o tipo VARCHAR explicitamente, permitindo coerção implícita
-- sem invocar CASTs recursivos. As funções de CAST são removidas
-- porque não são mais necessárias.
-- ============================================================

-- 1. Remover CASTs implícitos recursivos (se existirem)
DROP CAST IF EXISTS (varchar AS "ListingStatus");
DROP CAST IF EXISTS (varchar AS "VehicleStatus");
DROP CAST IF EXISTS (varchar AS "FuelType");
DROP CAST IF EXISTS (varchar AS "SellerType");
DROP CAST IF EXISTS (varchar AS "PhotoType");

-- 2. Remover funções de cast recursivas (se existirem)
DROP FUNCTION IF EXISTS cast_varchar_to_listingstatus(varchar);
DROP FUNCTION IF EXISTS cast_varchar_to_vehiclestatus(varchar);
DROP FUNCTION IF EXISTS cast_varchar_to_fueltype(varchar);
DROP FUNCTION IF EXISTS cast_varchar_to_sellertype(varchar);
DROP FUNCTION IF EXISTS cast_varchar_to_phototype(varchar);
