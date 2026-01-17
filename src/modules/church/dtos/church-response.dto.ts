import { ApiProperty } from '@nestjs/swagger';

export class ChurchResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Igreja Batista Central' })
  name: string;

  @ApiProperty({ example: 'Rua das Flores, 123', required: false })
  address?: string;

  @ApiProperty({ example: '+5511999999999', required: false })
  phone?: string;

  @ApiProperty({ example: 'contato@igreja.com' })
  email: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ example: 150 })
  memberActive: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ChurchListResponseDto {
  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ type: [ChurchResponseDto] })
  data: ChurchResponseDto[];
}
