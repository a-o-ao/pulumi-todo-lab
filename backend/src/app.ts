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

// Start the server
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    app.log.info(`Server is running at http://0.0.0.0:3000`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();