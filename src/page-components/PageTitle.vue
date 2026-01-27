<template>
  <v-card class="page-title-card d-flex align-center px-6 py-4 mb-6 mt-n6" :class="colorful ? 'text-white' : ''"
    :style="cardStyle" elevation="0" width="100%">
    <div class="d-flex flex-column">
      <h2 class="text-h5 font-weight-black" style="line-height: 1.1">
        {{ title }}
      </h2>
      <span v-if="subtitle" class="text-caption font-weight-bold mt-1" :class="colorful ? 'text-white' : 'text-primary'"
        style="opacity: 0.8; letter-spacing: 1px; text-transform: uppercase;">
        {{ subtitle }}
      </span>
    </div>

    <v-spacer />

    <div class="d-flex align-center gap-3">
      <v-menu v-model="filterMenu" :close-on-content-click="false" location="bottom end" offset="10"
        transition="scale-transition">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" variant="flat" :color="colorful ? 'rgba(255,255,255,0.2)' : 'white'" border
            class="rounded-lg text-capitalize font-weight-bold" :class="colorful ? 'text-white border-white' : ''"
            prepend-icon="mdi-filter-variant">
            Filters
            <v-badge v-if="totalActiveFilters > 0" color="error" :content="totalActiveFilters" inline
              class="ml-2"></v-badge>
          </v-btn>
        </template>

        <v-card width="450" class="rounded-xl shadow-lg border">
          <v-card-title class="d-flex justify-space-between align-center pa-4">
            <span class="text-subtitle-1 font-weight-bold">Apply Filters</span>
            <v-btn variant="text" color="error" size="small" @click="resetFilters" :disabled="totalActiveFilters === 0">
              Reset
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-4 overflow-y-auto" style="max-height: 450px">
            <div class="d-flex flex-column ga-4">
              <div v-for="level in activeLevels" :key="level.key">
                <label class="text-caption font-weight-bold text-uppercase text-grey-darken-1 mb-1 d-block">
                  {{ level.label }}
                </label>
                <v-select v-model="selections[level.key]" :items="options[level.key]" :loading="loadings[level.key]"
                  :placeholder="`All ${level.label}`" variant="outlined" density="compact" multiple clearable
                  hide-details rounded="lg">
                  <template v-slot:selection="{ item, index: i }">
                    <v-chip v-if="i === 0" size="x-small" color="primary">{{ item.title }}</v-chip>
                    <span v-if="i === 1" class="text-caption ml-1">
                      (+{{ (selections[level.key]?.length || 0) - 1 }})
                    </span>
                  </template>
                </v-select>
              </div>
            </div>
          </v-card-text>

          <v-divider />
          <v-card-actions class="pa-4 bg-grey-lighten-4">
            <v-btn block color="primary" variant="flat" class="rounded-lg font-weight-bold" @click="applyFilters">
              Apply Filters
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <div v-if="showDateFilter" style="width: 280px">
        <DateRangePicker :from="startDate" :to="endDate" @date-change="setDateRange"
          :theme="colorful ? 'light' : undefined" />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import { fetchData } from '@/utils/apiBuilder'
import DateRangePicker from '@/page-components/DateRangePicker.vue'

// Definisi Props
const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  showDateFilter?: boolean
  colorful?: boolean
  // Menentukan filter mana saja yang aktif untuk halaman ini
  enabledFilters?: string[]
  // Menentukan apakah harus menyaring kata 'internal' dari data (untuk page External)
  excludeInternal?: boolean
}>(), {
  showDateFilter: true,
  colorful: true,
  enabledFilters: () => ['channel', 'group', 'brand', 'variants', 'kategori', 'sub_kategori'],
  excludeInternal: false
})

const emit = defineEmits(['update:filter'])

// Store Logic
const appStore = useAppStore()
const { startDate, endDate, internalGroup } = storeToRefs(appStore)
const { setDateRange } = appStore

// State Logic
const filterMenu = ref(false)
const selections = ref<Record<string, any[]>>({})
const options = ref<Record<string, any[]>>({})
const loadings = ref<Record<string, boolean>>({})

