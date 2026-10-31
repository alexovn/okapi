import { mapOkapiError, OkapiError, type MappedOkapiError } from '@alexovn/okapi'

export type PlaygroundError = MappedOkapiError<'subscription-expired'>

export function caughtError(error: unknown): PlaygroundError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'details' in error &&
    error.details instanceof OkapiError
  ) {
    return error as PlaygroundError
  }
  return mapOkapiError(error)
}

// Error's message/cause are not enumerable. Make them visible without losing raw payloads.
export function formatJson(value: unknown): string {
  return (
    JSON.stringify(
      value,
      (_key, item: unknown) => {
        if (item instanceof Error) {
          return {
            ...item,
            name: item.name,
            message: item.message,
            cause: item.cause,
          }
        }
        return item
      },
      2,
    ) ?? 'null'
  )
}
