import { $fetch, type FetchOptions } from 'ofetch'
import { getOfetchError } from '@alexovn/okapi'
import type {
  ApiErrorAdapterOptions,
  MapApiErrorOptions,
  ApiError,
} from '@alexovn/okapi'

interface ApiErrorHandlerOptions extends ApiErrorAdapterOptions, MapApiErrorOptions {}

export interface ApiErrorHandler {
  getOfetchError: (error: unknown) => ApiError
}

function createApiErrorHandler(options: ApiErrorHandlerOptions = {}): ApiErrorHandler {
  return {
    getOfetchError: (error) => getOfetchError(error, options),
  }
}

const apiErrors = createApiErrorHandler({
  resolveMessage: ({ kind }) => `API error: ${kind}`,
  resolveFactoryMessage: ({ kind }) => `API error: ${kind}`,
  resolveHttpMessage: ({ statusCode }) => {
    return statusCode ? `HTTP error ${statusCode}` : undefined
  },
})

export async function ofetchGet<T>(
  url: string,
  options?: FetchOptions<'json'>,
): Promise<T> {
  try {
    return await $fetch<T>(url, options)
  } catch (error) {
    throw apiErrors.getOfetchError(error)
  }
}

export async function ofetchPost<T>(
  url: string,
  payload: Record<string, unknown>,
): Promise<T | undefined> {
  try {
    return await $fetch<T>(url, {
      body: payload,
      method: 'POST',
    })
  } catch (error) {
    throw apiErrors.getOfetchError(error)
  }
}
