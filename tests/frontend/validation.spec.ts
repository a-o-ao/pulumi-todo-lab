import { z } from 'zod';
import { validateTodo } from '../../src/utils/validation';

describe('Validation Tests', () => {
  const validTodo = {
    title: 'Test Todo',
    description: 'This is a test todo item.',
    dueDate: new Date().toISOString(),
  };

  it('should validate a valid todo item', () => {
    const result = validateTodo(validTodo);
    expect(result.success).toBe(true);
  });

  it('should fail validation if title is missing', () => {
    const invalidTodo = { ...validTodo, title: '' };
    const result = validateTodo(invalidTodo);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should fail validation if dueDate is not a valid date', () => {
    const invalidTodo = { ...validTodo, dueDate: 'invalid-date' };
    const result = validateTodo(invalidTodo);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});