import type { ApiError } from "../core/apiError"
import { API_ERROR_KIND, API_ERROR_TYPE } from "../constants/api"

export type ApiValidationErrors = Record<string, string[]>

export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  message: string
  errors?: ApiValidationErrors
}

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

export interface ApiErrorI18nOptions {
  api?: ApiErrorI18nApiOptions
  http?: ApiErrorI18nHttpOptions
}

export interface ApiErrorI18nApiOptions {
  messages?: ApiErrorMessages
  resolveMessage?: ApiErrorMessageResolver
  resolveFactoryMessage?: ApiErrorFactoryMessageResolver
}

export interface ApiErrorI18nHttpOptions {
  messages?: HttpErrorMessages
  resolveMessage?: HttpErrorMessageResolver
}

export interface ApiErrorOptions {
  i18n?: ApiErrorI18nOptions
}

export interface MapApiErrorOptions extends ApiErrorOptions {}

export interface ApiErrorFactoryMessageContext {
  kind: ApiErrorKind
  cause?: unknown
}

export type ApiErrorFactoryMessageResolver = (
  context: ApiErrorFactoryMessageContext,
) => string | undefined

export interface ApiErrorFactoryMessageOptions extends ApiErrorOptions {}

export type HttpErrorMessages = Partial<Record<number, string>>

export interface HttpErrorMessageContext {
  statusCode?: number
  statusText?: string
  raw?: unknown
}

export type HttpErrorMessageResolver = (
  context: HttpErrorMessageContext,
) => string | undefined

export interface HttpErrorMessageOptions extends ApiErrorOptions {}

export interface ApiErrorAdapterOptions extends ApiErrorOptions {}

export type ApiErrorMapper = (error: unknown) => MappedApiError

export interface ApiErrorResponseLike {
  status: number
  statusText?: string
  body?: unknown
}

export interface ApiErrorParams {
  kind: ApiErrorKind
  message: string
  statusCode?: number
  validationErrors?: ApiValidationErrors
  raw?: unknown
  cause?: unknown
}
