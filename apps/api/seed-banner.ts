import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.banner.create({
    data: {
      title: 'Promoção Especial Peçaê',
      imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80',
      linkUrl: 'https://pecae.com.br/promocao',
      position: 'HOME_TOP',
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });
  console.log('Banner criado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
