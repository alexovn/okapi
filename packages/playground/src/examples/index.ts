import type { Component } from 'vue'

import AxiosExample from './axios/Example.vue'
import FetchExample from './fetch/Example.vue'
import OfetchExample from './ofetch/Example.vue'

export const adapters = [
  { id: 'fetch', label: 'Native fetch', component: FetchExample },
  { id: 'axios', label: 'Axios', component: AxiosExample },
  { id: 'ofetch', label: 'ofetch', component: OfetchExample },
] satisfies { id: string; label: string; component: Component }[]
