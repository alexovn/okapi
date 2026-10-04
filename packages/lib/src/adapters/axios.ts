import { AxiosError, isAxiosError, isCancel } from 'axios'

import {
  OkapiError,
  createOkapiErrorFromResponse,
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
    return createOkapiErrorFromResponse(
      {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response.data,
      },
      options,
    )
  }

  const isAbortError = isCancel(error) || error.code === AxiosError.ECONNABORTED

  // Axios rejects with ECONNABORTED by default for timeout.
  // Property transitional.clarifyTimeoutError should be set up to receive ETIMEDOUT instead.
  const isTimeoutError = error.code === AxiosError.ETIMEDOUT

  return OkapiError.getTransportError(error, options, { isAbortError, isTimeoutError })
}

export function createAxiosErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  options: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors> = {},
): OkapiErrorMapper<TCustomKind, TValidationErrors> {
  return (error) => mapOkapiError(getAxiosError(error, options), options)
}
