<template>
  <v-app id="inspire">
    <!--
      The Sidebar is now controlled by v-model for mobile
      and props for desktop behavior.
    -->
    <AppSidebar
      :nav-items="navItems"
      :is-desktop="isDesktop"
      v-model:is-open="isMobileSidebarOpen"
    />

    <!-- The Header receives the desktop status to change its layout -->
    <AppHeader
      :is-desktop="isDesktop"
      @open-sidebar="isMobileSidebarOpen = true"
    />

    <v-main class="bg-background">
      <v-container>
        <router-view v-slot="{ Component }">
          <v-slide-y-transition mode="out-in">
            <component :is="Component" />
          </v-slide-y-transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import AppHeader from '@/components/Header.vue'
import AppSidebar from '@/components/Sidebar.vue'
import { useDisplay } from 'vuetify'

const appStore = useAppStore()
const { navItems } = storeToRefs(appStore)

const { mdAndUp } = useDisplay()
const isDesktop = computed(() => mdAndUp.value)
const isMobileSidebarOpen = ref(false)
</script>

<style scoped>
</style>
