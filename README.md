![Okapi banner](./.github/assets/okapi-banner.jpg)

# Okapi

A library for handling API and HTTP errors with ease.

## Features

- Framework agnostic
- Fully typed
- i18n support
- Built-in adapters for popular fetching libraries (axios, ofetch etc.)
- Customizable. Set up your own error kinds and validation-error formats

## Installation

```shell
npm install @alexovn/okapi
```

> ⚠️ Fetching data libraries like `Axios` or `ofetch` should be installed separately.

## Quick Start

Use an adapter mapper to turn a library-specific error into a consistent object for your UI:

```ts
import axios from 'axios'
import { createAxiosErrorMapper } from '@alexovn/okapi/axios'
import { notify } from './notificationService' // your notification service

const mapAxiosError = createAxiosErrorMapper({
  i18n: {
    titles: {
      'not-found': 'Not found',
      network: 'Connection problem',
    },
    statusTitles: {
      503: 'Temporarily unavailable',
    },
    messages: {
      'not-found': 'The requested resource was not found.',
      network: 'Check your internet connection and try again.',
    },
    statusMessages: {
      503: 'The service is temporarily unavailable. Please try again later.',
    },
  },
})

async function saveProfile() {
  try {
    const response = await axios.post('/api/profile', {
      email: 'invalid',
    })
    return response.data
  } catch (error) {
    const mappedError = mapAxiosError(error)

    notify({
      title: mappedError.title,
      message: mappedError.message
    })
  }
}
```

## Core API

### `createApiErrorFromResponse`

Creates an `OkapiError` from an HTTP status and a parsed response body:

```ts
import { createApiErrorFromResponse } from '@alexovn/okapi'

const error = createApiErrorFromResponse({
  status: 422,
  body: {
    message: 'Invalid email',
    errors: { email: ['Required'] },
  },
})

// Example

// kind: 'validation'
// source: 'api'
// statusCode: 422
// message: 'Passed data has issues'
// rawMessage: 'Invalid email',
// validationErrors: { email: ['Required'] }
```

The API-provided message remains available as `rawMessage`. The normalized `message` uses Okapi's
built-in or configured message for the resolved error kind.

### `normalizeOkapiError`

Converts an unknown thrown value to an `OkapiError`. Existing `OkapiError` instances are preserved:

```ts
import { normalizeOkapiError } from '@alexovn/okapi'

try {
  await save()
} catch (error) {
  throw normalizeOkapiError(error)
}

// Example

// type: 'unexpected'
// title: 'Something went wrong'
// message: 'Unexpected error occurred'
// details: OkapiError
```

Generic `Error` values become `unexpected` errors. Fetch adapters should be used when a
`TypeError` needs to be recognized as a network failure.

### `mapOkapiError`

Converts an unknown error into a presentation-friendly `MappedOkapiError`:

```ts
import { mapOkapiError } from '@alexovn/okapi'

const mappedError = mapOkapiError(new Error('Failed'))

// Example

// type: 'unexpected'
// title: 'Something went wrong'
// message: 'Unexpected error occurred'
// details: OkapiError
```

### `OkapiError`

`OkapiError` extends the native `Error` class and provides:

- `kind`: the specific error category
- `source`: where the error originated
- `statusCode` and `statusText`: HTTP response information, when available
- `validationErrors`: parsed validation details, when available
- `raw`: the original API or HTTP response body
- `rawMessage`: the original message from a recognized API response
- `cause`: the original thrown value, when available
- `isNetworkError`: flag that checks if an error is a network error
- `isValidationError`: flag that checks if an error is a validation error

It can also be constructed directly or through its static helpers:

```ts
import { OkapiError } from '@alexovn/okapi'

const error = new OkapiError({
  kind: 'business',
  message: 'The operation could not be completed.',
})
```

Available static helpers are:

- `OkapiError.getApiResponseError` handles api error.
- `OkapiError.getHttpResponseError` handles http error.
- `OkapiError.getNetworkError` handles network error.
- `OkapiError.getUnexpectedError` handles unexpected error.

## Error Taxonomy

`kind` describes the specific failure, while `type` groups kinds into broader categories suitable
for application behavior.

