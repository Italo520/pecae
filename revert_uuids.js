const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function run() {
  await client.connect();
  console.log('Connected to Supabase to revert UUIDs to TEXT');

  const queries = [
    // Drops foreign keys so we can alter types
    'ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_brand_id_fkey',
    'ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_model_id_fkey',
    'ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_version_id_fkey',
    'ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_year_fab_id_fkey',
    'ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_year_model_id_fkey',
    'ALTER TABLE vehicle_photos DROP CONSTRAINT IF EXISTS vehicle_photos_vehicle_id_fkey',
    'ALTER TABLE seller_profiles DROP CONSTRAINT IF EXISTS seller_profiles_user_id_fkey',
    'ALTER TABLE seller_stats DROP CONSTRAINT IF EXISTS seller_stats_seller_profile_id_fkey',
    'ALTER TABLE seller_verifications DROP CONSTRAINT IF EXISTS seller_verifications_seller_profile_id_fkey',
    
    // Change PKs and FKs back to TEXT
    'ALTER TABLE vehicle_brands ALTER COLUMN id TYPE TEXT',
    
    'ALTER TABLE vehicle_models ALTER COLUMN id TYPE TEXT',
    
    'ALTER TABLE vehicle_versions ALTER COLUMN id TYPE TEXT',
    
    'ALTER TABLE vehicle_years ALTER COLUMN id TYPE TEXT',
    
    'ALTER TABLE vehicles ALTER COLUMN id TYPE TEXT',
    'ALTER TABLE vehicles ALTER COLUMN brand_id TYPE TEXT',
    'ALTER TABLE vehicles ALTER COLUMN model_id TYPE TEXT',
    'ALTER TABLE vehicles ALTER COLUMN version_id TYPE TEXT',
    'ALTER TABLE vehicles ALTER COLUMN year_fab_id TYPE TEXT',
    'ALTER TABLE vehicles ALTER COLUMN year_model_id TYPE TEXT',
    
    'ALTER TABLE vehicle_photos ALTER COLUMN id TYPE TEXT',
    'ALTER TABLE vehicle_photos ALTER COLUMN vehicle_id TYPE TEXT',
    
    'ALTER TABLE seller_profiles ALTER COLUMN id TYPE TEXT',
    
    'ALTER TABLE seller_stats ALTER COLUMN id TYPE TEXT',
    'ALTER TABLE seller_stats ALTER COLUMN seller_profile_id TYPE TEXT',
    
    'ALTER TABLE seller_verifications ALTER COLUMN id TYPE TEXT',
    'ALTER TABLE seller_verifications ALTER COLUMN seller_profile_id TYPE TEXT',

    // Re-add foreign keys
    'ALTER TABLE vehicles ADD CONSTRAINT vehicles_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE CASCADE',
    'ALTER TABLE vehicles ADD CONSTRAINT vehicles_model_id_fkey FOREIGN KEY (model_id) REFERENCES vehicle_models(id) ON DELETE CASCADE',
    'ALTER TABLE vehicles ADD CONSTRAINT vehicles_version_id_fkey FOREIGN KEY (version_id) REFERENCES vehicle_versions(id) ON DELETE CASCADE',
    'ALTER TABLE vehicles ADD CONSTRAINT vehicles_year_fab_id_fkey FOREIGN KEY (year_fab_id) REFERENCES vehicle_years(id) ON DELETE CASCADE',
    'ALTER TABLE vehicles ADD CONSTRAINT vehicles_year_model_id_fkey FOREIGN KEY (year_model_id) REFERENCES vehicle_years(id) ON DELETE CASCADE',
    
    'ALTER TABLE vehicle_photos ADD CONSTRAINT vehicle_photos_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE',
    
    'ALTER TABLE seller_stats ADD CONSTRAINT seller_stats_seller_profile_id_fkey FOREIGN KEY (seller_profile_id) REFERENCES seller_profiles(id) ON DELETE CASCADE',
    'ALTER TABLE seller_verifications ADD CONSTRAINT seller_verifications_seller_profile_id_fkey FOREIGN KEY (seller_profile_id) REFERENCES seller_profiles(id) ON DELETE CASCADE'
  ];

  try {
    await client.query('BEGIN');
    for (const q of queries) {
      await client.query(q);
    }
    await client.query('COMMIT');
    console.log('Reverted to TEXT successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to revert', e);
  }
  await client.end();
}

run();
