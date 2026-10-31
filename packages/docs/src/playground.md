---
layout: page
title: Playground
description: Try Okapi error handling with native fetch, Axios, and ofetch.
outline: false
---

<script setup>
import PlaygroundApp from '../../playground/src/PlaygroundApp.vue'
</script>

<div class="vp-raw">
  <div class="playground-page">
    <div class="playground-page__content">
      <header>
        <h1 class="playground-page__title">Error handling, made clear</h1>
        <p class="playground-page__description">
          Try the same request with different HTTP clients. Inspect the response and see how Okapi
          turns failures into useful errors
        </p>
      </header>
      <PlaygroundApp />
    </div>
  </div>
</div>

<style scoped>
.playground-page {
  padding: 48px 32px;
}

.playground-page__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 48rem;
  margin-inline: auto;
  padding: 0 2rem;
}

.playground-page__title {
  font-size: 2rem;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: -0.02em;
}

.playground-page__description {
  max-width: 32rem;
  margin-top: 1rem;
  color: var(--vp-c-text-2);
  font-size: 1rem;
  line-height: 28px;
}
</style>
