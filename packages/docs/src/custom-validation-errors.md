# Custom Validation Errors

By default, Okapi recognizes validation errors shaped as a dictionary of string arrays:

```ts
type ApiValidationErrors = Record<string, string[]>
```

For example, this response uses the default shape:

```json
{
  "message": "Invalid input",
  "errors": {
    "email": ["Email is required"]
  }
}
```

Use `parseValidationErrors` when your API returns another shape. The validation-errors type is
unconstrained, so it may be an array, dictionary, nested object, primitive, or union.

## Parse a custom shape

Pass the validation-errors type as the second generic argument to the mapper options. The parser
receives the response's unknown `errors` value and returns the typed value when it recognizes the
payload.

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

The first generic argument is `never` because this example does not define any
[custom error kinds](/error-kinds#custom-error-kinds). The returned validation value is available
as both `mapped.details.validationErrors` and `mapped.errors`, with its type preserved.

## Normalize the payload

The parser can also transform the server value into a more convenient consumer-facing shape. For
example, an API array can be converted to a dictionary keyed by field name:

```ts
import type { OkapiErrorAdapterOptions } from '@alexovn/okapi'

type FieldErrors = Record<string, string[]>

const options: OkapiErrorAdapterOptions<never, FieldErrors> = {
  parseValidationErrors(value) {
    if (!Array.isArray(value)) {
      return undefined
    }

    const errors: FieldErrors = {}

    for (const item of value) {
      if (
        typeof item !== 'object' ||
        item === null ||
        !('field' in item) ||
        typeof item.field !== 'string' ||
        !('message' in item) ||
        typeof item.message !== 'string'
      ) {
        return undefined
      }

      errors[item.field] ??= []
      errors[item.field].push(item.message)
    }

    return errors
  },
}
```

## Parser behavior

Providing `parseValidationErrors` replaces the built-in parser. Return `undefined` when the value
is not a recognized validation-error shape. If an `errors` property is present but the parser
rejects it, Okapi treats the response as an HTTP-sourced error instead of an API-sourced error.
The HTTP status still participates in kind classification, so a rejected response with status
`422` still has the `validation` kind but does not expose parsed `errors`.

Omitting the option preserves the default `Record<string, string[]>` behavior. The same option is
accepted by [`createApiErrorFromResponse`](/api#createapierrorfromresponse) and every
[adapter](/adapters/native-fetch) through [`OkapiErrorOptions`](/types#okapierroroptions).
