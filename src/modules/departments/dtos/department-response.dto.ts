export class DepartmentResponseDto {
  id: string;
  name: string;
  description?: string;
  churchId: string;
  color?: string;
  totalMember: number;
  createdAt: Date;
  updatedAt: Date;
  members: { id: string; name: string; isLeader: boolean }[];
}

export class DepartmentListResponseDto {
  total: number;
  totalMember: number;
  totalLider: number;
  data: DepartmentResponseDto[];
}
