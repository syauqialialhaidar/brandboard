<template>
  <v-card class="pa-0 table-premium-card overflow-hidden d-flex flex-column fill-height" elevation="0" color="surface">
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

    <div class="scroller-table scroller-x">
      <table class="table-custom">
        <thead>
          <tr>
            <th class="col-rank text-center">Rank</th>
            <th v-for="(header, index) in dynamicHeaders" :key="index" class="text-left">
              {{ header }}
            </th>
            <th class="col-mention text-center">Mention</th>
            <th class="col-action text-center">Detail</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, index) in itemsToShow" :key="index" :class="{ 'row-internal': row.isInternal }">
            <td class="col-rank text-center text-primary font-weight-bold">
              {{ row.rank }}
            </td>

            <td v-for="(col, cIndex) in dynamicHeaders" :key="cIndex" class="truncate">
              <span v-html="highlightText(row[col.toLowerCase().replace(/\s+/g, '_')]) || row[col.toLowerCase()]"></span>
            </td>

            <td class="col-mention text-center">
              <span v-html="highlightText(row.mention)"></span>
            </td>

            <td class="col-action text-center">
              <v-btn 
                icon="mdi-eye" 
                variant="text" 
                size="small" 
                color="primary" 
                @click="openDetails(row)" 
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <v-card-text class="pa-4">
      <div class="d-flex align-center">
        <p class="text-body-2 mb-0">
          {{ displayStartIndex }} - {{ endIndex }} of {{ totalItems }} entries
        </p>
        <v-pagination 
          v-model="currentPage" 
          :length="totalPages" 
          :total-visible="3" 
          density="compact" 
          class="ms-auto" 
        />
      </div>
    </v-card-text>

    <v-dialog v-model="detailsModal" max-width="500px" scrollable>
      <v-card class="rounded-xl">
        <v-card-title class="d-flex align-center pa-4">
          <span class="text-h6 font-weight-bold">Detail Data</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" density="comfortable" @click="detailsModal = false"></v-btn>
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
          <v-btn color="primary" variant="flat" rounded="lg" class="px-6" @click="detailsModal = false">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface TableRow {
  rank?: number
  mention?: string | number
  isInternal?: boolean
  [key: string]: any
}

const props = defineProps<{
  title: string
  headers: string[]
  rows: TableRow[]
  perPage?: number
}>()

const emit = defineEmits(['view-detail'])

// --- State ---
const searchQuery = ref('')
const currentPage = ref(1)
const detailsModal = ref(false)
const selectedItem = ref<TableRow | null>(null)

const perPage = computed(() => props.perPage ?? 5)

// --- Logic Pencarian & Highlight ---
const highlightText = (text: any) => {
  if (text === undefined || text === null) return '';
  const val = String(text);
  if (!searchQuery.value) return val;

  const q = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${q})`, 'gi');

  return val.replace(regex, '<mark class="highlight-mark">$1</mark>');
}

// Fungsi Modal
const openDetails = (row: TableRow) => {
  // Kita buat salinan data tanpa properti internal jika tidak ingin ditampilkan
  const { isInternal, ...displayData } = row
  selectedItem.value = displayData
  detailsModal.value = true
  emit('view-detail', row)
}

// Reset page jika search atau data berubah
watch(searchQuery, () => (currentPage.value = 1))
watch(() => props.rows, () => { currentPage.value = 1 }, { deep: true })

const dynamicHeaders = computed(() =>
  props.headers.filter(h => !['rank', 'mention', 'detail', 'action'].includes(h.toLowerCase()))
)

const filteredData = computed(() => {
  if (!searchQuery.value) return props.rows
  const q = searchQuery.value.toLowerCase()
  return props.rows.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(q))
  )
})

// --- Logic Pagination ---
const totalItems = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))

const itemsToShow = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
const endIndex = computed(() =>
  Math.min(currentPage.value * perPage.value, totalItems.value)
)
const displayStartIndex = computed(() =>
  totalItems.value === 0 ? 0 : startIndex.value + 1
)
</script>

<style scoped>
.scroller-table {
  overflow-x: auto;
  overflow-y: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  min-height: 246px;
}

.table-custom {
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
  table-layout: fixed;
}

.table-custom th,
.table-custom td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 0.875rem;
}

.table-custom th {
  position: sticky;
  top: 0;
  background-color: rgba(var(--v-theme-primary), 0.15);
  font-weight: 600;
  z-index: 1;
}

.table-custom td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-rank { width: 60px; }
.col-mention { width: 85px; }
.col-action { width: 70px; }

/* Row Styling */
.row-internal {
  background-color: rgba(174, 236, 221, 0.4) !important;
}

.v-theme--dark .row-internal {
  background-color: rgba(0, 150, 135, 0.2) !important;
}

/* Highlight Styling */
:deep(.highlight-mark) {
  background-color: #ffeb3b;
  color: #000;
  border-radius: 2px;
  padding: 0 2px;
}

.v-theme--dark :deep(.highlight-mark) {
  background-color: #fdd835;
  color: #000;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-premium-card {
  border-radius: 20px !important;
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
}

@media (max-width: 768px) {
  .table-custom th,
  .table-custom td {
    padding: 6px 8px;
    font-size: 0.8rem;
  }
}
</style>