<script setup lang="ts">
import { mapOkapiError } from '@alexovn/okapi'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { PlaygroundError } from '../shared/errors'
import { formatJson, useErrorOptions } from '../shared/errors'

const props = defineProps<{ error: PlaygroundError }>()

const { t } = useI18n()
const options = useErrorOptions<'subscription-expired'>()

const mapped = computed(() => mapOkapiError(props.error.details, options))
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-lg border border-danger/25 bg-danger-soft p-4" role="status">
      <h3 class="font-semibold text-danger">{{ mapped.title }}</h3>
      <p class="mt-1 text-sm text-danger">{{ mapped.message }}</p>
    </div>

    <dl class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
      <div
        v-for="(value, key) in {
          type: mapped.type,
          kind: mapped.details.kind,
          source: mapped.details.source,
          status: mapped.details.statusCode ?? '—',
        }"
        :key="key"
      >
        <dt class="text-muted">{{ t(`fields.${key}`) }}</dt>
        <dd class="mt-1 wrap-break-word font-mono text-xs">{{ value }}</dd>
      </div>
    </dl>

    <details>
      <summary class="cursor-pointer text-sm font-medium">{{ t('ui.mappedError') }}</summary>
      <pre class="output mt-3" v-text="formatJson(mapped)" />
    </details>

    <details v-if="mapped.details.raw !== undefined">
      <summary class="cursor-pointer text-sm font-medium">{{ t('ui.raw') }}</summary>
      <pre class="output mt-3" v-text="formatJson(mapped.details.raw)" />
    </details>

    <div v-if="mapped.errors !== undefined">
      <h4 class="mb-2 text-sm font-medium">{{ t('ui.validationErrors') }}</h4>
      <pre class="output" v-text="formatJson(mapped.errors)" />
    </div>
  </div>
</template>
