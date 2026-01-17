import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token (valid for 60 minutes)' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token (valid for 24 hours)', required: false })
  refreshToken?: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User role (ADMIN, PASTOR, SECRETARY, TREASURY)' })
  role: string;

  @ApiProperty({ description: 'Church ID' })
  churchId: string;

  @ApiProperty({ description: 'Associated member name', required: false })
  memberName?: string;

  @ApiProperty({ description: 'Church name', required: false })
  churchName?: string;

  @ApiProperty({ description: 'Indicates if it is the first login of the church (admin)', required: false })
  firstLogin?: boolean;
}
