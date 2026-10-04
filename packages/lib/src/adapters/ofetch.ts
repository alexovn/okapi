import { FetchError } from 'ofetch'

import { ABORT_ERROR, TIMEOUT_ERROR } from '../constants'
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
    typeof cause === 'object' && cause !== null && 'name' in cause && cause.name === ABORT_ERROR

  const isTimeoutError =
    typeof cause === 'object' && cause !== null && 'name' in cause && cause.name === TIMEOUT_ERROR

  return OkapiError.getTransportError(error, options, { isAbortError, isTimeoutError })
}

export function createOfetchErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  options: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors> = {},
): OkapiErrorMapper<TCustomKind, TValidationErrors> {
  return (error) => mapOkapiError(getOfetchError(error, options), options)
}
