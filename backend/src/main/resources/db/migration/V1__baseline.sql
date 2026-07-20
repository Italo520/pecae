-- ============================================================
-- PECAÊ — Flyway Baseline Migration
-- V1__baseline.sql
--
-- Este é um baseline vazio porque o schema já existe no banco
-- PostgreSQL (criado pelo Prisma). O Flyway usa baseline-on-migrate=true
-- para registrar que esta versão já está aplicada.
--
-- Novas migrações devem ser criadas como V2__xxx.sql, V3__xxx.sql, etc.
-- ============================================================

-- Extensão pg_trgm (já habilitada pelo Prisma)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Nenhuma outra alteração necessária nesta baseline.
-- O schema completo já existe no banco e será validado pelo Hibernate (ddl-auto=validate).
