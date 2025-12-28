import { createTRPCRouter } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '../prisma/client';
import { Todo } from '@prisma/client';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
});

export const todoRouter = createTRPCRouter({
  create: {
    input: todoSchema,
    resolve: async ({ input }) => {
      const todo = await prisma.todo.create({
        data: {
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
        },
      });
      return todo;
    },
  },
  getAll: {
    resolve: async () => {
      const todos = await prisma.todo.findMany();
      return todos;
    },
  },
  getById: {
    input: z.string(),
    resolve: async ({ input }) => {
      const todo = await prisma.todo.findUnique({
        where: { id: input },
      });
      if (!todo) {
        throw new Error('Todo not found');
      }
      return todo;
    },
  },
  update: {
    input: z.object({
      id: z.string(),
      data: todoSchema.partial(),
    }),
    resolve: async ({ input }) => {
      const todo = await prisma.todo.update({
        where: { id: input.id },
        data: input.data,
      });
      return todo;
    },
  },
  delete: {
    input: z.string(),
    resolve: async ({ input }) => {
      const todo = await prisma.todo.delete({
        where: { id: input },
      });
      return todo;
    },
  },
});