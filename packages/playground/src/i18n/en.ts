export default {
  ui: {
    pageTitle: 'Okapi playground',
    title: 'Error handling, made clear',
    description:
      'Try the same request with different HTTP clients. Inspect the response and see how Okapi turns failures into useful errors',
    darkMode: 'Dark mode',
    language: 'Language',
    adapters: 'HTTP client',
    scenario: 'Request scenario',
    run: 'Run request',
    running: 'Running…',
    cancel: 'Cancel',
    clear: 'Clear',
    waiting: 'Waiting for a response…',
    success: 'Request succeeded',
    empty: 'No response body.',
    ready: 'Choose a scenario and run a request.',
    mappedError: 'Mapped error',
    raw: 'Raw response',
    validationErrors: 'Validation errors',
    dismiss: 'Dismiss',
    notification: 'Notification',
    notifications: 'Notifications ({hotkey})',
    service: 'Live responses from',
  },
  fields: {
    type: 'Type',
    kind: 'Kind',
    source: 'Source',
    status: 'Status',
  },
  scenarios: {
    '200': '200 · Success',
    '204': '204 · No content',
    '400': '400 · Bad request',
    '401': '401 · Unauthorized',
    '403': '403 · Forbidden',
    '404': '404 · Not found',
    '409': '409 · Conflict',
    '418': '418 · I’m a teapot',
    '422': '422 · Validation',
    '429': '429 · Rate limited',
    '500': '500 · Server error',
    '503': '503 · Service unavailable',
    text: '500 · Plain-text HTTP error',
    slow: 'Slow success · 3 seconds (try Cancel)',
    timeout: 'Timeout · 1 second limit, 3 second response',
  },
  custom: {
    title: 'Core customization',
    description:
      'Local fixtures · No network request. These examples use Okapi’s core APIs directly.',
    example: 'Example',
    kind: 'Custom error kind',
    validation: 'Custom validation parser',
    kindHelp:
      'resolveKind maps an API code to subscription-expired instead of the default forbidden kind.',
    validationHelp: 'parseValidationErrors converts an array of field errors into a dictionary.',
    input: 'Input fixture',
  },
  errors: {
    network: {
      title: 'Connection problem',
      message: 'Check your internet connection and try again.',
    },
    abort: {
      title: 'Request cancelled',
      message: 'The request was cancelled before it completed.',
    },
    timeout: {
      title: 'Request timed out',
      message: 'The response took too long. Please try again.',
    },
    unauthorized: {
      title: 'Authentication required',
      message: 'Sign in to continue.',
    },
    forbidden: {
      title: 'Access denied',
      message: 'You do not have permission to perform this action.',
    },
    'not-found': {
      title: 'Not found',
      message: 'The requested resource could not be found.',
    },
    validation: {
      title: 'Check your input',
      message: 'Some fields contain invalid values.',
    },
    conflict: {
      title: 'Conflict',
      message: 'The request conflicts with the current resource state.',
    },
    'rate-limited': {
      title: 'Too many requests',
      message: 'Please wait before trying again.',
    },
    business: {
      title: 'Request failed',
      message: 'The request could not be completed.',
    },
    server: {
      title: 'Server error',
      message: 'We could not complete your request. Please try again.',
    },
    unexpected: {
      title: 'Unexpected error',
      message: 'Something went wrong. Please try again.',
    },
    'subscription-expired': {
      title: 'Subscription expired',
      message: 'Renew your subscription to continue.',
    },
  },
}
