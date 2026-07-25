import { OKAPI_ERROR_KIND, OKAPI_ERROR_TYPE, OKAPI_ERROR_SOURCE } from '../constants/okapiError'
import { STATUS_CODE } from '../constants/statusCode'
import {
  EN_OKAPI_ERROR_MESSAGE,
  EN_OKAPI_ERROR_TITLE,
  EN_HTTP_ERROR_TITLE,
} from '../i18n/locales/en'
import type {
  ApiErrorResponse,
  OkapiErrorSource,
  ApiValidationErrors,
  OkapiErrorKind,
  DefaultOkapiErrorKind,
  OkapiErrorKindContext,
  OkapiErrorParams,
  OkapiErrorOptions,
  ApiErrorResponseLike,
  MapOkapiErrorOptions,
  MappedOkapiError,
  OkapiErrorType,
} from '../types/api'

export class OkapiError<TCustomKind extends string = never> extends Error {
  readonly kind: OkapiErrorKind<TCustomKind>
  readonly source: OkapiErrorSource
  readonly statusCode?: number
  readonly statusText?: string
  readonly validationErrors?: ApiValidationErrors
  readonly raw?: unknown

  constructor(params: OkapiErrorParams<TCustomKind>) {
    super(params.message, { cause: params.cause })

    this.name = 'OkapiError'
    this.kind = params.kind
    this.source = params.source ?? OKAPI_ERROR_SOURCE.CUSTOM
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
    return this.kind === OKAPI_ERROR_KIND.NETWORK || this.kind === OKAPI_ERROR_KIND.ABORT
  }

  get isValidationError(): boolean {
    return this.kind === OKAPI_ERROR_KIND.VALIDATION
  }

