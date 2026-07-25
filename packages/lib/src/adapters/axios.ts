import { isAxiosError } from 'axios'
import type { AxiosError } from 'axios'

import {
  ApiError,
  createApiErrorFromResponse,
  mapApiError,
  normalizeApiError,
} from '../core/apiError'
import type { ApiErrorAdapterOptions, ApiErrorMapper } from '../types/api'

export type ApiAxiosError<T = unknown, D = unknown> = AxiosError<T, D>

export function getAxiosError<TCustomKind extends string = never>(
  error: unknown,
  options?: ApiErrorAdapterOptions<TCustomKind>,
): ApiError<TCustomKind> {
  if (!isAxiosError(error)) {
    return normalizeApiError(error, options)
  }

  if (typeof error.response?.status === 'number') {
    return createApiErrorFromResponse(
      {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response.data,
      },
      options,
    )
  }

  return ApiError.getNetworkError(error, options)
}

export function createAxiosErrorMapper<TCustomKind extends string = never>(
  options: ApiErrorAdapterOptions<TCustomKind> = {},
): ApiErrorMapper<TCustomKind> {
  return (error) => mapApiError(getAxiosError(error, options), options)
}
