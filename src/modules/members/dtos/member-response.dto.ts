import { ApiProperty } from '@nestjs/swagger';

export class MemberDepartmentDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Louvor' })
  name: string;

  @ApiProperty({ example: true })
  isLeader: boolean;

  @ApiProperty({ example: '#FF5733', required: false })
  color?: string;
}

export class MemberFamilyResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 12345 })
  idMember: number;

  @ApiProperty({ example: 'Maria Silva' })
  name: string;

  @ApiProperty({ example: 'Esposa' })
  relationType: string;
}

export class MemberResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 12345 })
  idMember: number;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao@email.com', required: false })
  email?: string;

  @ApiProperty({ example: '+5511999999999', required: false })
  phone?: string;

  @ApiProperty({ example: 'M', required: false })
  gender?: string;

  @ApiProperty({ example: '1990-05-15', required: false })
  birthDate?: string;

  @ApiProperty({ type: [MemberDepartmentDto] })
  departments: MemberDepartmentDto[];

  @ApiProperty({ example: true })
  baptismStatus: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [MemberFamilyResponseDto] })
  family: MemberFamilyResponseDto[];
}

export class MemberListResponseDto {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ type: [MemberResponseDto] })
  data: MemberResponseDto[];
}
