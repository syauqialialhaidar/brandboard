<template>
  <v-card class="page-title-card d-flex align-center px-6 py-4 mb-6 mt-n6"
    :class="colorful ? 'text-white' : 'text-on-surface'" :style="cardStyle" elevation="0" width="100%">
    <div class="d-flex flex-column">
      <h2 class="text-h5 font-weight-black" style="line-height: 1.2">
        {{ title }}
      </h2>
      <span v-if="subtitle" class="text-caption font-weight-bold mt-1" :class="colorful ? 'text-white' : 'text-primary'"
        style="opacity: 0.9; letter-spacing: 1px; text-transform: uppercase;">
        {{ subtitle }}
      </span>
    </div>

    <v-spacer />

    <div class="d-flex align-center gap-3">
      <v-menu v-model="filterMenu" :close-on-content-click="false" location="bottom end" offset="10"
        transition="scale-transition">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" variant="flat" :color="colorful ? 'rgba(255,255,255,0.2)' : 'surface'"
            class="rounded-lg text-capitalize font-weight-bold filter-btn"
            :class="colorful ? 'text-white border-white' : 'border'" prepend-icon="mdi-filter-variant">
            Filters
            <v-badge v-if="totalActiveFilters > 0" color="error" :content="totalActiveFilters" inline
              class="ml-2"></v-badge>
          </v-btn>
        </template>

        <v-card width="450" class="rounded-xl border" color="surface">
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
                <label class="filter-label mb-1 d-block">
                  {{ level.label }}
                </label>
                <v-select v-model="selections[level.key]" :items="options[level.key]" :loading="loadings[level.key]"
                  :placeholder="`All ${level.label}`" variant="outlined" density="compact" multiple clearable
                  hide-details rounded="lg">
                  <template v-slot:prepend-item>
                    <v-list-item title="Select All" @click="toggleSelectAll(level.key)">
                      <template v-slot:prepend>
                        <v-checkbox-btn :model-value="isAllSelected(level.key)"
                          :indeterminate="isSomeSelected(level.key) && !isAllSelected(level.key)"
                          color="primary"></v-checkbox-btn>
                      </template>
                    </v-list-item>
                    <v-divider class="mt-2"></v-divider>
                  </template>

                  <template v-slot:selection="{ item, index: i }">
                    <v-chip v-if="i === 0" size="x-small" color="primary" variant="flat">{{ item.title }}</v-chip>
                    <span v-if="i === 1" class="text-caption ml-1">
                      (+{{ (selections[level.key]?.length || 0) - 1 }})
                    </span>
                  </template>
                </v-select>
              </div>
            </div>
          </v-card-text>

          <v-divider />
          <v-card-actions class="pa-4 bg-grey-100">
            <v-btn block color="primary" variant="flat" class="rounded-lg font-weight-bold" @click="applyFilters">
              Apply Filters
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <div v-if="showDateFilter" class="date-picker-wrapper">
        <DateRangePicker :from="startDate" :to="endDate" @date-change="setDateRange" />
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

//--Select All Logic--
const isAllSelected = (key: string) => {
  const selected = selections.value[key] || [];
  const available = options.value[key] || [];
  return selected.length === available.length && available.length > 0;
}

const isSomeSelected = (key: string) => {
  return (selections.value[key]?.length || 0) > 0;
}

const toggleSelectAll = (key: string) => {
  const available = options.value[key] || [];
  
  if (isAllSelected(key)) {
    selections.value[key] = [];
  } else {
    // Pastikan kita meng-assign array yang valid
    selections.value[key] = [...available];
  }
}

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
      const filterParam: any = {};

      const isInternalPage = props.title.toLowerCase().includes('internal');
      if (isInternalPage && internalGroup.value) {
        filterParam.group = [internalGroup.value];
      }

      const data = await fetchData(level.endpoint!, filterParam);

      if (Array.isArray(data)) {
        let rawItems = data.map(item => item.name || item.title).filter(Boolean);


        const internalGroupName = internalGroup.value?.toLowerCase() || '';

        if (props.excludeInternal) {
          // Page EXTERNAL: Buang yang mengandung internal
          rawItems = rawItems.filter(name => {
            const n = name.toLowerCase();
            return n !== internalGroupName && !n.includes('internal');
          });
        } else if (isInternalPage) {
          // Page INTERNAL: Ambil yang grup internal atau ada kata internal
          rawItems = rawItems.filter(name => {
            const n = name.toLowerCase();
            return n === internalGroupName || n.includes('internal');
          });

          // Fallback jika kosong
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
  border-radius: 16px !important;
  /* Border tipis menggunakan variabel border color tema */
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
}

.filter-btn {
  /* Memastikan tombol filter punya border yang jelas saat mode light */
  border: 1px solid rgba(var(--v-border-color), 0.2) !important;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  /* Menggunakan warna abu-abu dari config */
  color: rgb(var(--v-theme-grey-500));
}

.date-picker-wrapper {
  width: 280px;
}

.gap-3 {
  display: flex;
  gap: 12px;
}

/* Transisi warna saat ganti tema */
.page-title-card,
.v-card {
  transition: background 0.3s ease, color 0.3s ease !important;
}
</style>