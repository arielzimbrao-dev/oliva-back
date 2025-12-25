export class DepartmentResponseDto {
  id: string;
  name: string;
  description?: string;
  churchId: string;
  totalMember: number;
  createdAt: Date;
  updatedAt: Date;
}

export class DepartmentListResponseDto {
  total: number;
  totalMember: number;
  totalLider: number;
  data: DepartmentResponseDto[];
}
