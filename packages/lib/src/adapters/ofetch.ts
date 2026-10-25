import { FetchError } from 'ofetch'

import {
  OkapiError,
  createOkapiErrorFromResponse,
  mapOkapiError,
  normalizeOkapiError,
} from '../core/okapiError'
import type { ApiValidationErrors, OkapiErrorAdapterOptions, OkapiErrorMapper } from '../types/main'
import { isAbortError, isTimeoutError } from '../utils/errors'

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

  return OkapiError.getTransportError(error, options, {
    isAbortError: isAbortError(cause),
    isTimeoutError: isTimeoutError(cause),
  })
}

export function createOfetchErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  options: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors> = {},
): OkapiErrorMapper<TCustomKind, TValidationErrors> {
  return (error) => mapOkapiError(getOfetchError(error, options), options)
}
