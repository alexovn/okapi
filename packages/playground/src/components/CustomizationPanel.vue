<script setup lang="ts">
import { computed, ref } from 'vue'

import { customKindFixture, mapCustomFixture, validationFixture } from '../shared/customization'
import { formatJson } from '../shared/errors'
import ErrorResult from './ErrorResult.vue'
import UiPanel from './UiPanel.vue'
import UiSelect from './UiSelect.vue'

const mode = ref<'kind' | 'validation'>('kind')
const result = computed(() => mapCustomFixture(mode.value))
</script>

<template>
  <UiPanel as="section" class="customization-panel">
    <div>
      <h2 class="customization-panel__title">Core customization</h2>
      <p class="customization-panel__description">
        Local fixtures · No network request. These examples use Okapi’s core APIs directly.
      </p>
    </div>
    <div class="customization-panel__field">
      <label for="customization-select" class="customization-panel__label">Example</label>
      <UiSelect
        id="customization-select"
        v-model="mode"
        :options="[
          { value: 'kind', label: 'Custom error kind' },
          { value: 'validation', label: 'Custom validation parser' },
        ]"
        class="customization-panel__select"
      />
    </div>
    <p class="customization-panel__help">
      {{
        mode === 'kind'
          ? 'resolveKind maps an API code to subscription-expired instead of the default forbidden kind.'
          : 'parseValidationErrors converts an array of field errors into a dictionary.'
      }}
    </p>
    <details>
      <summary class="customization-panel__summary">Input fixture</summary>
      <pre
        class="customization-panel__output"
        v-text="formatJson(mode === 'kind' ? customKindFixture : validationFixture)"
      />
    </details>
    <ErrorResult :error="result" />
  </UiPanel>
</template>

<style scoped>
.customization-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.customization-panel__label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.customization-panel__summary {
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.customization-panel__output {
  max-height: 20rem;
  margin: 0;
  overflow: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 0.75rem;
  line-height: 1.5rem;
  white-space: pre;
}

.customization-panel__output {
  margin-top: 0.75rem;
}

.customization-panel__title {
  font-size: 1.125rem;
  font-weight: 600;
}

.customization-panel__description {
  margin-top: 0.25rem;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

:deep(.customization-panel__select) {
  width: 100%;
}

.customization-panel__help {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  :deep(.customization-panel__select) {
    width: auto;
  }
}
</style>
