import type { AxiosError } from 'axios'
import { ApiError, createApiErrorFromResponse } from '../core/apiError'
import type { ApiErrorAdapterOptions } from '../core/apiError'

export type ApiAxiosError<T = unknown, D = unknown> = AxiosError<T, D>

export function fromAxiosError<T = unknown, D = unknown>(
  error: AxiosError<T, D>,
  options?: ApiErrorAdapterOptions,
): ApiError {
  if (typeof error.response?.status === 'number') {
    return createApiErrorFromResponse({
      status: error.response.status,
      statusText: error.response.statusText,
      body: error.response.data,
    }, options)
  }

  return ApiError.fromNetwork(error, options)
}
