
export class MemberDepartmentDto {
  id: string;
  name: string;
  isLeader: boolean;
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
  gender?: string;
  birthDate?: string;
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
