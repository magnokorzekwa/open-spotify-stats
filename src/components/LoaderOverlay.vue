<script setup lang="ts">

const props = defineProps<{
  open: boolean
}>()
</script>

<template>
  <v-overlay :model-value="props.open" class="loader-overlay" persistent>
    <div class="loader-content">
      <v-progress-circular indeterminate size="64" width="6" />
    </div>
  </v-overlay>
</template>

<style lang="scss" scoped>
.loader-overlay {
  .loader-content {
    width: 100vw;
    height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
