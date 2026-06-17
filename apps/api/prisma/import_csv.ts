import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaClient, FuelType, TransmissionType, VehicleStatus, ListingStatus, VehicleSegment } from '@prisma/client';

const prisma = new PrismaClient();

const SUPABASE_URL = 'https://hsxeulvcfrbyvxehhhaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzeGV1bHZjZnJieXZ4ZWhoaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4OTU0NjQsImV4cCI6MjA5NjQ3MTQ2NH0.gl7nMqpNt-5-AQb39OogZUsTTzcoqtr0esoumTUu6c0';

const BUCKET_NAME = 'vehicle-photos';

async function downloadImage(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    }
  });
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer;
}

async function uploadToSupabase(buffer: ArrayBuffer, filename: string): Promise<string> {
  const path = `import/${Date.now()}_${filename}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true'
    },
    body: buffer
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase upload error:', errorText);
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}

async function main() {
  console.log('🔄 Iniciando limpeza e importação de dados...');

  // 1. Encontrar o vendedor padrão
  const sellerUser = await prisma.user.findUnique({
    where: { email: 'vendedor@pecae.com.br' },
    include: { sellerProfile: true }
  });

  if (!sellerUser || !sellerUser.sellerProfile) {
    console.error('❌ Vendedor vendedor@pecae.com.br ou seu perfil não encontrado no banco!');
    process.exit(1);
  }

  const sellerProfileId = sellerUser.sellerProfile.id;

  // 2. Limpar os veículos existentes ("retirar os seeds para não ficar poluído")
  console.log('🧹 Limpando veículos existentes...');
  await prisma.listing.deleteMany();
  await prisma.vehiclePhoto.deleteMany();
  await prisma.vehicle.deleteMany();
  console.log('✅ Veículos limpos.');

  // 3. Ler e parsear o CSV
  const csvPath = path.resolve(__dirname, '../../../estoque_veiculos_final.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
  const header = lines[0].split(',');
  
  // As colunas são:
  // marca,modelo,versao,ano_fabricacao,ano_modelo,cor,cidade,estado,combustivel,transmissao,quilometragem,observacoes,imagens

  let successCount = 0;

  for (let i = 1; i < lines.length; i++) {
    // Tratamento simples para CSV (ignorando vírgulas dentro de aspas - o CSV parece não ter aspas baseando no formato, mas caso tenha, faremos split simples pois as colunas não contêm vírgula nos dados de teste)
    // O CSV providenciado usou aspas em observações? "Pneus novos, IPVA 2024 pago. Pronto para transferir."
    // Vamos usar um regex simples para dividir respeitando aspas
    const line = lines[i];
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const values = line.split(regex).map(v => v.replace(/^"|"$/g, '').trim());
    
    if (values.length < 12) continue;

    const [
      marca, modelo, versao, ano_fabricacao, ano_modelo, cor,
      cidade, estado, combustivelStr, transmissaoStr, quilometragem, observacoes, imagensUrlStr
    ] = values;

    console.log(`🚀 Processando [${i}/${lines.length - 1}]: ${marca} ${modelo} ${versao}...`);

    try {
      // Garantir Marca
      const brand = await prisma.vehicleBrand.upsert({
        where: { name: marca },
        update: {},
        create: { id: crypto.randomUUID(), name: marca }
      });

      // Garantir Modelo
      const model = await prisma.vehicleModel.upsert({
        where: { brandId_name: { brandId: brand.id, name: modelo } },
        update: {},
        create: { id: crypto.randomUUID(), brandId: brand.id, name: modelo, segment: VehicleSegment.OTHER }
      });

      // Garantir Versão
      // Nota: versão não tem constraint unique no banco, então buscamos primeiro
      let version = await prisma.vehicleVersion.findFirst({
        where: { modelId: model.id, name: versao }
      });
      if (!version) {
        version = await prisma.vehicleVersion.create({
          data: {
            id: crypto.randomUUID(),
            modelId: model.id,
            name: versao,
            fuel: combustivelStr as FuelType || FuelType.FLEX,
            transmission: transmissaoStr as TransmissionType || TransmissionType.MANUAL,
          }
        });
      }

      // Garantir Ano
      let year = await prisma.vehicleYear.findFirst({
        where: { versionId: version.id, yearFab: parseInt(ano_fabricacao), yearModel: parseInt(ano_modelo) }
      });
      if (!year) {
        year = await prisma.vehicleYear.create({
          data: {
            id: crypto.randomUUID(),
            versionId: version.id,
            yearFab: parseInt(ano_fabricacao),
            yearModel: parseInt(ano_modelo)
          }
        });
      }

      // Processar Imagens
      const uploadedPhotos = [];
      if (imagensUrlStr) {
        const imageUrls = imagensUrlStr.split(';');
        let order = 0;
        for (const imgUrl of imageUrls) {
          if (!imgUrl.startsWith('http')) continue;
          console.log(`   ⬇️  Baixando imagem: ${imgUrl}`);
          try {
            const buffer = await downloadImage(imgUrl);
            const filename = `vehicle_${i}_photo_${order}.jpg`;
            console.log(`   ⬆️  Fazendo upload para Supabase...`);
            const publicUrl = await uploadToSupabase(buffer, filename);
            uploadedPhotos.push({ url: publicUrl, order: order++ });
          } catch (e) {
            console.error(`   ⚠️ Erro ao processar imagem ${imgUrl}:`, e.message);
            // Fallback para a URL original caso o upload falhe
            uploadedPhotos.push({ url: imgUrl, order: order++ });
          }
        }
      }

      // Criar Veículo
      const vehicle = await prisma.vehicle.create({
        data: {
          sellerId: sellerProfileId,
          versionId: version.id,
          yearFabId: year.id,
          color: cor || 'Indefinida',
          city: cidade || 'Indefinida',
          state: estado || 'SP',
          fuelType: combustivelStr as FuelType || FuelType.FLEX,
          mileage: parseInt(quilometragem) || 0,
          observations: observacoes || '',
          status: VehicleStatus.ACTIVE,
          photos: {
            create: uploadedPhotos
          }
        }
      });

      // Criar Anúncio (Listing)
      await prisma.listing.create({
        data: {
          sellerProfileId: sellerProfileId,
          vehicleId: vehicle.id,
          title: `${marca} ${modelo} ${versao}`,
          description: observacoes || '',
          status: ListingStatus.PUBLISHED,
          publishedAt: new Date(),
        }
      });

      successCount++;
      console.log(`   ✅ Veículo ${marca} ${modelo} criado com sucesso!`);
    } catch (e) {
      console.error(`   ❌ Falha ao criar veículo da linha ${i}:`, e.message);
    }
  }

  console.log(`🎉 Importação finalizada! ${successCount} veículos cadastrados.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
