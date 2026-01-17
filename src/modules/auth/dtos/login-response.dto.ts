import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Token de acesso JWT (válido por 60 minutos)' })
  accessToken: string;

  @ApiProperty({ description: 'Token de renovação JWT (válido por 24 horas)', required: false })
  refreshToken?: string;

  @ApiProperty({ description: 'ID do usuário' })
  userId: string;

  @ApiProperty({ description: 'Email do usuário' })
  email: string;

  @ApiProperty({ description: 'Role do usuário (ADMIN, PASTOR, SECRETARY, TREASURY)' })
  role: string;

  @ApiProperty({ description: 'ID da igreja' })
  churchId: string;

  @ApiProperty({ description: 'Nome do membro associado', required: false })
  memberName?: string;

  @ApiProperty({ description: 'Nome da igreja', required: false })
  churchName?: string;
}
