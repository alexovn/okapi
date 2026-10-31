<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'

import { caughtError, formatJson, type PlaygroundError } from '../shared/errors'
import { scenarios, scenarioUrl, type RequestClient, type RequestResult } from '../shared/requests'
import ErrorResult from './ErrorResult.vue'
import ErrorToast from './ErrorToast.vue'
import UiButton from './UiButton.vue'
import UiSelect from './UiSelect.vue'

const props = defineProps<{ request: RequestClient }>()

const selected = ref('200')
const scenario = computed(() => scenarios.find(({ id }) => id === selected.value) ?? scenarios[0]!)
const pending = ref(false)
const result = shallowRef<RequestResult>()
const error = shallowRef<PlaygroundError>()
const sequence = ref(0)

let controller: AbortController | undefined
let active = true

async function run() {
  if (pending.value) {
    return
  }
  result.value = undefined
  error.value = undefined
  const current = new AbortController()
  controller = current
  pending.value = true

  try {
    const response = await props.request(scenarioUrl(scenario.value), {
      signal: current.signal,
      timeoutMs: scenario.value.timeoutMs,
      format: scenario.value.format,
    })
    if (active) {
      result.value = response
    }
  } catch (cause) {
    if (active) {
      error.value = caughtError(cause)
      sequence.value++
    }
  } finally {
    if (active) {
      pending.value = false
    }
    if (controller === current) {
      controller = undefined
    }
  }
}

const scenarioOptions = computed(() => {
  return scenarios.map((item) => ({ value: item.id, label: item.label }))
})

function clear() {
  result.value = undefined
  error.value = undefined
}

onBeforeUnmount(() => {
  active = false
  controller?.abort()
})
</script>

<template>
  <section :aria-busy="pending" class="request-panel">
    <form class="request-panel__form" @submit.prevent="run">
      <div class="request-panel__field">
        <label for="scenario-select" class="request-panel__label">Request scenario</label>
        <UiSelect
          id="scenario-select"
          v-model="selected"
          :disabled="pending"
          :options="scenarioOptions"
          class="request-panel__select"
        />
      </div>

      <div class="request-panel__actions">
        <UiButton variant="primary" :disabled="pending" type="submit">
          {{ pending ? 'Running…' : 'Run request' }}
        </UiButton>

        <UiButton v-if="pending" type="button" @click="controller?.abort()"> Cancel </UiButton>

        <UiButton v-else type="button" :disabled="!result && !error" @click="clear">
          Clear
        </UiButton>
      </div>
    </form>

    <p class="request-panel__url">GET {{ scenarioUrl(scenario) }}</p>

    <p v-if="pending" role="status" class="request-panel__pending">Waiting for a response…</p>

    <ErrorResult v-else-if="error" :error />

    <div v-else-if="result" class="request-panel__result">
      <p role="status" class="request-panel__success">Request succeeded · {{ result.status }}</p>

      <pre
        class="request-panel__output"
        v-text="result.status === 204 ? 'No response body.' : formatJson(result.body)"
      />
    </div>

    <p v-else class="request-panel__empty">Choose a scenario and run a request.</p>

    <ErrorToast v-if="error" :error :sequence />
  </section>
</template>

<style scoped>
.request-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.request-panel__form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
}

.request-panel__field {
  flex: 1;
  min-width: min(12rem, 100%);
}

.request-panel__label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.request-panel__select) {
  width: 100%;
}

.request-panel__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.request-panel__url {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 0.75rem;
  word-break: break-all;
}

.request-panel__pending {
  padding-block: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.request-panel__result {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-panel__success {
  color: var(--vp-c-success-1);
  font-size: 0.875rem;
  font-weight: 500;
}

.request-panel__empty {
  padding: 2.5rem 1rem;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.request-panel__output {
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
</style>
