import {
  createFetchErrorMapper,
  createFetchResponseErrorMapper,
} from '@alexovn/okapi'

const options = {
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
} satisfies Parameters<typeof createFetchErrorMapper>[0]

const mapFetchError = createFetchErrorMapper(options)
const mapFetchResponseError = createFetchResponseErrorMapper(options)

async function fetchJson<T>(
  url: string,
  options: RequestInit,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, options)
  } catch (error) {
    throw mapFetchError(error)
  }

  if (!response.ok) {
    throw mapFetchResponseError(response)
  }

  return await response.json() as T
}

export function fetchGet<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchJson<T>(url, options)
}
