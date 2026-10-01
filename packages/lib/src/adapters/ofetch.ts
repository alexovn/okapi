import { FetchError } from 'ofetch'

import {
  OkapiError,
  createOkapiErrorFromResponse,
  mapOkapiError,
  normalizeOkapiError,
} from '../core/okapiError'
import type { ApiValidationErrors, OkapiErrorAdapterOptions, OkapiErrorMapper } from '../types/main'

export type ApiOfetchError<T = unknown> = FetchError<T>

export function getOfetchError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  error: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors> {
  if (!(error instanceof FetchError)) {
    return normalizeOkapiError(error, options)
  }

  if (error.response) {
    return createOkapiErrorFromResponse(
      {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response._data,
      },
      options,
    )
  }

  const cause = error.cause
  const isAbortError =
    typeof cause === 'object' && cause !== null && 'name' in cause && cause.name === 'AbortError'

  return OkapiError.getNetworkError(error, options, { isAbortError })
}

export function createOfetchErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  options: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors> = {},
): OkapiErrorMapper<TCustomKind, TValidationErrors> {
  return (error) => mapOkapiError(getOfetchError(error, options), options)
}
