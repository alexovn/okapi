# API

## `OkapiError`

A core class that extends the native `Error` class with useful information and built-in functions.

- Type:

```ts
  readonly kind: OkapiErrorKind<TCustomKind>
  readonly source: OkapiErrorSource
  readonly statusCode?: number
  readonly statusText?: string
  readonly validationErrors?: TValidationErrors
  readonly raw?: unknown
```

- `kind`: the specific error category
- `source`: where the error originated
- `statusCode`: HTTP status code
- `statusText`: HTTP status text
- `validationErrors`: parsed validation details
- `raw`: the original API or HTTP response body
- `rawMessage`: the original message from a recognized API response
- `cause`: the original thrown value
- `isNetworkError`: a getter that checks if an error is a network error
- `isValidationError`: a getter that checks if an error is a validation error

### `constructor`

Creates an `OkapiError` directly from an error kind, message, and optional error details.

- Type:

```ts
new OkapiError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  params: OkapiErrorParams<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors>
```

### `rawMessage`

A getter for getting raw error message.

- Type:

```ts
(getter) OkapiError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors
>.rawMessage: string | undefined
```

### `isNetworkError`

A getter that checks if an error is a network error.

- Type:

```ts
(getter) OkapiError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors
>.isNetworkError: boolean
```

### `isValidationError`

A getter that checks if an error is a validation error.

- Type:

```ts
(getter) OkapiError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors
>.isValidationError: boolean
```

### `getApiResponseError`

Creates an API-sourced error from a recognized API error response. Validation errors are read from
`raw.errors`.

- Type:

```ts
OkapiError.getApiResponseError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  raw: ApiErrorResponse<TValidationErrors>,
  statusCode?: number,
  statusText?: string,
  options?: OkapiErrorOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors>
```

### `getHttpResponseError`

Creates an HTTP-sourced error from a status code when the response body is not a recognized API
error response.

- Type:

```ts
OkapiError.getHttpResponseError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  statusCode: number,
  statusText?: string,
  raw?: unknown,
  options?: OkapiErrorOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors>
```

### `getNetworkError`

Creates a network-sourced error from a thrown value. Errors named `AbortError` use the `abort` kind;
other values use the `network` kind by default.

- Type:

```ts
OkapiError.getNetworkError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  error: unknown,
  options?: OkapiErrorOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors>
```

### `getUnexpectedError`

Creates an unexpected-sourced error from an unrecognized thrown value.

- Type:

```ts
OkapiError.getUnexpectedError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  error: unknown,
  options?: OkapiErrorOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors>
```

## `createApiErrorFromResponse`

Creates an `OkapiError` from an HTTP response. A response body with a string `message` and either no
validation payload or recognized validation errors becomes an API-sourced error; otherwise, it
becomes an HTTP-sourced error.

- Type:

```ts
function createApiErrorFromResponse<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  response: ApiErrorResponseLike,
  options?: OkapiErrorOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors>
```

## `mapOkapiError`

Normalizes an unknown error and maps it to a presentation-friendly object containing a type, title,
message, and the normalized `OkapiError`. Validation errors are also exposed as `errors`.

- Type:

```ts
function mapOkapiError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  error: unknown,
  options?: MapOkapiErrorOptions<TCustomKind, TValidationErrors>,
): MappedOkapiError<TCustomKind, TValidationErrors>
```

## `normalizeOkapiError`

Converts an unknown thrown value to an `OkapiError`. Existing `OkapiError` instances are returned
unchanged, abort errors become network-sourced errors, and all other values become unexpected errors.

- Type:

```ts
function normalizeOkapiError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  error: unknown,
  options?: OkapiErrorOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors>
```
