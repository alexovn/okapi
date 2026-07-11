import { getFetchResponseError, getFetchError } from '../../lib'
import type {
  ApiErrorAdapterOptions,
  MapApiErrorOptions,
  FetchResponseLike,
  ApiError
} from '../../lib'

interface ApiErrorHandlerOptions extends ApiErrorAdapterOptions, MapApiErrorOptions {}

export interface ApiErrorHandler {
  getFetchResponseError: (response: FetchResponseLike, body?: unknown) => ApiError
  getFetchError: (error: unknown, body?: unknown) => ApiError
}

function createApiErrorHandler(options: ApiErrorHandlerOptions = {}): ApiErrorHandler {
  return {
    getFetchResponseError: (response, body) => getFetchResponseError(response, body, options),
    getFetchError: (error, body) => getFetchError(error, body, options),
  }
}

const apiErrors = createApiErrorHandler({
  resolveMessage: ({ kind }) => `API error: ${kind}`,
  resolveFactoryMessage: ({ kind }) => `API error: ${kind}`,
  resolveHttpMessage: ({ statusCode }) => {
    return statusCode ? `HTTP error ${statusCode}` : undefined
  },
})

export async function fetchGet<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw apiErrors.getFetchResponseError(response)
    }

    return await response.json()  as T
  } catch (error) {
    throw apiErrors.getFetchError(error)
  }
}

export async function fetchPost<T>(
  url: string,
  payload: unknown,
): Promise<T | undefined> {
  try {
    const response = await fetch(url, {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      throw apiErrors.getFetchResponseError(response)
    }

    return await response.json() as T
  } catch (error) {
    throw apiErrors.getFetchError(error)
  }
}