// Master Konfigurasi Semua Kemungkinan Filter
const MASTER_LEVELS = [
  { key: 'channel', label: 'Channel', endpoint: 'top/channel' },
  { key: 'group', label: 'Group', endpoint: 'top/group' },
  { key: 'brand', label: 'Brand', endpoint: 'top/brand' },
  { key: 'variants', label: 'Variants', endpoint: 'top/varian' },
  { key: 'kategori', label: 'Kategori', endpoint: 'top/category' },
  { key: 'sub_kategori', label: 'Sub Kategori', endpoint: 'top/sub_category' },
]

// Filter yang aktif berdasarkan props
const activeLevels = computed(() => {
  return MASTER_LEVELS.filter(level => props.enabledFilters.includes(level.key))
})

// Inisialisasi State Reactive
MASTER_LEVELS.forEach(l => {
  selections.value[l.key] = []
  options.value[l.key] = []
  loadings.value[l.key] = false
})

const totalActiveFilters = computed(() => {
  return activeLevels.value.reduce((acc, level) => acc + (selections.value[level.key]?.length || 0), 0)
})

/**
 * Memanggil API hanya untuk filter yang diaktifkan
 */
async function loadFilterOptions() {
  const tasks = activeLevels.value.map(async (level) => {
    loadings.value[level.key] = true
    try {
      // PERBAIKAN: Tambahkan parameter filter saat fetch
      const filterParam: any = {};
      
      // Jika di page internal, paksa API hanya mengambil data milik internalGroup
      const isInternalPage = props.title.toLowerCase().includes('internal');
      if (isInternalPage && internalGroup.value) {
        filterParam.group = [internalGroup.value];
      }

      // Panggil API dengan filterParam
      const data = await fetchData(level.endpoint!, filterParam); 
      
      if (Array.isArray(data)) {
        let rawItems = data.map(item => item.name || item.title).filter(Boolean);

        const isInternalPage = props.title.toLowerCase().includes('internal');
        const internalGroupName = internalGroup.value?.toLowerCase() || '';

        if (props.excludeInternal) {
          // Page EXTERNAL
          rawItems = rawItems.filter(name => {
            const n = name.toLowerCase();
            return n !== internalGroupName && !n.includes('internal');
          });
        } else if (isInternalPage) {
          // Page INTERNAL
          rawItems = rawItems.filter(name => {
            const n = name.toLowerCase();
            // Munculkan jika namanya sama dengan grup internal ATAU mengandung kata 'internal'
            return n === internalGroupName || n.includes('internal');
          });

          // Jika setelah difilter kosong (karena API tidak pakai kata 'internal'), 
          // kembalikan semua data agar user bisa memilih
          if (rawItems.length === 0) {
            rawItems = data.map(item => item.name || item.title).filter(Boolean);
          }
        }

        options.value[level.key] = [...new Set(rawItems)].sort();
      }
    } catch (error) {
      console.error(`Gagal load ${level.label}:`, error)
    } finally {
      loadings.value[level.key] = false
    }
  })
  await Promise.all(tasks)
}
onMounted(() => {
  loadFilterOptions()
})

const applyFilters = () => {
  // Deklarasikan payload dengan index signature yang jelas
  const payload: { [key: string]: any[] } = {};

  activeLevels.value.forEach(level => {
    // Gunakan Type Assertion 'as string' pada level.key jika masih merah
    const key = level.key as string;

    if (selections.value[key]) {
      payload[key] = selections.value[key];
    }
  });

  emit('update:filter', payload);
  filterMenu.value = false;
};

const resetFilters = () => {
  activeLevels.value.forEach(l => {
    selections.value[l.key] = []
  })
}

const cardStyle = computed(() => {
  if (props.colorful) {
    return {
      background: 'linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #42A5F5 100%)',
      border: 'none'
    }
  }
  return { background: 'rgb(var(--v-theme-surface))' }
})

watch([() => props.enabledFilters, internalGroup], () => {
  loadFilterOptions();
}, { deep: true });
</script>

<style scoped>
.page-title-card {
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.3s ease;
}

.gap-3 {
  display: flex;
  gap: 12px;
}
</style>