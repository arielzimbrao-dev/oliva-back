export class MemberInfoDto {
  id: string;
  name: string;
}

export class EventDto {
  title: string;
  date: string;
  members: MemberInfoDto[];
}

export class MemberEventsResponseDto {
  birthdays: EventDto[];
  marriages: EventDto[];
}
