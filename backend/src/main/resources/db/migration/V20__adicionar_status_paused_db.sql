-- flyway:no-transaction
-- ============================================================
-- PECAÊ — Migração V20
-- V20__adicionar_status_paused_db.sql
--
-- Adiciona o valor 'PAUSED' ao enum 'ListingStatus' no PostgreSQL.
-- Executado sem transação conforme exigência do PostgreSQL para ALTER TYPE ADD VALUE.
-- ============================================================

ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'PAUSED';
