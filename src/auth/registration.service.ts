// RegistrationService was moved to src/church/church.service.ts
// Keep a small stub to avoid accidental imports — prefer using ChurchService from ChurchModule.
import { Injectable } from '@nestjs/common';

@Injectable()
export class RegistrationService {
  constructor() {
    throw new Error('RegistrationService removed. Use ChurchService from ChurchModule (src/church/church.service.ts)');
  }
}
