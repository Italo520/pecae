-- Migration V14: Sistema de Publicidade (M13)

-- Tabela de Anunciantes (patrocinadores externos)
CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_empresa VARCHAR(255) NOT NULL,
    nome_contato VARCHAR(255),
    email_contato VARCHAR(255),
    telefone_contato VARCHAR(50),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Campanhas Publicitárias
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'RASCUNHO',
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    orcamento_total NUMERIC(15,2),
    notas_internas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Criativos (banners individuais de cada campanha)
CREATE TABLE IF NOT EXISTS ad_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    titulo_alt VARCHAR(255) NOT NULL,
    url_imagem TEXT NOT NULL,
    url_destino TEXT NOT NULL,
    texto_cta VARCHAR(100),
    placement VARCHAR(100) NOT NULL,
    prioridade INT NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Impressões (exibições do banner)
CREATE TABLE IF NOT EXISTS ad_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creative_id UUID NOT NULL REFERENCES ad_creatives(id) ON DELETE CASCADE,
    ip_usuario VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Cliques
CREATE TABLE IF NOT EXISTS ad_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creative_id UUID NOT NULL REFERENCES ad_creatives(id) ON DELETE CASCADE,
    ip_usuario VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser ON ad_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_periodo ON ad_campaigns(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_campaign ON ad_creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_placement ON ad_creatives(placement) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_ad_impressions_creative ON ad_impressions(creative_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_creative ON ad_clicks(creative_id);
