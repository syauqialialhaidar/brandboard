<template>
  <v-card class="pa-0 progress-list-card overflow-hidden d-flex flex-column fill-height" elevation="0" color="surface">
    <div class="d-flex flex-wrap align-center pa-4">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
        {{ title }}
      </v-card-title>
      <v-spacer></v-spacer>
      <v-text-field 
        v-model="searchQuery" 
        density="compact" 
        label="Search" 
        append-inner-icon="mdi-magnify" 
        single-line
        flat 
        hide-details 
        variant="outlined" 
        style="max-width: 220px;" 
      />
    </div>

    <div class="scroller-body px-4 flex-grow-1">
      <v-divider v-if="isLoading" class="mb-4"></v-divider>
      <v-progress-linear v-if="isLoading" indeterminate color="primary" height="2"></v-progress-linear>

      <div 
        v-for="(row, index) in itemsToShow" 
        :key="index" 
        class="progress-item-row py-4"
        :class="{ 'row-internal': row.isInternal }"
      >
        <div class="d-flex align-start">
          <div class="rank-badge mr-4 text-primary font-weight-bold">
            {{ row.rank }}
          </div>

          <div class="flex-grow-1">
            <div class="d-flex justify-space-between align-center mb-1">
              <div class="d-flex align-center">
                <v-icon color="blue-darken-2" size="small" class="mr-2">mdi-television-classic</v-icon>
                <span class="font-weight-bold text-body-2" v-html="highlightText(row.name)"></span>
              </div>
            </div>

            <v-progress-linear
              :model-value="calculatePercentage(row.mention)"
              color="primary"
              height="10"
              rounded="pill"
              bg-color="grey-lighten-3"
              bg-opacity="1"
              class="mb-1"
            ></v-progress-linear>

            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-grey-darken-1">
                <span v-html="highlightText(formatCompact(row.mention))"></span> mentions
              </span>
              <v-btn 
                icon="mdi-eye-outline" 
                variant="text" 
                size="x-small" 
                color="grey-darken-1" 
                @click="openDetails(row)" 
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="itemsToShow.length === 0 && !isLoading" class="pa-10 text-center text-grey">
        No data found.
      </div>
    </div>

    <v-divider></v-divider>
    <v-card-text class="pa-4">
      <div class="d-flex align-center flex-wrap gap-2">
        <p class="text-caption mb-0 text-grey-darken-1">
          Showing {{ displayStartIndex }}-{{ endIndex }} of {{ totalItems }}
        </p>
        <v-pagination 
          v-model="currentPage" 
          :length="totalPages" 
          :total-visible="3" 
          density="compact" 
          class="ms-auto" 
          active-color="primary"
        />
      </div>
    </v-card-text>

    <v-dialog v-model="detailsModal" max-width="500px" scrollable>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center pa-4">
          <span class="text-h6 font-weight-bold">Detail Data</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="detailsModal = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-0" style="max-height: 400px;">
          <v-list lines="two">
            <v-list-item v-for="(value, key) in selectedItem" :key="key">
              <v-list-item-title class="text-caption text-uppercase text-grey font-weight-bold">
                {{ String(key).replace(/_/g, ' ') }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-1 text-high-emphasis pt-1">
                {{ value ?? '-' }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" rounded="lg" class="px-6" @click="detailsModal = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface TableRow {
  rank?: number
  name: string
  mention: string | number
  isInternal?: boolean
  [key: string]: any
}

const props = defineProps<{
  title: string
  rows: TableRow[]
  perPage?: number
  isLoading?: boolean
}>()

const emit = defineEmits(['view-detail'])

// --- State ---
const searchQuery = ref('')
const currentPage = ref(1)
const detailsModal = ref(false)
const selectedItem = ref<TableRow | null>(null)
const perPage = computed(() => props.perPage ?? 5)

// --- Logic Helpers ---
const calculatePercentage = (val: string | number) => {
  const num = Number(val);
  if (isNaN(num) || props.rows.length === 0) return 0;
  // Menghitung persentase relatif terhadap nilai tertinggi agar bar proporsional
  const maxVal = Math.max(...props.rows.map(r => Number(r.mention) || 0));
  return maxVal > 0 ? Math.round((num / maxVal) * 100) : 0;
};

const formatCompact = (val: string | number) => {
  let num = Number(val);
  if (isNaN(num)) return val;
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
};

const highlightText = (text: any) => {
  if (!text) return '';
  const val = String(text);
  if (!searchQuery.value) return val;
  const q = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${q})`, 'gi');
  return val.replace(regex, '<mark class="highlight-mark">$1</mark>');
}

// --- Pagination & Search Logic ---
const filteredData = computed(() => {
  if (!searchQuery.value) return props.rows
  const q = searchQuery.value.toLowerCase()
  return props.rows.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(q))
  )
})

const totalItems = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))
const itemsToShow = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
const endIndex = computed(() => Math.min(currentPage.value * perPage.value, totalItems.value))
const displayStartIndex = computed(() => totalItems.value === 0 ? 0 : startIndex.value + 1)

// --- Modal Functions ---
const openDetails = (row: TableRow) => {
  const { isInternal, ...displayData } = row
  selectedItem.value = displayData
  detailsModal.value = true
  emit('view-detail', row)
}

watch(searchQuery, () => (currentPage.value = 1))
watch(() => props.rows, () => { currentPage.value = 1 }, { deep: true })
</script>

<style scoped>
.progress-list-card {
  border-radius: 20px !important;
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
}

.scroller-body {
  overflow-y: auto;
  max-height: 500px;
}

.progress-item-row {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
  transition: background-color 0.2s ease;
}

.progress-item-row:last-child {
  border-bottom: none;
}

.rank-badge {
  min-width: 35px;
  font-size: 1.1rem;
}

.row-internal {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

:deep(.highlight-mark) {
  background-color: #ffeb3b;
  color: #000;
  border-radius: 2px;
  padding: 0 2px;
}
</style>