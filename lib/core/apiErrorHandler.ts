import type { AxiosError } from 'axios'
import type { FetchError } from 'ofetch'
import { fromAxiosError } from '../adapters/axios'
import {
  fromFetchResponse,
  fromNativeError,
  type FetchResponseLike,
} from '../adapters/native'
import { fromOfetchError } from '../adapters/ofetch'
import {
  mapApiError,
  normalizeApiError,
  type ApiError,
  type ApiErrorAdapterOptions,
  type MapApiErrorOptions,
  type MappedApiError,
} from './apiError'

export interface ApiErrorHandlerOptions
  extends ApiErrorAdapterOptions,
  MapApiErrorOptions {}

export interface ApiErrorHandler {
  fromFetchResponse: (
    response: FetchResponseLike,
    body?: unknown,
  ) => ApiError
  fromNativeError: (error: unknown, body?: unknown) => ApiError
  fromAxiosError: <T = unknown, D = unknown>(
    error: AxiosError<T, D>,
  ) => ApiError
  fromOfetchError: <T = unknown>(error: FetchError<T>) => ApiError
  normalize: (error: unknown) => ApiError
  map: (error: unknown) => MappedApiError
}

export function createApiErrorHandler(
  options: ApiErrorHandlerOptions = {},
): ApiErrorHandler {
  return {
    fromFetchResponse: (response, body) => {
      return fromFetchResponse(response, body, options)
    },

    fromNativeError: (error, body) => {
      return fromNativeError(error, body, options)
    },

    fromAxiosError: (error) => {
      return fromAxiosError(error, options)
    },

    fromOfetchError: (error) => {
      return fromOfetchError(error, options)
    },

    normalize: (error) => {
      return normalizeApiError(error, options)
    },

    map: (error) => {
      return mapApiError(error, options)
    },
  }
}
