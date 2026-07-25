import { isAxiosError } from 'axios'
import type { AxiosError } from 'axios'

import {
  OkapiError,
  createApiErrorFromResponse,
  mapOkapiError,
  normalizeOkapiError,
} from '../core/okapiError'
import type { OkapiErrorAdapterOptions, OkapiErrorMapper } from '../types/api'

export type ApiAxiosError<T = unknown, D = unknown> = AxiosError<T, D>

export function getAxiosError<TCustomKind extends string = never>(
  error: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind>,
): OkapiError<TCustomKind> {
  if (!isAxiosError(error)) {
    return normalizeOkapiError(error, options)
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
  options: OkapiErrorAdapterOptions<TCustomKind> = {},
): OkapiErrorMapper<TCustomKind> {
  return (error) => mapOkapiError(getAxiosError(error, options), options)
}
