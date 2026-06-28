import type { ApiErrorResponse, ApiValidationErrors } from '../types/api'
import { EN_API_ERROR_MESSAGES, EN_HTTP_ERROR_MESSAGES } from '../i18n/locales/en'
import { STATUS_CODE } from '../types/statusCode'

export const API_ERROR_KIND = {
  NETWORK: 'network',
  ABORT: 'abort',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  VALIDATION: 'validation',
  CONFLICT: 'conflict',
  RATE_LIMITED: 'rate-limited',
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

export type ApiErrorMessages = Partial<Record<ApiErrorKind, string>>

export type ApiErrorMessageResolver = (error: ApiError) => string | undefined

export interface MapApiErrorOptions {
  messages?: ApiErrorMessages
  resolveMessage?: ApiErrorMessageResolver
}

export type HttpErrorMessages = Partial<Record<number, string>>

export interface HttpErrorMessageContext {
  statusCode?: number
  statusText?: string
  raw?: unknown
}

export type HttpErrorMessageResolver = (
  context: HttpErrorMessageContext,
) => string | undefined

export interface HttpErrorMessageOptions {
  httpMessages?: HttpErrorMessages
  resolveHttpMessage?: HttpErrorMessageResolver
}

export interface ApiErrorResponseLike {
  status: number
  statusText?: string
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

  static fromHttpResponse(
    statusCode: number,
    statusText?: string,
    raw?: unknown,
    options: HttpErrorMessageOptions = {},
  ) {
    return new ApiError({
      kind: getKindFromStatus(statusCode),
      message: getHttpMessage(statusCode, statusText, raw, options),
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

export function createApiErrorFromResponse(
  response: ApiErrorResponseLike,
  options: HttpErrorMessageOptions = {},
): ApiError {
  if (isApiErrorResponse(response.body)) {
    return ApiError.fromApiResponse(response.body, response.status)
  }

  return ApiError.fromHttpResponse(
    response.status,
    response.statusText,
    response.body,
    options,
  )
}

export function mapApiError(
  error: unknown,
  options: MapApiErrorOptions = {},
): MappedApiError {
  const apiError = normalizeApiError(error)
  const mappedError: MappedApiError = {
    type: getApiErrorType(apiError),
    message: getMappedApiErrorMessage(apiError, options),
    details: apiError,
  }

  if (apiError.kind === API_ERROR_KIND.VALIDATION) {
    mappedError.errors = apiError.validationErrors
  }

  return mappedError
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (isAbortError(error)) {
    return ApiError.fromNetwork(error)
  }

  return ApiError.fromUnexpected(error)
}

function getApiErrorType(error: ApiError): ApiErrorType {
  switch (error.kind) {
    case API_ERROR_KIND.NETWORK:
    case API_ERROR_KIND.ABORT:
      return API_ERROR_TYPE.NETWORK

    case API_ERROR_KIND.VALIDATION:
      return API_ERROR_TYPE.VALIDATION

    case API_ERROR_KIND.UNAUTHORIZED:
      return API_ERROR_TYPE.AUTH

    case API_ERROR_KIND.SERVER:
      return API_ERROR_TYPE.SERVER

    case API_ERROR_KIND.FORBIDDEN:
    case API_ERROR_KIND.NOT_FOUND:
    case API_ERROR_KIND.CONFLICT:
    case API_ERROR_KIND.RATE_LIMITED:
    case API_ERROR_KIND.BUSINESS:
      return API_ERROR_TYPE.BUSINESS

    default:
      return API_ERROR_TYPE.UNEXPECTED
  }
}

function getMappedApiErrorMessage(
  error: ApiError,
  options: MapApiErrorOptions,
) {
  const resolvedMessage = options.resolveMessage?.(error)

  if (resolvedMessage) {
    return resolvedMessage
  }

  const customMessage = options.messages?.[error.kind]

  if (customMessage) {
    return customMessage
  }

  const defaultMessage = EN_API_ERROR_MESSAGES[error.kind]

  if (defaultMessage) {
    return defaultMessage
  }

  return error.message
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
  if (statusCode === STATUS_CODE.CONFLICT) {
    return API_ERROR_KIND.CONFLICT
  }
  if (statusCode === STATUS_CODE.UNPROCESSABLE_CONTENT || raw?.errors) {
    return API_ERROR_KIND.VALIDATION
  }
  if (statusCode === STATUS_CODE.TOO_MANY_REQUESTS) {
    return API_ERROR_KIND.RATE_LIMITED
  }
  if (statusCode && statusCode >= STATUS_CODE.INTERNAL_SERVER_ERROR) {
    return API_ERROR_KIND.SERVER
  }

  return API_ERROR_KIND.BUSINESS
}

function getHttpMessage(
  statusCode?: number,
  statusText?: string,
  raw?: unknown,
  options: HttpErrorMessageOptions = {},
): string {
  const resolvedMessage = options.resolveHttpMessage?.({
    statusCode,
    statusText,
    raw,
  })

  if (resolvedMessage) {
    return resolvedMessage
  }

  const customMessage = statusCode !== undefined
    ? options.httpMessages?.[statusCode]
    : undefined

  if (customMessage) {
    return customMessage
  }

  const defaultMessage = statusCode !== undefined
    ? EN_HTTP_ERROR_MESSAGES[statusCode]
    : undefined

  if (defaultMessage) {
    return defaultMessage
  }

  if (statusCode && statusCode >= STATUS_CODE.INTERNAL_SERVER_ERROR) {
    return EN_HTTP_ERROR_MESSAGES[STATUS_CODE.INTERNAL_SERVER_ERROR] ?? 'Server error.'
  }

  if (statusText) {
    return statusText
  }

  return `HTTP error ${statusCode ?? 'unknown'}.`
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
