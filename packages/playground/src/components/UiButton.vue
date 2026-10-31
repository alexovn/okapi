<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { variant: 'secondary', type: 'button', disabled: false },
)
</script>

<template>
  <button :type="type" :disabled="disabled" class="ui-button" :class="`ui-button--${variant}`">
    <slot />
  </button>
</template>

<style scoped>
.ui-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
}

.ui-button--primary {
  border-color: var(--vp-c-brand-3);
  background: var(--vp-c-brand-3);
  color: var(--vp-button-brand-text);
}

.ui-button--primary:hover {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-2);
}

.ui-button--primary:active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
}

.ui-button--secondary {
  border-color: var(--vp-c-border);
  background: var(--vp-c-default-3);
  color: var(--vp-c-text-1);
}

.ui-button--secondary:hover {
  background: var(--vp-c-default-2);
}

.ui-button--ghost {
  padding: 0;
  background: transparent;
  color: var(--vp-c-text-2);
}

.ui-button--ghost:hover {
  color: var(--vp-c-text-1);
}
</style>
