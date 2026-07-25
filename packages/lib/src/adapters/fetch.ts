import {
  ApiError,
  createApiErrorFromResponse,
  mapApiError,
  normalizeApiError,
} from '../core/apiError'
import type { ApiErrorAdapterOptions, MappedApiError } from '../types/api'

export interface FetchResponseLike {
  status: number
  statusText?: string
}

export type FetchResponseErrorMapper<TCustomKind extends string = never> = (
  response: FetchResponseLike,
  body?: unknown,
) => MappedApiError<TCustomKind>

export type FetchErrorMapper<TCustomKind extends string = never> = (
  error: unknown,
  body?: unknown,
) => MappedApiError<TCustomKind>

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getFetchResponseError<TCustomKind extends string = never>(
  response: FetchResponseLike,
  body?: unknown,
  options?: ApiErrorAdapterOptions<TCustomKind>,
): ApiError<TCustomKind> {
  return createApiErrorFromResponse(
    { status: response.status, statusText: response.statusText, body },
    options,
  )
}

export function getFetchError<TCustomKind extends string = never>(
  error: unknown,
  body?: unknown,
  options?: ApiErrorAdapterOptions<TCustomKind>,
): ApiError<TCustomKind> {
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
    return ApiError.getNetworkError(error, options)
  }

  return normalizeApiError(error, options)
}

export function createFetchResponseErrorMapper<TCustomKind extends string = never>(
  options: ApiErrorAdapterOptions<TCustomKind> = {},
): FetchResponseErrorMapper<TCustomKind> {
  return (response, body) => mapApiError(getFetchResponseError(response, body, options), options)
}

export function createFetchErrorMapper<TCustomKind extends string = never>(
  options: ApiErrorAdapterOptions<TCustomKind> = {},
): FetchErrorMapper<TCustomKind> {
  return (error, body) => mapApiError(getFetchError(error, body, options), options)
}
