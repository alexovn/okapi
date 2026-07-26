import { isAxiosError } from 'axios'
import type { AxiosError } from 'axios'

import {
  OkapiError,
  createApiErrorFromResponse,
  mapOkapiError,
  normalizeOkapiError,
} from '../core/okapiError'
import type { ApiValidationErrors, OkapiErrorAdapterOptions, OkapiErrorMapper } from '../types/main'

export type ApiAxiosError<T = unknown, D = unknown> = AxiosError<T, D>

export function getAxiosError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  error: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors> {
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

export function createAxiosErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  options: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors> = {},
): OkapiErrorMapper<TCustomKind, TValidationErrors> {
  return (error) => mapOkapiError(getAxiosError(error, options), options)
}
