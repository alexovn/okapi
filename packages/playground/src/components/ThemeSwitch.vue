<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const storageKey = 'okapi-playground-theme'

const darkMode = ref(initialDarkMode())

function initialDarkMode(): boolean {
  try {
    const theme = localStorage.getItem(storageKey)
    if (theme === 'dark' || theme === 'light') {
      return theme === 'dark'
    }
  } catch {
    // The switch also works when browser storage is unavailable.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

watchEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode.value)
  try {
    localStorage.setItem(storageKey, darkMode.value ? 'dark' : 'light')
  } catch {
    // Keep the current session's theme even if it cannot be saved.
  }
})
</script>

<template>
  <div class="space-y-2 text-xs font-medium text-muted">
    <label for="theme-switch" class="block">{{ t('ui.darkMode') }}</label>

    <div class="flex h-9 items-center justify-end">
      <SwitchRoot
        id="theme-switch"
        v-model="darkMode"
        :aria-label="t('ui.darkMode')"
        class="h-6 w-11 rounded-full bg-default p-0.5 transition-colors data-[state=checked]:bg-brand-solid motion-reduce:transition-none"
      >
        <SwitchThumb
          class="block size-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5 motion-reduce:transition-none"
        />
      </SwitchRoot>
    </div>
  </div>
</template>
