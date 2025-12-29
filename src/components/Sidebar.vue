<template>
  <v-navigation-drawer 
    color="background" 
    :width="320" 
    :rail-width="88" 
    :permanent="isDesktop" 
    :temporary="!isDesktop"
    :rail="isDesktop ? rail : false" 
    :model-value="isDesktop ? true : isOpen"
    @update:model-value="val => { if (!isDesktop) isOpen = val }" 
    class="custom-drawer border-none" 
    elevation="0"
  >
    <div class="drawer-header-wrapper" :class="{ 'rail-padding': rail }">
      <div v-if="!rail" class="header-content">
        <v-img :src="currentLogo" width="62" height="50" contain class="flex-grow-0"></v-img>
        <div class="text-group">
          <h2 class="brand-title">BRANDBOARD</h2>
          <span class="brand-subtitle">TVC</span>
        </div>
        <v-spacer></v-spacer>
        <v-btn 
          v-if="isDesktop"
          variant="tonal" 
          icon="mdi-chevron-double-left" 
          size="x-small" 
          color="primary" 
          class="toggle-btn"
          @click.stop="handleToggleClick" 
        />
      </div>

      <div v-else class="rail-header-content">
        <v-btn 
          variant="tonal" 
          icon="mdi-chevron-double-right" 
          size="small" 
          color="primary" 
          class="rounded-lg"
          @click.stop="rail = false" 
        />
      </div>
    </div>

    <v-sheet 
      color="surface" 
      :class="['nav-card-container', { 'rail-card': rail }]"
    >
      <v-list nav density="compact" class="drawer-list bg-transparent">
        <v-list-item 
          v-for="item in navItems" 
          :key="item.title" 
          :to="item.to" 
          rounded="lg" 
          class="sidebar-item"
          :ripple="false"
        >
          <template #prepend>
            <v-icon :icon="item.icon" size="28" class="item-icon" :class="{ 'mx-auto': rail }" />
          </template>

          <v-list-item-title v-if="!rail" class="item-text font-weight-bold ml-3">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-sheet>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

import logoLight from '@/assets/images/logo-light.png'
import logoDark from '@/assets/images/logo-dark.png'

const props = defineProps<{
  navItems: Array<{ title: string; icon: string; to: string }>,
  isDesktop: boolean
}>()

const theme = useTheme()
const isOpen = defineModel<boolean>('isOpen')
const rail = ref(false)

const currentLogo = computed(() => {
  return theme.global.name.value === 'dark' ? logoDark : logoLight
})

const handleToggleClick = () => {
  if (props.isDesktop) {
    rail.value = true
  } else {
    isOpen.value = false
  }
}
</script>

<style scoped>
.custom-drawer {
  left: 40px !important;
  top: 20px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* 1. Header Layout */
.drawer-header-wrapper {
  padding: 32px 16px 24px 24px;
  transition: padding 0.3s ease;
}

.rail-padding {
  padding: 32px 0 24px 0 !important;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.rail-header-content {
  display: flex;
  justify-content: center;
  width: 100%;
}

.text-group {
  display: flex;
  flex-direction: column;
  margin-left: 12px;
}

.brand-title {
  font-size: 1.2rem !important;
  font-weight: 800 !important;
  color: rgb(var(--v-theme-primary));
  line-height: 1.1;
}

.brand-subtitle {
  font-size: 1.2rem;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
  filter: brightness(1.2);
  line-height: 1.1;
}

/* 2. Nav Card Container */
.nav-card-container {
  margin: 0 16px 16px 16px;
  padding: 20px 10px;
  border-radius: 20px;
  border: 1px solid rgba(var(--v-border-color), 0.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  min-height: calc(100vh - 160px);
  transition: all 0.3s ease;
}

/* Saat tertutup, card menyesuaikan lebar rail */
.rail-card {
  margin: 0 8px;
  padding: 20px 0;
}

/* 3. Menu Item Styling */
.sidebar-item {
  min-height: 50px !important;
  margin-bottom: 8px !important;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  transition: all 0.3s ease;
}

.item-text {
  font-size: 1rem !important;
}

/* 4. Active State */
.sidebar-item.v-list-item--active {
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)) 0%, #6da8e7 100%) !important;
  color: white !important;
}

.sidebar-item.v-list-item--active :deep(.v-icon) {
  color: white !important;
}

:deep(.v-list-item__overlay) {
  display: none;
}

/* Memastikan ikon berada di tengah saat rail mode */
:deep(.v-list-item__prepend) {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0 !important;
}
</style>