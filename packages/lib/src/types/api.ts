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

export type ApiErrorSource =
  | 'api'
  | 'http'
  | 'network'
  | 'unexpected'
  | 'custom'

export interface MappedApiError {
  type: ApiErrorType
  message: string
  details: ApiError
  errors?: ApiValidationErrors
}

export type ApiErrorMessages = Partial<Record<ApiErrorKind, string>>

export type ApiErrorStatusMessages = Partial<Record<number, string>>

export type ApiErrorMessageResolver = (error: ApiError) => string | undefined

export interface ApiErrorI18nOptions {
  messages?: ApiErrorMessages
  statusMessages?: ApiErrorStatusMessages
  resolveMessage?: ApiErrorMessageResolver
}

export interface ApiErrorOptions {
  i18n?: ApiErrorI18nOptions
}

export interface MapApiErrorOptions extends ApiErrorOptions {}

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
  /** Identifies which normalization path produced the error. */
  source?: ApiErrorSource
  statusCode?: number
  statusText?: string
  validationErrors?: ApiValidationErrors
  raw?: unknown
  /** Original API response message. It is never displayed implicitly. */
  rawMessage?: string
  cause?: unknown
}
