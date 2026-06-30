const { Client } = require('pg');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pecae';

async function seed() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('🌱 Iniciando Seed E2E no banco:', dbUrl);

    // 1. Criar hash da senha 'Pecae@E2e123'
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Pecae@E2e123', salt);
    console.log('Senha E2E hasheada:', hash);

    const users = [
      { name: 'Buyer E2E', email: 'buyer-e2e@pecae.com.br', role: 'BUYER', status: 'ACTIVE' },
      { name: 'Seller E2E', email: 'seller-e2e@pecae.com.br', role: 'SELLER', status: 'ACTIVE' },
      { name: 'Moderator E2E', email: 'moderator-e2e@pecae.com.br', role: 'MODERATOR', status: 'ACTIVE' },
      { name: 'Admin E2E', email: 'admin-e2e@pecae.com.br', role: 'ADMIN', status: 'ACTIVE' },
      { name: 'Malicious Buyer E2E', email: 'malicious-e2e@pecae.com.br', role: 'BUYER', status: 'ACTIVE' },
      { name: 'Seller Quota E2E', email: 'seller-quota-e2e@pecae.com.br', role: 'SELLER', status: 'ACTIVE' },
      { name: 'Buyer Chat E2E', email: 'buyer-chat-e2e@pecae.com.br', role: 'BUYER', status: 'ACTIVE' },
      { name: 'Seller Chat E2E', email: 'seller-chat-e2e@pecae.com.br', role: 'SELLER', status: 'ACTIVE' }
    ];

    for (const u of users) {
      const id = crypto.randomUUID();
      await client.query(`
        INSERT INTO users (id, name, email, password_hash, type, status, email_verified, phone_verified, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET 
          password_hash = EXCLUDED.password_hash,
          type = EXCLUDED.type,
          status = EXCLUDED.status,
          updated_at = NOW();
      `, [id, u.name, u.email, hash, u.role, u.status]);
    }

    // 3. Inserir Catálogo de Veículos
    const brandName = 'Volkswagen';
    let brandRes = await client.query(`SELECT id FROM vehicle_brands WHERE name = $1`, [brandName]);
    if (brandRes.rows.length === 0) {
      await client.query(`
        INSERT INTO vehicle_brands (id, name, active, created_at, updated_at)
        VALUES ($1, $2, true, NOW(), NOW())
      `, [crypto.randomUUID(), brandName]);
      brandRes = await client.query(`SELECT id FROM vehicle_brands WHERE name = $1`, [brandName]);
    }
    const actualBrandId = brandRes.rows[0].id;

    const modelName = 'Gol';
    let modelRes = await client.query(`SELECT id FROM vehicle_models WHERE name = $1 AND brand_id = $2`, [modelName, actualBrandId]);
    if (modelRes.rows.length === 0) {
      await client.query(`
        INSERT INTO vehicle_models (id, brand_id, name, segment, active, created_at, updated_at)
        VALUES ($1, $2, $3, 'HATCH', true, NOW(), NOW())
      `, [crypto.randomUUID(), actualBrandId, modelName]);
      modelRes = await client.query(`SELECT id FROM vehicle_models WHERE name = $1 AND brand_id = $2`, [modelName, actualBrandId]);
    }
    const actualModelId = modelRes.rows[0].id;

    const versionName = '1.0 MI 8V';
    let versionRes = await client.query(`SELECT id FROM vehicle_versions WHERE name = $1 AND model_id = $2`, [versionName, actualModelId]);
    if (versionRes.rows.length === 0) {
      await client.query(`
        INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
        VALUES ($1, $2, $3, 'FLEX', 'MANUAL', true, NOW(), NOW())
      `, [crypto.randomUUID(), actualModelId, versionName]);
      versionRes = await client.query(`SELECT id FROM vehicle_versions WHERE name = $1 AND model_id = $2`, [versionName, actualModelId]);
    }
    const actualVersionId = versionRes.rows[0].id;

    const yearVal = 2012;
    let yearRes = await client.query(`SELECT id FROM vehicle_years WHERE year = $1 AND version_id = $2`, [yearVal, actualVersionId]);
    if (yearRes.rows.length === 0) {
      await client.query(`
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES ($1, $2, $3, $3, NOW())
      `, [crypto.randomUUID(), actualVersionId, yearVal]);
    }

    // 4. Inserir Catálogo de Peças (mínimo 5)
    let categoryRes = await client.query(`SELECT id FROM part_categories WHERE name = 'GERAL'`);
    let actualCategoryId;
    if (categoryRes.rows.length === 0) {
      const categoryId = crypto.randomUUID();
      await client.query(`
        INSERT INTO part_categories (id, name, slug, icon, created_at)
        VALUES ($1, 'GERAL', 'geral', 'wrench', NOW())
      `, [categoryId]);
      actualCategoryId = categoryId;
    } else {
      actualCategoryId = categoryRes.rows[0].id;
    }

    const parts = [
      { name: 'Motor', slug: 'motor' },
      { name: 'Câmbio', slug: 'cambio' },
      { name: 'Porta Esquerda', slug: 'porta-esquerda' },
      { name: 'Farol Direito', slug: 'farol-direito' },
      { name: 'Capô', slug: 'capo' },
      { name: 'Roda Liga Leve', slug: 'roda-liga-leve' }
    ];
    for (const p of parts) {
      let partRes = await client.query(`SELECT id FROM part_catalog WHERE name = $1`, [p.name]);
      if (partRes.rows.length === 0) {
        await client.query(`
          INSERT INTO part_catalog (id, category_id, name, slug, created_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [crypto.randomUUID(), actualCategoryId, p.name, p.slug]);
      }
    }

    console.log('✅ Seed E2E concluído com sucesso!');

    // 5. Inserir Marca GM, Modelo Onix, Veículo e Anúncio Patrocinado
    const gmBrandName = 'GM';
    let gmBrandRes = await client.query(`SELECT id FROM vehicle_brands WHERE name = $1`, [gmBrandName]);
    if (gmBrandRes.rows.length === 0) {
      await client.query(`
        INSERT INTO vehicle_brands (id, name, active, created_at, updated_at)
        VALUES ($1, $2, true, NOW(), NOW())
      `, [crypto.randomUUID(), gmBrandName]);
      gmBrandRes = await client.query(`SELECT id FROM vehicle_brands WHERE name = $1`, [gmBrandName]);
    }
    const gmBrandId = gmBrandRes.rows[0].id;

    const onixModelName = 'Onix';
    let onixModelRes = await client.query(`SELECT id FROM vehicle_models WHERE name = $1 AND brand_id = $2`, [onixModelName, gmBrandId]);
    if (onixModelRes.rows.length === 0) {
      await client.query(`
        INSERT INTO vehicle_models (id, brand_id, name, segment, active, created_at, updated_at)
        VALUES ($1, $2, $3, 'HATCH', true, NOW(), NOW())
      `, [crypto.randomUUID(), gmBrandId, onixModelName]);
      onixModelRes = await client.query(`SELECT id FROM vehicle_models WHERE name = $1 AND brand_id = $2`, [onixModelName, gmBrandId]);
    }
    const onixModelId = onixModelRes.rows[0].id;

    const onixVersionName = '1.0 LT';
    let onixVersionRes = await client.query(`SELECT id FROM vehicle_versions WHERE name = $1 AND model_id = $2`, [onixVersionName, onixModelId]);
    if (onixVersionRes.rows.length === 0) {
      await client.query(`
        INSERT INTO vehicle_versions (id, model_id, name, fuel, transmission, active, created_at, updated_at)
        VALUES ($1, $2, $3, 'FLEX', 'MANUAL', true, NOW(), NOW())
      `, [crypto.randomUUID(), onixModelId, onixVersionName]);
      onixVersionRes = await client.query(`SELECT id FROM vehicle_versions WHERE name = $1 AND model_id = $2`, [onixVersionName, onixModelId]);
    }
    const onixVersionId = onixVersionRes.rows[0].id;

    const onixYearVal = 2018;
    let onixYearRes = await client.query(`SELECT id FROM vehicle_years WHERE year = $1 AND version_id = $2`, [onixYearVal, onixVersionId]);
    let actualOnixYearId;
    if (onixYearRes.rows.length === 0) {
      actualOnixYearId = crypto.randomUUID();
      await client.query(`
        INSERT INTO vehicle_years (id, version_id, year_fab, year, created_at)
        VALUES ($1, $2, $3, $3, NOW())
      `, [actualOnixYearId, onixVersionId, onixYearVal]);
    } else {
      actualOnixYearId = onixYearRes.rows[0].id;
    }

    // Inserir Perfil de Vendedor para o Seller E2E
    const sellerE2eId = (await client.query(`SELECT id FROM users WHERE email = 'seller-e2e@pecae.com.br'`)).rows[0].id;
    await client.query(`
      INSERT INTO seller_profiles (id, user_id, name, seller_type, document, address, city, state, zip_code, phone, whatsapp, is_verified, created_at, updated_at)
      VALUES ($1, $2, 'Seller E2E', 'INDIVIDUAL', '11122233344', 'Rua das Sucatas, 777', 'São Paulo', 'SP', '01001-000', '11999999999', '11999999999', true, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET is_verified = true;
    `, [sellerE2eId, sellerE2eId]);
 
    // Inserir Perfil de Vendedor para o Seller Quota
    const sellerQuotaE2eId = (await client.query(`SELECT id FROM users WHERE email = 'seller-quota-e2e@pecae.com.br'`)).rows[0].id;
    await client.query(`
      INSERT INTO seller_profiles (id, user_id, name, seller_type, document, address, city, state, zip_code, phone, whatsapp, is_verified, created_at, updated_at)
      VALUES ($1, $2, 'Seller Quota E2E', 'INDIVIDUAL', '22233344455', 'Rua das Sucatas, 888', 'São Paulo', 'SP', '01001-000', '11988888888', '11988888888', true, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET is_verified = true;
    `, [sellerQuotaE2eId, sellerQuotaE2eId]);

    // Inserir um Veículo e um Anúncio Patrocinado para o Onix
    const onixVehicleId = crypto.randomUUID();
    await client.query(`
      INSERT INTO vehicles (id, seller_id, version_id, year_fab_id, plate, color, city, state, status, available_parts, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'AAA-1111', 'Preto', 'São Paulo', 'SP', 'ACTIVE', '[]', NOW(), NOW())
    `, [onixVehicleId, sellerE2eId, onixVersionId, actualOnixYearId]);

    const onixListingId = crypto.randomUUID();
    await client.query(`
      INSERT INTO listings (id, seller_profile_id, vehicle_id, title, description, status, is_sponsored_active, is_duplicate, favorites_count, views, published_at, created_at, updated_at)
      VALUES ($1, $2, $3, 'Onix Sucata E2E - Pronto para Negociar', 'Sucata Onix para testes.', 'PUBLISHED', true, false, 0, 0, NOW(), NOW(), NOW())
    `, [onixListingId, sellerE2eId, onixVehicleId]);

  } catch (error) {
    console.error('❌ Erro no seed E2E:', error);
  } finally {
    await client.end();
  }
}

seed();
