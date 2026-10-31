import type { OkapiErrorAdapterOptions } from '@alexovn/okapi'
import { createFetchErrorMapper, createFetchResponseErrorMapper } from '@alexovn/okapi/fetch'

import { requestSignal, type RequestClient } from '../../shared/requests'

export function createFetchClient(options: OkapiErrorAdapterOptions = {}): RequestClient {
  const mapError = createFetchErrorMapper(options)
  const mapResponse = createFetchResponseErrorMapper(options)

  return async (url, request) => {
    let response: Response
    let body: unknown
    try {
      response = await fetch(url, {
        signal: requestSignal(request),
        headers: { Accept: request.format === 'json' ? 'application/json' : 'text/plain' },
      })
      const text = await response.text()
      body = text || null
      if (text && request.format === 'json') {
        try {
          body = JSON.parse(text)
        } catch {
          // Preserve non-JSON error pages so status-based mapping still works.
        }
      }
    } catch (error) {
      throw mapError(error)
    }
    // Native fetch resolves HTTP failures; response mapping is separate from transport mapping.
    if (!response.ok) {
      throw mapResponse(response, body)
    }
    return { status: response.status, body }
  }
}
