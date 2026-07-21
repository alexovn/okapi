import axios from 'axios'
import { createAxiosErrorMapper } from '@alexovn/okapi'
import { useI18n } from 'vue-i18n'

export function useAxios() {
  const { t } = useI18n()

  const mapAxiosError = createAxiosErrorMapper({
    i18n: {
      resolveTitle: ({ kind }) => t(`error.api.title.${kind}`),
      resolveMessage: ({ kind }) => t(`error.api.messages.${kind}`),
    },
  })

  async function axiosGet<T>(url: string): Promise<T> {
    try {
      const response = await axios.get<T>(url)
      return response.data
    } catch (error) {
      throw mapAxiosError(error)
    }
  }

  return { axiosGet }
}
