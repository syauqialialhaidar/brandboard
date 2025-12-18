<template>
  <v-navigation-drawer
    color="surface"
    :width="260"
    :rail-width="88"
    class="custom-drawer"

    :permanent="isDesktop"
    :temporary="!isDesktop"
    :rail="isDesktop ? rail : false"

    :model-value="isDesktop ? true : isOpen"
    @update:model-value="val => { if (!isDesktop) isOpen = val }"
  >
    <v-list-item v-if="!rail" class="header-expanded">
      <div class="d-flex align-center justify-space-between">
        <v-icon color="primary" size="32">mdi-monitor-dashboard</v-icon>

        <v-list-item-title
          class="font-weight-bold text-h6 text-uppercase drawer-title ml-2"
        >
          BRANDBOARD TVC
        </v-list-item-title>

        <v-btn
          variant="text"
          icon
          size="x-small"
          color="primary"
          @click.stop="handleToggleClick"
          aria-label="Minimize sidebar"
        >
          <v-icon>mdi-chevron-double-left</v-icon>
        </v-btn>
      </div>
    </v-list-item>

    <div v-else-if="isDesktop" class="rail-header">
      <v-btn
        variant="text"
        icon
        size="x-small"
        color="primary"
        @click.stop="rail = false"
        aria-label="Expand sidebar"
      >
        <v-icon>mdi-chevron-double-right</v-icon>
      </v-btn>
    </div>

    <v-divider />
    <v-list nav density="compact" class="drawer-list">
      <v-list-item
        v-for="item in navItems"
        :key="item.title"
        :to="item.to"
        rounded="lg"
        class="mb-1 sidebar-item"
      >
        <template #prepend>
          <v-icon :icon="item.icon" size="22" />
        </template>
        <v-list-item-title v-if="!rail" class="font-weight-medium text-body-2">
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  navItems: Array<{ title: string; icon: string; to: string }>,
  isDesktop: boolean
}>()

const isOpen = defineModel<boolean>('isOpen')

const rail = ref(false)

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
  padding: 0px;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-drawer.v-navigation-drawer--rail {
  padding-left: 0;
  padding-right: 0;
}

.header-expanded {
  padding: 24px;
}

.drawer-title {
  white-space: normal;
  line-height: 1rem;
  color: rgb(var(--v-theme-primary));
}

.rail-header {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.drawer-list {
  padding: 24px;
}

.sidebar-item {
  transition: background 0.25s ease, color 0.25s ease;
}

.sidebar-item.v-list-item--active {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-white)) !important;
}

.sidebar-item.v-list-item--active .v-icon,
.sidebar-item.v-list-item--active .v-list-item-title {
  color: rgb(var(--v-theme-white)) !important;
}

.sidebar-item:not(.v-list-item--active) .v-list-item-title {
  color: rgb(var(--v-theme-grey-500)) !important;
}

.sidebar-item:not(.v-list-item--active) .v-icon {
  color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 0.8;
}
</style>
