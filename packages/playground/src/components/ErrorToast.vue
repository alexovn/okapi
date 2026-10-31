<script setup lang="ts">
import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from 'reka-ui'

import type { PlaygroundError } from '../shared/errors'
import UiButton from './UiButton.vue'

defineProps<{ error: PlaygroundError; sequence: number }>()
</script>

<template>
  <ToastRoot :key="sequence" class="error-toast" :duration="6000">
    <div class="error-toast__content">
      <div>
        <ToastTitle class="error-toast__title">
          {{ error.title }}
        </ToastTitle>

        <ToastDescription class="error-toast__description">
          {{ error.message }}
        </ToastDescription>
      </div>

      <ToastClose as-child>
        <UiButton variant="ghost">Dismiss</UiButton>
      </ToastClose>
    </div>
  </ToastRoot>

  <ToastViewport label="Notifications (F8)" class="error-toast__viewport" />
</template>

<style>
.error-toast {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  box-shadow:
    0 10px 15px -3px #0000001a,
    0 4px 6px -4px #0000001a;
}

.error-toast__content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.error-toast__title {
  font-weight: 600;
}

.error-toast__description {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.error-toast__viewport {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 50;
  width: calc(100% - 2rem);
  max-width: 24rem;
  margin: 0;
  padding: 0;
  list-style: none;
  outline: none;
  font-family: var(--vp-font-family-base, 'Inter', ui-sans-serif, system-ui, sans-serif);
  line-height: 1.5;
}
</style>
