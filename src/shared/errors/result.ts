import { AppError } from './app-error';

export type Result<T, E = AppError> = Ok<T, E> | Err<T, E>;

export class Ok<T, E = AppError> {
  readonly ok = true as const;
  readonly err: E | undefined = undefined;

  constructor(public readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<T, E> {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  unwrapOrElse(_op: (err: E) => T): T {
    return this.value;
  }

  map<U>(op: (value: T) => U): Result<U, E> {
    return ok(op(this.value));
  }

  mapErr<F>(_op: (err: E) => F): Result<T, F> {
    return ok(this.value) as Result<T, F>;
  }

  andThen<U>(op: (value: T) => Result<U, E>): Result<U, E> {
    return op(this.value);
  }

  orElse<F>(_op: (err: E) => Result<T, F>): Result<T, F> {
    return ok(this.value) as Result<T, F>;
  }

  toJSON() {
    return { ok: true, value: this.value };
  }
}

export class Err<T, E = AppError> {
  readonly ok = false as const;
  readonly value: T | undefined = undefined;

  constructor(public readonly err: E) {}

  isOk(): this is Ok<T, E> {
    return false;
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  unwrap(): never {
    throw this.err;
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse(op: (err: E) => T): T {
    return op(this.err);
  }

  map<U>(_op: (value: T) => U): Result<U, E> {
    return err(this.err) as Result<U, E>;
  }

  mapErr<F>(op: (err: E) => F): Result<T, F> {
    return err(op(this.err));
  }

  andThen<U>(_op: (value: T) => Result<U, E>): Result<U, E> {
    return err(this.err) as Result<U, E>;
  }

  orElse<F>(op: (err: E) => Result<T, F>): Result<T, F> {
    return op(this.err);
  }

  toJSON() {
    return { ok: false, error: this.err };
  }
}

export function ok<T, E = AppError>(value: T): Result<T, E> {
  return new Ok(value);
}

export function err<T, E = AppError>(err: E): Result<T, E> {
  return new Err(err);
}

export function isResult<T, E>(value: unknown): value is Result<T, E> {
  return value instanceof Ok || value instanceof Err;
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T, E> {
  return result.isOk();
}

export function isErr<T, E>(result: Result<T, E>): result is Err<T, E> {
  return result.isErr();
}

export function fromPromise<T>(promise: Promise<T>): Promise<Result<T, AppError>> {
  return promise
    .then((value) => ok(value))
    .catch((error) =>
      err(error instanceof AppError ? error : new AppError(String(error), 'PROMISE_ERROR'))
    );
}

export function fromSafePromise<T>(promise: Promise<T>): Promise<Result<T, AppError>> {
  return fromPromise(promise);
}

export async function tryCatch<T, E = AppError>(fn: () => T | Promise<T>): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return ok(value) as Result<T, E>;
  } catch (error) {
    return err(error as E);
  }
}

export function fromThrowable<T, E = AppError>(
  fn: () => T,
  errorMapper?: (error: unknown) => E
): Result<T, E> {
  try {
    return ok(fn());
  } catch (error) {
    return err(errorMapper ? errorMapper(error) : (error as E));
  }
}
