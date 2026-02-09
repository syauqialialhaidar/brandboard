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

    <div class="scroller-table scroller-x flex-grow-1">
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
              <span
                v-html="highlightText(row[col.toLowerCase().replace(/\s+/g, '_')]) || row[col.toLowerCase()]"></span>
            </td>

            <td class="col-mention text-center">
              <span v-html="highlightText(formatCompact(row.mention))"></span>
            </td>

            <td class="col-action text-center">
              <v-btn icon="mdi-eye" variant="text" size="small" color="primary" @click="viewDetail(row)" />
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
        <v-pagination v-model="currentPage" :length="totalPages" :total-visible="3" density="compact" class="ms-auto" />
      </div>
    </v-card-text>

    <v-dialog v-model="isModalOpen" max-width="1200" transition="scale-transition">
      <v-card class="modal-card-premium rounded-xl overflow-hidden" elevation="0" color="surface">
        <div class="modal-layout-split">

          <div class="modal-video-section bg-black d-flex align-center justify-center position-relative">
            <video v-if="selectedItem?.video_link" ref="modalVideo" :src="selectedItem.video_link" autoplay muted
              playsinline controls class="video-player"></video>
            <div v-else class="text-white text-center pa-10">
              <v-icon size="64" color="grey">mdi-video-off</v-icon>
              <p>No Preview Available</p>
            </div>
          </div>

          <aside class="modal-info-sidebar d-flex flex-column">
            <div class="sidebar-header pa-6 pb-0">
              <div class="d-flex justify-space-between align-start mb-4">
                <div>
                  <v-chip color="primary" variant="flat" size="small" class="font-weight-black mb-2">DETAIL
                    DATA</v-chip>
                  <h2 class="text-h4 font-weight-black text-high-emphasis">
                    {{ selectedItem?.name || selectedItem?.brand || 'Detail Info' }}
                  </h2>
                </div>
                <v-btn icon="mdi-close" variant="tonal" size="small" @click="isModalOpen = false"></v-btn>
              </div>
              <v-divider class="mb-4"></v-divider>
            </div>

            <div class="sidebar-scroll-content flex-grow-1 overflow-y-auto pa-4">
              <v-expansion-panels variant="accordion" class="custom-accordion">
                <v-expansion-panel v-for="(group, gIndex) in groupedDetails" :key="gIndex" elevation="0"
                  class="border-bottom">
                  <v-expansion-panel-title class="py-4 text-primary font-weight-bold">
                    <v-icon size="20" class="mr-3">{{ getGroupIcon(group.title) }}</v-icon>
                    {{ group.title }}
                  </v-expansion-panel-title>

                  <v-expansion-panel-text>
                    <v-row dense class="pt-2">
                      <v-col v-for="(tile, index) in group.items" :key="index" cols="12">
                        <v-card variant="flat" class="pa-4 border rounded-lg bg-grey-lighten-4 mb-2">
                          <div class="d-flex align-center ga-3 mb-4">
                            <v-avatar :color="tile.iconColor || 'grey'" variant="tonal" size="32" rounded="lg">
                              <v-icon size="16">{{ tile.icon }}</v-icon>
                            </v-avatar>
                            <label class="text-caption font-weight-bold text-medium-emphasis text-uppercase">
                              {{ tile.label }}
                            </label>
                          </div>

                          <div v-if="tile.type === 'pie' && tile.genderData"
                            class="d-flex align-center justify-space-around py-2">
                            <v-progress-circular :model-value="tile.genderData.female" :size="80" :width="12"
                              color="pink" bg-color="blue">
                              <span class="text-caption font-weight-black">{{ tile.genderData.female }}%</span>
                            </v-progress-circular>

                            <div class="d-flex flex-column ga-1">
                              <div class="d-flex align-center ga-2">
                                <v-badge dot color="pink" inline></v-badge>
                                <span class="text-caption">Female ({{ tile.genderData.female }}%)</span>
                              </div>
                              <div class="d-flex align-center ga-2">
                                <v-badge dot color="blue" inline></v-badge>
                                <span class="text-caption">Male ({{ tile.genderData.male }}%)</span>
                              </div>
                            </div>
                          </div>
                          <div v-else-if="tile.type === 'bar'" class="d-flex align-end justify-space-around pt-2 pb-1"
                            style="height: 140px; border-bottom: 1px solid #e0e0e0;">
                            <div v-for="age in tile.ageData" :key="age.label"
                              class="d-flex flex-column align-center flex-grow-1 h-100 justify-end">
                              <span class="text-caption font-weight-black mb-1"
                                style="font-size: 0.7rem; color: #1565D8;">
                                {{ age.val }}%
                              </span>
                              <div class="rounded-t-sm" :style="{
                                height: age.val + '%',
                                width: '24px',
                                background: 'linear-gradient(to top, #1565D8, #64B5F6)'
                              }"></div>
                              <span class="text-caption mt-2 font-weight-bold"
                                style="font-size: 0.65rem; color: #616161;">
                                {{ age.label }}
                              </span>
                            </div>
                          </div>

                          <p v-else class="text-body-2 font-weight-bold ma-0 text-high-emphasis">
                            {{ tile.value }}
                          </p>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </aside>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// Tambahkan import API jika belum ada
