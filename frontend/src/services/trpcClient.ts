import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '../../backend/src/trpc/router';

export const trpc = createTRPCReact<AppRouter>();

export function createTRPCClient() {
  const queryClient = new QueryClient();

  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/trpc',
      }),
    ],
  });

  return { trpcClient, queryClient };
}