import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '../../../backend/src/trpc/router';

// Use proper AppRouter type instead of `any`
export const trpc = createTRPCReact<AppRouter>();

export function createTRPCClientInstance() {
  const queryClient = new QueryClient();

  // VITE_API_URL があればそれを使い、無ければ現在のオリジンを使用
  const baseUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');

  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
      }),
    ],
  });

  return { trpcClient, queryClient };
}