import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { ApiError, apiCall, buildApiUrl } from '../utils/api';

/**
 * Hook for making API calls with automatic error handling
 */
export const useApiCall = () => {
  const { addToast, addPersistentToast } = useToast();

  const call = useCallback(
    async <T,>(
      endpoint: string,
      options?: RequestInit,
      config?: {
        showSuccess?: boolean;
        successMessage?: string;
        showError?: boolean;
        errorMessage?: string;
        persistent?: boolean;
      }
    ): Promise<T | null> => {
      try {
        const url = buildApiUrl(endpoint);
        const result = await apiCall<T>(url, options);

        if (config?.showSuccess) {
          const message = config?.successMessage || 'Operation completed successfully';
          if (config?.persistent) {
            addPersistentToast(message, 'success');
          } else {
            addToast(message, 'success', 3000);
          }
        }

        return result;
      } catch (error) {
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

        console.error('API Call Error:', {
          endpoint,
          error,
          timestamp: new Date().toISOString(),
        });

        return null;
      }
    },
    [addToast, addPersistentToast]
  );

  return { call };
};

/**
 * Hook for async operations with toast notifications
 */
export const useAsync = () => {
  const { addToast, addPersistentToast } = useToast();

  const execute = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      config?: {
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
        persistent?: boolean;
      }
    ): Promise<T | null> => {
      try {
        if (config?.loadingMessage) {
          if (config?.persistent) {
            addPersistentToast(config.loadingMessage, 'info');
          } else {
            addToast(config.loadingMessage, 'info', 0);
          }
        }

        const result = await asyncFn();

        if (config?.successMessage) {
          const message = config.successMessage;
          if (config?.persistent) {
            addPersistentToast(message, 'success');
          } else {
            addToast(message, 'success', 3000);
          }
        }

        return result;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'An error occurred';

        const message = config?.errorMessage || errorMsg;
        if (config?.persistent) {
          addPersistentToast(message, 'error');
        } else {
          addToast(message, 'error', 5000);
        }

        console.error('Async Operation Error:', {
          error,
          timestamp: new Date().toISOString(),
        });

        return null;
      }
    },
    [addToast, addPersistentToast]
  );

  return { execute };
};
