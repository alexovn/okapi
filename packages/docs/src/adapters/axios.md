# Axios

An adapter for Axios.

## Types

```ts
type ApiAxiosError<T = unknown, D = unknown> = AxiosError<T, D>
```

## `getAxiosError`

Handles Axios response errors, network errors, and other thrown values.

- Type:

```ts
function getAxiosError<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  error: unknown,
  options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>,
): OkapiError<TCustomKind, TValidationErrors>
```

## `createAxiosErrorMapper`

Creates a mapper for Axios response errors, network errors, and other thrown values.

- Type:

```ts
function createAxiosErrorMapper<
  TCustomKind extends string = never,
  TValidationErrors = ApiValidationErrors,
>(
  options?: OkapiErrorAdapterOptions<TCustomKind, TValidationErrors>,
): OkapiErrorMapper<TCustomKind, TValidationErrors>
```

## Example

```ts
import axios from 'axios'
import { createAxiosErrorMapper } from '@alexovn/okapi/axios'

const mapAxiosError = createAxiosErrorMapper()

async function axiosGet<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url)
    return response.data
  } catch (error) {
    throw mapAxiosError(error)
  }
}
```

Axios exposes the parsed error response body to the adapter automatically. This example throws a
mapped object to its caller. If your application expects native `Error` instances, use
`getAxiosError` instead, then map the error at the UI boundary.
