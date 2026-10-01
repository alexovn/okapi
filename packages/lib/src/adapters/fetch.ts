import {
  OkapiError,
  createOkapiErrorFromResponse,
  mapOkapiError,
  normalizeOkapiError,
} from '../core/okapiError'
import type { ApiValidationErrors, OkapiErrorAdapterOptions, MappedOkapiError } from '../types/main'

export interface FetchResponseLike {
  status: number
  statusText?: string
}

export type FetchResponseErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> = (
  response: FetchResponseLike,
  body?: unknown,
) => MappedOkapiError<TCustomKind, TValidationErrors>

export type FetchErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> = (error: unknown, body?: unknown) => MappedOkapiError<TCustomKind, TValidationErrors>

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getFetchError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  error: unknown,
  body?: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors> {
  if (isObject(error) && typeof error.status === 'number') {
    return createOkapiErrorFromResponse(
      {
        status: error.status,
        statusText: typeof error.statusText === 'string' ? error.statusText : undefined,
        body: body ?? error.body,
      },
      options,
    )
  }

  if (error instanceof TypeError) {
    return OkapiError.getNetworkError(error, options)
  }

  return normalizeOkapiError(error, options)
}

export function createFetchResponseErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  options: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors> = {},
): FetchResponseErrorMapper<TCustomKind, TValidationErrors> {
  return (response, body) =>
    mapOkapiError(
      createOkapiErrorFromResponse(
        {
          status: response.status,
          statusText: response.statusText,
          body,
        },
        options,
      ),
      options,
    )
}

export function createFetchErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  options: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors> = {},
): FetchErrorMapper<TCustomKind, TValidationErrors> {
  return (error, body) => mapOkapiError(getFetchError(error, body, options), options)
}
