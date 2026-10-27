<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { customKindFixture, mapCustomFixture, validationFixture } from '../shared/customization'
import { formatJson, useErrorOptions } from '../shared/errors'
import ErrorResult from './ErrorResult.vue'
import UiPanel from './UiPanel.vue'
import UiSelect from './UiSelect.vue'

const { t } = useI18n()
const mode = ref<'kind' | 'validation'>('kind')
const options = useErrorOptions<'subscription-expired'>()
const result = computed(() => mapCustomFixture(mode.value, options))
</script>

<template>
  <UiPanel as="section" class="space-y-5">
    <div>
      <h2 class="text-lg font-semibold">{{ t('custom.title') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('custom.description') }}</p>
    </div>
    <div class="space-y-2 text-sm font-medium">
      <label for="customization-select" class="block">{{ t('custom.example') }}</label>
      <UiSelect
        id="customization-select"
        v-model="mode"
        :options="[
          { value: 'kind', label: t('custom.kind') },
          { value: 'validation', label: t('custom.validation') },
        ]"
        class="w-full sm:w-auto"
      />
    </div>
    <p class="text-sm text-muted">{{ t(`custom.${mode}Help`) }}</p>
    <details>
      <summary class="cursor-pointer text-sm font-medium">{{ t('custom.input') }}</summary>
      <pre
        class="output mt-3"
        v-text="formatJson(mode === 'kind' ? customKindFixture : validationFixture)"
      />
    </details>
    <ErrorResult :error="result" />
  </UiPanel>
</template>
