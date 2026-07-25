import { expect, expectTypeOf, test } from 'vitest'

import {
  ApiError,
  createFetchErrorMapper,
  createFetchResponseErrorMapper,
  mapApiError,
  normalizeApiError,
} from '../src'
import type {
  ApiErrorAdapterOptions,
  ApiErrorKind,
  ApiErrorOptions,
  DefaultApiErrorKind,
  MappedApiError,
} from '../src'
import { TITLES, MESSAGES, HTTP_CASES } from './constants'

test('error kind type can include consumer-defined kinds', () => {
  type AppErrorKind = ApiErrorKind<'project-archived'>

  expectTypeOf<'project-archived'>().toExtend<AppErrorKind>()
  expectTypeOf<DefaultApiErrorKind>().toExtend<AppErrorKind>()
})

test('consumers can construct an ApiError with a custom kind', () => {
  type AppErrorKind = 'project-archived'

  const error = new ApiError<AppErrorKind>({
    kind: 'project-archived',
    message: 'This project has been archived.',
  })

  expectTypeOf(error.kind).toEqualTypeOf<ApiErrorKind<AppErrorKind>>()
  expectTypeOf(normalizeApiError(error)).toEqualTypeOf<ApiError<AppErrorKind>>()
  expectTypeOf(mapApiError(error)).toEqualTypeOf<MappedApiError<AppErrorKind>>()
  expect(error.kind).toBe('project-archived')
  expect(error.message).toBe('This project has been archived.')
})

test('adapters classify and translate consumer-defined error kinds', () => {
  type AppErrorKind = 'project-archived' | 'subscription-expired'

  const options: ApiErrorAdapterOptions<AppErrorKind> = {
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
    i18n: {
      titles: { 'project-archived': 'Project archived' },
      messages: { 'project-archived': 'Restore the project to continue.' },
    },
  }
  const mapResponseError = createFetchResponseErrorMapper(options)
  const mapped = mapResponseError(
    { status: 404, statusText: 'Not Found' },
    { message: 'Internal backend details', code: 'PROJECT_ARCHIVED' },
  )

  expectTypeOf(mapped).toEqualTypeOf<MappedApiError<AppErrorKind>>()
  expect(mapped).toMatchObject({
    type: 'business',
    title: 'Project archived',
    message: 'Restore the project to continue.',
    details: { kind: 'project-archived', statusCode: 404 },
  })
})

test('custom kind resolution falls back to built-in classification', () => {
  const mapResponseError = createFetchResponseErrorMapper<'project-archived'>({
    resolveKind: () => undefined,
  })

  expect(mapResponseError({ status: 404 }).details.kind).toBe('not-found')
})

test('resolvers take precedence over configured titles and messages', () => {
  const options: ApiErrorOptions = {
    i18n: {
      resolveTitle: () => 'Project unavailable',
      resolveMessage: () => 'This project has been archived.',
      titles: { 'not-found': 'Resource not found' },
      statusTitles: { 404: 'Page not found' },
      messages: { 'not-found': 'The requested project could not be found.' },
      statusMessages: { 404: 'The page is unavailable.' },
    },
  }

  const error = ApiError.getHttpResponseError(404, 'Not Found')
  expect(mapApiError(error, options)).toMatchObject({
    title: 'Project unavailable',
    message: 'This project has been archived.',
  })
})

test('resolveMessage prop handles network and unexpected errors dynamically', () => {
  const mapError = createFetchErrorMapper({
    i18n: {
      resolveMessage: ({ cause, kind }) => {
        if (kind === 'network') {
          return 'Connection unavailable'
        }
        if (kind === 'unexpected' && cause instanceof Error) {
          return `Unexpected: ${cause.message}`
        }
        return 'Unable to complete the request'
      },
    },
  })

  // TypeError occurs when the fetch() API completely fails to make a network request.
  expect(mapError(new TypeError('network error')).message).toBe('Connection unavailable')
  expect(mapError(new Error('unexpected error')).message).toBe('Unexpected: unexpected error')
})

test('titles are resolved separately from low-level error messages', () => {
  const options: ApiErrorOptions = {
    i18n: {
      titles: { 'not-found': 'Not here' },
      statusTitles: { 404: 'Missing' },
      messages: { 'not-found': 'The requested item does not exist.' },
    },
  }
  const error = ApiError.getHttpResponseError(404, undefined, undefined, options)
  expect(error.message).toBe('The requested item does not exist.')

  const mapped = mapApiError(error, options)
  expect(mapped.title).toBe('Missing')
  expect(mapped.message).toBe('The requested item does not exist.')
})

