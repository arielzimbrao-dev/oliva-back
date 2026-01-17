import { ApiProperty } from '@nestjs/swagger';

export class MemberStatsResponseDto {
  @ApiProperty({ example: 150 })
  totalMembers: number;

  @ApiProperty({ example: 12 })
  newMembers: number;

  @ApiProperty({ example: 45 })
  servingMembers: number;

  @ApiProperty({ example: 5 })
  newServingMembers: number;

  @ApiProperty({ example: 120 })
  baptizedMembers: number;

  @ApiProperty({ example: 30 })
  notBaptizedMembers: number;

  @ApiProperty({ example: 8 })
  newBaptizedMembers: number;
}
