import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChurchService } from './church.service';
import { RegisterChurchRequestDto } from './dtos/register-church-request.dto';
import { RegisterChurchResponseDto } from '../auth/dtos/register-church-response.dto';


@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async signup(@Body() dto: RegisterChurchRequestDto): Promise<RegisterChurchResponseDto> {
    return this.churchService.registerChurch(dto);
  }
}
