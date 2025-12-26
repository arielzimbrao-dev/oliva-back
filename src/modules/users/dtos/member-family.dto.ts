import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { FamilyRelationType } from '../../../entities/member-family.entity';

export class MemberFamilyDto {
  @IsUUID()
  @IsNotEmpty()
  id: string; // relatedMemberId

  @IsEnum(FamilyRelationType)
  @IsNotEmpty()
  type: FamilyRelationType;

  @IsOptional()
  @IsDateString()
  marriageDate?: string;
}
