import { describe, expect, expectTypeOf, test } from 'vitest'

import { OkapiError, mapOkapiError, normalizeOkapiError } from '../src'
import type {
  OkapiErrorAdapterOptions,
  OkapiErrorKind,
  DefaultOkapiErrorKind,
  MappedOkapiError,
} from '../src'
import { createFetchResponseErrorMapper } from '../src/adapters/fetch'

describe('custom error kinds', () => {
  test('Okapi error kind type can include consumer-defined kinds', () => {
    type AppErrorKind = OkapiErrorKind<'project-archived'>

    expectTypeOf<'project-archived'>().toExtend<AppErrorKind>()
    expectTypeOf<DefaultOkapiErrorKind>().toExtend<AppErrorKind>()
  })

  test('consumers can construct an OkapiError with a custom kind', () => {
    type AppErrorKind = 'project-archived'

    const error = new OkapiError<AppErrorKind>({
      kind: 'project-archived',
      message: 'This project has been archived.',
    })

    expectTypeOf(error.kind).toEqualTypeOf<OkapiErrorKind<AppErrorKind>>()
    expectTypeOf(normalizeOkapiError<AppErrorKind>(error)).toEqualTypeOf<OkapiError<AppErrorKind>>()
    expectTypeOf(mapOkapiError<AppErrorKind>(error)).toEqualTypeOf<MappedOkapiError<AppErrorKind>>()
    expect(error.name).toBe('OkapiError')
    expect(error.kind).toBe('project-archived')
    expect(error.message).toBe('This project has been archived.')
  })

  test('adapters classify consumer-defined error kinds', () => {
    type AppErrorKind = 'project-archived' | 'subscription-expired'

    const options: OkapiErrorAdapterOptions<AppErrorKind> = {
      resolveKind: ({ source, statusCode, raw }) => {
        if (
          source === 'api' &&
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
    }
    const mapResponseError = createFetchResponseErrorMapper(options)
    const mapped = mapResponseError(
      { status: 404, statusText: 'Not Found' },
      { message: 'Internal backend details', code: 'PROJECT_ARCHIVED' },
    )

    expectTypeOf(mapped).toEqualTypeOf<MappedOkapiError<AppErrorKind>>()
    expect(mapped).toMatchObject({
      type: 'business',
      details: { kind: 'project-archived', statusCode: 404 },
    })
  })

  test('custom kind resolution falls back to built-in classification', () => {
    const mapResponseError = createFetchResponseErrorMapper<'project-archived'>({
      resolveKind: () => undefined,
    })

    expect(mapResponseError({ status: 404 }).details.kind).toBe('not-found')
  })
})

describe('validation errors', () => {
  interface ValidationErrorDetail {
    code: string
    message: string
  }

  test('uses the default validation errors shape when no parser is configured', () => {
    const mapResponseError = createFetchResponseErrorMapper()
    const mapped = mapResponseError(
      { status: 400 },
      {
        message: 'Some fields are invalid.',
        errors: {
          email: ['Please enter a valid email address.'],
          password: ['Password must be at least 8 characters long.'],
        },
      },
    )

    expectTypeOf(mapped.errors).toEqualTypeOf<Record<string, string[]> | undefined>()
    expect(mapped).toMatchObject({
      type: 'validation',
      errors: {
        email: ['Please enter a valid email address.'],
        password: ['Password must be at least 8 characters long.'],
      },
      details: {
        kind: 'validation',
        source: 'api',
      },
    })
  })

  test('consumers can parse array validation errors', () => {
    interface ArrayValidationError extends ValidationErrorDetail {
      path?: string[]
    }

    const arrayErrors = [
      {
        path: ['shipping_address', 'zipcode'],
        code: 'INVALID_ZIP',
        message: 'Zipcode does not match the selected country.',
      },
    ]

    const mapCustomValidationError = createFetchResponseErrorMapper<never, ArrayValidationError[]>({
      parseValidationErrors: (value) => value as ArrayValidationError[],
    })

    const mapped = mapCustomValidationError(
      { status: 400 },
      { message: 'Invalid address.', errors: arrayErrors },
    )

    expectTypeOf(mapped).toEqualTypeOf<MappedOkapiError<never, ArrayValidationError[]>>()
    expect(mapped.errors).toEqual(arrayErrors)
    expect(mapped.details.validationErrors).toEqual(arrayErrors)
    expect(mapped.details.rawMessage).toBe('Invalid address.')
    expect(mapped.type).toBe('validation')
  })

  test('consumers can parse dictionary validation errors', () => {
    type ObjectValidationError = Record<string, ValidationErrorDetail>

    const dictionaryErrors = {
      username: {
        code: 'REQUIRED',
        message: 'Username is required.',
      },
    }

    const mapCustomValidationError = createFetchResponseErrorMapper<never, ObjectValidationError>({
      parseValidationErrors: (value) => value as ObjectValidationError,
    })

    const mapped = mapCustomValidationError(
      { status: 400 },
      { message: 'Invalid account.', errors: dictionaryErrors },
    )

    expectTypeOf(mapped).toEqualTypeOf<MappedOkapiError<never, ObjectValidationError>>()
    expect(mapped.errors).toEqual(dictionaryErrors)
    expect(mapped.details.validationErrors).toEqual(dictionaryErrors)
    expect(mapped.details.rawMessage).toBe('Invalid account.')
    expect(mapped.type).toBe('validation')
  })

  test('custom validation errors can have an arbitrary non-object shape', () => {
    const mapResponseError = createFetchResponseErrorMapper<never, string>({
      parseValidationErrors: (value) => value as string,
    })
    const mapped = mapResponseError(
      { status: 400 },
      { message: 'Invalid input.', errors: 'INVALID_INPUT' },
    )

    expectTypeOf(mapped.errors).toEqualTypeOf<string | undefined>()
    expect(mapped.type).toBe('validation')
    expect(mapped.errors).toBe('INVALID_INPUT')

    const normalized = normalizeOkapiError<never, string>(mapped.details)
    const remapped = mapOkapiError<never, string>(normalized)

    expectTypeOf(normalized).toEqualTypeOf<OkapiError<never, string>>()
    expectTypeOf(remapped).toEqualTypeOf<MappedOkapiError<never, string>>()
    expect(remapped.errors).toBe('INVALID_INPUT')
  })

  test('a custom validation errors parser replaces the default parser', () => {
    const mapResponseError = createFetchResponseErrorMapper<never, string>({
      parseValidationErrors: () => undefined,
    })
    const body = {
      message: 'Invalid input.',
      errors: { email: ['Invalid email.'] },
    }
    const mapped = mapResponseError({ status: 400 }, body)

    expect(mapped.type).toBe('business')
    expect(mapped.errors).toBeUndefined()
    expect(mapped.details.source).toBe('http')
    expect(mapped.details.raw).toBe(body)
  })
})
