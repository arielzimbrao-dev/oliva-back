import { ApiProperty } from '@nestjs/swagger';

export class DepartmentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Louvor' })
  name: string;

  @ApiProperty({ example: 'Departamento de louvor e adoração', required: false })
  description?: string;

  @ApiProperty({ example: 'uuid' })
  churchId: string;

  @ApiProperty({ example: '#FF5733', required: false })
  color?: string;

  @ApiProperty({ example: 15 })
  totalMember: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  members: { id: string; name: string; isLeader: boolean }[];
}

export class DepartmentListResponseDto {
  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 45 })
  totalMember: number;

  @ApiProperty({ example: 5 })
  totalLider: number;

  @ApiProperty({ type: [DepartmentResponseDto] })
  data: DepartmentResponseDto[];
}
