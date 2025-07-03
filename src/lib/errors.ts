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
