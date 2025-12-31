import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '../../../backend/src/trpc/router';

// Use proper AppRouter type instead of `any`
export const trpc = createTRPCReact<AppRouter>();

export function createTRPCClientInstance() {
  const queryClient = new QueryClient();

  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/trpc',
      }),
    ],
  });

  return { trpcClient, queryClient };
}