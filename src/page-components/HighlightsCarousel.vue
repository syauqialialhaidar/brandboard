<template>
  <v-card 
  class="insight-hub-wrapper pa-0 border-header-style overflow-hidden fill-height" 
  elevation="0" 
  color="surface"
>
    <div class="glass-canvas">

      <div class="glass-panel">
        <header class="header-nav">
          <div class="brand-identity-group">
            <div class="category-label-wrapper mb-3">
              <span class="category-label text-primary font-weight-bold">
                {{ totalTitle }}
              </span>
            </div>

            <div class="stats-and-nav d-flex align-center flex-wrap ga-4">
              <v-sheet class="stats-badge-group elevation-header border rounded-xl d-flex align-center px-6" height="64">
                <div class="stat-badge d-flex align-center">
                  <span class="stat-value text-high-emphasis">{{ totalItemsCount }}</span>
                  <span class="text-overline font-weight-bold ml-2 opacity-70">{{ itemLabel }}</span>
                </div>
                <div class="stat-separator mx-5"></div>
                <div class="stat-badge d-flex align-center">
                  <span class="stat-value text-high-emphasis">{{ totalValue }}</span>
                  <span class="stat-label text-medium-emphasis ml-2">Mentions</span>
                </div>
              </v-sheet>

              <v-sheet class="pagination-suite elevation-header border rounded-xl d-flex align-center px-4" height="64">
                <div class="date-info-container d-flex align-center mr-4 pr-4 border-right">
                  <v-icon size="18" color="primary" class="mr-2">mdi-calendar-clock</v-icon>
                  <div class="d-flex flex-column text-left">
                    <span class="text-caption font-weight-bold text-high-emphasis lh-1">
                      {{ dynamicDateRange }}
                    </span>
                  </div>
                </div>

                <v-btn icon variant="tonal" class="nav-arrow-btn" size="small" color="primary"
                  :disabled="currentPage === 0" @click="currentPage--">
                  <v-icon size="18">mdi-chevron-left</v-icon>
                </v-btn>

                <div class="page-numbers-display px-4 font-weight-bold">
                  <span class="current-page text-primary">{{ currentPage + 1 }}</span>
                  <span class="page-divider mx-1 opacity-30">/</span>
                  <span class="text-medium-emphasis">{{ totalPages }}</span>
                </div>

                <v-btn icon variant="tonal" class="nav-arrow-btn" size="small" color="primary" :loading="isLoadingMore"
                  :disabled="currentPage + 1 >= totalPages" @click="handleNext">
                  <v-icon size="18">mdi-chevron-right</v-icon>
                </v-btn>
              </v-sheet>
            </div>
          </div>
        </header>

        <div class="bento-grid mt-8">
          <v-card v-for="(item, i) in paginatedItems" :key="item.name"
            :class="['brand-card', `gradient-type-${Number(i) % 3}`]"
            class="elevation-0 rounded-xl overflow-hidden position-relative" @click="handleItemClick(item)">
            <div class="card-media-bg">
              <video v-if="item.preview_video" :src="item.preview_video" muted loop autoplay playsinline
                class="w-100 h-100" style="object-fit: cover;"></video>
            </div>

            <div class="card-overlay-content d-flex flex-column justify-center">
              <div class="text-container">
                <span class="text-overline font-weight-bold opacity-70">BRAND</span>
                <h3 class="text-h6 font-weight-black mb-0">{{ item.name }}</h3>
                <div class="d-flex align-baseline ga-1 mt-1">
                  <span class="text-h5 font-weight-black">{{ item.count }}</span>
                  <span class="text-caption font-weight-bold">MENTIONS</span>
                </div>
              </div>

              <v-btn icon variant="outlined" class="play-btn" size="x-small">
                <v-icon size="14">mdi-play</v-icon>
              </v-btn>
            </div>
          </v-card>
        </div>
      </div>
    </div>

    <v-dialog :model-value="showModal" @update:model-value="$emit('close-modal')" max-width="1150"
      transition="scale-transition">
      <v-card class="modal-card-premium rounded-xl overflow-hidden">
        <div class="modal-layout-split">
          <div class="modal-video-section bg-black d-flex align-center justify-center position-relative">
            <div v-if="isLoadingDetail" class="loader-state position-absolute">
              <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
            </div>
            <video v-if="!isLoadingDetail && activeVideo" ref="modalVideo" :src="activeVideo.video_link" autoplay
              controls class="w-100 h-100"></video>
          </div>

          <aside class="modal-info-sidebar d-flex flex-column pa-8">
            <div class="sidebar-top mb-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <v-chip color="primary" variant="flat" size="small" class="font-weight-black">Detail Ads</v-chip>
                <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close-modal')"></v-btn>
              </div>
              <h2 class="text-h3 font-weight-black text-high-emphasis">{{ selectedItem?.name }}</h2>
            </div>

            <div class="sidebar-scroll-content flex-grow-1 overflow-y-auto">
              <v-row dense>
                <v-col v-for="(tile, index) in modalDetails" :key="index" cols="12" sm="6">
                  <v-card variant="outlined" class="pa-4 border rounded-lg d-flex align-center ga-3 h-100">
                    <v-avatar :color="tile.iconColor || 'grey'" variant="tonal" size="40" rounded="lg">
                      <v-icon size="20">{{ tile.icon }}</v-icon>
                    </v-avatar>
                    <div>
                      <label class="text-caption font-weight-bold text-medium-emphasis text-uppercase d-block">{{
                        tile.label }}</label>
                      <p class="text-body-2 font-weight-bold ma-0 text-high-emphasis">{{ tile.value }}</p>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

          </aside>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';


