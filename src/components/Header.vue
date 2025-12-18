<template>
  <v-app-bar
    app
    flat
    height="100"
    color="background" 
    class="app-header"
  >
    <v-container>
      <v-card 
        class="ma-0 pa-2 rounded-lg elevation-2" 
        color="surface" 
        width="100%"
      >
        <div class="d-flex align-center">

          <v-btn
            v-if="!isDesktop"
            icon="mdi-chevron-double-right"
            variant="text"
            color="primary"
            class="ml-1"
            @click="$emit('open-sidebar')"
            aria-label="Open sidebar"
          ></v-btn>

          <v-avatar
            rounded="0"
            class="mr-3 ml-2"
            size="36"
          >
            <v-img
              :src="unileverLogo"
              alt="Unilever Logo"
              contain
            ></v-img>
          </v-avatar>

          <div
            v-if="isDesktop"
            class="text-h6 font-weight-bold text-on-surface"
          >
            UNILEVER INDONESIA
          </div>

          <v-spacer></v-spacer>

          <v-btn
            :icon="theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
            variant="text"
            class="mr-1"
            color="secondary"
            @click="toggleTheme"
          ></v-btn>

          <v-avatar class="mr-2" size="36">
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
import { ref } from 'vue'
import { useTheme } from 'vuetify'

// Import assets
import profileJpg from '@/assets/images/profile.jpg'
import unileverLogo from '@/assets/images/Unilever.png'

defineProps<{
  isDesktop: boolean
}>()

defineEmits(['open-sidebar'])

const profileImage = ref(profileJpg)
const theme = useTheme()

function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<style scoped>
/* CSS ini memastikan app-bar tidak memiliki background transparan 
   yang memperlihatkan konten saat scroll 
*/
.v-app-bar.v-toolbar {
  /* Pastikan background app-bar mengikuti background aplikasi agar card terlihat 'melayang' */
  background-color: rgb(var(--v-theme-background)) !important;
}

/* Menghilangkan overflow agar rapi */
.app-header {
  z-index: 1000 !important;
}
</style>