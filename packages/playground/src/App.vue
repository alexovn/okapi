<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger, ToastProvider } from 'reka-ui'
import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import ThemeSwitch from './components/ThemeSwitch.vue'
import UiPanel from './components/UiPanel.vue'
import UiSelect from './components/UiSelect.vue'
import { adapters } from './examples'

const { t, locale } = useI18n()
watchEffect(() => {
  document.documentElement.lang = locale.value
  document.title = t('ui.pageTitle')
})
</script>

<template>
  <ToastProvider :label="t('ui.notification')">
    <div
      class="mx-auto max-w-3xl min-h-screen flex flex-col justify-between gap-6 px-4 py-10 sm:px-6 sm:py-14"
    >
      <header class="space-y-5">
        <div class="flex items-start justify-between gap-4">
          <div class="pt-1">
            <a
              class="flex items-center gap-2 font-semibold"
              href="https://okapi.alexovn.dev/"
              target="_blank"
            >
              <img class="h-6 hidden dark:block" src="/okapi-logo-white.svg" alt="Okapi" />
              <img class="h-6 dark:hidden" src="/okapi-logo-black.svg" alt="Okapi" />

              <span>Okapi</span>
            </a>
          </div>

          <div class="flex items-start gap-5">
            <div class="space-y-2 text-xs font-medium text-muted">
              <label for="language-select" class="block">{{ t('ui.language') }}</label>
              <UiSelect
                id="language-select"
                v-model="locale"
                :options="[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Español' },
                ]"
              />
            </div>

            <ThemeSwitch />
          </div>
        </div>

        <div>
          <h1 class="text-3xl font-semibold tracking-tight">{{ t('ui.title') }}</h1>

          <p class="mt-2 max-w-lg text-sm leading-6 text-muted">
            {{ t('ui.description') }}
          </p>
        </div>
      </header>

      <main>
        <UiPanel as-child>
          <TabsRoot default-value="fetch">
            <TabsList
              :aria-label="t('ui.adapters')"
              class="mb-6 flex gap-1 border-b border-divider"
            >
              <TabsTrigger
                v-for="adapter in adapters"
                :key="adapter.id"
                :value="adapter.id"
                class="-mb-px border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted data-[state=active]:border-brand data-[state=active]:text-brand"
              >
                {{ adapter.label }}
              </TabsTrigger>
            </TabsList>

            <TabsContent v-for="adapter in adapters" :key="adapter.id" :value="adapter.id">
              <component :is="adapter.component" />
            </TabsContent>
          </TabsRoot>
        </UiPanel>
      </main>

      <footer class="mt-auto text-center text-xs text-muted">
        <div>
          <span>
            {{ t('ui.service') }}
          </span>
          <a
            class="underline underline-offset-2 hover:text-ink"
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
