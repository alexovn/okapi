![okapi banner](./.github/assets/okapi-banner.jpg)

# OKAPI

A library for handling API and HTTP errors with ease.

## Features

- Framework agnostic
- Fully typed
- i18n support
- Built-in adapters for popular fetching libraries (axios, ofetch etc.)

## Getting Started

### Installation

```shell
npm install @alexovn/okapi
```

## Usage

The core library logic is concern in `OkapiError` class that handles errors and returns structured info. It is surrounded by helper functions that do a lot of internal work to process data and to pass it for further implementation.

### `createApiErrorFromResponse`

Creates an `OkapiError` from a status and parsed response body.

```ts
import { createApiErrorFromResponse } from '@alexovn/okapi'

const error = createApiErrorFromResponse({
  status: 422,
  body: {
    message: 'Invalid input',
    errors: { email: ['Required'] }
  },
})

console.log(error.kind) // 'validation'
console.log(error.source) // 'api'
console.log(error.statusCode) // 422
console.log(error.message) // 'Invalid input'
console.log(error.validationErrors) // { email: ['Required'] }
```

### `normalizeOkapiError`

Converts an unknown thrown value to an `OkapiError`, preserving existing `OkapiError` instances.

```ts
import { normalizeOkapiError } from '@alexovn/okapi'

try {
  await save()
} catch (error) {
  throw normalizeOkapiError(error) // OkapiError
}
```

### `mapOkapiError`

Converts an unknown error to a presentation-friendly object with `type`, `title`, `message`, and `details`. It uses `normalizeOkapiError` function under the hood.

```ts
import { mapOkapiError } from '@alexovn/okapi'

const mapped = mapOkapiError(new Error('Failed'))

console.log(mapped.type) // 'unexpected'
console.log(mapped.title) // 'Something went wrong'
console.log(mapped.message) // 'Unexpected error occurred'
console.log(mapped.details) // OkapiError
```

## Fetch Adapters

If you want to just deep dive into work, than you should take a look at built-in fetch adapters. Every adapter is just a tiny wrapper around library functions, but they hold everything that you need to handle errors right way.

Have a specific case? No problem. You can create adapter yourself!

### Native Fetch

Helper functions for handling errors using [`native fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch):

- `getFetchResponseError`. Catches errors when `response.ok` is `false`.
- `getFetchError`. Catches all kind of errors.
- `createFetchResponseErrorMapper`. Convenient wrapper that internally maps errors from `getFetchResponseError` function.
- `createFetchErrorMapper`. Convenient wrapper that internally maps errors from `getFetchError` function.

```ts
import { createFetchErrorMapper, createFetchResponseErrorMapper } from '@alexovn/okapi/fetch'

const options = {
  i18n: {
    resolveMessage: ({ kind, statusCode }) => {
      return statusCode
        ? `HTTP error ${statusCode}`
        : `API error: ${kind}`
    },
  },
}

const mapFetchError = createFetchErrorMapper(options)
const mapFetchResponseError = createFetchResponseErrorMapper(options)

async function fetchJson(url, options) {
  try {
    const res = await fetch(url, options)

    if (!response.ok) {
      throw mapFetchResponseError(response)
    }

    return await res.json()
  } catch (error) {
    throw mapFetchError(error)
  }
}

export async function fetchGet(url, options) {
  return await fetchJson(url, options)
}
```

### Axios

Helper functions for handling errors using [`axios`](https://github.com/axios/axios):

- `getAxiosError`. Catches all kind of errors.
- `createAxiosErrorMapper`. Convenient wrapper that internally maps errors from `getAxiosError` function.


```ts
import { createAxiosErrorMapper } from '@alexovn/okapi/axios'

const mapAxiosError = createAxiosErrorMapper({
  i18n: {
    resolveMessage: ({ kind, statusCode }) => {
      return statusCode
        ? `HTTP error ${statusCode}`
        : `API error: ${kind}`
    },
  },
})

export async function axiosGet(url) {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    throw mapAxiosError(error)
  }
}
```

### Ofetch

Helper functions for handling errors using [`ofetch`](https://github.com/unjs/ofetch):

- `getOfetchError`. Catches all kind of errors.
- `createOfetchErrorMapper`. Convenient wrapper that internally maps errors from `getOfetchError` function.


```ts
import { createOfetchErrorMapper } from '@alexovn/okapi/ofetch'

