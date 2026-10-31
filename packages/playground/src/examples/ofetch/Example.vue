<script setup lang="ts">
import RequestPanel from '../../components/RequestPanel.vue'
import { createOfetchClient } from './client'

const request = createOfetchClient()
</script>

<template>
  <RequestPanel :request />
</template>
