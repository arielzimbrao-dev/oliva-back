import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterChurchDto, RegisterChurchResultDto } from './dtos/register-church.dto';
import { RegistrationService } from './registration.service';

@Controller('auth')
export class AuthRegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('register-church')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async registerChurch(@Body() dto: RegisterChurchDto): Promise<RegisterChurchResultDto> {
    return this.registrationService.registerChurch(dto);
  }
}
