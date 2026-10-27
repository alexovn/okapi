<script setup lang="ts" generic="T extends string">
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  options: readonly { value: T; label: string; disabled?: boolean }[]
  placeholder?: string
  disabled?: boolean
}>()

const model = defineModel<T>({ required: true })

const selectedLabel = computed(() => {
  return props.options.find((option) => option.value === model.value)?.label
})
</script>

<template>
  <SelectRoot v-model="model" :disabled="disabled">
    <SelectTrigger
      v-bind="$attrs"
      class="inline-flex min-w-0 items-center justify-between gap-3 rounded-lg border border-edge bg-surface px-3 py-2 text-left text-sm font-normal text-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span class="truncate">
        <SelectValue :placeholder="placeholder">{{ selectedLabel }}</SelectValue>
      </span>

      <SelectIcon class="shrink-0 text-muted">
        <svg
          aria-hidden="true"
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        position="popper"
        align="start"
        :side-offset="6"
        :collision-padding="8"
        class="z-50 flex max-h-[min(20rem,var(--reka-select-content-available-height))] min-w-(--reka-select-trigger-width) max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-lg border border-divider bg-surface text-sm text-ink shadow-lg"
      >
        <SelectScrollUpButton
          class="flex h-6 shrink-0 items-center justify-center text-muted"
          aria-hidden="true"
        >
          ▴
        </SelectScrollUpButton>

        <SelectViewport class="min-h-0 p-1">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            :text-value="option.label"
            class="relative cursor-pointer rounded-md py-2 pr-3 pl-8 outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-brand-soft data-highlighted:text-brand"
          >
            <SelectItemIndicator class="absolute left-2" aria-hidden="true">
              ✓
            </SelectItemIndicator>

            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>

        <SelectScrollDownButton
          class="flex h-6 shrink-0 items-center justify-center text-muted"
          aria-hidden="true"
        >
          ▾
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
