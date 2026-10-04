# Native Fetch

An adapter for native fetching.

## Types

```ts
interface FetchResponseLike {
  status: number
  statusText?: string
}
```

## `getFetchError`

Handles response-like objects, transport failures, and other thrown values. A rejected native Fetch
request with a `TimeoutError`, such as one using `AbortSignal.timeout()`, maps to the `timeout` kind.

- Type:

```ts
function getFetchError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors
>(
  error: unknown,
  body?: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>
): OkapiError<TCustomKind, TValidationErrors>
```

## `createFetchResponseErrorMapper`

Creates a mapper for unsuccessful HTTP responses.

- Type:

```ts
function createFetchResponseErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors
>(options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>):
  FetchResponseErrorMapper<TCustomKind, TValidationErrors>

type FetchResponseErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> = (
  response: FetchResponseLike,
  body?: unknown,
) => MappedOkapiError<TCustomKind, TValidationErrors>
```

## `createFetchErrorMapper`

Creates a mapper for transport and other thrown errors.

- Type:

```ts
function createFetchErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors
>(options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>):
  FetchErrorMapper<TCustomKind, TValidationErrors>

type FetchErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
> = (error: unknown, body?: unknown) =>
  MappedOkapiError<TCustomKind, TValidationErrors>
```

## Example

```ts
import {
  createFetchErrorMapper,
  createFetchResponseErrorMapper,
} from '@alexovn/okapi/fetch'

const mapFetchError = createFetchErrorMapper()
const mapFetchResponseError = createFetchResponseErrorMapper()

async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, options)
  } catch (error) {
    throw mapFetchError(error)
  }

  if (!response.ok) {
    let body: unknown

    try {
      body = await response.json()
    } catch {
      // The response may have an empty or non-JSON body.
    }

    throw mapFetchResponseError(response, body)
  }

  return (await response.json()) as T
}
```

This example throws a mapped object to its caller. If your application expects native `Error`
instances, use `getFetchError` and `createOkapiErrorFromResponse` instead, then map the error at the UI
boundary.
