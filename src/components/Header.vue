<template>
  <v-app-bar flat height="100" color="background" class="app-header" :absolute="true">
    <v-container>
      <v-card class="ma-0 pa-2 rounded-0 elevation-0" color="transparent" width="100%">
        <div class="d-flex align-center">
          <v-btn v-if="!isDesktop" icon="mdi-chevron-double-right" variant="text" color="primary" class="ml-1"
            @click="$emit('open-sidebar')" aria-label="Open sidebar"></v-btn>

          <v-avatar rounded="0" class="mr-8 ml-2" size="46">
            <v-img :src="unileverLogo" alt="Unilever Logo" contain></v-img>
          </v-avatar>

          <div v-if="isDesktop" class="text-h6 font-weight-bold text-on-surface mr-4">
            UNILEVER INDONESIA
          </div>

          <v-spacer></v-spacer>

          <div v-if="isDesktop" class="d-flex align-center ga-3 mr-4">
            <v-sheet width="200" color="transparent">
              <v-select v-model="selectedChannels" :items="masterChannels" label="Select Channel" density="compact"
                variant="outlined" hide-details multiple chips closable-chips></v-select>
            </v-sheet>

            <v-sheet width="280" color="transparent">
              <DateRangePicker :from="startDate" :to="endDate" @date-change="setDateRange" />
            </v-sheet>
          </div>

          <v-btn :icon="theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
            variant="text" class="mr-1" color="secondary" @click="toggleTheme"></v-btn>

          <v-avatar class="mr-2" size="36">
            <v-img :src="profileImage" alt="User Avatar"
              @error="profileImage = 'https://placehold.co/40x40/E0E0E0/333?text=AV'"></v-img>
          </v-avatar>
        </div>
      </v-card>
    </v-container>
  </v-app-bar>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import DateRangePicker from '@/page-components/DateRangePicker.vue'
import { fetchData } from '@/utils/apiBuilder' // Import ini

// Import assets
import profileJpg from '@/assets/images/profile.jpg'
import unileverLogo from '@/assets/images/Unilever.png'

defineProps<{
  isDesktop: boolean
}>()

defineEmits(['open-sidebar'])

const profileImage = ref(profileJpg)
const theme = useTheme()

// Integrasi Logic Pinia Store
const appStore = useAppStore()
const {
  startDate,
  endDate,
  masterChannels, // Ini akan kita isi manual
  selectedChannels
} = storeToRefs(appStore)

const { setDateRange } = appStore

// Fungsi pengambil data yang sama dengan brand.vue
async function fetchChannelDropdown() {
  try {
    const channelData = await fetchData('top/channel')
    if (channelData && Array.isArray(channelData)) {
      // Transformasi: ambil property 'name' saja (Array of Strings)
      masterChannels.value = channelData.map((c: any) => c.name)
    }
  } catch (error) {
    console.error("Failed to fetch channel list in Header:", error)
  }
}

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

onMounted(async () => {
  // Hanya ambil data jika masterChannels masih kosong
  if (masterChannels.value.length === 0) {
    await fetchChannelDropdown()
  }
})
</script>

<style scoped>
.v-app-bar.v-toolbar {
  background-color: rgb(var(--v-theme-background)) !important;
}


/* Tambahan styling agar filter compact di header */
:deep(.v-select .v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 32px !important;
}
</style>