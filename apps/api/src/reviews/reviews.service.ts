import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('seller-stats') private readonly statsQueue: Queue,
  ) {}

  async create(buyerId: string, dto: CreateReviewDto) {
    // TODO: Integrar com o módulo M08 (Chat) quando disponível.
    // Atualmente estamos mockando a validação de interação no chat.
    const hasInteraction = await this.mockValidateChatInteraction(dto.chatRoomId);
    if (!hasInteraction) {
      throw new ForbiddenException('Não é possível avaliar um chat sem interação.');
    }

    // TODO: Validar se o buyerId realmente pertence ao chatRoomId e se ele é o comprador.
    // Como o módulo M08 não existe, assumimos que o usuário autenticado é o comprador válido.

    try {
      const review = await this.prisma.review.create({
        data: {
          sellerProfileId: dto.sellerProfileId,
          buyerId: buyerId,
          chatRoomId: dto.chatRoomId,
          rating: dto.rating,
          comment: dto.comment,
        },
      });

      // Disparar job para recálculo de rating
      await this.statsQueue.add('recalc-seller-rating', {
        sellerProfileId: dto.sellerProfileId,
      });

      return review;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Você já avaliou este vendedor para esta negociação.');
      }
      throw error;
    }
  }

  async findAllBySeller(sellerProfileId: string, limit = 10, cursor?: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        sellerProfileId,
        isRemoved: false,
      },
      take: limit + 1, // Fetch one more to determine if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        buyer: {
          select: {
            name: true,
          },
        },
      },
    });

    let nextCursor: string | undefined = undefined;
    if (reviews.length > limit) {
      const nextItem = reviews.pop();
      nextCursor = nextItem?.id;
    }

    const mappedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      buyerName: this.anonymizeName(review.buyer?.name),
    }));

    return {
      data: mappedReviews,
      meta: {
        nextCursor,
      },
    };
  }

  private async mockValidateChatInteraction(chatRoomId: string): Promise<boolean> {
    // Simulação: se o chatRoomId for 'empty-chat', retorna falso.
    // Caso contrário, assume que houve interação para permitir testes.
    if (chatRoomId === 'empty-chat') {
      return false;
    }
    return true;
  }

  private anonymizeName(fullName: string): string {
    if (!fullName) return 'Usuário';
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0];
    if (parts.length > 1) {
      const initial = parts[1][0].toUpperCase();
      return `${firstName} ${initial}.`;
    }
    return firstName;
  }
}
