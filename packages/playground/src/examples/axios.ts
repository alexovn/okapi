import axios from 'axios'
import { getAxiosError } from '@alexovn/okapi'
import type {
  ApiErrorAdapterOptions,
  MapApiErrorOptions,
  ApiError,
} from '@alexovn/okapi'

export interface ApiErrorHandlerOptions extends ApiErrorAdapterOptions, MapApiErrorOptions {}

export interface ApiErrorHandler {
  getAxiosError: (error: unknown) => ApiError
}

export function createApiErrorHandler(
  options: ApiErrorHandlerOptions = {},
): ApiErrorHandler {
  return {
    getAxiosError: (error) => getAxiosError(error, options),
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
    throw apiErrors.getAxiosError(error)
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
    throw apiErrors.getAxiosError(error)
  }
}
