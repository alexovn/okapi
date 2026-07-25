import { createFetchErrorMapper, createFetchResponseErrorMapper } from '@alexovn/okapi/fetch'
import { useI18n } from 'vue-i18n'

export function useFetch() {
  const { t } = useI18n()

  const options = {
    i18n: {
      resolveTitle: ({ kind }) => t(`error.api.title.${kind}`),
      resolveMessage: ({ kind }) => t(`error.api.messages.${kind}`),
    },
  } satisfies Parameters<typeof createFetchErrorMapper>[0]

  const mapFetchError = createFetchErrorMapper(options)
  const mapFetchResponseError = createFetchResponseErrorMapper(options)

  async function fetchJson<T>(url: string, options: RequestInit): Promise<T> {
    let response: Response

    try {
      response = await fetch(url, options)
    } catch (error) {
      throw mapFetchError(error)
    }

    if (!response.ok) {
      throw mapFetchResponseError(response)
    }

    return (await response.json()) as T
  }

  function fetchGet<T>(url: string, options: RequestInit = {}): Promise<T> {
    return fetchJson<T>(url, options)
  }

  return { fetchGet }
}
