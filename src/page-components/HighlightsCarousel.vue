<template>
  <v-card class="insight-hub-wrapper pa-0 border-header-style overflow-hidden fill-height" elevation="0"
    color="surface">
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
              <v-sheet class="stats-badge-group elevation-header border rounded-xl d-flex align-center px-6"
                height="64">
                <div class="stat-badge d-flex align-center">
                  <span class="stat-value text-high-emphasis">
                    {{ formatCompact(totalItemsCount) }} </span>
                  <span class="text-overline font-weight-bold ml-2 opacity-70">{{ itemLabel }}</span>
                </div>

                <div class="stat-separator mx-5"></div>

                <div class="stat-badge d-flex align-center">
                  <span class="stat-value text-high-emphasis">
                    {{ formatCompact(totalValue) }} </span>
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
              <video v-if="item.preview_video" :src="item.preview_video" loading="lazy" muted loop autoplay playsinline
                class="w-100 h-100" style="object-fit: cover;"></video>
            </div>

            <div class="card-overlay-content d-flex flex-column justify-center">
              <div class="text-container">
                <span class="text-overline font-weight-bold opacity-70">BRAND</span>
                <h3 class="text-h6 font-weight-black mb-0">{{ item.name }}</h3>
                <div class="d-flex align-baseline ga-1 mt-1">
                  <span class="text-h5 font-weight-black">
                    {{ formatCompact(item.count) }}
                  </span>
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

    <v-dialog :model-value="showModal" @update:model-value="$emit('close-modal')" max-width="1200"
      transition="scale-transition">
      <v-card class="modal-card-premium rounded-xl overflow-hidden" elevation="0" color="surface">
        <div class="modal-layout-split">
          <div class="modal-video-section bg-black d-flex align-center justify-center position-relative">
            <div v-if="isLoadingDetail" class="loader-state position-absolute">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            </div>
            <video v-if="!isLoadingDetail && activeVideo" ref="modalVideo" :src="activeVideo.video_link" autoplay muted
              playsinline controls class="video-player">
            </video>

          </div>

          <aside class="modal-info-sidebar d-flex flex-column">
            <div class="sidebar-header pa-6 pb-0">
              <div class="d-flex justify-space-between align-start mb-4">
                <div>
                  <v-chip color="primary" variant="flat" size="small" class="font-weight-black mb-2">DETAIL ADS</v-chip>
                  <h2 class="text-h4 font-weight-black text-high-emphasis">{{ selectedItem?.name }}</h2>
                </div>
                <v-btn icon="mdi-close" variant="tonal" size="small" @click="$emit('close-modal')"></v-btn>
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
                            <label class="text-caption font-weight-bold text-medium-emphasis text-uppercase">{{
                              tile.label }}</label>
                          </div>

                          <div v-if="tile.type === 'pie'" class="d-flex align-center justify-space-around py-2">
                            <v-progress-circular :model-value="tile.genderData.female" :size="80" :width="15"
                              color="pink" background-color="blue" class="gender-pie">
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

                          <div v-else-if="tile.type === 'bar'"
                            class="age-bar-container d-flex align-end justify-space-around pt-2 pb-1"
                            style="height: 140px; border-bottom: 1px solid #e0e0e0;">
                            <div v-for="age in tile.ageData" :key="age.label"
                              class="d-flex flex-column align-center flex-grow-1 h-100 justify-end"
                              style="position: relative;">

                              <span class="text-caption font-weight-black mb-1"
                                style="font-size: 0.7rem !important; color: var(--v-theme-primary);">
                                {{ age.val }}%
                              </span>

                              <v-tooltip location="top" :text="age.val + '%'">
                                <template v-slot:activator="{ props }">
                                  <div v-bind="props" class="bar-item rounded-t-sm" :style="{
                                    height: age.val + '%',
                                    width: '28px',
                                    background: 'linear-gradient(to top, #1565D8, #64B5F6)',
                                    transition: 'height 0.5s ease-in-out'
                                  }"></div>
                                </template>
                              </v-tooltip>

                              <span class="text-caption mt-2 font-weight-bold"
                                style="font-size: 0.65rem !important; color: #616161; white-space: nowrap;">
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
import { ref, computed, watch, nextTick } from 'vue';
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
  const details = modalDetails.value;
  return [
    { title: 'Media & Program', items: details.slice(0, 3) },
    { title: 'Product Identity', items: details.slice(3, 9) },
    { title: 'Metrics', items: details.slice(9, 12) },
    { title: 'Audience', items: details.slice(12, 15) }
  ];
});

