export type ResultOk<T> = {
  readonly success: true;
  readonly data: T;
};

export type ResultErr<E extends GuardianError = GuardianError> = {
  readonly success: false;
  readonly error: E;
};

export type Result<T, E extends GuardianError = GuardianError> =
  | ResultOk<T>
  | ResultErr<E>;

export function ok<T>(data: T): ResultOk<T> {
  return { success: true, data };
}

export function err<E extends GuardianError>(error: E): ResultErr<E> {
  return { success: false, error };
}

export type GuardianErrorCode =
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_REJECTED"
  | "INVALID_INPUT"
  | "UNSUPPORTED_METHOD"
  | "INTERNAL_ERROR";

export type GuardianError = {
  readonly code: GuardianErrorCode;
  readonly message: string;
};

export function guardianError(
  code: GuardianErrorCode,
  message: string
): GuardianError {
  return { code, message };
}
