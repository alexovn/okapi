<script setup lang="ts">
import type { PlaygroundError } from '../shared/errors'
import { formatJson } from '../shared/errors'

defineProps<{ error: PlaygroundError }>()
</script>

<template>
  <div class="error-result">
    <div class="error-result__notice" role="status">
      <h3 class="error-result__title">{{ error.title }}</h3>
      <p class="error-result__message">{{ error.message }}</p>
    </div>

    <dl class="error-result__fields">
      <div
        v-for="(value, key) in {
          Type: error.type,
          Kind: error.details.kind,
          Source: error.details.source,
          Status: error.details.statusCode ?? '—',
        }"
        :key="key"
      >
        <dt class="error-result__label">{{ key }}</dt>
        <dd class="error-result__value">{{ value }}</dd>
      </div>
    </dl>

    <details>
      <summary class="error-result__summary">Mapped error</summary>
      <pre class="error-result__output error-result__output--details" v-text="formatJson(error)" />
    </details>

    <details v-if="error.details.raw !== undefined">
      <summary class="error-result__summary">Raw response</summary>
      <pre
        class="error-result__output error-result__output--details"
        v-text="formatJson(error.details.raw)"
      />
    </details>

    <div v-if="error.errors !== undefined">
      <h4 class="error-result__validation-title">Validation errors</h4>
      <pre class="error-result__output" v-text="formatJson(error.errors)" />
    </div>
  </div>
</template>

<style scoped>
.error-result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-result__notice {
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--vp-c-danger-1) 25%, transparent);
  border-radius: 0.5rem;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

.error-result__title {
  font-size: 1rem;
  font-weight: 600;
}

.error-result__message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.error-result__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  font-size: 0.875rem;
}

.error-result__label {
  color: var(--vp-c-text-2);
}

.error-result__value {
  margin-top: 0.25rem;
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 0.75rem;
  overflow-wrap: anywhere;
}

.error-result__summary {
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-result__validation-title {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-result__output {
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

.error-result__output--details {
  margin-top: 0.75rem;
}

@media (min-width: 640px) {
  .error-result__fields {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
