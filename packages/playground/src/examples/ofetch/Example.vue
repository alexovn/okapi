<script setup lang="ts">
import RequestPanel from '../../components/RequestPanel.vue'
import { useErrorOptions } from '../../shared/errors'
import { createOfetchClient } from './client'

const request = createOfetchClient(useErrorOptions())
</script>

<template>
  <RequestPanel :request />
</template>
