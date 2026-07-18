-- ============================================================
-- PECAÊ — Migração V19
-- V19__adicionar_campos_aceite_lgpd.sql
--
-- Adiciona colunas para controle de consentimento da LGPD na tabela users.
-- Armazena o timestamp exato do aceite dos Termos de Uso e Política de Privacidade.
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS accepted_privacy_at TIMESTAMP;
