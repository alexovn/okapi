import axios from 'axios'
import { createAxiosErrorMapper } from '@alexovn/okapi'

const mapAxiosError = createAxiosErrorMapper({
  i18n: {
    resolveMessage: ({ kind, statusCode }) => {
      return statusCode ? `HTTP error ${statusCode}` : `API error: ${kind}`
    },
  },
})

export async function axiosGet<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url)
    return response.data
  } catch (error) {
    throw mapAxiosError(error)
  }
}
