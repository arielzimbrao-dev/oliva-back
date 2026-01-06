import { Patch } from '@nestjs/common';
import { UpdateChurchDto } from './dtos/update-church.dto';
import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe, Get, Request, UseGuards, Query } from '@nestjs/common';
import { ChurchService } from './church.service';
import { RegisterChurchRequestDto } from './dtos/register-church-request.dto';
import { RegisterChurchResponseDto } from '../auth/dtos/register-church-response.dto';
import { ChurchInfoResponseDto } from './dtos/church-info-response.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { IsPublic } from '../auth/jwt/is-public.decoretor';

@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Get('public')
  @IsPublic()
  async getChurchPublicInfo(@Query('churchId') churchId: string): Promise<{ name: string; canAddMembers: boolean }> {
    return await this.churchService.getChurchPublicInfo(churchId);
  }
  
  @Get()
  @UseGuards(JwtAuthGuard)
  async getChurchInfo(@Request() req): Promise<ChurchInfoResponseDto> {
    // req.user.churchId deve estar disponível pelo guard
    return this.churchService.getChurchInfo(req.user.churchId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateChurch(@Request() req, @Body() dto: UpdateChurchDto): Promise<ChurchInfoResponseDto> {
    // req.user.churchId deve estar disponível pelo guard
    return this.churchService.updateChurch(req.user.churchId, dto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async signup(@Body() dto: RegisterChurchRequestDto): Promise<RegisterChurchResponseDto> {
    return this.churchService.registerChurch(dto);
  }
}
