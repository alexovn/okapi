<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOfetch } from './utils/ofetch'

const { availableLocales, locale } = useI18n()
const { ofetchGet } = useOfetch()

const post = ref<unknown | null>(null)
const errorInfo = ref<unknown | null>(null)

function clearError() {
  errorInfo.value = null
}

async function fetchPost(options = { throwError: false }) {
  clearError()

  try {
    const res = await ofetchGet<any>(`https://jsonplaceholder.typicode.com/posts/${options.throwError ? '101' : '1'}`)
    post.value = res
  } catch (error) {
    errorInfo.value = error
    console.error('Failed to fetch post:', error)
  }
}
</script>

<template>
  <div class="wrapper">
    <label class="locale-switch">
      <span>
        Locale
      </span>

      <select v-model="locale">
        <option v-for="availableLocale in availableLocales" :key="availableLocale" :value="availableLocale">
          {{ availableLocale.toUpperCase() }}
        </option>
      </select>
    </label>

    <div class="actions">
      <button @click="fetchPost()">Fetch post</button>
      <button @click="fetchPost({ throwError: true })">Throw error</button>

      <button
        v-if="errorInfo"
        @click="clearError"
      >
        Clear error
      </button>
    </div>

    <div class="content">
      <div class="error-info" v-if="errorInfo">
        <code>
          {{ errorInfo }}
        </code>
      </div>

      <div v-if="post">
        {{ post }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.locale-switch {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.content {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-info {
  white-space: pre-wrap;
}
</style>
