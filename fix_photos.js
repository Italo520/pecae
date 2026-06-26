const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hsxeulvcfrbyvxehhhaj:db_coolify_pecae@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

// URLs de imagens de carros reais do Pexels para substituir as fotos falsas
const realCarImages = [
  'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1368735/pexels-photo-1368735.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/544542/pexels-photo-544542.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1981336/pexels-photo-1981336.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/314548/pexels-photo-314548.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1104768/pexels-photo-1104768.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg?auto=compress&cs=tinysrgb&w=800',
];

async function run() {
  await client.connect();
  console.log('Conectado ao Supabase - corrigindo URLs de fotos');

  try {
    // Buscar todas as fotos com URL falsa
    const fakesRes = await client.query(`
      SELECT id FROM vehicle_photos WHERE url LIKE '%pecae-mock-storage.com%' ORDER BY id
    `);
    
    console.log(`Total de fotos com URL falsa: ${fakesRes.rows.length}`);
    
    // Atualizar cada uma com uma URL real rotativa
    for (let i = 0; i < fakesRes.rows.length; i++) {
      const photo = fakesRes.rows[i];
      const realUrl = realCarImages[i % realCarImages.length];
      
      await client.query(`
        UPDATE vehicle_photos SET url = $1 WHERE id = $2
      `, [realUrl, photo.id]);
    }
    
    console.log('URLs corrigidas com sucesso!');
    
    // Atualizar também url_foto_principal nos listings (se houver campo)
    const listingsCheck = await client.query(`
      SELECT COUNT(*) as total FROM listings WHERE EXISTS (
        SELECT 1 FROM vehicle_photos vp 
        WHERE vp.vehicle_id = listings.vehicle_id
      )
    `);
    console.log('Listings com veículos:', listingsCheck.rows[0].total);
    
  } catch (e) {
    console.error('Erro:', e.message);
  }

  await client.end();
}

run();
