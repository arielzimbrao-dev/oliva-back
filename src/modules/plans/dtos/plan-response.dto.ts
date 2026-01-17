import { ApiProperty } from '@nestjs/swagger';

export class PlanResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Plano Básico' })
  name: string;

  @ApiProperty({ example: 'Plano ideal para pequenas igrejas', required: false })
  description?: string;

  @ApiProperty({ example: '29.99' })
  amountDolar: string;

  @ApiProperty({ example: '27.99' })
  amountEuro: string;

  @ApiProperty({ example: '149.90' })
  amountReal: string;

  @ApiProperty({ example: 100 })
  memberLimit: number;

  @ApiProperty({ example: 30 })
  freeDays: number;

  @ApiProperty({ example: 'https://payment.link', required: false })
  linkPayment?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PlanListResponseDto {
  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ type: [PlanResponseDto] })
  data: PlanResponseDto[];
}
