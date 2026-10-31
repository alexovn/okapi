<script setup lang="ts">
import RequestPanel from '../../components/RequestPanel.vue'
import { createAxiosClient } from './client'

const request = createAxiosClient()
</script>

<template>
  <RequestPanel :request />
</template>
