import { describe, expect, test } from 'vitest'

import { OkapiError, mapOkapiError } from '../src'
import type { OkapiErrorOptions } from '../src'
import { createFetchErrorMapper, createFetchResponseErrorMapper } from '../src/adapters/fetch'
import { TITLES, MESSAGES, HTTP_CASES } from './constants'

describe('i18n', () => {
  describe('custom error kinds', () => {
    test('translates consumer-defined error kinds', () => {
      type AppErrorKind = 'project-archived'

      const options: OkapiErrorOptions<AppErrorKind> = {
        i18n: {
          titles: { 'project-archived': 'Project archived' },
          messages: { 'project-archived': 'Restore the project to continue.' },
        },
      }
      const error = new OkapiError<AppErrorKind>({
        kind: 'project-archived',
        message: 'This project has been archived.',
      })

      expect(mapOkapiError(error, options)).toMatchObject({
        title: 'Project archived',
        message: 'Restore the project to continue.',
      })
    })
  })

  describe('title and message resolution', () => {
    test('resolvers take precedence over configured titles and messages', () => {
      const options: OkapiErrorOptions = {
        i18n: {
          resolveTitle: () => 'Project unavailable',
          resolveMessage: () => 'This project has been archived.',
          titles: { 'not-found': 'Resource not found' },
          statusTitles: { 404: 'Page not found' },
          messages: { 'not-found': 'The requested project could not be found.' },
          statusMessages: { 404: 'The page is unavailable.' },
        },
      }

      const error = OkapiError.getHttpResponseError(404, 'Not Found')
      expect(mapOkapiError(error, options)).toMatchObject({
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
      const options: OkapiErrorOptions = {
        i18n: {
          titles: { 'not-found': 'Not here' },
          statusTitles: { 404: 'Missing' },
          messages: { 'not-found': 'The requested item does not exist.' },
        },
      }
      const error = OkapiError.getHttpResponseError(404, undefined, undefined, options)
      expect(error.message).toBe('The requested item does not exist.')

      const mapped = mapOkapiError(error, options)
      expect(mapped.title).toBe('Missing')
      expect(mapped.message).toBe('The requested item does not exist.')
    })

    test('resolveTitle prop may intentionally return an empty title', () => {
      const options: OkapiErrorOptions = { i18n: { resolveTitle: () => '' } }
      const error = OkapiError.getUnexpectedError(new Error('unexpected error'))

      expect(mapOkapiError(error, options).title).toBe('')
    })

    test('resolveMessage prop may intentionally return an empty message', () => {
      const options: OkapiErrorOptions = { i18n: { resolveMessage: () => '' } }
      const error = OkapiError.getUnexpectedError(new Error('unexpected error'))
      const mapped = mapOkapiError(error, options)

      expect(mapped.message).toBe('')
    })

    test('backend messages are exposed separately and are not shown by default', () => {
      const options: OkapiErrorOptions = {
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
      expect(mapResponseError({ status: 418, statusText: "I'm a Teapot" }).title).toBe(
        "I'm a Teapot",
      )
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
      const options: OkapiErrorOptions = {
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

      expect(
        mapOkapiError(OkapiError.getNetworkError(new TypeError(), options), options),
      ).toMatchObject({
        title: 'Connection problem',
        message: 'Check your internet connection and try again.',
      })

      expect(
        mapOkapiError(OkapiError.getUnexpectedError(new Error(), options), options),
      ).toMatchObject({
        title: 'Something went wrong',
        message: 'An unexpected error occurred. Please try again.',
      })
    })

    test('maps titles and messages with resolvers', () => {
      const options: OkapiErrorOptions = {
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

      expect(mapOkapiError(OkapiError.getNetworkError(new TypeError()), options)).toMatchObject({
        title: 'Connection problem',
        message: 'Check your internet connection and try again.',
      })

      expect(mapOkapiError(OkapiError.getUnexpectedError(new Error()), options)).toMatchObject({
        title: 'Something went wrong',
        message: 'An unexpected error occurred. Please try again.',
      })
    })
  })
})