const props = defineProps({
  // Data List
  totalTitle: { type: String, default: 'Corporate Mentions' },
  totalValue: { type: [String, Number], default: '0' },
  items: { type: Array as any, default: () => [] },
  totalItemsCount: { type: Number, default: 0 },
  isLoadingMore: { type: Boolean, default: false },
  itemLabel: { type: String, default: 'Brands' },

  // TAMBAHKAN DUA PROPS INI UNTUK FILTER TANGGAL
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },

  // Data Modal (Dikirim dari Page)
  showModal: { type: Boolean, default: false },
  isLoadingDetail: { type: Boolean, default: false },
  selectedItem: { type: Object as () => any, default: null },
  activeVideo: { type: Object as () => any, default: null }
});


const emit = defineEmits(['next-page', 'item-click', 'close-modal']);

const itemsPerPage = 3;
const currentPage = ref(0);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// COMPUTE TANGGAL OTOMATIS DARI DATA
const dynamicDateRange = computed(() => {
  // Jika props tanggal dari parent tersedia, gunakan itu
  if (props.startDate && props.endDate) {
    const start = formatDate(props.startDate);
    const end = formatDate(props.endDate);

    // Jika tanggal sama (misal 1 hari), tampilkan satu saja
    return start === end ? start : `${start} - ${end}`;
  }

  // Fallback jika tidak ada filter (Opsional)
  return 'All Time';
});


const getCardClass = (index: number) => {
  return ['brand-card', `gradient-type-${index % 3}`];
};

const totalPages = computed(() => Math.ceil(props.totalItemsCount / itemsPerPage) || 1);

const paginatedItems = computed(() => {
  const start = currentPage.value * itemsPerPage;
  return props.items.slice(start, start + itemsPerPage);
});

const modalDetails = computed(() => [
  { label: 'Channel', value: props.activeVideo?.channel || '-', icon: 'mdi-television', iconColor: 'blue' },
  { label: 'Campaign', value: props.activeVideo?.ads_type || 'TVC', icon: 'mdi-bullhorn', iconColor: 'orange' },
  { label: 'Group', value: props.activeVideo?.group?.[0] || '-', icon: 'mdi-domain', iconColor: 'teal' },
  { label: 'Category', value: props.activeVideo?.category || '-', icon: 'mdi-shape', iconColor: 'purple' },
  { label: 'Sub Cat', value: props.activeVideo?.sub_category || '-', icon: 'mdi-format-list-bulleted', iconColor: 'indigo' },
  { label: 'Variant', value: props.activeVideo?.varian?.[0] || '-', icon: 'mdi-tag-multiple', iconColor: 'pink' },
]);