  static getApiResponseError<TCustomKind extends string = never>(
    raw: ApiErrorResponse,
    statusCode?: number,
    statusText?: string,
    options: OkapiErrorOptions<TCustomKind> = {},
  ): OkapiError<TCustomKind> {
    const kind = resolveOkapiErrorKind(
      { source: OKAPI_ERROR_SOURCE.API, statusCode, statusText, raw },
      options,
      () => getKindFromStatus(statusCode, raw),
    )

    return new OkapiError<TCustomKind>({
      kind,
      source: OKAPI_ERROR_SOURCE.API,
      message: getOkapiErrorMessageForKind(kind, options),
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
    options: OkapiErrorOptions<TCustomKind> = {},
  ): OkapiError<TCustomKind> {
    const kind = resolveOkapiErrorKind(
      { source: OKAPI_ERROR_SOURCE.HTTP, statusCode, statusText, raw },
      options,
      () => getKindFromStatus(statusCode),
    )

    return new OkapiError<TCustomKind>({
      kind,
      source: OKAPI_ERROR_SOURCE.HTTP,
      message: getOkapiErrorMessageForKind(kind, options),
      statusCode,
      statusText,
      raw,
    })
  }

  static getNetworkError<TCustomKind extends string = never>(
    error: unknown,
    options: OkapiErrorOptions<TCustomKind> = {},
  ): OkapiError<TCustomKind> {
    const defaultKind = isAbortError(error) ? OKAPI_ERROR_KIND.ABORT : OKAPI_ERROR_KIND.NETWORK
    const kind = resolveOkapiErrorKind(
      { source: OKAPI_ERROR_SOURCE.NETWORK, cause: error },
      options,
      () => defaultKind,
    )

    return new OkapiError<TCustomKind>({
      kind,
      source: OKAPI_ERROR_SOURCE.NETWORK,
      message: getOkapiErrorMessageForKind(kind, options),
      cause: error,
    })
  }

  static getUnexpectedError<TCustomKind extends string = never>(
    error: unknown,
    options: OkapiErrorOptions<TCustomKind> = {},
  ): OkapiError<TCustomKind> {
    const kind = resolveOkapiErrorKind(
      { source: OKAPI_ERROR_SOURCE.UNEXPECTED, cause: error },
      options,
      () => OKAPI_ERROR_KIND.UNEXPECTED,
    )

    return new OkapiError<TCustomKind>({
      kind,
      source: OKAPI_ERROR_SOURCE.UNEXPECTED,
      message: getOkapiErrorMessageForKind(kind, options),
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
  options: OkapiErrorOptions<TCustomKind> = {},
): OkapiError<TCustomKind> {
  if (isApiErrorResponse(response.body)) {
    return OkapiError.getApiResponseError(
      response.body,
      response.status,
      response.statusText,
      options,
    )
  }

  return OkapiError.getHttpResponseError(
    response.status,
    response.statusText,
    response.body,
    options,
  )
}

export function mapOkapiError<TCustomKind extends string>(
  error: OkapiError<TCustomKind>,
  options?: MapOkapiErrorOptions<TCustomKind>,
): MappedOkapiError<TCustomKind>
export function mapOkapiError<TCustomKind extends string = never>(
  error: unknown,
  options?: MapOkapiErrorOptions<TCustomKind>,
): MappedOkapiError<TCustomKind>
export function mapOkapiError(
  error: unknown,
  options: MapOkapiErrorOptions<string> = {},
): MappedOkapiError<string> {
  const okapiError = normalizeOkapiError(error, options)
  const mappedError: MappedOkapiError<string> = {
    type: getOkapiErrorType(okapiError),
    title: getMappedOkapiErrorTitle(okapiError, options),
    message: getMappedOkapiErrorMessage(okapiError, options),
    details: okapiError,
  }

  if (okapiError.kind === OKAPI_ERROR_KIND.VALIDATION) {
    mappedError.errors = okapiError.validationErrors
  }

  return mappedError
}

export function normalizeOkapiError<TCustomKind extends string>(
  error: OkapiError<TCustomKind>,
  options?: OkapiErrorOptions<TCustomKind>,
): OkapiError<TCustomKind>
export function normalizeOkapiError<TCustomKind extends string = never>(
  error: unknown,
  options?: OkapiErrorOptions<TCustomKind>,
): OkapiError<TCustomKind>
export function normalizeOkapiError(
  error: unknown,
  options: OkapiErrorOptions<string> = {},
): OkapiError<string> {
  if (error instanceof OkapiError) {
    return error
  }

  if (isAbortError(error)) {
    return OkapiError.getNetworkError(error, options)
  }

  return OkapiError.getUnexpectedError(error, options)
}

function getOkapiErrorType<TCustomKind extends string>(
  error: OkapiError<TCustomKind>,
): OkapiErrorType {
  switch (error.kind) {
    case OKAPI_ERROR_KIND.NETWORK:
    case OKAPI_ERROR_KIND.ABORT:
      return OKAPI_ERROR_TYPE.NETWORK

    case OKAPI_ERROR_KIND.VALIDATION:
      return OKAPI_ERROR_TYPE.VALIDATION

    case OKAPI_ERROR_KIND.UNAUTHORIZED:
      return OKAPI_ERROR_TYPE.AUTH

    case OKAPI_ERROR_KIND.SERVER:
      return OKAPI_ERROR_TYPE.SERVER

    case OKAPI_ERROR_KIND.UNEXPECTED:
      return OKAPI_ERROR_TYPE.UNEXPECTED

    default:
      return OKAPI_ERROR_TYPE.BUSINESS
  }
}

function getKindFromStatus(statusCode?: number, raw?: ApiErrorResponse): DefaultOkapiErrorKind {
  if (statusCode === STATUS_CODE.UNAUTHORIZED) {
    return OKAPI_ERROR_KIND.UNAUTHORIZED
  }
  if (statusCode === STATUS_CODE.FORBIDDEN) {
    return OKAPI_ERROR_KIND.FORBIDDEN
  }
  if (statusCode === STATUS_CODE.NOT_FOUND) {
    return OKAPI_ERROR_KIND.NOT_FOUND
  }
  if (statusCode === STATUS_CODE.CONFLICT) {
    return OKAPI_ERROR_KIND.CONFLICT
  }
  if (statusCode === STATUS_CODE.UNPROCESSABLE_CONTENT || raw?.errors) {
    return OKAPI_ERROR_KIND.VALIDATION
  }
  if (statusCode === STATUS_CODE.TOO_MANY_REQUESTS) {
    return OKAPI_ERROR_KIND.RATE_LIMITED
  }
  if (statusCode && statusCode >= STATUS_CODE.INTERNAL_SERVER_ERROR) {
    return OKAPI_ERROR_KIND.SERVER
  }

  return OKAPI_ERROR_KIND.BUSINESS
}

function getMappedOkapiErrorMessage<TCustomKind extends string>(
  error: OkapiError<TCustomKind>,
  options: MapOkapiErrorOptions<TCustomKind>,
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

function getMappedOkapiErrorTitle<TCustomKind extends string>(
  error: OkapiError<TCustomKind>,
  options: MapOkapiErrorOptions<TCustomKind>,
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
    getDefaultHttpTitle(error.statusCode, error.statusText) ?? getOkapiErrorTitleForKind(error.kind)
  )
}

function getOkapiErrorTitleForKind<TCustomKind extends string>(
  kind: OkapiErrorKind<TCustomKind>,
): string {
  return isBuiltInOkapiErrorKind(kind)
    ? EN_OKAPI_ERROR_TITLE[kind]
    : EN_OKAPI_ERROR_TITLE[OKAPI_ERROR_KIND.BUSINESS]
}

function getOkapiErrorMessageForKind<TCustomKind extends string>(
  kind: OkapiErrorKind<TCustomKind>,
  options: OkapiErrorOptions<TCustomKind>,
): string {
  const customMessage = options.i18n?.messages?.[kind]

  if (customMessage !== undefined) {
    return customMessage
  }

  return isBuiltInOkapiErrorKind(kind)
    ? EN_OKAPI_ERROR_MESSAGE[kind]
    : EN_OKAPI_ERROR_MESSAGE[OKAPI_ERROR_KIND.BUSINESS]
}

function resolveOkapiErrorKind<TCustomKind extends string>(
  context: OkapiErrorKindContext,
  options: OkapiErrorOptions<TCustomKind>,
  getFallback: () => DefaultOkapiErrorKind,
): OkapiErrorKind<TCustomKind> {
  return options.resolveKind?.(context) ?? getFallback()
}

function isBuiltInOkapiErrorKind(kind: string): kind is DefaultOkapiErrorKind {
  return Object.values(OKAPI_ERROR_KIND).some((value) => value === kind)
}

function getDefaultHttpTitle(statusCode?: number, statusText?: string): string | undefined {
  const defaultTitle = statusCode !== undefined ? EN_HTTP_ERROR_TITLE[statusCode] : undefined

  if (defaultTitle !== undefined) {
    return defaultTitle
  }

  if (statusCode && statusCode >= STATUS_CODE.INTERNAL_SERVER_ERROR) {
    return (
      EN_HTTP_ERROR_TITLE[STATUS_CODE.INTERNAL_SERVER_ERROR] ??
      EN_OKAPI_ERROR_TITLE[OKAPI_ERROR_KIND.SERVER]
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
