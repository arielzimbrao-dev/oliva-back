import { ApiProperty } from '@nestjs/swagger';

export class PlanDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Plano Básico' })
  name: string;

  @ApiProperty({ example: 'Plano ideal para pequenas igrejas' })
  description: string;

  @ApiProperty({ example: 29.99 })
  priceDolar: number;

  @ApiProperty({ example: 27.99 })
  priceEuro: number;

  @ApiProperty({ example: 149.90 })
  priceReal: number;

  @ApiProperty({ example: '30' })
  freeDays: string;
}