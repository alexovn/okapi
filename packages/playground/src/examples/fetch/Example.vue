<script setup lang="ts">
import RequestPanel from '../../components/RequestPanel.vue'
import { createFetchClient } from './client'

const request = createFetchClient()
</script>

<template>
  <RequestPanel :request="request" />
</template>
