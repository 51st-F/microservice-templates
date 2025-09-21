<template>
  <header class="app-header">
    <h1>前端應用</h1>
    <ThemeToggle />
  </header>
</template>

<script>
import ThemeToggle from './ThemeToggle.vue'

export default {
  name: 'AppHeader',
  components: {
    ThemeToggle
  }
}
</script>

<style>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
