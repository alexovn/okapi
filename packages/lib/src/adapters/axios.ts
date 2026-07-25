import { isAxiosError } from 'axios'
import type { AxiosError } from 'axios'

import {
  OkapiError,
  createApiErrorFromResponse,
  mapApiError,
  normalizeApiError,
} from '../core/okapiError'
import type { ApiErrorAdapterOptions, ApiErrorMapper } from '../types/api'

export type ApiAxiosError<T = unknown, D = unknown> = AxiosError<T, D>

export function getAxiosError<TCustomKind extends string = never>(
  error: unknown,
  options?: ApiErrorAdapterOptions<TCustomKind>,
): OkapiError<TCustomKind> {
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

  return OkapiError.getNetworkError(error, options)
}

export function createAxiosErrorMapper<TCustomKind extends string = never>(
  options: ApiErrorAdapterOptions<TCustomKind> = {},
): ApiErrorMapper<TCustomKind> {
  return (error) => mapApiError(getAxiosError(error, options), options)
}
