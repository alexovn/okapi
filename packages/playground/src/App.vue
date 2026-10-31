<script setup lang="ts">
import ThemeSwitch from './components/ThemeSwitch.vue'
import PlaygroundApp from './PlaygroundApp.vue'
</script>

<template>
  <div class="app">
    <header class="app__header">
      <div class="app__toolbar">
        <div class="app__brand">
          <a class="app__home" href="https://okapi.alexovn.dev/" target="_blank">
            <img class="app__logo app__logo--dark" src="/okapi-logo-white.svg" alt="Okapi" />
            <img class="app__logo app__logo--light" src="/okapi-logo-black.svg" alt="Okapi" />
            <span>Okapi</span>
          </a>
        </div>
        <ThemeSwitch />
      </div>
      <div>
        <h1 class="app__title">Error handling, made clear</h1>
        <p class="app__description">
          Try the same request with different HTTP clients. Inspect the response and see how Okapi
          turns failures into useful errors
        </p>
      </div>
    </header>
    <PlaygroundApp />
  </div>
</template>

<style>
@import './palette.css';

body {
  margin: 0;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
  max-width: 48rem;
  margin-inline: auto;
  padding: 2.5rem 1rem;
  line-height: 1.5;
}

.app :deep(.playground-app) {
  flex: 1;
}

.app__header {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.app__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.app__brand {
  padding-top: 0.25rem;
}

.app__home {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: inherit;
  font-weight: 600;
  text-decoration: none;
}

.app__logo {
  height: 1.5rem;
}

.app__logo--dark {
  display: none;
}

:global(.dark .app__logo--dark) {
  display: block;
}

:global(.dark .app__logo--light) {
  display: none;
}

.app__title {
  font-size: 2rem;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: -0.02em;
}

.app__description {
  max-width: 32rem;
  margin-top: 1rem;
  color: var(--vp-c-text-2);
  font-size: 1rem;
  line-height: 28px;
}

@media (min-width: 640px) {
  .app {
    padding: 3.5rem 1.5rem;
  }
}
</style>
