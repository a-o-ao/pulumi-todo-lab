import { describe, it, expect } from 'vitest';
import {
  AppError,
  handleValibotError,
  handleNotFoundError,
  handleValidationError,
  handleUnexpectedError,
} from '../../backend/src/utils/errors';
import * as v from 'valibot';

describe('Error Handling', () => {
  describe('AppError', () => {
    it('should create an AppError with message and statusCode', () => {
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });

    it('should extend Error class', () => {
      const error = new AppError('Test', 500);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('handleValibotError', () => {
    it('should handle Valibot validation errors', () => {
      const schema = v.object({
        title: v.string([v.minLength(1, 'Title is required')]),
      });

      try {
        v.parse(schema, { title: '' });
      } catch (error) {
        if (error instanceof v.ValiError) {
          const appError = handleValibotError(error);
          expect(appError.statusCode).toBe(400);
          expect(appError.message).toContain('Title is required');
        }
      }
    });

    it('should combine multiple validation error messages', () => {
      const schema = v.object({
        title: v.string([v.minLength(1, 'Title is required')]),
        description: v.string([v.minLength(1, 'Description is required')]),
      });

      try {
        v.parse(schema, { title: '', description: '' });
      } catch (error) {
        if (error instanceof v.ValiError) {
          const appError = handleValibotError(error);
          expect(appError.statusCode).toBe(400);
          expect(appError.message).toBeTruthy();
        }
      }
    });
  });

  describe('handleNotFoundError', () => {
    it('should create 404 error for missing resource', () => {
      const error = handleNotFoundError('Todo');
      expect(error.message).toBe('Todo not found');
      expect(error.statusCode).toBe(404);
    });

    it('should include resource name in error message', () => {
      const resources = ['Todo', 'User', 'Task'];
      resources.forEach((resource) => {
        const error = handleNotFoundError(resource);
        expect(error.message).toContain(resource);
      });
    });
  });

  describe('handleValidationError', () => {
    it('should create 422 validation error', () => {
      const error = handleValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(422);
    });
  });

  describe('handleUnexpectedError', () => {
    it('should create 500 unexpected error', () => {
      const error = handleUnexpectedError();
      expect(error.message).toBe('An unexpected error occurred');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('Error Status Codes', () => {
    it('should use appropriate HTTP status codes', () => {
      const errors = [
        { error: new AppError('Bad request', 400), expected: 400 },
        { error: new AppError('Unauthorized', 401), expected: 401 },
        { error: new AppError('Forbidden', 403), expected: 403 },
        { error: new AppError('Not found', 404), expected: 404 },
        { error: new AppError('Server error', 500), expected: 500 },
      ];

      errors.forEach(({ error, expected }) => {
        expect(error.statusCode).toBe(expected);
      });
    });
  });
});
