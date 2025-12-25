export class MemberDepartmentResponseDto {
  departmentId: string;
  isLeader: boolean;
}

export class MemberResponseDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate: string;
  baptismStatus?: boolean;
  status: string;
  departments: MemberDepartmentResponseDto[];
}

export class UserResponseDto {
  id: string;
  email: string;
  role: string;
  state: string;
  churchId: string;
  createdAt: Date;
  updatedAt: Date;
  member?: MemberResponseDto;
}

export class UserListResponseDto {
  total: number;
  page: number;
  limit: number;
  data: UserResponseDto[];
}
