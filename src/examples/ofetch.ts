import { $fetch, FetchError, type FetchOptions } from 'ofetch'
import { apiErrors } from './shared'

export async function ofetchGet<T>(
  url: string,
  options?: FetchOptions<'json'>,
): Promise<T> {
  try {
    return await $fetch<T>(url, options)
  } catch (error) {
    if (error instanceof FetchError) {
      throw apiErrors.fromOfetchError(error)
    }
    throw apiErrors.normalize(error)
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
    if (error instanceof FetchError) {
      throw apiErrors.fromOfetchError(error)
    }
    throw apiErrors.normalize(error)
  }
}
