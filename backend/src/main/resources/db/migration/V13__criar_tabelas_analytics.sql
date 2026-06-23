-- Migration V13: Tabelas de Analytics (M12)
CREATE TABLE IF NOT EXISTS admin_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_date DATE NOT NULL UNIQUE,
    dau INT DEFAULT 0,
    total_listings INT DEFAULT 0,
    total_revenue NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reference_date DATE NOT NULL,
    total_views INT DEFAULT 0,
    total_contacts INT DEFAULT 0,
    conversion_rate NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (seller_id, reference_date)
);

CREATE INDEX IF NOT EXISTS idx_seller_metrics_date ON seller_metrics(reference_date);
CREATE INDEX IF NOT EXISTS idx_seller_metrics_seller_id ON seller_metrics(seller_id);
