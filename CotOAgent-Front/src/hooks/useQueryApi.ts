import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { ApiError, apiCall, buildApiUrl } from '../utils/api';

/**
 * Hook for fetching data using TanStack Query with integrated error handling and toast notifications
 */
export const useQueryApi = <T,>(
  endpoint: string,
  options?: {
    queryOptions?: Partial<QueryOptions<T>>;
    showError?: boolean;
    errorMessage?: string;
    enabled?: boolean;
    headers?: Record<string, string>;
  }
) => {
  const { addToast } = useToast();

  const query = useQuery<T>({
    queryKey: [endpoint, options?.headers],
    queryFn: async () => {
      try {
        const url = buildApiUrl(endpoint);
        const fetchOptions: RequestInit = {};
        
        if (options?.headers) {
          fetchOptions.headers = options.headers;
        }
        
        return await apiCall<T>(url, fetchOptions);
      } catch (error) {
        let errorMsg = 'Failed to fetch data';

        if (error instanceof ApiError) {
          errorMsg = error.message;
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }

        if (options?.showError !== false) {
          const message = options?.errorMessage || errorMsg;
          addToast(message, 'error', 5000);
        }

        throw error;
      }
    },
    enabled: options?.enabled !== false,
    ...options?.queryOptions,
  });

  return query;
};

/**
 * Hook for mutations (POST, PUT, DELETE) with integrated error handling and toast notifications
 */
export const useMutationApi = <TData, TVariables = unknown>(
  config?: {
    mutationOptions?: Partial<UseMutationOptions<TData, Error, TVariables>>;
    showSuccess?: boolean;
    successMessage?: string;
    showError?: boolean;
    errorMessage?: string;
    persistent?: boolean;
    invalidateKeys?: string[];
  }
) => {
  const { addToast, addPersistentToast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, Error, TVariables>({
    // Provide a default mutationFn if none is provided
    mutationFn: config?.mutationOptions?.mutationFn || (async () => {
      throw new Error('No mutationFn provided');
    }),
    onSuccess: () => {
      if (config?.showSuccess) {
        const message = config?.successMessage || 'Operation completed successfully';
        if (config?.persistent) {
          addPersistentToast(message, 'success');
        } else {
          addToast(message, 'success', 3000);
        }
      }

      // Invalidate specified keys to trigger refetch
      if (config?.invalidateKeys && config.invalidateKeys.length > 0) {
        config.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    },
    onError: (error) => {
      let errorMsg = 'An error occurred';

      if (error instanceof ApiError) {
        errorMsg = error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      if (config?.showError !== false) {
        const message = config?.errorMessage || errorMsg;
        if (config?.persistent) {
          addPersistentToast(message, 'error');
        } else {
          addToast(message, 'error', 5000);
        }
      }

      console.error('Mutation Error:', {
        error,
        timestamp: new Date().toISOString(),
      });
    },
    ...config?.mutationOptions,
  });

  return mutation;
};
