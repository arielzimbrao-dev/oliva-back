export class PlanResponseDto {
  id: string;
  name: string;
  description?: string;
  amountDolar: string;
  amountEuro: string;
  amountReal: string;
  memberLimit: number;
  freeDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PlanListResponseDto {
  total: number;
  data: PlanResponseDto[];
}
