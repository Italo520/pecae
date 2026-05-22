import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Processor('notifications-queue')
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, type, title, body, notificationId } = job.data;

    switch (job.name) {
      case 'send-push': {
        try {
          // 1. Obter pushTokens da tabela dedicada
          const userTokens = await this.prisma.pushToken.findMany({
            where: { userId },
          });

          if (!userTokens || userTokens.length === 0) {
            if (notificationId) {
              await this.prisma.notificationLog.create({
                data: {
                  notificationId,
                  channel: 'PUSH',
                  status: 'SKIPPED',
                  error: 'Token push do dispositivo não encontrado.',
                },
              });
            }
            return;
          }

          // 2. Disparar via Expo Push API para cada token
          for (const pushToken of userTokens) {
            await this.sendExpoPush(pushToken.token, title, body, job.data.data);
          }

          if (notificationId) {
            await this.prisma.notificationLog.create({
              data: {
                notificationId,
                channel: 'PUSH',
                status: 'SENT',
              },
            });
          }
        } catch (error: any) {
          if (notificationId) {
            await this.prisma.notificationLog.create({
              data: {
                notificationId,
                channel: 'PUSH',
                status: 'FAILED',
                error: error.message || 'Erro desconhecido ao disparar push.',
              },
            });
          }
          throw error;
        }
        break;
      }

      case 'send-email': {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
          });

          if (!user || !user.email) {
            if (notificationId) {
              await this.prisma.notificationLog.create({
                data: {
                  notificationId,
                  channel: 'EMAIL',
                  status: 'SKIPPED',
                  error: 'E-mail do usuário inexistente.',
                },
              });
            }
            return;
          }

          // Disparar via serviço de e-mail existente
          // Como o MailService só tem formatos rígidos, estenderemos um fluxo padrão
          await this.mailService.sendVerificationStatusEmail(
            user.email,
            user.name || 'Usuário',
            'APPROVED',
            body,
          );

          if (notificationId) {
            await this.prisma.notificationLog.create({
              data: {
                notificationId,
                channel: 'EMAIL',
                status: 'SENT',
              },
            });
          }
        } catch (error: any) {
          if (notificationId) {
            await this.prisma.notificationLog.create({
              data: {
                notificationId,
                channel: 'EMAIL',
                status: 'FAILED',
                error: error.message || 'Erro desconhecido ao disparar e-mail.',
              },
            });
          }
          throw error;
        }
        break;
      }

      default:
        console.warn(`Job desconhecido: ${job.name}`);
    }
  }

  private async sendExpoPush(token: string, title: string, body: string, data?: any) {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title,
        body,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Expo API error: ${response.status} ${response.statusText}`);
    }
  }
}