const mapOfetchError = createOfetchErrorMapper({
  i18n: {
    resolveMessage: ({ kind, statusCode }) => {
      return statusCode
        ? `HTTP error ${statusCode}`
        : `API error: ${kind}`
    },
  },
})

export async function ofetchGet(url, options) {
  try {
    return await $fetch(url, options)
  } catch (error) {
    throw mapOfetchError(error)
  }
}
```

## Translations

There's built-in support for errors translations. It uses English language by default.

`Titles` and `messages` are localized when an error passes through `mapOkapiError` or
one of the adapter mappers. They are based on error kind (network, business, server etc.).

Use `statusTitles` and `statusMessages` for fine-grained translations based on
status code.


```ts
const options = {
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

Resolvers can handle cases that need the complete normalized error context. You can use any i18n library to translate messages dynamically.

```ts
const options = {
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

### Translation Order

Title resolution order:

1) `i18n.resolveTitle`
2) `i18n.statusTitles[statusCode]`
3) `i18n.titles[kind]`
4) built-in title

Message resolution order:

1) `i18n.resolveMessage`
2) `i18n.statusMessages[statusCode]`
3) `i18n.messages[kind]`
4) built-in message

## Custom Error Kinds

Applications can extend the built-in kinds with a string union. Pass that union
as the generic argument to options, errors, or mapper factories that need to
know about the custom kinds.

```ts
type AppErrorKind =
  | 'project-archived'
  | 'subscription-expired'

const options: OkapiErrorAdapterOptions<AppErrorKind> = {
  resolveKind: ({ statusCode, raw }) => {
    if (
      statusCode === 404
      && typeof raw === 'object'
      && raw !== null
      && 'code' in raw
      && raw.code === 'PROJECT_ARCHIVED'
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
```

`resolveKind` runs before built-in classification and receives the error `source`, `statusCode`, `statusText`, `raw` value, and `cause`. Return `undefined` to use the built-in classifier. Custom kinds map to the broad `business` error type by default.

Custom errors can also be constructed directly:

```ts
const error = new OkapiError<AppErrorKind>({
  kind: 'project-archived',
  message: 'This project has been archived.',
})
```

## Custom Validation Errors

By default, Okapi accepts validation errors shaped as a dictionary of string arrays:

```ts
type ApiValidationErrors = Record<string, string[]>
```

Use `parseValidationErrors` when an API returns another shape. The validation errors type is
unconstrained, so it can be an array, dictionary, nested object, primitive, or a union of several
formats.

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
    return value as AppValidationErrors
  },
}

const mapResponseError = createFetchResponseErrorMapper(options)
const mapped = mapResponseError(response, body)

const errors = mapped.errors
```

The returned value is available as both `OkapiError.validationErrors` and
`MappedOkapiError.errors`, with its type preserved. The parser may also normalize the server value
into a different consumer-facing shape.

Providing `parseValidationErrors` replaces the built-in parser. Return `undefined` when the value
is not a recognized validation errors shape. If an `errors` property is present but the parser
rejects it, Okapi treats the response as an HTTP response error instead of an API error. Omitting
the option preserves the default `Record<string, string[]>` behavior.

## Credits

A library has been inspired by article ["API Error Handling Demystified: Don’t Just Fetch — Handle in JS & TS"](https://medium.com/@tanguyfab/api-error-handling-demystified-dont-just-fetch-handle-in-js-ts-7938ee22afb9) by [Tanguy Fabien](https://github.com/fabien-tanguy).

## License

Made with ❤️

Published under the [MIT license](https://github.com/alexovn/okapi/LICENSE).