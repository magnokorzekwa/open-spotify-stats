<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer-outer">
    <div class="footer-inner">
      <span class="left">
        © {{ currentYear }} {{ t('footer.brand') }}
      </span>

      <span class="right">
        {{ t('footer.legal') }}
      </span>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '../styles/colors' as *;

.footer-outer {
  width: 100%;
  background-color: $secondaryBackground;
  border-top: 1px solid $borderColor;
  margin-top: auto;
  
  display: flex;
  justify-content: center; 
}

.footer-inner {
  width: 100%;
  max-width: 1920px;
  
  padding: 16px 24px;
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  font-size: 0.75rem;
  color: $secondaryTypograhyColor;
}

.left,
.right {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1.5;
}

.right {
  text-align: right;
}

@media (max-width: 600px) {
  .footer-inner {
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: 24px 16px;
  }

  .right {
    text-align: center;
  }
}
</style>