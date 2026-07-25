import { API_ERROR_KIND, API_ERROR_SOURCE, API_ERROR_TYPE } from '../constants/api'
import type { ApiError } from '../core/apiError'

export type ApiValidationErrors = Record<string, string[]>

export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  message: string
  errors?: ApiValidationErrors
}

export type DefaultApiErrorKind = (typeof API_ERROR_KIND)[keyof typeof API_ERROR_KIND]

export type ApiErrorKind<TCustomKind extends string = never> = DefaultApiErrorKind | TCustomKind

export type ApiErrorType = (typeof API_ERROR_TYPE)[keyof typeof API_ERROR_TYPE]

export type ApiErrorSource = (typeof API_ERROR_SOURCE)[keyof typeof API_ERROR_SOURCE]

export interface MappedApiError<TCustomKind extends string = never> {
  type: ApiErrorType
  title: string
  message: string
  details: ApiError<TCustomKind>
  errors?: ApiValidationErrors
}

export type ApiErrorTitles<TCustomKind extends string = never> = Partial<
  Record<ApiErrorKind<TCustomKind>, string>
>

export type ApiErrorStatusTitles = Partial<Record<number, string>>

export type ApiErrorMessages<TCustomKind extends string = never> = Partial<
  Record<ApiErrorKind<TCustomKind>, string>
>

export type ApiErrorStatusMessages = Partial<Record<number, string>>

export type ApiErrorMessageResolver<TCustomKind extends string = never> = (
  error: ApiError<TCustomKind>,
) => string | undefined

export type ApiErrorTitleResolver<TCustomKind extends string = never> = (
  error: ApiError<TCustomKind>,
) => string | undefined

export interface ApiErrorI18nOptions<TCustomKind extends string = never> {
  titles?: ApiErrorTitles<TCustomKind>
  statusTitles?: ApiErrorStatusTitles
  messages?: ApiErrorMessages<TCustomKind>
  statusMessages?: ApiErrorStatusMessages
  resolveTitle?: ApiErrorTitleResolver<TCustomKind>
  resolveMessage?: ApiErrorMessageResolver<TCustomKind>
}

export interface ApiErrorKindContext {
  source: ApiErrorSource
  statusCode?: number
  statusText?: string
  raw?: unknown
  cause?: unknown
}

export type ApiErrorKindResolver<TCustomKind extends string = never> = (
  context: ApiErrorKindContext,
) => ApiErrorKind<TCustomKind> | undefined

export interface ApiErrorOptions<TCustomKind extends string = never> {
  i18n?: ApiErrorI18nOptions<TCustomKind>
  resolveKind?: ApiErrorKindResolver<TCustomKind>
}

export interface MapApiErrorOptions<
  TCustomKind extends string = never,
> extends ApiErrorOptions<TCustomKind> {}

export interface ApiErrorAdapterOptions<
  TCustomKind extends string = never,
> extends ApiErrorOptions<TCustomKind> {}

export type ApiErrorMapper<TCustomKind extends string = never> = (
  error: unknown,
) => MappedApiError<TCustomKind>

export interface ApiErrorResponseLike {
  status: number
  statusText?: string
  body?: unknown
}

export interface ApiErrorParams<TCustomKind extends string = never> {
  kind: ApiErrorKind<TCustomKind>
  message: string
  source?: ApiErrorSource
  statusCode?: number
  statusText?: string
  validationErrors?: ApiValidationErrors
  raw?: unknown
  cause?: unknown
}
