import type { ApiErrorResponse, ApiValidationErrors } from '../types/api'
import {
  EN_API_ERROR_MESSAGE,
  EN_API_ERROR_TITLE,
  EN_HTTP_ERROR_TITLE,
} from '../i18n/locales/en'
import { STATUS_CODE } from '../constants/statusCode'
import { API_ERROR_KIND, API_ERROR_TYPE } from '../constants/api'
import type {
  ApiErrorKind,
  ApiErrorParams,
  ApiErrorOptions,
  ApiErrorResponseLike,
  MapApiErrorOptions,
  MappedApiError,
  ApiErrorType,
  ApiErrorSource,
} from '../types/api'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly source: ApiErrorSource
  readonly statusCode?: number
  readonly statusText?: string
  readonly validationErrors?: ApiValidationErrors
  readonly raw?: unknown

  constructor(params: ApiErrorParams) {
    super(params.message, { cause: params.cause })

    this.name = 'ApiError'
    this.kind = params.kind
    this.source = params.source ?? 'custom'
    this.statusCode = params.statusCode
    this.statusText = params.statusText
    this.validationErrors = params.validationErrors
    this.raw = params.raw

    Object.setPrototypeOf(this, new.target.prototype)
  }

  get rawMessage(): string | undefined {
    return isApiErrorResponse(this.raw) ? this.raw.message : undefined
  }

  get isNetworkError(): boolean {
    return this.kind === API_ERROR_KIND.NETWORK || this.kind === API_ERROR_KIND.ABORT
  }

  get isValidationError(): boolean {
    return this.kind === API_ERROR_KIND.VALIDATION
  }

  static getApiResponseError(
    raw: ApiErrorResponse,
    statusCode?: number,
    statusText?: string,
  ): ApiError {
    const kind = getKindFromStatus(statusCode, raw)

    return new ApiError({
      kind,
      source: 'api',
      message: EN_API_ERROR_MESSAGE[kind],
      statusCode,
      statusText,
      validationErrors: raw.errors,
      raw,
    })
  }

  static getHttpResponseError(
    statusCode: number,
    statusText?: string,
    raw?: unknown,
    options: ApiErrorOptions = {},
  ): ApiError {
    const kind = getKindFromStatus(statusCode)

    return new ApiError({
      kind,
      source: 'http',
      message: options.i18n?.messages?.[kind] ?? EN_API_ERROR_MESSAGE[kind],
      statusCode,
      statusText,
      raw,
    })
  }

  static getNetworkError(
    error: unknown,
    options: ApiErrorOptions = {},
  ): ApiError {
    const kind = isAbortError(error)
      ? API_ERROR_KIND.ABORT
      : API_ERROR_KIND.NETWORK

    return new ApiError({
      kind,
      source: 'network',
      message: getApiErrorMessageForKind(kind, options),
      cause: error,
    })
  }

  static getUnexpectedError(
    error: unknown,
    options: ApiErrorOptions = {},
  ): ApiError {
    return new ApiError({
      kind: API_ERROR_KIND.UNEXPECTED,
      source: 'unexpected',
      message: getApiErrorMessageForKind(API_ERROR_KIND.UNEXPECTED, options),
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
  options: ApiErrorOptions = {},
): ApiError {
  if (isApiErrorResponse(response.body)) {
    return ApiError.getApiResponseError(
      response.body,
      response.status,
      response.statusText,
    )
  }

  return ApiError.getHttpResponseError(
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
  const apiError = normalizeApiError(error, options)
  const mappedError: MappedApiError = {
    type: getApiErrorType(apiError),
    title: getMappedApiErrorTitle(apiError, options),
    message: getMappedApiErrorMessage(apiError, options),
    details: apiError,
  }

  if (apiError.kind === API_ERROR_KIND.VALIDATION) {
    mappedError.errors = apiError.validationErrors
  }

  return mappedError
}

export function normalizeApiError(
  error: unknown,
  options: ApiErrorOptions = {},
): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (isAbortError(error)) {
    return ApiError.getNetworkError(error, options)
  }

  return ApiError.getUnexpectedError(error, options)
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

function getMappedApiErrorMessage(
  error: ApiError,
  options: MapApiErrorOptions,
): string {
  const resolvedMessage = options.i18n?.resolveMessage?.(error)

  if (resolvedMessage !== undefined) {
    return resolvedMessage
  }

  const statusMessage = error.statusCode !== undefined
    ? options.i18n?.statusMessages?.[error.statusCode]
    : undefined

  if (statusMessage !== undefined) {
    return statusMessage
  }

  const customMessage = options.i18n?.messages?.[error.kind]

  if (customMessage !== undefined) {
    return customMessage
  }

  return error.message
}

function getMappedApiErrorTitle(
  error: ApiError,
  options: MapApiErrorOptions,
): string {
  const resolvedTitle = options.i18n?.resolveTitle?.(error)

  if (resolvedTitle !== undefined) {
    return resolvedTitle
  }

  const statusTitle = error.statusCode !== undefined
    ? options.i18n?.statusTitles?.[error.statusCode]
    : undefined

  if (statusTitle !== undefined) {
    return statusTitle
  }

  const customTitle = options.i18n?.titles?.[error.kind]

  if (customTitle !== undefined) {
    return customTitle
  }

  return getDefaultHttpTitle(error.statusCode, error.statusText)
    ?? EN_API_ERROR_TITLE[error.kind]
}

function getApiErrorMessageForKind(
  kind: ApiErrorKind,
  options: ApiErrorOptions,
): string {
  const customMessage = options.i18n?.messages?.[kind]

  return customMessage ?? EN_API_ERROR_MESSAGE[kind]
}

function getDefaultHttpTitle(
  statusCode?: number,
  statusText?: string,
): string | undefined {
  const defaultTitle = statusCode !== undefined
    ? EN_HTTP_ERROR_TITLE[statusCode]
    : undefined

  if (defaultTitle !== undefined) {
    return defaultTitle
  }

  if (statusCode && statusCode >= STATUS_CODE.INTERNAL_SERVER_ERROR) {
    return EN_HTTP_ERROR_TITLE[STATUS_CODE.INTERNAL_SERVER_ERROR]
      ?? EN_API_ERROR_TITLE[API_ERROR_KIND.SERVER]
  }

  if (statusText) {
    return statusText
  }

  return undefined
}

function isAbortError(error: unknown): boolean {
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
