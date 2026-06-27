import { ApiError, createApiErrorFromResponse } from '../core/apiError'

export interface OfetchErrorLike {
  response?: {
    status?: number
    statusText?: string
    _data?: unknown
  }
  status?: number
  statusCode?: number
  statusText?: string
  data?: unknown
}

export function fromOfetchError(error: OfetchErrorLike): ApiError {
  const status = typeof error.response?.status === 'number'
    ? error.response.status
    : getNumber(error.status) ?? getNumber(error.statusCode)

  if (typeof status === 'number') {
    return createApiErrorFromResponse({
      status,
      statusText: error.response?.statusText ?? error.statusText,
      body: error.response?._data ?? error.data,
    })
  }

  return ApiError.fromNetwork(error)
}

function getNumber(value: unknown) {
  return typeof value === 'number' ? value : undefined
}
