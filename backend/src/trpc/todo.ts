import { initTRPC } from '@trpc/server';
import * as v from 'valibot';
import { prisma } from '../prisma/client';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const todoRouter = t.router({
  getAll: t.procedure.query(async () => {
    try {
      const todos = await prisma.todo.findMany();
      return todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }),
  getById: t.procedure.input(v.string()).query(async ({ input }) => {
    try {
      return await prisma.todo.findUnique({ where: { id: input } });
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw error;
    }
  }),
  create: t.procedure
    .input(
      v.object({
        title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
        description: v.optional(v.string()),
        dueDate: v.optional(v.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await prisma.todo.create({
          data: {
            title: input.title,
            description: input.description,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            status: 'todo',
          },
        });
      } catch (error) {
        console.error('Error creating todo:', error);
        throw error;
      }
    }),
  update: t.procedure
    .input(
      v.object({
        id: v.string(),
        title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
        description: v.optional(v.string()),
        dueDate: v.optional(v.string()),
        status: v.picklist(['todo', 'doing', 'done']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await prisma.todo.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            status: input.status,
          },
        });
      } catch (error) {
        console.error('Error updating todo:', error);
        throw error;
      }
    }),
  delete: t.procedure.input(v.string()).mutation(async ({ input }) => {
    try {
      return await prisma.todo.delete({ where: { id: input } });
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }),
});