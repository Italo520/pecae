import { IsUUID, IsNotEmpty, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID do anúncio (Listing)' })
  @IsUUID()
  @IsNotEmpty()
  listingId: string;

  @ApiProperty({ example: 500.00, description: 'Orçamento total da campanha' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  budget: number;

  @ApiProperty({ example: '2026-04-26T00:00:00.000Z', description: 'Data de início' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-05-26T00:00:00.000Z', description: 'Data de término (opcional)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
