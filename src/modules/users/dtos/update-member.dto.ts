
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsBoolean, ValidateNested, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { MemberFamilyDto } from './member-family.dto';


class DepartmentIdDto {
  @IsUUID()
  id: string;

  @IsBoolean()
  isLeader: boolean;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsBoolean()
  baptismStatus?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentIdDto)
  departmentIds?: DepartmentIdDto[];
  @IsOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberFamilyDto)
  family?: MemberFamilyDto[];
}
