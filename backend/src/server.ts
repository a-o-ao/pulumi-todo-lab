import fastify from 'fastify';
import { createContext } from './trpc/context';
import { appRouter } from './trpc/router';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

const server = fastify({ logger: true });

server.register(require('@fastify/cors'), {
  origin: true,
});

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
    console.log(`Server is running at http://localhost:3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();