| Kind | Mapped type | Typical cause |
| --- | --- | --- |
| `network` | `network` | Transport or connection failure |
| `abort` | `network` | Aborted request |
| `unauthorized` | `auth` | HTTP 401 |
| `forbidden` | `business` | HTTP 403 |
| `not-found` | `business` | HTTP 404 |
| `validation` | `validation` | HTTP 422 or recognized validation errors |
| `conflict` | `business` | HTTP 409 |
| `rate-limited` | `business` | HTTP 429 |
| `business` | `business` | Other recognized API or HTTP failure |
| `server` | `server` | HTTP 5xx |
| `unexpected` | `unexpected` | Unrecognized thrown value |

An error's `source` is one of `api`, `http`, `network`, `unexpected`, or `custom`.

## Fetch Adapters

If you want to get started quickly, take a look at the built-in fetch adapters. Each adapter is a
small wrapper around the library functions and provides everything you need to handle errors the
right way.

### Native Fetch

Import native Fetch helpers from `@alexovn/okapi/fetch`:

- `getFetchResponseError` handles unsuccessful HTTP responses.
- `getFetchError` handles response-like objects, network errors, and other thrown values.
- `createFetchResponseErrorMapper` creates a mapper for unsuccessful HTTP responses.
- `createFetchErrorMapper` creates a mapper for network and other thrown errors.

The native Fetch adapter does not read the response body for you. Parse it once and pass it as the
second argument:

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
instances, use `getFetchError` and `getFetchResponseError` instead, then map the error at the UI
boundary.

### Axios

Import Axios helpers from `@alexovn/okapi/axios`:

- `getAxiosError` returns an `OkapiError`.
- `createAxiosErrorMapper` creates a reusable `MappedOkapiError` mapper.

Axios exposes the parsed error response body to the adapter automatically:

```ts
import axios from 'axios'
import { createAxiosErrorMapper } from '@alexovn/okapi/axios'

const mapAxiosError = createAxiosErrorMapper()

export async function axiosGet<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url)
    return response.data
  } catch (error) {
    throw mapAxiosError(error)
  }
}
```

### ofetch

Import ofetch helpers from `@alexovn/okapi/ofetch`:

- `getOfetchError` returns an `OkapiError`.
- `createOfetchErrorMapper` creates a reusable `MappedOkapiError` mapper.

```ts
import { ofetch } from 'ofetch'
import { createOfetchErrorMapper } from '@alexovn/okapi/ofetch'

const mapOfetchError = createOfetchErrorMapper()

export async function ofetchGet<T>(url: string): Promise<T> {
  try {
    return await ofetch<T>(url)
  } catch (error) {
    throw mapOfetchError(error)
  }
}
```

## Translations

Okapi includes English titles and messages by default. They are resolved when an error passes
through `mapOkapiError` or an adapter mapper.

Use kind-based values for general translations and status-based values for more specific HTTP
responses:

```ts
import type { OkapiErrorAdapterOptions } from '@alexovn/okapi'

const options: OkapiErrorAdapterOptions = {
  i18n: {
    titles: {
      'not-found': 'Not found',
      network: 'Connection problem',
    },
    statusTitles: {
      503: 'Temporarily unavailable',
    },
    messages: {
      'not-found': 'The requested resource was not found.',
      network: 'Check your internet connection and try again.',
    },
    statusMessages: {
      503: 'The service is temporarily unavailable. Please try again later.',
    },
  },
}
```

Resolvers receive the complete normalized `OkapiError`, so they can be integrated with any i18n
library:

```ts
import type { OkapiErrorAdapterOptions } from '@alexovn/okapi'

const options: OkapiErrorAdapterOptions = {
  i18n: {
    resolveTitle: ({ statusCode }) => {
      if (statusCode === 503) {
        return 'Temporarily unavailable'
      }

      return undefined
    },
    resolveMessage: ({ kind, statusCode }) => {
      if (statusCode) {
        return translate(`errors.http.${statusCode}`)
      }

      return translate(`errors.api.${kind}`)
    },
  },
}
```

### Translation Resolution Order

Titles are resolved in this order:

1. `i18n.resolveTitle`
2. `i18n.statusTitles[statusCode]`
3. `i18n.titles[kind]`
4. Built-in title

