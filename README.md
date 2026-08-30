![Okapi banner](./.github/assets/okapi-banner.jpg)

# Okapi

A library for handling API and HTTP errors with ease.

## Features

- Framework agnostic
- Fully typed
- i18n support
- Built-in adapters for popular fetching libraries (axios, ofetch etc.)
- Customizable. Set up your own error kinds and validation-error formats

## Installation

```shell
npm install @alexovn/okapi
```

> ⚠️ Fetching data libraries like `Axios` or `ofetch` should be installed separately.

## Quick Start

Use an adapter mapper to turn a library-specific error into a consistent object for your UI:

```ts
import axios from 'axios'
import { createAxiosErrorMapper } from '@alexovn/okapi/axios'
import { notify } from './notificationService' // your notification service

const mapAxiosError = createAxiosErrorMapper({
  i18n: {
    titles: {
      'not-found': 'Not found',
      network: 'Connection problem',
    },
    statusTitles: {
      503: 'Temporarily unavailable',
    },
    messages: {
      'not-found': 'The requested resource was not found.',
      network: 'Check your internet connection and try again.',
    },
    statusMessages: {
      503: 'The service is temporarily unavailable. Please try again later.',
    },
  },
})

async function saveProfile() {
  try {
    const response = await axios.post('/api/profile', {
      email: 'invalid',
    })
    return response.data
  } catch (error) {
    const mappedError = mapAxiosError(error)

    notify({
      title: mappedError.title,
      message: mappedError.message
    })
  }
}
```

## Documentation

Take a look at [Okapi documentation](https://alexovn.github.io/okapi/). There you can find all necessary information about library usage with comprehensive examples.

## Development

- Clone this repository
- Enable Corepack using `corepack enable`
- Install dependencies using `pnpm install`

## Inspirations

This library was inspired by article
["API Error Handling Demystified: Don’t Just Fetch — Handle in JS & TS"](https://medium.com/@tanguyfab/api-error-handling-demystified-dont-just-fetch-handle-in-js-ts-7938ee22afb9)
by [Tanguy Fabien](https://github.com/fabien-tanguy).

## License

Made with ❤️

Published under the [MIT license](https://github.com/alexovn/okapi/LICENSE).