const props = defineProps({
  // Data List
  totalTitle: { type: String, default: 'Corporate Mentions' },
  totalValue: { type: [String, Number], default: '0' },
  items: { type: Array as any, default: () => [] },
  totalItemsCount: { type: Number, default: 0 },
  isLoadingMore: { type: Boolean, default: false },
  itemLabel: { type: String, default: 'Brands' },

  // Filter Tanggal
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },

  // Data Modal
  showModal: { type: Boolean, default: false },
  isLoadingDetail: { type: Boolean, default: false },
  selectedItem: { type: Object as () => any, default: null },
  activeVideo: { type: Object as () => any, default: null }
});

const isWaitingForData = ref(false);
const emit = defineEmits(['next-page', 'item-click', 'close-modal']);
const itemsPerPage = 3;
const currentPage = ref(0);
const modalVideo = ref<HTMLVideoElement | null>(null);

// --- UTILS & FORMATTERS ---
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// 1. Format Rupiah
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// 2. Generator Dummy Rate Card (Random 15jt - 75jt)
const getDummyRate = () => {
  const min = 15000000;
  const max = 75000000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 3. Generator Dummy Program Name berdasarkan Channel
const getDummyProgram = (channelName: string) => {
  const c = channelName?.toLowerCase() || '';
  if (c.includes('rcti')) return 'Ikatan Cinta';
  if (c.includes('sctv')) return 'Takdir Cinta Yang Kupilih';
  if (c.includes('indosiar')) return 'D\'Academy 6';
  if (c.includes('trans')) return 'Bioskop Trans TV';
  return 'Prime Time News';
};

// --- COMPUTED PROPERTIES ---

const dynamicDateRange = computed(() => {
  if (props.startDate && props.endDate) {
    const start = formatDate(props.startDate);
    const end = formatDate(props.endDate);
    return start === end ? start : `${start} - ${end}`;
  }
  return 'All Time';
});

const totalPages = computed(() => Math.ceil(props.totalItemsCount / itemsPerPage) || 1);

const paginatedItems = computed(() => {
  const start = currentPage.value * itemsPerPage;
  return props.items.slice(start, start + itemsPerPage);
});

// --- MAIN MODAL DATA LOGIC (HYBRID) ---
const modalDetails = computed((): any[] => {
  // Safety check
  const video = props.activeVideo || {};

  // Ambil data real untuk helper
  const realChannel = video.channel ? video.channel.toUpperCase() : '-';

  return [
    // === GROUP 1: MEDIA & PROGRAM INFO ===
    {
      label: 'Channel',
      value: realChannel, // DATA ASLI
      icon: 'mdi-television',
      iconColor: 'blue'
    },
    {
      label: 'Program Name',
      value: getDummyProgram(realChannel), // DUMMY
      icon: 'mdi-television-guide',
      iconColor: 'deep-purple'
    },
    {
      label: 'Program Type',
      value: 'Sinetron / Drama', // DUMMY
      icon: 'mdi-playlist-check',
      iconColor: 'indigo'
    },

    // === GROUP 2: PRODUCT IDENTITY (DATA ASLI) ===
    {
      label: 'Brand',
      value: video.brand?.[0] || '-', // DATA ASLI
      icon: 'mdi-watermark',
      iconColor: 'deep-orange'
    },
    {
      label: 'Group',
      value: video.group?.[0] || '-', // DATA ASLI
      icon: 'mdi-domain',
      iconColor: 'teal'
    },
    {
      label: 'Category',
      value: video.category || '-', // DATA ASLI
      icon: 'mdi-shape',
      iconColor: 'purple'
    },
    {
      label: 'Sub Category',
      value: video.sub_category || '-', // DATA ASLI
      icon: 'mdi-format-list-bulleted',
      iconColor: 'indigo'
    },
    {
      label: 'Variant',
      value: video.varian?.[0] || '-', // DATA ASLI
      icon: 'mdi-tag-multiple',
      iconColor: 'pink'
    },
    {
      label: 'Ads Type',
      value: video.ads_type || 'TVC', // DATA ASLI
      icon: 'mdi-bullhorn',
      iconColor: 'orange'
    },

    // === GROUP 3: BROADCAST METRICS (DUMMY) ===
    {
      label: 'Rate Card (/ 30s)',
      value: formatCurrency(getDummyRate()), // DUMMY
      icon: 'mdi-cash-multiple',
      iconColor: 'green'
    },
    {
      label: 'Broadcast Scope',
      value: 'National (FTA)', // DUMMY
      icon: 'mdi-access-point-network',
      iconColor: 'cyan'
    },
    {
      label: 'Timezone',
      value: 'WIB / GMT+7', // DUMMY
      icon: 'mdi-clock-time-four-outline',
      iconColor: 'amber'
    },

    {
      label: 'Gender Distribution',
      type: 'pie',
      genderData: { female: 65, male: 35 },
      icon: 'mdi-gender-male-female',
      iconColor: 'pink accent-3'
    },
    {
      label: 'Age Group',
      type: 'bar',
      ageData: [
        { label: '18-24', val: 40 },
        { label: '25-34', val: 85 },
        { label: '35-44', val: 60 },
        { label: '45+', val: 30 }
      ],
      icon: 'mdi-account-group',
      iconColor: 'brown'
    },
    {
      label: 'Location',
      value: 'Java, Bali, Sumatra',
      icon: 'mdi-map-marker-radius',
      iconColor: 'red'
    },
  ];
});
// --- METHODS ---

const handleNext = () => {
  const nextPageIndex = currentPage.value + 1;
  const targetIndexNeeded = nextPageIndex * itemsPerPage; // Index minimal yang harus ada

  // Jika halaman berikutnya masih dalam range total data yang ada di server
  if (nextPageIndex < totalPages.value) {

    // Cek apakah data di array 'items' sudah cukup untuk menampilkan full slot di page depan?
    // Kita butuh minimal (targetIndexNeeded + itemsPerPage) data di dalam array
    if (props.items.length < (targetIndexNeeded + itemsPerPage) && props.items.length < props.totalItemsCount) {
      isWaitingForData.value = true;
      emit('next-page'); // Minta data ke parent

      // JANGAN pindahkan currentPage.value++ di sini
      // Kita tunggu datanya sampai dulu
    } else {
      // Jika data sudah ready di array, langsung pindah
      currentPage.value++;
    }
  }
};

const handleItemClick = (item: any) => {
  emit('item-click', item);
};
watch(() => props.items.length, (newLength) => {
  // Jika kita sedang menunggu data untuk pindah page
  if (isWaitingForData.value) {
    const nextPageIndex = currentPage.value + 1;
    const targetIndexNeeded = nextPageIndex * itemsPerPage;

    // Jika data yang baru datang sudah cukup untuk mengisi minimal 1 slot penuh di page depan
    // Atau jika itu adalah sisa data terakhir (totalItemsCount)
    if (newLength >= (targetIndexNeeded + 1) || newLength === props.totalItemsCount) {
      currentPage.value++;
      isWaitingForData.value = false; // Reset penanda
    }
  }
});
watch(() => props.activeVideo, async (val) => {
  if (val?.video_link) {
    await nextTick();
    const video = modalVideo.value;
    if (video) {
      video.load();
      video.play().catch(() => {
        // autoplay bisa diblok, ignore
      });
    }
  }
});
watch(() => props.showModal, (open) => {
  if (!open && modalVideo.value) {
    modalVideo.value.pause();
    modalVideo.value.src = '';
  }
});

</script>

<style scoped>
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
  overflow: hidden;
  /* Penting agar isi tidak keluar dari radius */
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

/* Container Utama Modal */
.modal-layout-split {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  /* Sedikit dikecilkan rasio kirinya */
  height: 80vh;
  /* Batasi tinggi agar tidak meluber */
  background: #fff;
}

/* Sisi Kiri (Video) */
.modal-video-section {
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.video-player {
  width: 100%;
  height: 100%;
  /* PENTING: Gunakan 'contain' agar video tidak terdistorsi 
     meskipun rasio video berbeda dengan rasio kotak */
  object-fit: contain;
}

/* Sisi Kanan (Informasi) */
.modal-info-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  /* Mencegah seluruh sidebar ikut scroll */
}

/* Area Scroll Info */
.sidebar-scroll-content {
  flex-grow: 1;
  overflow-y: auto;
  /* Hanya area ini yang boleh scroll */
  padding: 24px;
}

/* Perbaikan Text Truncate agar tidak merusak layout kartu kecil */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

/* Fix untuk Mobile */
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

.custom-accordion .v-expansion-panel {
  background: transparent !important;
}

.custom-accordion .v-expansion-panel:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.custom-accordion .v-expansion-panel-title--active {
  background: rgba(var(--v-theme-primary), 0.05) !important;
}

/* Memastikan konten di dalam accordion tidak terlalu menjorok */
:deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 12px 16px 12px !important;
}
</style>