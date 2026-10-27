import { createApp } from 'vue'

import App from './App.vue'
import { createPlaygroundI18n } from './i18n'

import './style.css'

createApp(App).use(createPlaygroundI18n()).mount('#app')
