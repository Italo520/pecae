-- ============================================================
-- V9 — Avaliações e Reputação: reviews
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id   UUID        NOT NULL REFERENCES seller_profiles(id) ON DELETE CASCADE,
    rating      INTEGER     NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Apenas 1 avaliação por usuário para um vendedor
    CONSTRAINT uq_reviews_reviewer_seller UNIQUE (reviewer_id, seller_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller_id   ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
