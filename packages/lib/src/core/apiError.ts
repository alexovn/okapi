import { API_ERROR_KIND, API_ERROR_TYPE } from '../constants/api'
import { STATUS_CODE } from '../constants/statusCode'
import { EN_API_ERROR_MESSAGE, EN_API_ERROR_TITLE, EN_HTTP_ERROR_TITLE } from '../i18n/locales/en'
import type { ApiErrorResponse, ApiValidationErrors } from '../types/api'
import type {
  ApiErrorKind,
  DefaultApiErrorKind,
  ApiErrorKindContext,
  ApiErrorParams,
  ApiErrorOptions,
  ApiErrorResponseLike,
  MapApiErrorOptions,
  MappedApiError,
  ApiErrorType,
  ApiErrorSource,
} from '../types/api'

export class ApiError<TCustomKind extends string = never> extends Error {
  readonly kind: ApiErrorKind<TCustomKind>
  readonly source: ApiErrorSource
  readonly statusCode?: number
  readonly statusText?: string
  readonly validationErrors?: ApiValidationErrors
  readonly raw?: unknown

  constructor(params: ApiErrorParams<TCustomKind>) {
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

  static getApiResponseError<TCustomKind extends string = never>(
    raw: ApiErrorResponse,
    statusCode?: number,
    statusText?: string,
    options: ApiErrorOptions<TCustomKind> = {},
  ): ApiError<TCustomKind> {
    const kind = resolveApiErrorKind({ source: 'api', statusCode, statusText, raw }, options, () =>
      getKindFromStatus(statusCode, raw),
    )

    return new ApiError<TCustomKind>({
      kind,
      source: 'api',
      message: getApiErrorMessageForKind(kind, options),
      statusCode,
      statusText,
      validationErrors: raw.errors,
      raw,
    })
  }

  static getHttpResponseError<TCustomKind extends string = never>(
    statusCode: number,
    statusText?: string,
    raw?: unknown,
    options: ApiErrorOptions<TCustomKind> = {},
  ): ApiError<TCustomKind> {
    const kind = resolveApiErrorKind({ source: 'http', statusCode, statusText, raw }, options, () =>
      getKindFromStatus(statusCode),
    )

    return new ApiError<TCustomKind>({
      kind,
      source: 'http',
      message: getApiErrorMessageForKind(kind, options),
      statusCode,
      statusText,
      raw,
    })
  }

  static getNetworkError<TCustomKind extends string = never>(
    error: unknown,
    options: ApiErrorOptions<TCustomKind> = {},
  ): ApiError<TCustomKind> {
    const defaultKind = isAbortError(error) ? API_ERROR_KIND.ABORT : API_ERROR_KIND.NETWORK
    const kind = resolveApiErrorKind(
      { source: 'network', cause: error },
      options,
      () => defaultKind,
    )

    return new ApiError<TCustomKind>({
      kind,
      source: 'network',
      message: getApiErrorMessageForKind(kind, options),
      cause: error,
    })
  }

  static getUnexpectedError<TCustomKind extends string = never>(
    error: unknown,
    options: ApiErrorOptions<TCustomKind> = {},
  ): ApiError<TCustomKind> {
    const kind = resolveApiErrorKind(
      { source: 'unexpected', cause: error },
      options,
      () => API_ERROR_KIND.UNEXPECTED,
    )

    return new ApiError<TCustomKind>({
      kind,
      source: 'unexpected',
      message: getApiErrorMessageForKind(kind, options),
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

export function createApiErrorFromResponse<TCustomKind extends string = never>(
  response: ApiErrorResponseLike,
  options: ApiErrorOptions<TCustomKind> = {},
): ApiError<TCustomKind> {
  if (isApiErrorResponse(response.body)) {
    return ApiError.getApiResponseError(
      response.body,
      response.status,
      response.statusText,
      options,
    )
  }

  return ApiError.getHttpResponseError(response.status, response.statusText, response.body, options)
}

export function mapApiError<TCustomKind extends string>(
  error: ApiError<TCustomKind>,
  options?: MapApiErrorOptions<TCustomKind>,
): MappedApiError<TCustomKind>
export function mapApiError<TCustomKind extends string = never>(
  error: unknown,
  options?: MapApiErrorOptions<TCustomKind>,
): MappedApiError<TCustomKind>
export function mapApiError(
  error: unknown,
  options: MapApiErrorOptions<string> = {},
): MappedApiError<string> {
  const apiError = normalizeApiError(error, options)
  const mappedError: MappedApiError<string> = {
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

export function normalizeApiError<TCustomKind extends string>(
  error: ApiError<TCustomKind>,
  options?: ApiErrorOptions<TCustomKind>,
): ApiError<TCustomKind>
export function normalizeApiError<TCustomKind extends string = never>(
  error: unknown,
  options?: ApiErrorOptions<TCustomKind>,
): ApiError<TCustomKind>
export function normalizeApiError(
  error: unknown,
  options: ApiErrorOptions<string> = {},
): ApiError<string> {
  if (error instanceof ApiError) {
    return error
  }

  if (isAbortError(error)) {
    return ApiError.getNetworkError(error, options)
  }

  return ApiError.getUnexpectedError(error, options)
}

function getApiErrorType<TCustomKind extends string>(error: ApiError<TCustomKind>): ApiErrorType {
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

    case API_ERROR_KIND.UNEXPECTED:
      return API_ERROR_TYPE.UNEXPECTED

    default:
      return API_ERROR_TYPE.BUSINESS
  }
}

function getKindFromStatus(statusCode?: number, raw?: ApiErrorResponse): DefaultApiErrorKind {
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

function getMappedApiErrorMessage<TCustomKind extends string>(
  error: ApiError<TCustomKind>,
  options: MapApiErrorOptions<TCustomKind>,
): string {
  const resolvedMessage = options.i18n?.resolveMessage?.(error)

  if (resolvedMessage !== undefined) {
    return resolvedMessage
  }

  const statusMessage =
    error.statusCode !== undefined ? options.i18n?.statusMessages?.[error.statusCode] : undefined

  if (statusMessage !== undefined) {
    return statusMessage
  }

  const customMessage = options.i18n?.messages?.[error.kind]

  if (customMessage !== undefined) {
    return customMessage
  }

  return error.message
}

function getMappedApiErrorTitle<TCustomKind extends string>(
  error: ApiError<TCustomKind>,
  options: MapApiErrorOptions<TCustomKind>,
): string {
  const resolvedTitle = options.i18n?.resolveTitle?.(error)

  if (resolvedTitle !== undefined) {
    return resolvedTitle
  }

  const statusTitle =
    error.statusCode !== undefined ? options.i18n?.statusTitles?.[error.statusCode] : undefined

  if (statusTitle !== undefined) {
    return statusTitle
  }

  const customTitle = options.i18n?.titles?.[error.kind]

  if (customTitle !== undefined) {
    return customTitle
  }

  return (
    getDefaultHttpTitle(error.statusCode, error.statusText) ?? getApiErrorTitleForKind(error.kind)
  )
}

function getApiErrorTitleForKind<TCustomKind extends string>(
  kind: ApiErrorKind<TCustomKind>,
): string {
  return isBuiltInApiErrorKind(kind)
    ? EN_API_ERROR_TITLE[kind]
    : EN_API_ERROR_TITLE[API_ERROR_KIND.BUSINESS]
}

function getApiErrorMessageForKind<TCustomKind extends string>(
  kind: ApiErrorKind<TCustomKind>,
  options: ApiErrorOptions<TCustomKind>,
): string {
  const customMessage = options.i18n?.messages?.[kind]

  if (customMessage !== undefined) {
    return customMessage
  }

  return isBuiltInApiErrorKind(kind)
    ? EN_API_ERROR_MESSAGE[kind]
    : EN_API_ERROR_MESSAGE[API_ERROR_KIND.BUSINESS]
}

function resolveApiErrorKind<TCustomKind extends string>(
  context: ApiErrorKindContext,
  options: ApiErrorOptions<TCustomKind>,
  getFallback: () => DefaultApiErrorKind,
): ApiErrorKind<TCustomKind> {
  return options.resolveKind?.(context) ?? getFallback()
}

function isBuiltInApiErrorKind(kind: string): kind is DefaultApiErrorKind {
  return Object.values(API_ERROR_KIND).some((value) => value === kind)
}

function getDefaultHttpTitle(statusCode?: number, statusText?: string): string | undefined {
  const defaultTitle = statusCode !== undefined ? EN_HTTP_ERROR_TITLE[statusCode] : undefined

  if (defaultTitle !== undefined) {
    return defaultTitle
  }

  if (statusCode && statusCode >= STATUS_CODE.INTERNAL_SERVER_ERROR) {
    return (
      EN_HTTP_ERROR_TITLE[STATUS_CODE.INTERNAL_SERVER_ERROR] ??
      EN_API_ERROR_TITLE[API_ERROR_KIND.SERVER]
    )
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
    return Array.isArray(messages) && messages.every((message) => typeof message === 'string')
  })
}
