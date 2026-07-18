import { expect, test } from 'vitest'

import {
  ApiError,
  ApiErrorOptions,
  createFetchErrorMapper,
  createFetchResponseErrorMapper,
  mapApiError,
} from '../src'

test('resolveMessage prop handles HTTP errors', () => {
  const options: ApiErrorOptions = {
    i18n: {
      resolveMessage: ({ kind }) => {
        if (kind === 'not-found') {
          return 'foo'
        }
        return 'bar'
      },
    },
  }

  const error = ApiError.getHttpResponseError(404, 'Not Found')
  expect(mapApiError(error, options).message).toBe('foo')
})

test('messages prop handles HTTP errors', () => {
  const options: ApiErrorOptions = {
    i18n: {
      messages: { 'not-found': 'foo' },
    },
  }

  const error = ApiError.getHttpResponseError(404, 'Not Found')
  expect(mapApiError(error, options).message).toBe('foo')
})

test('statusMessages prop handles HTTP errors', () => {
  const options: ApiErrorOptions = {
    i18n: {
      statusMessages: { 404: 'foo' },
    },
  }

  const error = ApiError.getHttpResponseError(404, 'Not Found')
  expect(mapApiError(error, options).message).toBe('foo')
})

test('resolveMessage prop takes precedence over statusMessages and messages props', () => {
  const error = ApiError.getHttpResponseError(404, 'Not Found')

  expect(mapApiError(error, {
    i18n: {
      resolveMessage: ({ kind }) => {
        if (kind === 'not-found') {
          return 'foo'
        }
        return 'bar'
      },
      statusMessages: { 404: 'baz' },
      messages: { 'not-found': 'qux' },
    },
  }).message).toBe('foo')
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
        return 'Error'
      },
    },
  })

  // TypeError occurs when the fetch() API completely fails to make a network request.
  expect(mapError(new TypeError('network error')).message).toBe('Connection unavailable')
  expect(mapError(new Error('unexpected error')).message).toBe('Unexpected: unexpected error')
})

test('statusMessages prop takes precedence and works with low-level constructors', () => {
  const options: ApiErrorOptions = {
    i18n: {
      messages: { 'not-found': 'foo' },
      statusMessages: { 404: 'bar' },
    },
  }
  const error = ApiError.getHttpResponseError(404, undefined, undefined, options)

  expect(error.message).toBe('bar')
  expect(mapApiError(error, options).message).toBe('bar')
})

test('resolveMessage prop may intentionally return an empty message', () => {
  const options: ApiErrorOptions = {
    i18n: { resolveMessage: () => '' },
  }
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

test('HTTP messages fall back by status, server family, status text, then kind', () => {
  const mapResponseError = createFetchResponseErrorMapper()

  expect(mapResponseError({ status: 404 }).message).toBe('Not found')
  expect(mapResponseError({ status: 599 }).message).toBe('Server error')
  expect(mapResponseError({ status: 418, statusText: "I'm a Teapot" }).message).toBe("I'm a Teapot")
  expect(mapResponseError({ status: 418 }).message).toBe('Business logic error')
})
