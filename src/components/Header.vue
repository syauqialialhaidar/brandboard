<template>
  <v-app-bar
    flat
    height="85"
    color="transparent"
    class="app-header position-absolute"
  >
    <v-container fluid class="">
      <v-card class="header-card-container d-flex align-center px-4" color="surface" height="70">
        <v-btn
          v-if="!isDesktop"
          icon="mdi-menu"
          variant="tonal"
          color="primary"
          class="mr-3 rounded-lg"
          size="small"
          @click="$emit('open-sidebar')"
        ></v-btn>

        <v-avatar rounded="0" class="mr-3" size="40">
          <v-img :src="unileverLogo" contain alt="Unilever Logo"></v-img>
        </v-avatar>

        <div v-if="isDesktop" class="text-group">
          <h2 class="brand-title">UNILEVER INDONESIA</h2>
        </div>

        <v-spacer></v-spacer>

        <div class="d-flex align-center gap-2">
          <v-btn
            :icon="theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
            variant="text"
            color="secondary"
            class="rounded-lg"
            @click="toggleTheme"
          ></v-btn>

          <v-avatar class="ml-2 border-primary" size="38" border>
            <v-img
              :src="profileImage"
              alt="User Avatar"
              @error="profileImage = 'https://placehold.co/40x40/E0E0E0/333?text=AV'"
            ></v-img>
          </v-avatar>
        </div>
      </v-card>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import profileJpg from '@/assets/images/profile.jpg'
import logoLight from '@/assets/images/logo-light.png' // Gunakan logo yang sama dengan sidebar
import logoDark from '@/assets/images/logo-dark.png'
import unileverLogo from '@/assets/images/Unilever.png'

defineProps<{
  isDesktop: boolean
}>()

defineEmits(['open-sidebar'])

const theme = useTheme()
const profileImage = ref(profileJpg)

const currentLogo = computed(() => {
  return theme.global.name.value === 'dark' ? logoDark : logoLight
})

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<style scoped>
.app-header {
  top: 10px !important; /* Memberikan sedikit jarak dari atas layar */
  z-index: 1001;
}

.header-card-container {
  border-radius: 20px !important; /* Menyamakan dengan Sidebar */
  border: 1px solid rgba(var(--v-border-color), 0.05) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease;
}

.text-group {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-title {
  font-size: 1rem !important;
  font-weight: 800 !important;
  color: rgb(var(--v-theme-primary));
  letter-spacing: 0.5px;
}

.brand-subtitle {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  filter: brightness(1.2);
  opacity: 0.8;
}

/* Utilitas tambahan untuk spasi antar icon */
.gap-2 {
  display: flex;
  gap: 8px;
}

.border-primary {
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
}
</style>