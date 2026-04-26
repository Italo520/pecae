import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ description: 'ID do anúncio para iniciar o chat' })
  @IsUUID()
  listingId: string;
}
