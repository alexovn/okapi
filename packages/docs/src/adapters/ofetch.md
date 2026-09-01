# ofetch

An adapter for ofetch.

## Types

```ts
type ApiOfetchError<T = unknown> = FetchError<T>
```

## `getOfetchError`

Handles ofetch response errors, network errors, and other thrown values.

- Type:

```ts
function getOfetchError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  error: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors>
```

## `createOfetchErrorMapper`

Creates a mapper for ofetch response errors, network errors, and other thrown values.

- Type:

```ts
function createOfetchErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>,
): OkapiErrorMapper<TCustomKind, TValidationErrors>
```

## Example

```ts
import { ofetch } from 'ofetch'
import { createOfetchErrorMapper } from '@alexovn/okapi/ofetch'

const mapOfetchError = createOfetchErrorMapper()

async function ofetchGet<T>(url: string): Promise<T> {
  try {
    return await ofetch<T>(url)
  } catch (error) {
    throw mapOfetchError(error)
  }
}
```

ofetch exposes the parsed error response body to the adapter automatically. This example throws a
mapped object to its caller. If your application expects native `Error` instances, use
`getOfetchError` instead, then map the error at the UI boundary.
