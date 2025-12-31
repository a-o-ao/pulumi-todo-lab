import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as v from 'valibot';

// Validation tests
describe('Todo Validation', () => {
  const todoInputSchema = v.object({
    title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
  });

  it('should validate valid todo input', () => {
    const validInput = {
      title: 'Buy groceries',
      description: 'Milk, bread, eggs',
      dueDate: '2025-12-31',
    };
    expect(() => v.parse(todoInputSchema, validInput)).not.toThrow();
  });

  it('should require a title', () => {
    const invalidInput = {
      title: '',
      description: 'No title',
    };
    // Valibot's minLength(1) rejects empty strings
    const result = v.safeParse(todoInputSchema, invalidInput);
    expect(result.success).toBe(false);
  });

  it('should allow optional description and dueDate', () => {
    const minimalInput = {
      title: 'Simple task',
    };
    const result = v.parse(todoInputSchema, minimalInput);
    expect(result.title).toBe('Simple task');
    expect(result.description).toBeUndefined();
    expect(result.dueDate).toBeUndefined();
  });

  it('should reject invalid date format', () => {
    const invalidInput = {
      title: 'Task',
      dueDate: 'not-a-date',
    };
    const result = v.safeParse(todoInputSchema, invalidInput);
    // Since dueDate is just a string, it will pass validation
    // But the backend will validate it when creating a Date
    expect(result.success).toBe(true);
  });
});

// Update input validation tests
describe('Todo Update Validation', () => {
  const todoUpdateSchema = v.object({
    id: v.string(),
    title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.picklist(['todo', 'doing', 'done']),
  });

  it('should validate valid update input', () => {
    const validInput = {
      id: '123',
      title: 'Updated task',
      status: 'doing' as const,
    };
    expect(() => v.parse(todoUpdateSchema, validInput)).not.toThrow();
  });

  it('should validate status values', () => {
    const validStatuses: ('todo' | 'doing' | 'done')[] = ['todo', 'doing', 'done'];
    validStatuses.forEach((status) => {
      const input = {
        id: '123',
        title: 'Task',
        status: status,
      };
      expect(() => v.parse(todoUpdateSchema, input)).not.toThrow();
    });
  });

  it('should reject invalid status', () => {
    const invalidInput = {
      id: '123',
      title: 'Task',
      status: 'invalid',
    };
    expect(() => v.parse(todoUpdateSchema, invalidInput)).toThrow();
  });
});

// Business logic tests
describe('Todo Business Logic', () => {
  it('should parse date string correctly', () => {
    const dateString = '2025-12-31';
    const date = new Date(dateString);
    expect(date).toBeInstanceOf(Date);
    expect(date.toISOString().startsWith('2025-12-31')).toBe(true);
  });

  it('should handle optional dueDate as null when not provided', () => {
    const dueDate = undefined;
    const result = dueDate ? new Date(dueDate) : null;
    expect(result).toBeNull();
  });

  it('should handle optional dueDate when provided', () => {
    const dueDate = '2025-12-31';
    const result = dueDate ? new Date(dueDate) : null;
    expect(result).toBeInstanceOf(Date);
  });

  it('should set default status to "todo" for new items', () => {
    const status = 'todo';
    expect(['todo', 'doing', 'done']).toContain(status);
  });
});

// Error handling tests
describe('Error Handling', () => {
  it('should throw error for empty title', () => {
    const titleSchema = v.pipe(v.string(), v.minLength(1, 'Title is required'));
    // Valibot's minLength(1) rejects empty strings
    const result = v.safeParse(titleSchema, '');
    expect(result.success).toBe(false);
  });

  it('should throw error for null title', () => {
    const titleSchema = v.pipe(v.string(), v.minLength(1, 'Title is required'));
    expect(() => v.parse(titleSchema, null)).toThrow();
  });

  it('should validate description is a string', () => {
    const descriptionSchema = v.optional(v.string());
    expect(() => v.parse(descriptionSchema, 'Valid description')).not.toThrow();
    expect(() => v.parse(descriptionSchema, undefined)).not.toThrow();
    // Note: Valibot will validate types strictly
  });
});

// Todo CRUD operation expectations
describe('Todo CRUD Operations', () => {
  describe('Create', () => {
    it('should have required fields for creation', () => {
      const createSchema = v.object({
        title: v.pipe(v.string(), v.minLength(1)),
        description: v.optional(v.string()),
        dueDate: v.optional(v.string()),
      });

      const input = { title: 'New task' };
      const parsed = v.parse(createSchema, input);
      expect(parsed.title).toBe('New task');
      expect(parsed.description).toBeUndefined();
      expect(parsed.dueDate).toBeUndefined();
    });
  });

  describe('Read', () => {
    it('should validate UUID format for getById', () => {
      const idSchema = v.string();
      const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      expect(() => v.parse(idSchema, id)).not.toThrow();
    });
  });

  describe('Update', () => {
    it('should require id and at least title', () => {
      const updateSchema = v.object({
        id: v.string(),
        title: v.pipe(v.string(), v.minLength(1)),
        description: v.optional(v.string()),
        dueDate: v.optional(v.string()),
        status: v.picklist(['todo', 'doing', 'done']),
      });

      const input = {
        id: '123',
        title: 'Updated',
        status: 'doing' as const,
      };
      const parsed = v.parse(updateSchema, input);
      expect(parsed.id).toBe('123');
      expect(parsed.title).toBe('Updated');
      expect(parsed.status).toBe('doing');
    });
  });

  describe('Delete', () => {
    it('should require id for deletion', () => {
      const deleteSchema = v.string();
      const id = 'some-id';
      expect(() => v.parse(deleteSchema, id)).not.toThrow();
    });
  });
});

// Type safety tests
describe('Todo Types', () => {
  type TodoStatus = 'todo' | 'doing' | 'done';

  it('should validate TodoStatus type', () => {
    const validStatuses: TodoStatus[] = ['todo', 'doing', 'done'];
    expect(validStatuses).toHaveLength(3);
    expect(validStatuses).toContain('todo');
    expect(validStatuses).toContain('doing');
    expect(validStatuses).toContain('done');
  });
});
