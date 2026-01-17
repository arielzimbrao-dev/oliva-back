import { ApiProperty } from '@nestjs/swagger';

export class MemberDepartmentResponseDto {
  @ApiProperty({ example: 'uuid' })
  departmentId: string;

  @ApiProperty({ example: true })
  isLeader: boolean;
}

export class MemberResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'joao@email.com', required: false })
  email?: string;

  @ApiProperty({ example: '+5511999999999', required: false })
  phone?: string;

  @ApiProperty({ example: '1990-05-15' })
  birthDate: string;

  @ApiProperty({ example: true, required: false })
  baptismStatus?: boolean;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;

  @ApiProperty({ type: [MemberDepartmentResponseDto] })
  departments: MemberDepartmentResponseDto[];
}

export class UserResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'admin@igreja.com' })
  email: string;

  @ApiProperty({ example: 'ADMIN' })
  role: string;

  @ApiProperty({ example: 'ACTIVE' })
  state: string;

  @ApiProperty({ example: 'uuid' })
  churchId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: MemberResponseDto, required: false })
  member?: MemberResponseDto;
}

export class UserListResponseDto {
  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];
}
