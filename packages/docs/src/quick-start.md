# Quick Start

## Prerequisites

- [Node.js](https://nodejs.org/) version 22 or higher.

## Installation

Install the library using your preferred package manager.

::: code-group

```shell [npm]
npm install @alexovn/okapi
```

```shell [yarn]
yarn add @alexovn/okapi
```

```shell [pnpm]
pnpm add @alexovn/okapi
```

```shell [bun]
bun add @alexovn/okapi
```
:::

## Usage

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