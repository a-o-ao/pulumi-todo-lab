import { initTRPC } from '@trpc/server';
import { todoRouter as todo } from './todo';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = () => t.router;

export const appRouter = t.router({
  todo,
});

export type AppRouter = typeof appRouter;