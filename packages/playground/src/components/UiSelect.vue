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
    <SelectTrigger v-bind="$attrs" class="ui-select">
      <span class="ui-select__value">
        <SelectValue :placeholder="placeholder">{{ selectedLabel }}</SelectValue>
      </span>

      <SelectIcon class="ui-select__icon">
        <svg
          aria-hidden="true"
          class="ui-select__chevron"
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
        class="ui-select__menu"
      >
        <SelectScrollUpButton class="ui-select__scroll" aria-hidden="true">
          ▴
        </SelectScrollUpButton>

        <SelectViewport class="ui-select__viewport">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            :text-value="option.label"
            class="ui-select__option"
          >
            <SelectItemIndicator class="ui-select__indicator" aria-hidden="true">
              ✓
            </SelectItemIndicator>

            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>

        <SelectScrollDownButton class="ui-select__scroll" aria-hidden="true">
          ▾
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style>
.ui-select {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.5rem;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
}

.ui-select__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-select__icon {
  flex-shrink: 0;
  color: var(--vp-c-text-2);
}

.ui-select__chevron {
  display: block;
  width: 1rem;
  height: 1rem;
}

.ui-select__menu {
  z-index: 50;
  display: flex;
  flex-direction: column;
  max-height: min(20rem, var(--reka-select-content-available-height));
  min-width: var(--reka-select-trigger-width);
  max-width: calc(100vw - 1rem);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.5rem;
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-base, 'Inter', ui-sans-serif, system-ui, sans-serif);
  font-size: 0.875rem;
  line-height: 1.5;
  box-shadow:
    0 10px 15px -3px #0000001a,
    0 4px 6px -4px #0000001a;
}

.ui-select__scroll {
  display: flex;
  height: 1.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
}

.ui-select__viewport {
  min-height: 0;
  padding: 0.25rem;
}

.ui-select__option {
  position: relative;
  padding: 0.5rem 0.75rem 0.5rem 2rem;
  border-radius: 0.375rem;
  outline: none;
  cursor: pointer;
  user-select: none;
}

.ui-select__option[data-disabled] {
  pointer-events: none;
  opacity: 0.5;
}

.ui-select__option[data-highlighted] {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.ui-select__indicator {
  position: absolute;
  left: 0.5rem;
}
</style>
