# Types

Shared types used across the core API and adapters are documented here. Types that belong to a
specific feature are documented with that feature:

- [i18n types](/i18n#types)
- [error kind types](/error-kinds#types)

## API responses

### `ApiValidationErrors`

The default validation-error shape, keyed by field name.

```ts
type ApiValidationErrors = Record<string, string[]>
```

### `ApiSuccessResponse`

A generic successful API response envelope.

```ts
interface ApiSuccessResponse<T> {
  data: T
}
```

### `ApiErrorResponse`

An API error response containing a message and optional validation errors.

```ts
interface ApiErrorResponse<TValidationErrors = ApiValidationErrors> {
  message: string
  errors?: TValidationErrors
}
```

### `ApiErrorResponseLike`

The response data accepted by `createApiErrorFromResponse`.

```ts
interface ApiErrorResponseLike {
  status: number
  statusText?: string
  body?: unknown
}
```

## Error classification

For the difference between broad error types and specific error kinds, see
[Error Kinds](/error-kinds).

### `OkapiErrorType`

A union of the presentation-level values from `OKAPI_ERROR_TYPE`.

```ts
type OkapiErrorType =
  (typeof OKAPI_ERROR_TYPE)[keyof typeof OKAPI_ERROR_TYPE]
```

### `OkapiErrorSource`

A union of the origin values from `OKAPI_ERROR_SOURCE`. See
[`OkapiError.source`](/api#source) for the meaning of each value.

```ts
type OkapiErrorSource =
  (typeof OKAPI_ERROR_SOURCE)[keyof typeof OKAPI_ERROR_SOURCE]
```

## Error data

### `OkapiErrorParams`

The values accepted by the `OkapiError` constructor.

```ts
interface OkapiErrorParams<
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
```

### `MappedOkapiError`

The presentation-friendly error returned by Okapi error mappers.

```ts
interface MappedOkapiError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> {
  type: OkapiErrorType
  title: string
  message: string
  details: OkapiError<TCustomKind, TValidationErrors>
  errors?: TValidationErrors
}
```

### `OkapiErrorMapper`

A function that maps an unknown thrown value to a presentation-friendly error.

```ts
type OkapiErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> = (error: unknown) => MappedOkapiError<TCustomKind, TValidationErrors>
```

### `ValidationErrorsParser`

A function that validates or transforms an unknown validation payload.

```ts
type ValidationErrorsParser<TValidationErrors> = (
  value: unknown,
) => TValidationErrors | undefined
```

## Configuration

### `OkapiErrorOptions`

Shared options accepted by the core API and adapter mapper factories. Use `resolveKind` to
[customize error classification](/error-kinds#custom-error-kinds), `i18n` to
[customize presentation text](/i18n), and `parseValidationErrors` when your API uses a different
validation-error shape.

```ts
interface OkapiErrorOptions<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> {
  i18n?: OkapiErrorI18nOptions<TCustomKind, TValidationErrors>
  resolveKind?: OkapiErrorKindResolver<TCustomKind>
  parseValidationErrors?: ValidationErrorsParser<TValidationErrors>
}
```

### `MapOkapiErrorOptions`

The options accepted by `mapOkapiError`.

```ts
interface MapOkapiErrorOptions<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> extends OkapiErrorOptions<TCustomKind, TValidationErrors> {}
```

### `OkapiErrorAdapterOptions`

The shared options accepted by the fetch, Axios, and ofetch adapters.

```ts
interface OkapiErrorAdapterOptions<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> extends OkapiErrorOptions<TCustomKind, TValidationErrors> {}
```
