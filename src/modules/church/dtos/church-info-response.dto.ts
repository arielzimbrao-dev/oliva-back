import { ApiProperty } from '@nestjs/swagger';

export class ChurchInfoResponseDto {
  @ApiProperty({ example: 'Igreja Batista Central' })
  name: string;

  @ApiProperty({ example: 'pt' })
  language: string;

  @ApiProperty({ example: 'BRL' })
  currency: string;

  @ApiProperty({ example: 'Plano Básico', required: false })
  plan?: string;

  @ApiProperty({ example: 150 })
  totalMembers: number;

  @ApiProperty({ example: 100, required: false })
  memberLimit?: number;
}
