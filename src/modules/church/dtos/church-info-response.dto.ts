export class ChurchInfoResponseDto {
  name: string;
  language: string;
  currency: string;
  plan?: string;
  totalMembers: number;
  memberLimit?: number;
}
