import { describe, expect, it } from 'bun:test';
import {
  AppError,
  err,
  fromThrowable,
  isErr,
  isOk,
  isResult,
  ok,
  Result,
  tryCatch,
} from '../../../src/shared/errors';

describe('Result', () => {
  describe('ok()', () => {
    it('should create an Ok result with value', () => {
      const result = ok(42);
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
      expect(result.value).toBe(42);
    });

    it('should unwrap Ok value', () => {
      const result = ok('hello');
      expect(result.unwrap()).toBe('hello');
    });

    it('should return default value on unwrapOr for Ok', () => {
      const result = ok('hello');
      expect(result.unwrapOr('default')).toBe('hello');
    });
  });

  describe('err()', () => {
    it('should create an Err result with error', () => {
      const error = new AppError('Failed', 'ERROR');
      const result = err(error);
      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
      expect(result.err).toBe(error);
    });

    it('should throw on unwrap for Err', () => {
      const error = new AppError('Failed', 'ERROR');
      const result = err(error);
      expect(() => result.unwrap()).toThrow();
    });

    it('should return default value on unwrapOr for Err', () => {
      const error = new AppError('Failed', 'ERROR');
      const result = err<string, AppError>(error);
      expect(result.unwrapOr('default')).toBe('default');
    });

    it('should call op on unwrapOrElse for Err', () => {
      const error = new AppError('Failed', 'ERROR');
      const result = err<string, AppError>(error);
      const value = result.unwrapOrElse((e) => `handled: ${e.message}`);
      expect(value).toBe('handled: Failed');
    });
  });

  describe('isOk() / isErr()', () => {
    it('should correctly identify Ok result', () => {
      const result = ok(42);
      expect(isOk(result)).toBe(true);
      expect(isErr(result)).toBe(false);
    });

    it('should correctly identify Err result', () => {
      const result = err(new AppError('Error', 'CODE'));
      expect(isOk(result)).toBe(false);
      expect(isErr(result)).toBe(true);
    });
  });

  describe('isResult()', () => {
    it('should return true for Ok', () => {
      expect(isResult(ok(42))).toBe(true);
    });

    it('should return true for Err', () => {
      expect(isResult(err(new AppError('e', 'c')))).toBe(true);
    });

    it('should return false for plain values', () => {
      expect(isResult(42)).toBe(false);
      expect(isResult(null)).toBe(false);
      expect(isResult('error')).toBe(false);
    });
  });

  describe('map()', () => {
    it('should transform Ok value', () => {
      const result = ok(5).map((v) => v * 2);
      expect(result.unwrap()).toBe(10);
    });

    it('should not transform Err', () => {
      const error = new AppError('error', 'CODE');
      const result = err<number, AppError>(error).map((v) => v * 2);
      expect(result.isErr()).toBe(true);
    });
  });

  describe('mapErr()', () => {
    it('should not transform Ok', () => {
      const result = ok(5).mapErr((e) => new AppError('new', 'NEW'));
      expect(result.unwrap()).toBe(5);
    });

    it('should transform Err error', () => {
      const error = new AppError('old', 'OLD');
      const result = err<number, AppError>(error).mapErr(
        (e: AppError) => new AppError('new', 'NEW')
      );
      expect(result.isErr()).toBe(true);
      expect((result as any).err.code).toBe('NEW');
    });
  });

  describe('andThen()', () => {
    it('should chain Ok results', () => {
      const result = ok(5)
        .andThen((v) => ok(v * 2))
        .andThen((v) => ok(v + 1));
      expect(result.unwrap()).toBe(11);
    });

    it('should short-circuit on Err', () => {
      const error = new AppError('error', 'CODE');
      const result = err<number, AppError>(error).andThen((v: number) => ok(v * 2));
      expect(result.isErr()).toBe(true);
    });

    it('should allow returning Err from chain', () => {
      const result = ok<number, AppError>(5).andThen((v: number) =>
        err(new AppError('failed', 'FAIL'))
      );
      expect(result.isErr()).toBe(true);
    });
  });

  describe('orElse()', () => {
    it('should not call op on Ok', () => {
      const result = ok(5).orElse((e) => err(e));
      expect(result.unwrap()).toBe(5);
    });

    it('should call op on Err', () => {
      const error = new AppError('error', 'CODE');
      const result = err<number, AppError>(error).orElse((_e: AppError) => ok(42));
      expect(result.unwrap()).toBe(42);
    });
  });

  describe('tryCatch()', () => {
    it('should return Ok for successful sync function', async () => {
      const result = await tryCatch(() => 42);
      expect(result.unwrap()).toBe(42);
    });

    it('should return Err for throwing sync function', async () => {
      const result = await tryCatch(() => {
        throw new Error('boom');
      });
      expect(result.isErr()).toBe(true);
    });

    it('should return Ok for successful async function', async () => {
      const result = await tryCatch(async () => await Promise.resolve(42));
      expect(result.unwrap()).toBe(42);
    });

    it('should return Err for failing async function', async () => {
      const result = await tryCatch(async () => {
        throw new Error('boom');
      });
      expect(result.isErr()).toBe(true);
    });
  });

  describe('fromThrowable()', () => {
    it('should return Ok for successful function', () => {
      const result = fromThrowable(() => 42);
      expect(result.unwrap()).toBe(42);
    });

    it('should return Err for throwing function', () => {
      const result = fromThrowable(() => {
        throw new Error('boom');
      });
      expect(result.isErr()).toBe(true);
    });

    it('should use custom error mapper', () => {
      const result = fromThrowable<number, AppError>(
        () => {
          throw new Error('boom');
        },
        (e: unknown) => new AppError((e as Error).message, 'MAPPED')
      );
      expect(result.isErr()).toBe(true);
      const errResult = result as { isErr: () => boolean; err: AppError };
      expect(errResult.err.code).toBe('MAPPED');
    });
  });

  describe('toJSON()', () => {
    it('should serialize Ok to JSON', () => {
      const json = ok(42).toJSON();
      expect(json).toEqual({ ok: true, value: 42 });
    });

    it('should serialize Err to JSON', () => {
      const error = new AppError('error', 'CODE');
      const json = err(error).toJSON();
      expect(json).toEqual({ ok: false, error });
    });
  });
});
