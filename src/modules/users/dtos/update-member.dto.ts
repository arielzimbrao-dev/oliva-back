import { IsNotEmpty, IsOptional, IsString, IsDateString, IsBoolean, ValidateNested, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class DepartmentLinkDto {
  @IsUUID()
  departmentId: string;

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
  @IsBoolean()
  baptismStatus?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentLinkDto)
  departments?: DepartmentLinkDto[];
}
