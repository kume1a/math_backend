export enum ExceptionMessageCode {
  MISSING_TOKEN = 'MISSING_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EMAIL_OR_PASSWORD_INVALID = 'EMAIL_OR_PASSWORD_INVALID',
  USER_EMAIL_EXISTS = 'USER_EMAIL_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  REFRESH_TOKEN_REUSE = 'REFRESH_TOKEN_REUSE',
  RECOVER_PASSWORD_REQUEST_NOT_FOUND = 'RECOVER_PASSWORD_REQUEST_NOT_FOUND',
  RECOVER_PASSWORD_REQUEST_INVALID_CODE = 'RECOVER_PASSWORD_REQUEST_INVALID_CODE',
  RECOVER_PASSWORD_REQUEST_TIMED_OUT = 'RECOVER_PASSWORD_REQUEST_TIMED_OUT',
  RECOVER_PASSWORD_REQUEST_INVALID = 'RECOVER_PASSWORD_REQUEST_INVALID',
  ACCOUNT_VERIFFICATION_REQUEST_NOT_FOUND = 'ACCOUNT_VERIFFICATION_REQUEST_NOT_FOUND',
  MISSING_AUTH_USER_PAYLOAD = 'MISSING_AUTH_USER_PAYLOAD',
}
