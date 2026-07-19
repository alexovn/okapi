# OKAPI

A service for handling HTTP and API errors without unnecessary overhead.

## Features

- Framework agnostic
- Fully typed
- i18n support
- Built-in adapters for popular fetching libraries (axios, ofetch etc.)

## Fetch Adapters

When you fetch a data it's necessary to get right error details that have its own specificity. Adapters can help you to do it with ease.

Every adapter is just a tiny wrapper around library functions, so if you have a specific case, you can create adapter yourself.

### Native Fetch

There are several helper functions for handling errors using [`native fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch):

- `getFetchResponseError`. Catches errors when `response.ok` is `false`.
- `getFetchError`. Catches all kind of errors.
- `createFetchResponseErrorMapper`. Convenient wrapper that internally maps errors from `getFetchResponseError` function.
- `createFetchErrorMapper`. Convenient wrapper that internally maps errors from `getFetchError` function.

```ts
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

There are several helper functions for handling errors using [`axios`](https://github.com/axios/axios):

- `getAxiosError`. Catches all kind of errors.
- `createAxiosErrorMapper`. Convenient wrapper that internally maps errors from `getAxiosError` function.


```ts
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

There are several helper functions for handling errors using [`ofetch`](https://github.com/unjs/ofetch):

- `getOfetchError`. Catches all kind of errors.
- `createOfetchErrorMapper`. Convenient wrapper that internally maps errors from `getOfetchError` function.


```ts
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

`Titles` and `messages` are localized when an error passes through `mapApiError` or
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

const options: ApiErrorAdapterOptions<AppErrorKind> = {
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
const error = new ApiError<AppErrorKind>({
  kind: 'project-archived',
  message: 'This project has been archived.',
})
```
