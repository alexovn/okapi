import {
  createOkapiErrorFromResponse,
  mapOkapiError,
  type ApiValidationErrors,
  type OkapiErrorAdapterOptions,
} from '@alexovn/okapi'

export const customKindFixture = {
  status: 403,
  body: { message: 'Your subscription has expired.', code: 'SUBSCRIPTION_EXPIRED' },
}

export const validationFixture = {
  status: 422,
  body: {
    message: 'Invalid input',
    errors: [{ field: 'email', message: 'A valid email is required.' }],
  },
}

export function parseValidationErrors(value: unknown): ApiValidationErrors | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }
  const errors: ApiValidationErrors = {}
  for (const item of value) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.field !== 'string' ||
      typeof item.message !== 'string'
    ) {
      return undefined
    }
    // Define own properties even for field names such as "__proto__".
    if (!Object.hasOwn(errors, item.field)) {
      Object.defineProperty(errors, item.field, { value: [], enumerable: true })
    }
    errors[item.field]!.push(item.message)
  }
  return errors
}

export function mapCustomFixture(
  mode: 'kind' | 'validation',
  options: OkapiErrorAdapterOptions<'subscription-expired'>,
) {
  const fixture = mode === 'kind' ? customKindFixture : validationFixture
  const configured: OkapiErrorAdapterOptions<'subscription-expired'> = {
    ...options,
    resolveKind: ({ raw }) => {
      if (
        typeof raw === 'object' &&
        raw !== null &&
        'code' in raw &&
        raw.code === 'SUBSCRIPTION_EXPIRED'
      ) {
        return 'subscription-expired'
      }
      return undefined
    },
    parseValidationErrors,
  }
  return mapOkapiError(createOkapiErrorFromResponse(fixture, configured), configured)
}
