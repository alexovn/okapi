import axios from 'axios'
import { createAxiosErrorMapper } from '@alexovn/okapi'

const mapAxiosError = createAxiosErrorMapper({
  i18n: {
    api: {
      resolveMessage: ({ kind }) => `API error: ${kind}`,
      resolveFactoryMessage: ({ kind }) => `API error: ${kind}`,
    },
    http: {
      resolveMessage: ({ statusCode }) => {
        return statusCode ? `HTTP error ${statusCode}` : undefined
      },
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