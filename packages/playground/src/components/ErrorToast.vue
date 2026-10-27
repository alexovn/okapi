<script setup lang="ts">
import { mapOkapiError } from '@alexovn/okapi'
import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from 'reka-ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { type PlaygroundError, useErrorOptions } from '../shared/errors'
import UiButton from './UiButton.vue'

const props = defineProps<{ error: PlaygroundError; sequence: number }>()

const { t } = useI18n()
const options = useErrorOptions<'subscription-expired'>()

const mapped = computed(() => mapOkapiError(props.error.details, options))
</script>

<template>
  <ToastRoot
    :key="sequence"
    class="rounded-xl border border-divider bg-surface p-4 shadow-lg"
    :duration="6000"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <ToastTitle class="font-semibold">
          {{ mapped.title }}
        </ToastTitle>

        <ToastDescription class="mt-1 text-sm text-muted">
          {{ mapped.message }}
        </ToastDescription>
      </div>

      <ToastClose as-child>
        <UiButton variant="ghost">{{ t('ui.dismiss') }}</UiButton>
      </ToastClose>
    </div>
  </ToastRoot>

  <ToastViewport
    :label="t('ui.notifications', { hotkey: 'F8' })"
    class="fixed right-4 bottom-4 z-50 m-0 w-[calc(100%-2rem)] max-w-sm list-none outline-none"
  />
</template>
