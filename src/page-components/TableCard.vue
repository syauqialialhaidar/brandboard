<template>
  <v-card class="pa-0 table-premium-card overflow-hidden d-flex flex-column fill-height" elevation="0" color="surface">
    <div class="d-flex flex-wrap align-center pa-4">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
        {{ title }}
      </v-card-title>
      <v-spacer></v-spacer>
      <v-text-field v-model="searchQuery" density="compact" label="Search" append-inner-icon="mdi-magnify" single-line
        flat hide-details variant="outlined" style="max-width: 220px;" />
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
          </tr>
        </thead>

        <tbody>
          <tr v-for="(row, index) in itemsToShow" :key="index" :class="{ 'row-internal': row.isInternal }">
            <td class="col-rank text-center text-primary font-weight-bold">
              #{{ row.rank }}
            </td>
            <td v-for="(col, cIndex) in dynamicHeaders" :key="cIndex" class="truncate">
              <span v-html="highlightText(row[col.toLowerCase()])"></span>
            </td>

            <td class="col-mention text-center">
              <span v-html="highlightText(row.mention)"></span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <v-card-text class="pa-4">
      <div class="d-flex align-center">
        <p class="text-body-2 mb-0">
          Showing {{ displayStartIndex }} - {{ endIndex }} of {{ totalItems }} entries
        </p>
        <v-pagination v-model="currentPage" :length="totalPages" :total-visible="3" density="compact" class="ms-auto" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface TableRow {
  rank?: number
  mention?: string
  [key: string]: any
}

const props = defineProps<{
  title: string
  headers: string[]
  rows: TableRow[]
  perPage?: number
}>()

const highlightText = (text: any) => {
  const val = String(text);
  if (!searchQuery.value) return val;

  // Escape karakter khusus regex dan buat regex case-insensitive
  const q = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${q})`, 'gi');

  return val.replace(regex, '<mark class="highlight-mark">$1</mark>');
}

const searchQuery = ref('')
const currentPage = ref(1)
const perPage = computed(() => props.perPage ?? 10)

watch(searchQuery, () => (currentPage.value = 1))

watch(
  () => props.rows,
  () => {
    currentPage.value = 1
  },
  { deep: true }
)

const dynamicHeaders = computed(() =>
  props.headers.filter(h => !['rank', 'mention'].includes(h.toLowerCase()))
)

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
  background-color: rgba(var(--v-theme-primary), 0.3);
  font-weight: 600;
  z-index: 1;
}

.table-custom td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-rank,
.col-mention {
  width: 80px;
}

.col-rank,
.col-mention {
  text-align: center;
}

@media (max-width: 768px) {

  .table-custom th,
  .table-custom td {
    padding: 6px 8px;
    font-size: 0.8rem;
  }

  .scroller-table {
    border-radius: 0;
    margin-left: -12px;
    margin-right: -12px;
    width: calc(100% + 24px);
  }
}

/* Warna Baris Internal yang adaptif */
.row-internal {
  /* Di Light Mode: Hijau Toska lembut */
  background-color: rgba(174, 236, 221, 0.927) !important;
}

/* Saat Dark Mode aktif (Vuetify menambahkan class v-theme--dark pada parent) */
.v-theme--dark .row-internal {
  /* Di Dark Mode: Gunakan warna yang lebih gelap/redup agar teks tetap terbaca */
  background-color: rgba(0, 150, 135, 0.655) !important;
}

/* Styling untuk teks yang di-highlight (Search) */
:deep(.highlight-mark) {
  background-color: #ffeb3b;
  /* Kuning standar */
  color: #000;
  /* Teks tetap hitam agar kontras */
  border-radius: 2px;
  padding: 0 2px;
}

/* Penyesuaian Highlight di Dark Mode */
.v-theme--dark :deep(.highlight-mark) {
  background-color: #fdd835;
  color: #000;
}

/* Menghilangkan efek garis samping yang sebelumnya ada */
.row-internal td {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Tambahkan atau timpa class ini di bagian style */
.table-premium-card {
  border-radius: 20px !important;
  border: 1px solid rgba(var(--v-border-color), 0.05) !important;
  /* Shadow halus sesuai highlight.vue */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
}

/* Pastikan header tabel juga mengikuti estetika yang lebih bersih */
.table-custom th {
  position: sticky;
  top: 0;
  /* Mengurangi opacity background header agar lebih soft */
  background-color: rgba(var(--v-theme-primary), 0.15); 
  font-weight: 600;
  z-index: 1;
}
</style>
