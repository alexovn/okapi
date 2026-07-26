import { OKAPI_ERROR_KIND, OKAPI_ERROR_SOURCE, OKAPI_ERROR_TYPE } from '../constants/main'
import type { OkapiError } from '../core/okapiError'

export type ApiValidationErrors = Record<string, string[]>

export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse<TValidationErrors = ApiValidationErrors> {
  message: string
  errors?: TValidationErrors
}

export type DefaultOkapiErrorKind = (typeof OKAPI_ERROR_KIND)[keyof typeof OKAPI_ERROR_KIND]

export type OkapiErrorKind<TCustomKind extends string = never> = DefaultOkapiErrorKind | TCustomKind

export type OkapiErrorType = (typeof OKAPI_ERROR_TYPE)[keyof typeof OKAPI_ERROR_TYPE]

export type OkapiErrorSource = (typeof OKAPI_ERROR_SOURCE)[keyof typeof OKAPI_ERROR_SOURCE]

export interface MappedOkapiError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> {
  type: OkapiErrorType
  title: string
  message: string
  details: OkapiError<TCustomKind, TValidationErrors>
  errors?: TValidationErrors
}

export type OkapiErrorTitles<TCustomKind extends string = never> = Partial<
  Record<OkapiErrorKind<TCustomKind>, string>
>

export type OkapiErrorStatusTitles = Partial<Record<number, string>>

export type OkapiErrorMessages<TCustomKind extends string = never> = Partial<
  Record<OkapiErrorKind<TCustomKind>, string>
>

export type OkapiErrorStatusMessages = Partial<Record<number, string>>

export type OkapiErrorMessageResolver<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> = (error: OkapiError<TCustomKind, TValidationErrors>) => string | undefined

export type OkapiErrorTitleResolver<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> = (error: OkapiError<TCustomKind, TValidationErrors>) => string | undefined

export interface OkapiErrorI18nOptions<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> {
  titles?: OkapiErrorTitles<TCustomKind>
  statusTitles?: OkapiErrorStatusTitles
  messages?: OkapiErrorMessages<TCustomKind>
  statusMessages?: OkapiErrorStatusMessages
  resolveTitle?: OkapiErrorTitleResolver<TCustomKind, TValidationErrors>
  resolveMessage?: OkapiErrorMessageResolver<TCustomKind, TValidationErrors>
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

export type ValidationErrorsParser<TValidationErrors> = (
  value: unknown,
) => TValidationErrors | undefined

export interface OkapiErrorOptions<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> {
  i18n?: OkapiErrorI18nOptions<TCustomKind, TValidationErrors>
  resolveKind?: OkapiErrorKindResolver<TCustomKind>
  parseValidationErrors?: ValidationErrorsParser<TValidationErrors>
}

export interface MapOkapiErrorOptions<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> extends OkapiErrorOptions<TCustomKind, TValidationErrors> {}

export interface OkapiErrorAdapterOptions<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> extends OkapiErrorOptions<TCustomKind, TValidationErrors> {}

export type OkapiErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> = (error: unknown) => MappedOkapiError<TCustomKind, TValidationErrors>

export interface ApiErrorResponseLike {
  status: number
  statusText?: string
  body?: unknown
}

export interface OkapiErrorParams<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> {
  kind: OkapiErrorKind<TCustomKind>
  message: string
  source?: OkapiErrorSource
  statusCode?: number
  statusText?: string
  validationErrors?: TValidationErrors
  raw?: unknown
  cause?: unknown
}
