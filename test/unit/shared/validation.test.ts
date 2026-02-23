import { describe, it, expect } from 'bun:test';
import { z, validate, validateSafe, schemas } from '../../../src/shared/validation';

describe('Validation', () => {
  describe('validate', () => {
    it('should validate valid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = { name: 'John', age: 30 };
      const result = validate(schema, data);

      expect(result).toEqual(data);
    });

    it('should throw on invalid data', () => {
      const schema = z.object({
        name: z.string(),
      });

      expect(() => validate(schema, { name: 123 })).toThrow('Validation failed');
    });
  });

  describe('validateSafe', () => {
    it('should return success for valid data', () => {
      const schema = z.string();
      const result = validateSafe(schema, 'hello');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hello');
      }
    });

    it('should return error for invalid data', () => {
      const schema = z.string();
      const result = validateSafe(schema, 123);

      expect(result.success).toBe(false);
    });
  });

  describe('schemas', () => {
    it('should validate settings schema', () => {
      const data = { key: 'theme', value: 'dark' };
      const result = validateSafe(schemas.settings, data);

      expect(result.success).toBe(true);
    });

    it('should reject invalid settings', () => {
      const data = { key: '', value: 'dark' };
      const result = validateSafe(schemas.settings, data);

      expect(result.success).toBe(false);
    });
  });
});
