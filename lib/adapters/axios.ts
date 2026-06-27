import { ApiError, createApiErrorFromResponse } from '../core/apiError'

export interface AxiosErrorLike {
  response?: {
    status?: number
    statusText?: string
    data?: unknown
  }
  request?: unknown
  code?: string
  message?: string
}

export function fromAxiosError(error: AxiosErrorLike): ApiError {
  if (typeof error.response?.status === 'number') {
    return createApiErrorFromResponse({
      status: error.response.status,
      statusText: error.response.statusText,
      body: error.response.data,
    })
  }

  return ApiError.fromNetwork(error)
}