const handleNext = () => {
  const nextPageIndex = currentPage.value + 1;
  // Jika data di array lokal kurang dari index yang dibutuhkan, minta data baru ke Page
  if (props.items.length <= nextPageIndex * itemsPerPage && props.items.length < props.totalItemsCount) {
    emit('next-page');
  }
  currentPage.value++;
};

const handleItemClick = (item: any) => {
  emit('item-click', item);
};
</script>

<style scoped>
.insight-hub-wrapper {
  padding: 0;
  height: 100%;
  /* Tambahkan ini */
  display: flex;
  flex-direction: column;
}

.glass-panel {
  padding: 32px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.category-label {
  font-size: 13px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.stat-separator {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
}

.border {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
  flex-grow: 1;
  margin-bottom: 20px;
  align-items: stretch;
}

@media (max-width: 1264px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile (Layar di bawah 768px): 1 Kolom */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }

  .glass-panel {
    padding: 16px;
    /* Perkecil padding di mobile agar tidak sempit */
  }

  /* Penyesuaian teks di mobile agar tidak terlalu besar */
  .text-container {
    padding: 30px;
  }

  .text-container h3 {
    font-size: 1.25rem !important;
  }
}

.brand-card {
  height: 100%;
  /* Ubah dari 200px ke 100% */
  min-height: 200px;
  /* Gunakan min-height agar tidak terlalu gepeng di layar kecil */
  color: white !important;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.brand-card:hover {
  transform: translateY(-5px);
}

.card-media-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.card-overlay-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 35%;
}

.text-container {
  width: 100%;
  padding: 70px;
}

.text-container h3 {
  font-size: 1.75rem !important;
  line-height: 1.2;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.play-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}

.gradient-type-0 .card-overlay-content {
  background: linear-gradient(90deg, transparent 0%, #1565D8 75%, #1565D8 100%);
}

.gradient-type-1 .card-overlay-content {
  background: linear-gradient(90deg, transparent 0%, #7B2CBF 75%, #7B2CBF 100%);
}

.gradient-type-2 .card-overlay-content {
  background: linear-gradient(90deg, transparent 0%, #C9184A 75%, #C9184A 100%);
}

.modal-layout-split {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  min-height: 600px;
}

@media (max-width: 960px) {

  .bento-grid,
  .modal-layout-split {
    grid-template-columns: 1fr;
  }

  .glass-panel {
    padding: 40px;
  }

  .card-overlay-content {
    padding-left: 40%;
  }
}

/* Garis pembatas vertikal antara tanggal dan tombol */
.border-right {
  border-right: 1px solid rgba(0, 0, 0, 0.1) !important;
  height: 35px;
}

.lh-1 {
  line-height: 1 !important;
}

.date-info-container {
  min-width: max-content;
}

/* Sembunyikan label periode di layar sangat kecil agar tidak sumpek */
@media (max-width: 600px) {
  .date-info-container {
    margin-right: 8px !important;
    padding-right: 8px !important;
  }

  .date-info-container .text-overline {
    display: none;
  }
}


/* Custom class untuk menyamakan dengan Header atas */
.border-header-style {
  border-radius: 20px !important; 
  border: 1px solid rgba(var(--v-border-color), 0.05) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
}

/* Shadow khusus untuk sheet/kotakan kecil di dalam agar konsisten */
.elevation-header {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(var(--v-border-color), 0.05) !important;
}

/* Memastikan wrapper mengikuti radius */
.insight-hub-wrapper {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Penting agar isi tidak keluar dari radius */
}

/* Update pada brand-card agar serasi (Opsional: Radius 20px) */
.brand-card {
  border-radius: 20px !important;
  height: 100%;
  min-height: 200px;
  color: white !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.brand-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}
</style>