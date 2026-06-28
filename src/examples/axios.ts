import axios from 'axios'
import { apiErrors } from './shared'

export async function axiosGet<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw apiErrors.fromAxiosError(error)
    }
    throw apiErrors.normalize(error)
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
      throw apiErrors.fromAxiosError(error)
    }
    throw apiErrors.normalize(error)
  }
}
