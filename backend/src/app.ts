import fastify from 'fastify';
import { appRouter } from './trpc/router';
import { createContext } from './trpc/context';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

const app = fastify({ logger: true });

// Middleware
app.register(require('@fastify/cors'), { origin: '*' });

// tRPC plugin registration (fastify-trpc)
app.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
});

// Health check route
app.get('/health', async () => ({ status: 'ok' }));

export { app };