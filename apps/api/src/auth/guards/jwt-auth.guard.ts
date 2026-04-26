import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    
    if (result) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      
      if (user && user.id) {
        // Atualização assíncrona (fire-and-forget) para registrar presença (DAU)
        this.prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() },
        }).catch((err) => {
          console.error(`Erro ao atualizar lastActiveAt para o usuário ${user.id}:`, err);
        });
      }
    }
    
    return result;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
