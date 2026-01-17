import { IsNotEmpty, IsOptional, IsString, IsDateString, IsBoolean, ValidateNested, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MemberFamilyDto } from './member-family.dto';


class DepartmentIdDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isLeader: boolean;
}

export class UpdateMemberDto {
  @ApiProperty({ example: 'João Silva', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'joao@email.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '+5511999999999', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '1990-05-15', required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ example: 'M', required: false })
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  baptismStatus?: boolean;

  @ApiProperty({ type: [DepartmentIdDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentIdDto)
  departmentIds?: DepartmentIdDto[];

  @ApiProperty({ type: [MemberFamilyDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberFamilyDto)
  family?: MemberFamilyDto[];
}
