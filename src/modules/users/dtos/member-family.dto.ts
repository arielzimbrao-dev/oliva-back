import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FamilyRelationType } from '../../../entities/member-family.entity';

export class MemberFamilyDto {
  @ApiProperty({ example: 'uuid', description: 'ID do membro relacionado' })
  @IsUUID()
  @IsNotEmpty()
  id: string; // relatedMemberId

  @ApiProperty({ enum: FamilyRelationType, example: 'SPOUSE' })
  @IsEnum(FamilyRelationType)
  @IsNotEmpty()
  type: FamilyRelationType;

  @ApiProperty({ example: '2015-06-20', required: false })
  @IsOptional()
  @IsDateString()
  marriageDate?: string;
}
