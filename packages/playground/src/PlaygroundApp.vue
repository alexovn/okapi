<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger, ToastProvider } from 'reka-ui'

import UiPanel from './components/UiPanel.vue'
import { adapters } from './examples'

import './style.css'
</script>

<template>
  <ToastProvider label="Notification">
    <div class="playground-app">
      <UiPanel as-child>
        <TabsRoot default-value="fetch">
          <TabsList aria-label="HTTP client" class="playground-app__tabs">
            <TabsTrigger
              v-for="adapter in adapters"
              :key="adapter.id"
              :value="adapter.id"
              class="playground-app__tab"
            >
              {{ adapter.label }}
            </TabsTrigger>
          </TabsList>

          <TabsContent v-for="adapter in adapters" :key="adapter.id" :value="adapter.id">
            <component :is="adapter.component" />
          </TabsContent>
        </TabsRoot>
      </UiPanel>

      <footer class="playground-app__footer">
        <div>
          <span> Live responses from </span>
          <a
            class="playground-app__service"
            href="https://httpstatus.codes/"
            target="_blank"
            rel="noreferrer"
          >
            httpstatus.codes
          </a>
        </div>
      </footer>
    </div>
  </ToastProvider>
</template>

<style scoped>
.playground-app {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  line-height: 1.5;
}

.playground-app__tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.playground-app__tab {
  margin-bottom: -1px;
  padding: 0.75rem;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--vp-c-text-2);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.playground-app__tab[data-state='active'] {
  border-bottom-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.playground-app__footer {
  text-align: center;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.playground-app__service {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.playground-app__service:hover {
  color: var(--vp-c-text-1);
}
</style>
