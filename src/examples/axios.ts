import axios from 'axios'
import type { AxiosError } from 'axios'
import { getAxiosError, normalizeApiError } from '../../lib/'
import type {
  ApiErrorAdapterOptions,
  MapApiErrorOptions,
  ApiError,
} from '../../lib'

export interface ApiErrorHandlerOptions extends ApiErrorAdapterOptions, MapApiErrorOptions {}

export interface ApiErrorHandler {
  getAxiosError: <T = unknown, D = unknown>(error: AxiosError<T, D>) => ApiError
  normalizeApiError: (error: unknown) => ApiError
}

export function createApiErrorHandler(
  options: ApiErrorHandlerOptions = {},
): ApiErrorHandler {
  return {
    getAxiosError: (error) => getAxiosError(error, options),
    normalizeApiError: (error) => normalizeApiError(error, options),
  }
}

const apiErrors = createApiErrorHandler({
  resolveMessage: ({ kind }) => `API error: ${kind}`,
  resolveFactoryMessage: ({ kind }) => `API error: ${kind}`,
  resolveHttpMessage: ({ statusCode }) => {
    return statusCode ? `HTTP error ${statusCode}` : undefined
  },
})

export async function axiosGet<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw apiErrors.getAxiosError(error)
    }
    throw apiErrors.normalizeApiError(error)
  }
}

export async function axiosPost<T>(
  url: string,
  payload: unknown,
): Promise<T | undefined> {
  try {
    const response = await axios.post<T>(url, payload)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw apiErrors.getAxiosError(error)
    }
    throw apiErrors.normalizeApiError(error)
  }
}
