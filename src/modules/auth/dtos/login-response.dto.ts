export class LoginResponseDto {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  email: string;
  role: string;
  churchId: string;
  memberName?: string;
  churchName?: string;
}
