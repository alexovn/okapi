import type { ApiErrorResponse, ApiValidationErrors } from '../types/api'
import { STATUS_CODE } from '../types/statusCode'

export const API_ERROR_KIND = {
  NETWORK: 'network',
  ABORT: 'abort',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  VALIDATION: 'validation',
  BUSINESS: 'business',
  SERVER: 'server',
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

export type ApiErrorKind = typeof API_ERROR_KIND[keyof typeof API_ERROR_KIND]

export type ApiErrorType = typeof API_ERROR_TYPE[keyof typeof API_ERROR_TYPE]

export interface MappedApiError {
  type: ApiErrorType
  message: string
  details: ApiError
  errors?: ApiValidationErrors
}

export interface ApiErrorResponseLike {
  status: number
  statusText?: string
  body?: unknown
}

export interface FetchResponseLike {
  status: number
  statusText?: string
}

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

export type ApiErrorAdapter = 'axios' | 'ofetch'

export interface CreateApiErrorOptions {
  adapter?: ApiErrorAdapter
  body?: unknown
}

interface ApiErrorParams {
  kind: ApiErrorKind
  message: string
  statusCode?: number
  validationErrors?: ApiValidationErrors
  raw?: unknown
  cause?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly statusCode?: number
  readonly validationErrors?: ApiValidationErrors
  readonly raw?: unknown
  override readonly cause?: unknown

  constructor(params: ApiErrorParams) {
    super(params.message, { cause: params.cause })

    this.name = 'ApiError'
    this.kind = params.kind
    this.statusCode = params.statusCode
    this.validationErrors = params.validationErrors
    this.raw = params.raw

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

  static fromHttpResponse(statusCode: number, statusText?: string, raw?: unknown) {
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

export function createApiError(
  error: unknown,
  options: CreateApiErrorOptions = {},
): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (isAbortError(error)) {
    return ApiError.fromNetwork(error)
  }

  switch (options.adapter) {
    case 'axios':
      return fromAxiosError(error as AxiosErrorLike)

    case 'ofetch':
      return fromOfetchError(error as OfetchErrorLike)

    default:
      return fromNativeError(error, options.body)
  }
}

export function createApiErrorFromResponse(response: ApiErrorResponseLike): ApiError {
  if (isApiErrorResponse(response.body)) {
    return ApiError.fromApiResponse(response.body, response.status)
  }

  return ApiError.fromHttpResponse(
    response.status,
    response.statusText,
    response.body,
  )
}

export function fromNativeError(error: unknown, body?: unknown): ApiError {
  if (isObject(error) && typeof error.status === 'number') {
    return fromFetchResponse(
      {
        status: error.status,
        statusText: typeof error.statusText === 'string'
          ? error.statusText
          : undefined,
      },
      body ?? error.body,
    )
  }

  if (isNativeFetchNetworkError(error)) {
    return ApiError.fromNetwork(error)
  }

  return ApiError.fromUnexpected(error)
}

export function fromFetchResponse(
  response: FetchResponseLike,
  body?: unknown,
): ApiError {
  return createApiErrorFromResponse({
    status: response.status,
    statusText: response.statusText,
    body,
  })
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

export function mapApiError(
  error: unknown,
  options?: CreateApiErrorOptions,
): MappedApiError {
  const apiError = normalizeApiError(error, options)

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

export function normalizeApiError(
  error: unknown,
  options?: CreateApiErrorOptions,
): ApiError {
  return createApiError(error, options)
}

function getKindFromStatus(
  statusCode?: number,
  raw?: ApiErrorResponse,
): ApiErrorKind {
  if (statusCode === STATUS_CODE.UNAUTHORIZED) {
    return API_ERROR_KIND.UNAUTHORIZED
  }
  if (statusCode === STATUS_CODE.FORBIDDEN) {
    return API_ERROR_KIND.FORBIDDEN
  }
  if (statusCode === STATUS_CODE.NOT_FOUND) {
    return API_ERROR_KIND.NOT_FOUND
  }
  if (statusCode === STATUS_CODE.UNPROCESSABLE_CONTENT || raw?.errors) {
    return API_ERROR_KIND.VALIDATION
  }
  if (statusCode && statusCode >= STATUS_CODE.INTERNAL_SERVER_ERROR) {
    return API_ERROR_KIND.SERVER
  }

  return API_ERROR_KIND.BUSINESS
}

function getHttpMessage(statusCode?: number, statusText?: string) {
  if (statusCode === STATUS_CODE.UNAUTHORIZED) {
    return 'Unauthorized.'
  }
  if (statusCode === STATUS_CODE.FORBIDDEN) {
    return 'Forbidden.'
  }
  if (statusCode === STATUS_CODE.NOT_FOUND) {
    return 'Not found.'
  }
  if (statusCode === STATUS_CODE.UNPROCESSABLE_CONTENT) {
    return 'Validation error.'
  }
  if (statusCode && statusCode >= STATUS_CODE.INTERNAL_SERVER_ERROR) {
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

function isNativeFetchNetworkError(error: unknown) {
  return error instanceof TypeError
}

function getNumber(value: unknown) {
  return typeof value === 'number' ? value : undefined
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
