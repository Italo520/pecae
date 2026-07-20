-- flyway:no-transaction
-- ============================================================
-- PECAÊ — Migração V21
-- V21__adicionar_status_encerrado_db.sql
--
-- Adiciona o valor 'CLOSED' ao enum 'ListingStatus' no PostgreSQL.
-- Executado sem transação conforme exigência do PostgreSQL para ALTER TYPE ADD VALUE.
-- ============================================================

ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'CLOSED';
