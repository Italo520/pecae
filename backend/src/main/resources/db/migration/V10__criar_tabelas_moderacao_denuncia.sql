-- ============================================================
-- V10 — Moderação e Denúncias: reports, audit_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL,
    target_id   UUID        NOT NULL,
    category    VARCHAR(50) NOT NULL,
    description TEXT,
    status      VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action       VARCHAR(50) NOT NULL,
    entity       VARCHAR(50) NOT NULL,
    entity_id    UUID        NOT NULL,
    reason       TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