import { fetchData } from '@/utils/apiBuilder';

const isLoadingDetail = ref(false);

const viewDetail = async (item: TableRow) => {
  selectedItem.value = item;
  isModalOpen.value = true;
  isLoadingDetail.value = true;

  try {
    // Tentukan kunci filter berdasarkan judul tabel
    // Jika tabel 'Top Groups', maka filter pakai 'group', dst.
    const filterKey = props.title.toLowerCase().includes('group') ? 'group' :
      props.title.toLowerCase().includes('brand') ? 'brand' : 'varian';

    // Ambil 1 contoh video terbaru untuk brand/group tersebut
    const response = await fetchData('list', { [filterKey]: [item.name] });

    if (response && response.data && response.data.length > 0) {
      // GABUNGKAN data agregat (name/mention) dengan data detail iklan (video_link/channel)
      selectedItem.value = { ...item, ...response.data[0] };
    }
  } catch (error) {
    console.error("Gagal memuat detail:", error);
  } finally {
    isLoadingDetail.value = false;
  }
};

interface TableRow {
  rank?: number
  mention: string | number
  isInternal?: boolean
  [key: string]: any
  gender_female?: number
  gender_male?: number
  age_distribution?: { label: string; val: number }[]
}

const formatCompact = (val: string | number) => {
  let num = Number(val);
  if (isNaN(num)) return val;

  if (num >= 1000) {
    const factor = Math.pow(10, Math.floor(Math.log10(num) / 3) * 3);
    num = Math.floor((num / factor) * 10) / 10 * factor;
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
};

const props = withDefaults(defineProps<{
  title: string
  headers: string[]
  rows: TableRow[]
  perPage?: number
}>(), {
  perPage:5
})

// --- State ---
const searchQuery = ref('')
const currentPage = ref(1)
const isModalOpen = ref(false)
const selectedItem = ref<TableRow | null>(null)

const perPage = computed(() => props.perPage)

// --- Logic Modal ---


const getGroupIcon = (title: string) => {
  switch (title) {
    case 'Media & Program': return 'mdi-television-play';
    case 'Product Identity': return 'mdi-tag-multiple';
    case 'Metrics': return 'mdi-chart-line';
    case 'Audience': return 'mdi-account-group';
    default: return 'mdi-information';
  }
};

const groupedDetails = computed(() => {
  if (!selectedItem.value) return [];
  const item = selectedItem.value;

  // Definisikan variabel details di sini agar bisa digunakan di return bawah
  const details = [
    // Media & Program
    { label: 'Channel', value: item.channel || '-', icon: 'mdi-television', iconColor: 'blue' },
    { label: 'Ads Type', value: item.ads_type || 'TVC', icon: 'mdi-bullhorn', iconColor: 'orange' },
    { label: 'Program', value: item.program || '-', icon: 'mdi-television-guide', iconColor: 'purple' },

    // Product Identity
    { label: 'Brand', value: item.brand?.[0] || item.name || '-', icon: 'mdi-watermark', iconColor: 'deep-orange' },
    { label: 'Group', value: item.group?.[0] || '-', icon: 'mdi-domain', iconColor: 'teal' },
    { label: 'Category', value: item.category || '-', icon: 'mdi-shape', iconColor: 'purple' },
    { label: 'Sub Category', value: item.sub_category || '-', icon: 'mdi-format-list-bulleted', iconColor: 'indigo' },
    { label: 'Variant', value: item.varian?.[0] || '-', icon: 'mdi-tag-multiple', iconColor: 'pink' },
    { label: 'Mention', value: formatCompact(item.mention || 0), icon: 'mdi-chart-bar', iconColor: 'blue' },

    // Metrics & Audience (Bisa dummy atau dari item jika ada)
    { label: 'Rate Card', value: 'Estimation', icon: 'mdi-cash-multiple', iconColor: 'green' },
    { label: 'Scope', value: 'National', icon: 'mdi-access-point-network', iconColor: 'cyan' },
    { label: 'Timezone', value: 'WIB', icon: 'mdi-clock-time-four-outline', iconColor: 'amber' },

    // Audience Data
    { label: 'Gender Dist.', type: 'pie', genderData: { female: 65, male: 35 }, icon: 'mdi-gender-male-female', iconColor: 'pink' },
    { label: 'Age Group', type: 'bar', ageData: [{ label: '18-24', val: 30 }, { label: '25+', val: 70 }], icon: 'mdi-account-group', iconColor: 'brown' },
    { label: 'Location', value: 'Java & Bali', icon: 'mdi-map-marker-radius', iconColor: 'red' }
  ];

  return [
    { title: 'Media & Program', items: details.slice(0, 3) },
    { title: 'Product Identity', items: details.slice(3, 9) },
    { title: 'Metrics', items: details.slice(9, 12) },
    { title: 'Audience', items: details.slice(12, 15) }
  ];
});

// --- Logic Pencarian & Highlight ---
const highlightText = (text: any) => {
  if (text === undefined || text === null) return '';
  const val = String(text);
  if (!searchQuery.value) return val;

  const q = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${q})`, 'gi');

  return val.replace(regex, '<mark class="highlight-mark">$1</mark>');
}
const modalVideo = ref<HTMLVideoElement | null>(null);

// Ambil data yang ingin ditampilkan di dalam list detail (exclude rank/internal info)
const displayDetails = computed(() => {
  if (!selectedItem.value) return {};
  const { rank, isInternal, video_link, ...rest } = selectedItem.value;
  return rest;
});

// Watch modal close untuk stop video
watch(isModalOpen, (isOpen) => {
  if (!isOpen && modalVideo.value) {
    modalVideo.value.pause();
  }
});

// Reset page jika search berubah
watch(searchQuery, () => (currentPage.value = 1))

// Reset page jika rows dari props berubah
watch(
  () => props.rows,
  () => {
    currentPage.value = 1
  },
  { deep: true }
)

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

.col-rank {
  width: 60px;
}

.col-mention {
  width: 85px;
}

.col-action {
  width: 70px;
}

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

.modal-layout-split {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  height: 80vh;
  background: #fff;
}

.modal-video-section {
  background: #000;
  overflow: hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.modal-info-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sidebar-scroll-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;
}

.custom-accordion .v-expansion-panel {
  background: transparent !important;
}

/* Responsif Mobile */
@media (max-width: 960px) {
  .modal-layout-split {
    grid-template-columns: 1fr;
    height: auto;
    max-height: 95vh;
  }

  .modal-video-section {
    aspect-ratio: 16/9;
  }
}

/* Styling tambahan untuk grafik di dalam modal */
.gender-pie {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.age-bar-container {
  gap: 8px;
}

.bar-item:hover {
  filter: brightness(1.2);
  cursor: pointer;
}

/* Memastikan teks label di dalam v-card modal rapi */
.ga-3 {
  gap: 12px !important;
}

.ga-1 {
  gap: 4px !important;
}

.ga-2 {
  gap: 8px !important;
}

/* Custom scrollbar untuk sidebar agar lebih elegan */
.sidebar-scroll-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-scroll-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>