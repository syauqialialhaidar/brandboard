<template>
  <v-navigation-drawer color="transparent" :width="280" :rail-width="80" :permanent="isDesktop" :temporary="!isDesktop"
    :rail="isDesktop ? rail : false" :model-value="isDesktop ? true : isOpen"
    @update:model-value="val => { if (!isDesktop) isOpen = val }" class="border-none pl-4 py-4" elevation="0" floating>
    <v-sheet color="surface" :class="['nav-card-container', { 'rail-card': rail }]" class="d-flex flex-column">
      <div class="drawer-header-wrapper" :class="{ 'rail-padding': rail }">

        <!-- LOGO CENTER -->
        <div v-if="!rail" class="logo-wrapper d-flex justify-center align-center mb-4">
          <v-img :src="logo" width="160" height="160" contain />
        </div>

        <!-- TEXT CENTER + BUTTON RIGHT -->
        <div v-if="!rail" class="brand-row position-relative px-4">
          <h2 class="brand-title text-center">
            BRANDBOARD TVC
          </h2>

          <v-btn v-if="isDesktop" variant="text" icon="mdi-chevron-double-left" size="x-small" color="primary"
            class="brand-btn" @click.stop="handleToggleClick" />
        </div>

        <!-- RAIL -->
        <div v-else class="rail-header-content text-center py-2">
          <v-btn variant="text" icon="mdi-chevron-double-right" size="small" color="primary" class="rounded-lg"
            @click.stop="rail = false" />
        </div>

      </div>


      <v-list nav density="compact" class="drawer-list bg-transparent flex-grow-1 blue-text-list">
        <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" rounded="lg" class="sidebar-item mb-2"
          :ripple="false" color="white">
          <template #prepend>
            <v-icon :icon="item.icon" size="22" class="item-icon text-primary" />
          </template>

          <v-list-item-title v-if="!rail" class="item-text font-weight-bold ml-2 text-primary">
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
import logo from '@/assets/images/tvc.png'

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
.nav-card-container {
  height: 100%;
  padding: 20px 10px;
  /* Reduced padding slightly */
  border-radius: 20px;
  border: 1px solid rgba(var(--v-border-color), 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.rail-card {
  padding: 20px 6px;
}

.drawer-header-wrapper {
  margin-bottom: 20px;
}

.brand-title {
  font-size: 0.95rem;
  /* Adjusted for smaller width */
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
  line-height: 1;
}

.brand-subtitle {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  opacity: 0.8;
  letter-spacing: 2px;
}

/* Base state for Sidebar Items */
.sidebar-item {
  color: rgb(var(--v-theme-primary)) !important;
  /* Force Blue Text */
  transition: all 0.2s ease;
}

/* Active State - Turn Background Blue and Text White */
.sidebar-item.v-list-item--active {
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.4);
  border: none;
}

/* Important: When active, force inner text/icons to white */
.sidebar-item.v-list-item--active :deep(.v-icon),
.sidebar-item.v-list-item--active :deep(.v-list-item-title) {
  color: #ffffff !important;
}

/* Hover State */
.sidebar-item:hover:not(.v-list-item--active) {
  background: rgba(var(--v-theme-primary), 0.08);
}

.brand-row {
  position: relative;
  margin-top: 8px;
}

.brand-title {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.brand-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}
</style>