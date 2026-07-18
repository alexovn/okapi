import { $fetch, type FetchOptions } from 'ofetch'
import { createOfetchErrorMapper } from '@alexovn/okapi'

const mapOfetchError = createOfetchErrorMapper({
  i18n: {
    resolveMessage: ({ kind, statusCode }) => {
      return statusCode ? `HTTP error ${statusCode}` : `API error: ${kind}`
    },
  },
})

export async function ofetchGet<T>(
  url: string,
  options?: FetchOptions<'json'>,
): Promise<T> {
  try {
    return await $fetch<T>(url, options)
  } catch (error) {
    throw mapOfetchError(error)
  }
}
