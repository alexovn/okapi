import {
  OkapiError,
  createApiErrorFromResponse,
  mapOkapiError,
  normalizeOkapiError,
} from '../core/okapiError'
import type { OkapiErrorAdapterOptions, MappedOkapiError } from '../types/api'

export interface FetchResponseLike {
  status: number
  statusText?: string
}

export type FetchResponseErrorMapper<TCustomKind extends string = never> = (
  response: FetchResponseLike,
  body?: unknown,
) => MappedOkapiError<TCustomKind>

export type FetchErrorMapper<TCustomKind extends string = never> = (
  error: unknown,
  body?: unknown,
) => MappedOkapiError<TCustomKind>

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getFetchResponseError<TCustomKind extends string = never>(
  response: FetchResponseLike,
  body?: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind>,
): OkapiError<TCustomKind> {
  return createApiErrorFromResponse(
    { status: response.status, statusText: response.statusText, body },
    options,
  )
}

export function getFetchError<TCustomKind extends string = never>(
  error: unknown,
  body?: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind>,
): OkapiError<TCustomKind> {
  if (isObject(error) && typeof error.status === 'number') {
    return getFetchResponseError(
      {
        status: error.status,
        statusText: typeof error.statusText === 'string' ? error.statusText : undefined,
      },
      body ?? error.body,
      options,
    )
  }

  if (error instanceof TypeError) {
    return OkapiError.getNetworkError(error, options)
  }

  return normalizeOkapiError(error, options)
}

export function createFetchResponseErrorMapper<TCustomKind extends string = never>(
  options: OkapiErrorAdapterOptions<TCustomKind> = {},
): FetchResponseErrorMapper<TCustomKind> {
  return (response, body) => mapOkapiError(getFetchResponseError(response, body, options), options)
}

export function createFetchErrorMapper<TCustomKind extends string = never>(
  options: OkapiErrorAdapterOptions<TCustomKind> = {},
): FetchErrorMapper<TCustomKind> {
  return (error, body) => mapOkapiError(getFetchError(error, body, options), options)
}
