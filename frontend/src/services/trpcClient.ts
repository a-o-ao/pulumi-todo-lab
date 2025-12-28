import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';

// Use `any` here to avoid cross-package type import issues in the workspace editor.
export const trpc = createTRPCReact<any>();

export function createTRPCClientInstance() {
  const queryClient = new QueryClient();

  const trpcClient = createTRPCClient({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/trpc',
      }),
    ],
  });

  return { trpcClient, queryClient };
}