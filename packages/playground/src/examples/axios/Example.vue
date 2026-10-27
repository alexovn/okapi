<script setup lang="ts">
import RequestPanel from '../../components/RequestPanel.vue'
import { useErrorOptions } from '../../shared/errors'
import { createAxiosClient } from './client'

const request = createAxiosClient(useErrorOptions())
</script>

<template>
  <RequestPanel :request />
</template>
