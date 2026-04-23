import {
  PrismaClient,
  UserType,
  UserStatus,
  VehicleSegment,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// ============================================================
// VEHICLE CATALOG DATA — Top 10 BR Brands (M04-T01-ST03)
// ============================================================
const VEHICLE_CATALOG = [
  {
    name: 'Fiat',
    country: 'Italy',
    models: [
      { name: 'Uno', segment: VehicleSegment.HATCH },
      { name: 'Palio', segment: VehicleSegment.HATCH },
      { name: 'Strada', segment: VehicleSegment.PICKUP },
      { name: 'Toro', segment: VehicleSegment.PICKUP },
      { name: 'Mobi', segment: VehicleSegment.HATCH },
    ],
  },
  {
    name: 'Volkswagen',
    country: 'Germany',
    models: [
      { name: 'Gol', segment: VehicleSegment.HATCH },
      { name: 'Polo', segment: VehicleSegment.HATCH },
      { name: 'Saveiro', segment: VehicleSegment.PICKUP },
      { name: 'T-Cross', segment: VehicleSegment.SUV },
      { name: 'Voyage', segment: VehicleSegment.SEDAN },
    ],
  },
  {
    name: 'Chevrolet',
    country: 'USA',
    models: [
      { name: 'Onix', segment: VehicleSegment.HATCH },
      { name: 'Tracker', segment: VehicleSegment.SUV },
      { name: 'S10', segment: VehicleSegment.PICKUP },
      { name: 'Prisma', segment: VehicleSegment.SEDAN },
      { name: 'Spin', segment: VehicleSegment.VAN },
    ],
  },
  {
    name: 'Toyota',
    country: 'Japan',
    models: [
      { name: 'Corolla', segment: VehicleSegment.SEDAN },
      { name: 'Hilux', segment: VehicleSegment.PICKUP },
      { name: 'Etios', segment: VehicleSegment.HATCH },
      { name: 'Yaris', segment: VehicleSegment.HATCH },
      { name: 'SW4', segment: VehicleSegment.SUV },
    ],
  },
  {
    name: 'Hyundai',
    country: 'South Korea',
    models: [
      { name: 'HB20', segment: VehicleSegment.HATCH },
      { name: 'Creta', segment: VehicleSegment.SUV },
      { name: 'HB20S', segment: VehicleSegment.SEDAN },
      { name: 'Tucson', segment: VehicleSegment.SUV },
      { name: 'Santa Fe', segment: VehicleSegment.SUV },
    ],
  },
  {
    name: 'Jeep',
    country: 'USA',
    models: [
      { name: 'Renegade', segment: VehicleSegment.SUV },
      { name: 'Compass', segment: VehicleSegment.SUV },
      { name: 'Commander', segment: VehicleSegment.SUV },
      { name: 'Grand Cherokee', segment: VehicleSegment.SUV },
      { name: 'Wrangler', segment: VehicleSegment.SUV },
    ],
  },
  {
    name: 'Renault',
    country: 'France',
    models: [
      { name: 'Kwid', segment: VehicleSegment.HATCH },
      { name: 'Sandero', segment: VehicleSegment.HATCH },
      { name: 'Logan', segment: VehicleSegment.SEDAN },
      { name: 'Duster', segment: VehicleSegment.SUV },
      { name: 'Oroch', segment: VehicleSegment.PICKUP },
    ],
  },
  {
    name: 'Honda',
    country: 'Japan',
    models: [
      { name: 'Civic', segment: VehicleSegment.SEDAN },
      { name: 'HR-V', segment: VehicleSegment.SUV },
      { name: 'Fit', segment: VehicleSegment.HATCH },
      { name: 'City', segment: VehicleSegment.SEDAN },
      { name: 'WR-V', segment: VehicleSegment.SUV },
    ],
  },
  {
    name: 'Nissan',
    country: 'Japan',
    models: [
      { name: 'Kicks', segment: VehicleSegment.SUV },
      { name: 'Versa', segment: VehicleSegment.SEDAN },
      { name: 'Frontier', segment: VehicleSegment.PICKUP },
      { name: 'Sentra', segment: VehicleSegment.SEDAN },
      { name: 'March', segment: VehicleSegment.HATCH },
    ],
  },
  {
    name: 'Ford',
    country: 'USA',
    models: [
      { name: 'Ka', segment: VehicleSegment.HATCH },
      { name: 'EcoSport', segment: VehicleSegment.SUV },
      { name: 'Ranger', segment: VehicleSegment.PICKUP },
      { name: 'Fiesta', segment: VehicleSegment.HATCH },
      { name: 'Focus', segment: VehicleSegment.HATCH },
    ],
  },
];

const PART_CATEGORIES = [
  { name: 'Motor', slug: 'motor', icon: 'engine' },
  { name: 'Câmbio', slug: 'cambio', icon: 'gearbox' },
  { name: 'Suspensão Dianteira', slug: 'suspensao-dianteira', icon: 'suspension-front' },
  { name: 'Suspensão Traseira', slug: 'suspensao-traseira', icon: 'suspension-rear' },
  { name: 'Freios', slug: 'freios', icon: 'brake' },
  { name: 'Lataria', slug: 'lataria', icon: 'body' },
  { name: 'Vidros', slug: 'vidros', icon: 'glass' },
  { name: 'Bancos e Estofamento', slug: 'bancos-estofamento', icon: 'seat' },
  { name: 'Painel e Elétrica', slug: 'painel-eletrica', icon: 'dashboard' },
  { name: 'Rodas e Pneus', slug: 'rodas-pneus', icon: 'wheel' },
  { name: 'Direção', slug: 'direcao', icon: 'steering' },
  { name: 'Arrefecimento', slug: 'arrefecimento', icon: 'cooling' },
  { name: 'Ar-Condicionado', slug: 'ar-condicionado', icon: 'ac' },
  { name: 'Escapamento', slug: 'escapamento', icon: 'exhaust' },
  { name: 'Capô e Para-choque', slug: 'capo-para-choque', icon: 'hood' },
];

async function seedVehicleCatalog() {
  for (const brandData of VEHICLE_CATALOG) {
    const brand = await prisma.vehicleBrand.upsert({
      where: { name: brandData.name },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: brandData.name,
        country: brandData.country,
      },
    });

    for (const modelData of brandData.models) {
      await prisma.vehicleModel.upsert({
        where: {
          brandId_name: {
            brandId: brand.id,
            name: modelData.name,
          },
        },
        update: {},
        create: {
          id: crypto.randomUUID(),
          brandId: brand.id,
          name: modelData.name,
          segment: modelData.segment,
        },
      });
    }
  }
  console.log(`✅ ${VEHICLE_CATALOG.length} vehicle brands and their models seeded.`);
}

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@pecae.com.br';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminPassword) {
    console.warn(
      '⚠️  ADMIN_SEED_PASSWORD not set — skipping admin user seed.',
    );
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: crypto.randomUUID(),
      name: 'Admin PECAÊ',
      email: adminEmail,
      passwordHash,
      type: UserType.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerified: false,
    },
  });

  console.log(`✅ Admin user seeded: ${adminEmail}`);
}

async function seedPartCategories() {
  for (const category of PART_CATEGORIES) {
    await prisma.partCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: category.name,
        slug: category.slug,
        icon: category.icon,
      },
    });
  }
  console.log(`✅ ${PART_CATEGORIES.length} part categories seeded.`);
}

async function main() {
  console.log('🌱 Starting PECAÊ database seed...');

  await seedPartCategories();
  await seedAdminUser();
  await seedVehicleCatalog();

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
