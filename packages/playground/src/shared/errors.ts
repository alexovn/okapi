import {
  mapOkapiError,
  OkapiError,
  type MappedOkapiError,
  type OkapiErrorAdapterOptions,
} from '@alexovn/okapi'
import { useI18n } from 'vue-i18n'

export type PlaygroundError = MappedOkapiError<'subscription-expired'>

export function useErrorOptions<
  TCustomKind extends string = never,
>(): OkapiErrorAdapterOptions<TCustomKind> {
  const { t } = useI18n()
  return {
    i18n: {
      resolveTitle: ({ kind }) => t(`errors.${kind}.title`),
      resolveMessage: ({ kind }) => t(`errors.${kind}.message`),
    },
  }
}

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
