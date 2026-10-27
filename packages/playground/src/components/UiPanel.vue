<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui'

const props = withDefaults(defineProps<PrimitiveProps>(), { as: 'div' })
</script>

<template>
  <Primitive v-bind="props" class="rounded-xl border border-divider bg-surface p-5 sm:p-6">
    <slot />
  </Primitive>
</template>
