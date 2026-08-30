# Error Kinds

An error kind is Okapi's specific, machine-readable classification for an error. Read it from
`OkapiError.kind` or `mappedError.details.kind` to choose application behavior independently from
the user-facing title and message.

```ts
const OKAPI_ERROR_KIND = {
  NETWORK: 'network',
  ABORT: 'abort',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  VALIDATION: 'validation',
  CONFLICT: 'conflict',
  RATE_LIMITED: 'rate-limited',
  BUSINESS: 'business',
  SERVER: 'server',
  UNEXPECTED: 'unexpected',
}
```

Use the exported constant instead of repeating string literals when branching on a kind:

```ts
import { OKAPI_ERROR_KIND } from '@alexovn/okapi'

if (mappedError.details.kind === OKAPI_ERROR_KIND.UNAUTHORIZED) {
  redirectToLogin()
}
```

## Built-in classification and mapping

Okapi assigns kinds from the error source and, for API or HTTP responses, the status code.

| Kind | Type | Condition |
| --- | --- | --- |
| `network` | `network` | Request failed before receiving a response |
| `abort` | `network` | Request was aborted with an `AbortError` |
| `unauthorized` | `auth` | Status `401` |
| `forbidden` | `business` | Status `403` |
| `not-found` | `business` | Status `404` |
| `conflict` | `business` | Status `409` |
| `validation` | `validation` | Status `422`, or a [recognized validation payload](/custom-validation-errors) unless the status is `401`, `403`, `404`, or `409` |
| `rate-limited` | `business` | Status `429` |
| `server` | `server` | Status `500` or greater |
| `business` | `business` | Other API or HTTP response |
| `unexpected` | `unexpected` | Unrecognized thrown value |

Kinds are more specific than `OkapiErrorType`, which groups errors for presentation. For example,
`forbidden`, `not-found`, `conflict`, and `rate-limited` all map to the broad `business` type. See
the shared [`OkapiErrorType`](/types#okapierrortype) type.

## Types

### `DefaultOkapiErrorKind`

A union of the built-in values from `OKAPI_ERROR_KIND`.

```ts
type DefaultOkapiErrorKind =
  (typeof OKAPI_ERROR_KIND)[keyof typeof OKAPI_ERROR_KIND]
```

### `OkapiErrorKind`

A union of the built-in error kinds and any application-specific kinds.

```ts
type OkapiErrorKind<TCustomKind extends string = never> =
  | DefaultOkapiErrorKind
  | TCustomKind
```

## Custom Error Kinds

Extend the built-in kinds with a string union when your application needs a category that cannot
be inferred from an HTTP status alone. Pass the union as the first generic argument to the mapper
options so it flows through the returned `OkapiError` and mapped result.

### `resolveKind`

A function that selects a built-in or custom error kind from the available error context.

- Type:

```ts
interface OkapiErrorKindContext {
  source: OkapiErrorSource
  statusCode?: number
  statusText?: string
  raw?: unknown
  cause?: unknown
}

type OkapiErrorKindResolver<TCustomKind extends string = never> = (
  context: OkapiErrorKindContext,
) => OkapiErrorKind<TCustomKind> | undefined
```

The context's [`source`](/api#source) identifies where the error originated. Response errors also
provide their status and raw body; network and unexpected errors provide the original `cause`.

### Example

```ts
import type { OkapiErrorAdapterOptions } from '@alexovn/okapi'
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

const mapFetchResponseError = createFetchResponseErrorMapper(options)
```

`resolveKind` runs before built-in classification for API, HTTP, network, and unexpected errors.
Return `undefined` when the custom rule does not apply; Okapi will then use the built-in classifier.

Custom kinds map to the broad `business` type by default. Add their titles and messages through
the [i18n options](/i18n#static-translations), as shown above.
