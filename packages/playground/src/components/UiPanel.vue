<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui'

const props = withDefaults(defineProps<PrimitiveProps>(), { as: 'div' })
</script>

<template>
  <Primitive v-bind="props" class="ui-panel">
    <slot />
  </Primitive>
</template>

<style scoped>
.ui-panel {
  padding: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  background: var(--vp-c-bg-elv);
}

@media (min-width: 640px) {
  .ui-panel {
    padding: 1.5rem;
  }
}
</style>
