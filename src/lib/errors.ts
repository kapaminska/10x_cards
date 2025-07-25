export type ServiceErrorCode =
  | "Bad Request"
  | "Unauthorized"
  | "Forbidden"
  | "Not Found"
  | "Conflict"
  | "Too Many Requests"
  | "Internal Server Error";

export class ServiceError extends Error {
  public readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message: string) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
  }
}

export class OpenRouterError extends ServiceError {
  constructor(message: string) {
    super("Internal Server Error", message);
    this.name = this.constructor.name;
  }
}

export class AuthenticationError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RateLimitError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class OutputValidationError extends OpenRouterError {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError;
  }
}
