import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiProperty({ example: 'Louvor', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Departamento de louvor e adoração', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '#FF5733', required: false })
  @IsOptional()
  @IsString()
  color?: string;
}
