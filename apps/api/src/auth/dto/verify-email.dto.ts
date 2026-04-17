import { IsNotEmpty, IsString, IsHexadecimal, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token de verificação recebido por e-mail' })
  @IsString()
  @IsNotEmpty()
  @IsHexadecimal()
  @Length(64, 64)
  token: string;
}
