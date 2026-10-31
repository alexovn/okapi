import type { OkapiErrorAdapterOptions } from '@alexovn/okapi'
import { createOfetchErrorMapper } from '@alexovn/okapi/ofetch'
import { ofetch } from 'ofetch'

import { requestSignal, type RequestClient } from '../../shared/requests'

export function createOfetchClient(options: OkapiErrorAdapterOptions = {}): RequestClient {
  const mapError = createOfetchErrorMapper(options)

  return async (url, request) => {
    try {
      const response = await ofetch.raw(url, {
        signal: requestSignal(request),
        retry: 0,
        responseType: request.format,
        headers: {
          Accept: request.format === 'json' ? 'application/json' : 'text/plain',
        },
      })
      return {
        status: response.status,
        body: response._data ?? null,
      }
    } catch (error) {
      throw mapError(error)
    }
  }
}
