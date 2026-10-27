<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { caughtError, formatJson, type PlaygroundError } from '../shared/errors'
import { scenarios, scenarioUrl, type RequestClient, type RequestResult } from '../shared/requests'
import ErrorResult from './ErrorResult.vue'
import ErrorToast from './ErrorToast.vue'
import UiButton from './UiButton.vue'
import UiSelect from './UiSelect.vue'

const props = defineProps<{ request: RequestClient }>()

const { t } = useI18n()

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
  return scenarios.map((item) => ({ value: item.id, label: t(`scenarios.${item.id}`) }))
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
  <section :aria-busy="pending" class="space-y-5">
    <form class="flex flex-wrap items-end gap-3" @submit.prevent="run">
      <div class="min-w-48 flex-1 space-y-2 text-sm font-medium">
        <label for="scenario-select" class="block">{{ t('ui.scenario') }}</label>
        <UiSelect
          id="scenario-select"
          v-model="selected"
          :disabled="pending"
          :options="scenarioOptions"
          class="w-full"
        />
      </div>

      <div class="flex items-center gap-3">
        <UiButton variant="primary" :disabled="pending" type="submit">
          {{ t(pending ? 'ui.running' : 'ui.run') }}
        </UiButton>

        <UiButton v-if="pending" type="button" @click="controller?.abort()">
          {{ t('ui.cancel') }}
        </UiButton>

        <UiButton v-else type="button" :disabled="!result && !error" @click="clear">
          {{ t('ui.clear') }}
        </UiButton>
      </div>
    </form>

    <p class="break-all rounded-lg bg-soft px-3 py-2 font-mono text-xs text-muted">
      GET {{ scenarioUrl(scenario) }}
    </p>

    <p v-if="pending" role="status" class="py-8 text-center text-sm text-muted">
      {{ t('ui.waiting') }}
    </p>

    <ErrorResult v-else-if="error" :error />

    <div v-else-if="result" class="space-y-3">
      <p role="status" class="text-sm font-medium text-success">
        {{ t('ui.success') }} · {{ result.status }}
      </p>

      <pre
        class="output"
        v-text="result.status === 204 ? t('ui.empty') : formatJson(result.body)"
      />
    </div>

    <p
      v-else
      class="rounded-lg border border-dashed border-divider py-10 text-center text-sm text-muted"
    >
      {{ t('ui.ready') }}
    </p>

    <ErrorToast v-if="error" :error :sequence />
  </section>
</template>