Messages are resolved in this order:

1. `i18n.resolveMessage`
2. `i18n.statusMessages[statusCode]`
3. `i18n.messages[kind]`
4. Built-in message

A resolver can return `undefined` to continue to the next fallback.

## Custom Error Kinds

Applications can extend the built-in kinds with a string union. Pass that union as the generic
argument to options, errors, and mapper factories that need to know about the custom kinds:

```ts
import type { OkapiErrorAdapterOptions } from '@alexovn/okapi'
import { OkapiError } from '@alexovn/okapi'
import { createFetchResponseErrorMapper } from '@alexovn/okapi/fetch'

type AppErrorKind = 'project-archived' | 'subscription-expired'

const options: OkapiErrorAdapterOptions<AppErrorKind> = {
  resolveKind: ({ statusCode, raw }) => {
    if (
      statusCode === 404 &&
      typeof raw === 'object' &&
      raw !== null &&
      'code' in raw &&
      raw.code === 'PROJECT_ARCHIVED'
    ) {
      return 'project-archived'
    }

    return undefined
  },
  i18n: {
    titles: {
      'project-archived': 'Project archived',
    },
    messages: {
      'project-archived': 'Restore the project to continue.',
    },
  },
}

const mapResponseError = createFetchResponseErrorMapper(options)

const error = new OkapiError<AppErrorKind>({
  kind: 'project-archived',
  message: 'This project has been archived.',
})
```

`resolveKind` runs before built-in classification and receives `source`, `statusCode`,
`statusText`, `raw`, and `cause`. Return `undefined` to use the built-in classifier. Custom kinds
map to the broad `business` type by default.

## Custom Validation Errors

By default, Okapi accepts validation errors shaped as a dictionary of string arrays:

```ts
type ApiValidationErrors = Record<string, string[]>
```

Use `parseValidationErrors` when an API returns another shape. The validation-errors type is
unconstrained, so it may be an array, dictionary, nested object, primitive, or union:

```ts
import type { OkapiErrorAdapterOptions } from '@alexovn/okapi'
import { createFetchResponseErrorMapper } from '@alexovn/okapi/fetch'

interface ValidationErrorDetail {
  code: string
  message: string
}

interface ArrayValidationError extends ValidationErrorDetail {
  field?: string
  path?: string[]
}

type AppValidationErrors =
  | ArrayValidationError[]
  | Record<string, ValidationErrorDetail>

const options: OkapiErrorAdapterOptions<never, AppValidationErrors> = {
  parseValidationErrors(value) {
    if (Array.isArray(value)) {
      return value as ArrayValidationError[]
    }

    if (typeof value === 'object' && value !== null) {
      return value as Record<string, ValidationErrorDetail>
    }

    return undefined
  },
}

const mapResponseError = createFetchResponseErrorMapper(options)

const response = { status: 422, statusText: 'Unprocessable Content' }
const body = {
  message: 'Invalid input',
  errors: [{ field: 'email', code: 'required', message: 'Email is required' }],
}

const mapped = mapResponseError(response, body)
const errors = mapped.errors // AppValidationErrors | undefined
```

The returned value is available as both `OkapiError.validationErrors` and
`MappedOkapiError.errors`, with its type preserved. The parser may also normalize the server value
into a different consumer-facing shape.

Providing `parseValidationErrors` replaces the built-in parser. Return `undefined` when the value
is not a recognized validation-error shape. If an `errors` property is present but the parser
rejects it, Okapi treats the response as an HTTP response error instead of an API error. Omitting
the option preserves the default `Record<string, string[]>` behavior.

## Development

- Clone this repository
- Enable Corepack using `corepack enable`
- Install dependencies using `pnpm install`

## Inspirations

This library was inspired by article
["API Error Handling Demystified: Don’t Just Fetch — Handle in JS & TS"](https://medium.com/@tanguyfab/api-error-handling-demystified-dont-just-fetch-handle-in-js-ts-7938ee22afb9)
by [Tanguy Fabien](https://github.com/fabien-tanguy).

## License

Made with ❤️

Published under the [MIT license](https://github.com/alexovn/okapi/LICENSE).