test('resolveTitle prop may intentionally return an empty title', () => {
  const options: ApiErrorOptions = { i18n: { resolveTitle: () => '' } }
  const error = ApiError.getUnexpectedError(new Error('unexpected error'))

  expect(mapApiError(error, options).title).toBe('')
})

test('resolveMessage prop may intentionally return an empty message', () => {
  const options: ApiErrorOptions = { i18n: { resolveMessage: () => '' } }
  const error = ApiError.getUnexpectedError(new Error('unexpected error'))
  const mapped = mapApiError(error, options)

  expect(mapped.message).toBe('')
})

test('backend messages are exposed separately and are not shown by default', () => {
  const options: ApiErrorOptions = {
    i18n: {
      resolveMessage: (error) => {
        expect(error.statusText).toBe('Bad Request')
        expect(error.rawMessage).toBe('Internal backend details')
        return undefined
      },
    },
  }
  const mapResponseError = createFetchResponseErrorMapper(options)
  const mapped = mapResponseError(
    { status: 400, statusText: 'Bad Request' },
    { message: 'Internal backend details' },
  )

  expect(mapped.message).toBe('Business logic error')
  expect(mapped.details.rawMessage).toBe('Internal backend details')
})

test('HTTP titles fall back by status, server family, status text, then kind', () => {
  const mapResponseError = createFetchResponseErrorMapper()

  expect(mapResponseError({ status: 404 }).title).toBe('Not found')
  expect(mapResponseError({ status: 599 }).title).toBe('Server error')
  expect(mapResponseError({ status: 418, statusText: "I'm a Teapot" }).title).toBe("I'm a Teapot")
  expect(mapResponseError({ status: 418 }).title).toBe('Request failed')
})

test('mapped errors expose independent built-in titles and messages', () => {
  const mapResponseError = createFetchResponseErrorMapper()
  const mapped = mapResponseError({ status: 404 })

  expect(mapped.title).toBe('Not found')
  expect(mapped.message).toBe('Requested resource was not found')
  expect(mapped.details.statusCode).toBe(404)
})

test('maps configured titles and messages by kind and status', () => {
  const options: ApiErrorOptions = {
    i18n: {
      titles: TITLES,
      statusTitles: {
        503: 'Temporarily unavailable',
        504: 'Request timed out',
      },
      messages: MESSAGES,
      statusMessages: {
        503: 'The service is temporarily unavailable.',
        504: 'The request took too long.',
      },
    },
  }

  const mapResponseError = createFetchResponseErrorMapper(options)

  for (const [status, title, defaultMessage] of HTTP_CASES) {
    const message = options.i18n?.statusMessages?.[status] ?? defaultMessage

    expect(mapResponseError({ status })).toMatchObject({
      title,
      message,
      details: { statusCode: status },
    })
  }

  expect(mapApiError(ApiError.getNetworkError(new TypeError(), options), options)).toMatchObject({
    title: 'Connection problem',
    message: 'Check your internet connection and try again.',
  })

  expect(mapApiError(ApiError.getUnexpectedError(new Error(), options), options)).toMatchObject({
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  })
})

test('maps titles and messages with resolvers', () => {
  const options: ApiErrorOptions = {
    i18n: {
      resolveTitle: ({ kind, statusCode }) => {
        if (statusCode === 503) {
          return 'Temporarily unavailable'
        }
        if (statusCode === 504) {
          return 'Request timed out'
        }
        return TITLES[kind]
      },
      resolveMessage: ({ kind }) => {
        return MESSAGES[kind]
      },
    },
  }

  const mapResponseError = createFetchResponseErrorMapper(options)

  for (const [status, title, message] of HTTP_CASES) {
    expect(mapResponseError({ status })).toMatchObject({
      title,
      message,
      details: { statusCode: status },
    })
  }

  expect(mapApiError(ApiError.getNetworkError(new TypeError()), options)).toMatchObject({
    title: 'Connection problem',
    message: 'Check your internet connection and try again.',
  })

  expect(mapApiError(ApiError.getUnexpectedError(new Error()), options)).toMatchObject({
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  })
})
