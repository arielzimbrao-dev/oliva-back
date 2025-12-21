import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterChurchDto, RegisterChurchResultDto } from '../auth/dtos/register-church.dto';
import { ChurchService } from './church.service';


@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async signup(@Body() dto: RegisterChurchDto): Promise<RegisterChurchResultDto> {
    return this.churchService.registerChurch(dto);
  }
}
