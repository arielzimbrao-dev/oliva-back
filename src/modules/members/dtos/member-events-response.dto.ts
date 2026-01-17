import { ApiProperty } from '@nestjs/swagger';

export class MemberInfoDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;
}

export class EventDto {
  @ApiProperty({ example: 'Aniversários do dia' })
  title: string;

  @ApiProperty({ example: '2024-01-15' })
  date: string;

  @ApiProperty({ type: [MemberInfoDto] })
  members: MemberInfoDto[];
}

export class MemberEventsResponseDto {
  @ApiProperty({ type: [EventDto] })
  birthdays: EventDto[];

  @ApiProperty({ type: [EventDto] })
  marriages: EventDto[];
}
