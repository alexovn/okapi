import type { ApiErrorResponse, ApiValidationErrors } from '../types/api'
import { StatusCodeEnum } from '../types/statusCode'

export const API_ERROR_KIND = {
  NETWORK: 'network',
  ABORT: 'abort',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  VALIDATION: 'validation',
  BUSINESS: 'business',
  SERVER: 'server',
  APPLICATION: 'application',
  UNEXPECTED: 'unexpected',
} as const

export const API_ERROR_TYPE = {
  AUTH: 'auth',
  BUSINESS: 'business',
  NETWORK: 'network',
  SERVER: 'server',
  UNEXPECTED: 'unexpected',
  VALIDATION: 'validation',
} as const

interface ApiErrorParams {
  kind: typeof API_ERROR_KIND[keyof typeof API_ERROR_KIND]
  message: string
  statusCode?: number
  validationErrors?: ApiValidationErrors
  raw?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  readonly kind: typeof API_ERROR_KIND[keyof typeof API_ERROR_KIND]
  readonly statusCode?: number
  readonly validationErrors?: ApiValidationErrors
  readonly raw?: unknown
  override readonly cause?: unknown

  constructor(params: ApiErrorParams) {
    super(params.message)

    this.name = 'ApiError'
    this.kind = params.kind
    this.statusCode = params.statusCode
    this.validationErrors = params.validationErrors
    this.raw = params.raw
    this.cause = params.cause

    Object.setPrototypeOf(this, new.target.prototype)
  }

  get isNetworkError() {
    return this.kind === API_ERROR_KIND.NETWORK || this.kind === API_ERROR_KIND.ABORT
  }

  get isValidationError() {
    return this.kind === API_ERROR_KIND.VALIDATION
  }

  static fromApiResponse(raw: ApiErrorResponse, statusCode?: number) {
    return new ApiError({
      kind: getKindFromStatus(statusCode, raw),
      message: raw.message || 'API error',
      statusCode,
      validationErrors: raw.errors,
      raw,
    })
  }

  static fromHttpResponse(statusCode: number, statusText: string, raw?: unknown) {
    return new ApiError({
      kind: getKindFromStatus(statusCode),
      message: getHttpMessage(statusCode, statusText),
      statusCode,
      raw,
    })
  }

  static fromNetwork(error: unknown) {
    return new ApiError({
      kind: isAbortError(error)
        ? API_ERROR_KIND.ABORT
        : API_ERROR_KIND.NETWORK,
      message: isAbortError(error)
        ? 'AbortController error. Request cancelled.'
        : 'Network error.',
      cause: error,
    })
  }

  static fromUnexpected(error: unknown) {
    return new ApiError({
      kind: API_ERROR_KIND.UNEXPECTED,
      message: 'Unexpected application error.',
      cause: error,
    })
  }
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isObject(value)) {
    return false
  }

  if (typeof value.message !== 'string') {
    return false
  }

  if ('errors' in value && value.errors !== undefined) {
    return isValidationErrors(value.errors)
  }

  return true
}

export function mapApiError(error: unknown) {
  const apiError = normalizeApiError(error)

  switch (apiError.kind) {
    case API_ERROR_KIND.NETWORK:
      return {
        type: API_ERROR_TYPE.NETWORK,
        message: 'Network unavailable. Please try again later.',
        details: apiError,
      }

    case API_ERROR_KIND.ABORT:
      return {
        type: API_ERROR_TYPE.NETWORK,
        message: 'Request has been cancelled.',
        details: apiError,
      }

    case API_ERROR_KIND.VALIDATION:
      return {
        type: API_ERROR_TYPE.VALIDATION,
        message: apiError.message || 'Data validation error.',
        errors: apiError.validationErrors,
        details: apiError,
      }

    case API_ERROR_KIND.UNAUTHORIZED:
      return {
        type: API_ERROR_TYPE.AUTH,
        message: apiError.message || 'Unauthorized. Please sign in again.',
        details: apiError,
      }

    case API_ERROR_KIND.FORBIDDEN:
      return {
        type: API_ERROR_TYPE.BUSINESS,
        message: apiError.message || 'You do not have permission to perform this action.',
        details: apiError,
      }

    case API_ERROR_KIND.NOT_FOUND:
      return {
        type: API_ERROR_TYPE.BUSINESS,
        message: apiError.message || 'Requested resource was not found.',
        details: apiError,
      }

    case API_ERROR_KIND.SERVER:
      return {
        type: API_ERROR_TYPE.SERVER,
        message: apiError.message || 'Server error. Please try again later.',
        details: apiError,
      }

    case API_ERROR_KIND.BUSINESS:
      return {
        type: API_ERROR_TYPE.BUSINESS,
        message: apiError.message || 'Business logic error.',
        details: apiError,
      }

    default:
      return {
        type: API_ERROR_TYPE.UNEXPECTED,
        message: apiError.message || 'Unexpected error occurred.',
        details: apiError,
      }
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  return ApiError.fromUnexpected(error)
}

function getKindFromStatus(
  statusCode?: number,
  raw?: ApiErrorResponse,
): typeof API_ERROR_KIND[keyof typeof API_ERROR_KIND] {
  if (statusCode === StatusCodeEnum.UNAUTHORIZED) {
    return API_ERROR_KIND.UNAUTHORIZED
  }
  if (statusCode === StatusCodeEnum.FORBIDDEN) {
    return API_ERROR_KIND.FORBIDDEN
  }
  if (statusCode === StatusCodeEnum.NOT_FOUND) {
    return API_ERROR_KIND.NOT_FOUND
  }
  if (statusCode === StatusCodeEnum.UNPROCESSABLE_CONTENT || raw?.errors) {
    return API_ERROR_KIND.VALIDATION
  }
  if (statusCode && statusCode >= StatusCodeEnum.INTERNAL_SERVER_ERROR) {
    return API_ERROR_KIND.SERVER
  }

  return API_ERROR_KIND.BUSINESS
}

function getHttpMessage(statusCode?: number, statusText?: string) {
  if (statusCode === StatusCodeEnum.UNAUTHORIZED) {
    return 'Unauthorized.'
  }
  if (statusCode === StatusCodeEnum.FORBIDDEN) {
    return 'Forbidden.'
  }
  if (statusCode === StatusCodeEnum.NOT_FOUND) {
    return 'Not found.'
  }
  if (statusCode === StatusCodeEnum.UNPROCESSABLE_CONTENT) {
    return 'Validation error.'
  }
  if (statusCode && statusCode >= StatusCodeEnum.INTERNAL_SERVER_ERROR) {
    return 'Server error.'
  }

  return statusText || `HTTP error ${statusCode ?? 'unknown'}.`
}

function isAbortError(error: unknown) {
  return isObject(error) && error.name === 'AbortError'
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isValidationErrors(value: unknown): value is ApiValidationErrors {
  if (!isObject(value)) {
    return false
  }

  return Object.values(value).every((messages) => {
    return (
      Array.isArray(messages)
      && messages.every(message => typeof message === 'string')
    )
  })
}

export function createApiErrorFromResponse(response: {
  status: number
  statusText: string
  _data?: unknown
}) {
  if (isApiErrorResponse(response._data)) {
    return ApiError.fromApiResponse(response._data, response.status)
  }

  return ApiError.fromHttpResponse(
    response.status,
    response.statusText,
    response._data,
  )
}
