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
  ...[
    { status: 200, label: '200 · Success' },
    { status: 204, label: '204 · No content' },
    { status: 400, label: '400 · Bad request' },
    { status: 401, label: '401 · Unauthorized' },
    { status: 403, label: '403 · Forbidden' },
    { status: 404, label: '404 · Not found' },
    { status: 409, label: '409 · Conflict' },
    { status: 418, label: '418 · I’m a teapot' },
    { status: 422, label: '422 · Validation' },
    { status: 429, label: '429 · Rate limited' },
    { status: 500, label: '500 · Server error' },
    { status: 503, label: '503 · Service unavailable' },
  ].map(({ status, label }) => ({
    id: String(status),
    label,
    status,
    delay: 0,
    timeoutMs: 15000,
    format: 'json' as const,
  })),
  {
    id: 'text',
    label: '500 · Plain-text HTTP error',
    status: 500,
    delay: 0,
    timeoutMs: 15000,
    format: 'text' as const,
  },
  {
    id: 'slow',
    label: 'Slow success · 3 seconds (try Cancel)',
    status: 200,
    delay: 3000,
    timeoutMs: 15000,
    format: 'json' as const,
  },
  {
    id: 'timeout',
    label: 'Timeout · 1 second limit, 3 second response',
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
