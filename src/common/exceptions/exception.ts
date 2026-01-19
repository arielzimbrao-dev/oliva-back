import { HttpStatus, HttpException } from '@nestjs/common';

export class NoAccessPermissionError extends HttpException {
  constructor() {
    super('access_denied', HttpStatus.FORBIDDEN);
  }
}

export class InvalidCredentialsError extends HttpException {
  constructor() {
    super('invalid_email_or_password', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidRefreshTokenError extends HttpException {
  constructor() {
    super('invalid_refresh_token', HttpStatus.UNAUTHORIZED);
  }
}

export class UserNotFoundError extends HttpException {
  constructor() {
    super('user_not_found', HttpStatus.NOT_FOUND);
  }
}

export class EmailAlreadyInUseError extends HttpException {
  constructor() {
    super('email_already_in_use', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidPlanError extends HttpException {
  constructor() {
    super('invalid_plan', HttpStatus.BAD_REQUEST);
  }
}

export class AdminRoleNotFoundError extends HttpException {
  constructor() {
    super('admin_role_not_found', HttpStatus.BAD_REQUEST);
  }
}

export class PasswordConfirmationMismatchError extends HttpException {
  constructor() {
    super('password_confirmation_mismatch', HttpStatus.BAD_REQUEST);
  }
}

export class InvalidTokenError extends HttpException {
  constructor() {
    super('invalid_token', HttpStatus.UNAUTHORIZED);
  }
}

export class EntityNotFoundError extends HttpException {
  constructor() {
    super('entity_not_found', HttpStatus.NOT_FOUND);
  }
}

export class ChurchNotFoundError extends HttpException {
  constructor() {
    super('church_not_found', HttpStatus.NOT_FOUND);
  }
}

export class PlanNotFoundError extends HttpException {
  constructor() {
    super('plan_not_found', HttpStatus.NOT_FOUND);
  }
}

export class PaymentSessionNotFoundError extends HttpException {
  constructor() {
    super('payment_session_not_found', HttpStatus.NOT_FOUND);
  }
}

export class StripeSessionCreationError extends HttpException {
  constructor() {
    super('stripe_session_creation_failed', HttpStatus.BAD_REQUEST);
  }
}

export class WebhookSignatureError extends HttpException {
  constructor() {
    super('invalid_webhook_signature', HttpStatus.BAD_REQUEST);
  }
}

export class UserInactiveError extends HttpException {
  constructor() {
    super('user_inactive', HttpStatus.FORBIDDEN);
  }
}

export class TokenExpiredError extends HttpException {
  constructor() {
    super('token_expired', HttpStatus.UNAUTHORIZED);
  }
}

export class RoleNotFoundError extends HttpException {
  constructor() {
    super('role_not_found', HttpStatus.NOT_FOUND);
  }
}

export class MemberAlreadyMarriedError extends HttpException {
  constructor() {
    super('member_already_married', HttpStatus.BAD_REQUEST);
  }
}
