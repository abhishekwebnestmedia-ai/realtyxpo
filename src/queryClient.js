import { QueryClient } from '@tanstack/react-query';

// single shared QueryClient instance for the app
export const queryClient = new QueryClient();

export default queryClient;
