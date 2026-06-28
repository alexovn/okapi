import { createApiErrorHandler, } from '../../lib'

export const apiErrors = createApiErrorHandler({
  resolveMessage: error => `API error: ${error.kind}`,
  resolveFactoryMessage: ({ kind }) => `API error: ${kind}`,
  resolveHttpMessage: ({ statusCode }) => {
    return statusCode ? `HTTP error ${statusCode}` : undefined
  },
})