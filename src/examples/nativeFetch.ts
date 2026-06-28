import { apiErrors } from './shared'

export async function nativeGet<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw apiErrors.fromFetchResponse(response)
    }

    return await response.json()  as T
  } catch (error) {
    throw apiErrors.fromNativeError(error)
  }
}

export async function nativePost<T>(
  url: string,
  payload: unknown,
): Promise<T | undefined> {
  try {
    const response = await fetch(url, {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      throw apiErrors.fromFetchResponse(response)
    }

    return await response.json() as T
  } catch (error) {
    throw apiErrors.fromNativeError(error)
  }
}
