import { FetchError } from 'ofetch'

import {
  OkapiError,
  createApiErrorFromResponse,
  mapOkapiError,
  normalizeOkapiError,
} from '../core/okapiError'
import type { OkapiErrorAdapterOptions, OkapiErrorMapper } from '../types/api'

export type ApiOfetchError<T = unknown> = FetchError<T>

export function getOfetchError<TCustomKind extends string = never>(
  error: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind>,
): OkapiError<TCustomKind> {
  if (!(error instanceof FetchError)) {
    return normalizeOkapiError(error, options)
  }

  if (error.response) {
    return createApiErrorFromResponse(
      {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response._data,
      },
      options,
    )
  }

  return OkapiError.getNetworkError(error, options)
}

export function createOfetchErrorMapper<TCustomKind extends string = never>(
  options: OkapiErrorAdapterOptions<TCustomKind> = {},
): OkapiErrorMapper<TCustomKind> {
  return (error) => mapOkapiError(getOfetchError(error, options), options)
}
