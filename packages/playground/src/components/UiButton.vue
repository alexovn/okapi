<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { variant: 'secondary', type: 'button', disabled: false },
)

const variants = {
  primary:
    'border border-brand-solid bg-brand-solid px-4 py-2 text-on-brand hover:border-brand-hover hover:bg-brand-hover active:border-brand active:bg-brand',
  secondary: 'border border-edge bg-default px-4 py-2 text-ink hover:bg-default-hover',
  ghost: 'text-muted hover:text-ink',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
    :class="variants[variant]"
  >
    <slot />
  </button>
</template>
