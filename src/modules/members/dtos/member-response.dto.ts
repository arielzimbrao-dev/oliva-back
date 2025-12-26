
export class MemberDepartmentDto {
  id: string;
  name: string;
}

export class MemberFamilyResponseDto {
  id: string;
  idMember: number;
  name: string;
  relationType: string;
}

export class MemberResponseDto {
  id: string;
  idMember: number;
  name: string;
  email?: string;
  phone?: string;
  departments: MemberDepartmentDto[];
  baptismStatus: boolean;
  createdAt: Date;
  family: MemberFamilyResponseDto[];
}

export class MemberListResponseDto {
  total: number;
  page: number;
  limit: number;
  data: MemberResponseDto[];
}
