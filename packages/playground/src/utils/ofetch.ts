import { $fetch, type FetchOptions } from 'ofetch'
import { createOfetchErrorMapper } from '@alexovn/okapi'

const mapOfetchError = createOfetchErrorMapper({
  i18n: {
    api: {
      resolveMessage: ({ kind }) => `API error: ${kind}`,
    },
    http: {
      resolveMessage: ({ statusCode }) => {
        return statusCode ? `HTTP error ${statusCode}` : undefined
      },
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
