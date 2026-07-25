import { OKAPI_ERROR_KIND, OKAPI_ERROR_SOURCE, OKAPI_ERROR_TYPE } from '../constants/okapiError'
import type { OkapiError } from '../core/okapiError'

export type ApiValidationErrors = Record<string, string[]>

export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  message: string
  errors?: ApiValidationErrors
}

export type DefaultOkapiErrorKind = (typeof OKAPI_ERROR_KIND)[keyof typeof OKAPI_ERROR_KIND]

export type OkapiErrorKind<TCustomKind extends string = never> = DefaultOkapiErrorKind | TCustomKind

export type OkapiErrorType = (typeof OKAPI_ERROR_TYPE)[keyof typeof OKAPI_ERROR_TYPE]

export type OkapiErrorSource = (typeof OKAPI_ERROR_SOURCE)[keyof typeof OKAPI_ERROR_SOURCE]

export interface MappedOkapiError<TCustomKind extends string = never> {
  type: OkapiErrorType
  title: string
  message: string
  details: OkapiError<TCustomKind>
  errors?: ApiValidationErrors
}

export type OkapiErrorTitles<TCustomKind extends string = never> = Partial<
  Record<OkapiErrorKind<TCustomKind>, string>
>

export type OkapiErrorStatusTitles = Partial<Record<number, string>>

export type OkapiErrorMessages<TCustomKind extends string = never> = Partial<
  Record<OkapiErrorKind<TCustomKind>, string>
>

export type OkapiErrorStatusMessages = Partial<Record<number, string>>

export type OkapiErrorMessageResolver<TCustomKind extends string = never> = (
  error: OkapiError<TCustomKind>,
) => string | undefined

export type OkapiErrorTitleResolver<TCustomKind extends string = never> = (
  error: OkapiError<TCustomKind>,
) => string | undefined

export interface OkapiErrorI18nOptions<TCustomKind extends string = never> {
  titles?: OkapiErrorTitles<TCustomKind>
  statusTitles?: OkapiErrorStatusTitles
  messages?: OkapiErrorMessages<TCustomKind>
  statusMessages?: OkapiErrorStatusMessages
  resolveTitle?: OkapiErrorTitleResolver<TCustomKind>
  resolveMessage?: OkapiErrorMessageResolver<TCustomKind>
}

export interface OkapiErrorKindContext {
  source: OkapiErrorSource
  statusCode?: number
  statusText?: string
  raw?: unknown
  cause?: unknown
}

export type OkapiErrorKindResolver<TCustomKind extends string = never> = (
  context: OkapiErrorKindContext,
) => OkapiErrorKind<TCustomKind> | undefined

export interface OkapiErrorOptions<TCustomKind extends string = never> {
  i18n?: OkapiErrorI18nOptions<TCustomKind>
  resolveKind?: OkapiErrorKindResolver<TCustomKind>
}

export interface MapOkapiErrorOptions<
  TCustomKind extends string = never,
> extends OkapiErrorOptions<TCustomKind> {}

export interface OkapiErrorAdapterOptions<
  TCustomKind extends string = never,
> extends OkapiErrorOptions<TCustomKind> {}

export type OkapiErrorMapper<TCustomKind extends string = never> = (
  error: unknown,
) => MappedOkapiError<TCustomKind>

export interface ApiErrorResponseLike {
  status: number
  statusText?: string
  body?: unknown
}

export interface OkapiErrorParams<TCustomKind extends string = never> {
  kind: OkapiErrorKind<TCustomKind>
  message: string
  source?: OkapiErrorSource
  statusCode?: number
  statusText?: string
  validationErrors?: ApiValidationErrors
  raw?: unknown
  cause?: unknown
}
