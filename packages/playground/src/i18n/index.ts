import { createI18n } from 'vue-i18n'

import en from './en'
import es from './es'

export const messages = { en, es }

export function createPlaygroundI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages,
  })
}
