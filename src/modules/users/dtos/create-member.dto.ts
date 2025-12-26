
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsBoolean, ValidateNested, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { MemberFamilyDto } from './member-family.dto';

class DepartmentLinkDto {
  @IsUUID()
  departmentId: string;

  @IsBoolean()
  isLeader: boolean;
}

export class CreateMemberDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;

  @IsOptional()
  @IsBoolean()
  baptismStatus?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentLinkDto)
  departments?: DepartmentLinkDto[];
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberFamilyDto)
  family?: MemberFamilyDto[];
}
