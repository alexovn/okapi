import type { OkapiErrorAdapterOptions } from '@alexovn/okapi'
import { createAxiosErrorMapper } from '@alexovn/okapi/axios'
import axios from 'axios'

import type { RequestClient } from '../../shared/requests'

export function createAxiosClient(options: OkapiErrorAdapterOptions = {}): RequestClient {
  const mapError = createAxiosErrorMapper(options)
  const client = axios.create({ transitional: { clarifyTimeoutError: true } })

  return async (url, request) => {
    try {
      const response = await client.get<unknown>(url, {
        signal: request.signal,
        timeout: request.timeoutMs,
        responseType: request.format,
        headers: {
          Accept: request.format === 'json' ? 'application/json' : 'text/plain',
        },
      })
      return {
        status: response.status,
        body: response.status === 204 ? null : response.data,
      }
    } catch (error) {
      throw mapError(error)
    }
  }
}
