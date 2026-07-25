import { createOfetchErrorMapper } from '@alexovn/okapi/ofetch'
import { $fetch, type FetchOptions } from 'ofetch'
import { useI18n } from 'vue-i18n'

export function useOfetch() {
  const { t } = useI18n()

  const mapOfetchError = createOfetchErrorMapper({
    i18n: {
      resolveTitle: ({ kind }) => t(`error.api.title.${kind}`),
      resolveMessage: ({ kind }) => t(`error.api.messages.${kind}`),
    },
  })

  async function ofetchGet<T>(url: string, options?: FetchOptions<'json'>): Promise<T> {
    try {
      return await $fetch<T>(url, options)
    } catch (error) {
      throw mapOfetchError(error)
    }
  }

  return { ofetchGet }
}
