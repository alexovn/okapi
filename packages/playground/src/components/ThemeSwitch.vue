<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { ref, watchEffect } from 'vue'

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
  <div class="theme-switch">
    <label for="theme-switch" class="theme-switch__label">Dark mode</label>

    <div class="theme-switch__control">
      <SwitchRoot
        id="theme-switch"
        v-model="darkMode"
        aria-label="Dark mode"
        class="theme-switch__switch"
      >
        <SwitchThumb class="theme-switch__thumb" />
      </SwitchRoot>
    </div>
  </div>
</template>

<style scoped>
.theme-switch {
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  font-weight: 500;
}

.theme-switch__label {
  display: block;
  margin-bottom: 0.5rem;
}

.theme-switch__control {
  display: flex;
  height: 2.25rem;
  align-items: center;
  justify-content: flex-end;
}

.theme-switch__switch {
  width: 2.75rem;
  height: 1.5rem;
  padding: 2px;
  border: 0;
  border-radius: 999px;
  background: var(--vp-c-default-3);
  cursor: pointer;
  transition: background-color 150ms;
}

.theme-switch__switch[data-state='checked'] {
  background: var(--vp-c-brand-3);
}

.theme-switch__thumb {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px #0000000d;
  transition: transform 150ms;
}

.theme-switch__thumb[data-state='checked'] {
  transform: translateX(1.25rem);
}

@media (prefers-reduced-motion: reduce) {
  .theme-switch__switch,
  .theme-switch__thumb {
    transition: none;
  }
}
</style>
