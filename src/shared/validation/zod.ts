/**
 * Validation utilities using Zod
 */
import { type ZodError, type ZodSchema, z } from 'zod';

export { z };

/**
 * Validate data against a schema
 * Returns the validated data or throws a ValidationError
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown, fieldName?: string): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new Error(`Validation failed${fieldName ? ` for ${fieldName}` : ''}: ${messages}`);
    }
    throw error;
  }
}

/**
 * Validate data safely - returns result or error
 */
export function validateSafe<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ZodError } {
  const result = schema.safeParse(data);
  return result;
}

/**
 * Create a validated IPC handler wrapper
 */
export function createValidatedHandler<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (data: TInput) => Promise<TOutput> | TOutput
) {
  return async (data: unknown): Promise<TOutput> => {
    const validated = validate(schema, data);
    return handler(validated);
  };
}

/**
 * Common schemas
 */
export const schemas = {
  string: z.string().min(1),
  number: z.number(),
  boolean: z.boolean(),
  object: z.object({}),
  array: z.array(z.unknown()),

  settings: z.object({
    key: z.string().min(1),
    value: z.unknown(),
  }),

  windowOptions: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    title: z.string().optional(),
  }),

  dialogOptions: z.object({
    type: z.enum(['none', 'info', 'error', 'question', 'warning']).optional(),
    title: z.string().optional(),
    message: z.string(),
    detail: z.string().optional(),
    buttons: z.array(z.string()).optional(),
  }),
};

/**
 * Type helpers
 */
export type InferType<T extends ZodSchema> = z.infer<T>;
