-- Adiciona índices para otimização de consultas e busca textual

-- Índice funcional em cidade e estado (já que usamos LOWER() na busca)
CREATE INDEX IF NOT EXISTS idx_vehicles_city_state ON vehicles (LOWER(city), LOWER(state));

-- Índice parcial composto para busca de anúncios públicos (os mais acessados)
CREATE INDEX IF NOT EXISTS idx_listings_status_seller_published ON listings (status, seller_profile_id, published_at DESC) WHERE deleted_at IS NULL;

-- Índice GIN para busca textual Full-Text Search (vetor)
CREATE INDEX IF NOT EXISTS idx_listings_search_vector ON listings USING GIN (search_vector);
