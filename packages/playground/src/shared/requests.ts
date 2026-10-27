export interface RequestOptions {
  signal: AbortSignal
  timeoutMs: number
  format: 'json' | 'text'
}

export interface RequestResult {
  status: number
  body: unknown
}

// Clients throw MappedOkapiError; presentation stays independent of the HTTP client.
export type RequestClient = (url: string, options: RequestOptions) => Promise<RequestResult>

export function requestSignal({ signal, timeoutMs }: RequestOptions): AbortSignal {
  return AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
}

export const scenarios = [
  ...[200, 204, 400, 401, 403, 404, 409, 418, 422, 429, 500, 503].map((status) => ({
    id: String(status),
    status,
    delay: 0,
    timeoutMs: 15000,
    format: 'json' as const,
  })),
  {
    id: 'text',
    status: 500,
    delay: 0,
    timeoutMs: 15000,
    format: 'text' as const,
  },
  {
    id: 'slow',
    status: 200,
    delay: 3000,
    timeoutMs: 15000,
    format: 'json' as const,
  },
  {
    id: 'timeout',
    status: 200,
    delay: 3000,
    timeoutMs: 1000,
    format: 'json' as const,
  },
]

export function scenarioUrl(scenario: (typeof scenarios)[number]): string {
  const url = new URL(`https://mock.httpstatus.codes/status/${scenario.status}`)
  if (scenario.delay) {
    url.searchParams.set('delay', String(scenario.delay))
  }
  return url.toString()
}
