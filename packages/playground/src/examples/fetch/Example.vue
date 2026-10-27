<script setup lang="ts">
import RequestPanel from '../../components/RequestPanel.vue'
import { useErrorOptions } from '../../shared/errors'
import { createFetchClient } from './client'

const request = createFetchClient(useErrorOptions())
</script>

<template>
  <RequestPanel :request="request" />
</template>
