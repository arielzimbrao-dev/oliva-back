export class ChurchResponseDto {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email: string;
  status: string;
  memberActive: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ChurchListResponseDto {
  total: number;
  data: ChurchResponseDto[];
}
