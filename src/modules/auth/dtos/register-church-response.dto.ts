import { ApiProperty } from '@nestjs/swagger';

export class RegisterChurchResponseDto {
  @ApiProperty({ example: 'uuid', description: 'Church ID' })
  id: string;

  @ApiProperty({ example: 'Central Baptist Church', description: 'Church name' })
  name: string;

  @ApiProperty({ example: 'contact@church.com', description: 'Church email' })
  email: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Church status' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
