<template>
  <v-card class="pa-6 main-container overflow-visible" :class="isDark ? 'theme-dark' : 'theme-light'" elevation="0"
    rounded="lg">
    <div class="d-flex flex-column flex-md-row align-stretch gap-6 position-relative" style="z-index: 2;">
      <v-card v-if="showTotal" class="hero-card-3d d-flex flex-column align-center justify-center flex-shrink-0"
        rounded="xl">
        <div class="shine-sweep"></div>
        <div class="deco-dot top-right"></div>
        <div class="deco-dot bottom-left"></div>
        <div
          class="text-overline text-white font-weight-bold mb-1 text-center px-2 z-index-1 tracking-widest opacity-80">
          {{ totalTitle }}
        </div>
        <div class="hero-number-wrapper z-index-1 my-2">
          <span class="hero-number text-white">{{ totalValue }}</span>
        </div>
        <div class="glow-circle top-left"></div>
        <div class="glow-circle bottom-right"></div>
      </v-card>

      <div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
        <div class="d-flex align-end justify-space-between mb-5 flex-wrap gap-4">
          <div class="d-flex align-center gap-4">
            <v-btn color="#2563EB" class="cta-btn-3d text-none px-6 text-white font-weight-bold" rounded="pill"
              height="44">
              <span>Brand Corporate</span>
            </v-btn>
          </div>
          <div class="d-flex align-center gap-2">
            <v-btn icon="mdi-arrow-left" variant="text" :class="isDark ? 'nav-btn-dark' : 'nav-btn-light'"
              class="nav-glass" size="40" @click="scrollLeft"></v-btn>
            <v-btn icon="mdi-arrow-right" variant="text" :class="isDark ? 'nav-btn-dark' : 'nav-btn-light'"
              class="nav-glass" size="40" @click="scrollRight"></v-btn>
          </div>
        </div>

        <div ref="carouselContainer" class="carousel-scroll-area py-4 px-1 mt-auto">
          <div v-for="(item, index) in items" :key="index" class="carousel-item-wrapper" @click="handleItemClick(item)">
            <v-card class="item-card-3d d-flex align-center overflow-hidden" :class="getColorVariant(index)"
              rounded="xl">

              <div class="video-preview-container">
                <video v-if="item.preview_video" :src="item.preview_video" muted loop autoplay playsinline
                  class="card-video-bg"></video>
                <div v-else class="avatar-fallback d-flex align-center justify-center">
                  <span class="text-h4 font-weight-bold text-white opacity-40">{{ item.name.charAt(0) }}</span>
                </div>
                <div class="video-gradient-overlay"></div>
              </div>

              <div class="text-content pl-4 pr-4 position-relative z-index-2 overflow-hidden">
                <div class="text-caption font-weight-bold text-white mb-n1 opacity-70">BRAND</div>
                <div class="text-subtitle-1 font-weight-black text-white text-truncate">{{ item.name }}</div>
                <div class="d-flex align-baseline mt-1">
                  <span class="text-h5 font-weight-black text-white text-shadow-soft">{{ item.count }}</span>
                  <span class="text-caption text-white ml-1 font-weight-medium">ADS</span>
                </div>
              </div>

              <div class="card-shine"></div>
              <div class="play-indicator">
                <v-icon icon="mdi-play" color="white" size="18"></v-icon>
              </div>
            </v-card>
          </div>
        </div>
      </div>
    </div>

    <v-dialog v-model="showModal" max-width="950" transition="scale-transition">
      <v-card class="rounded-xl overflow-hidden glass-modal" elevation="24">
        <div class="modal-header d-flex justify-space-between align-center px-8 py-5">
          <div class="d-flex align-center">
            <div class="header-icon-box mr-4">
              <v-icon icon="mdi-play-circle" color="white" size="28"></v-icon>
            </div>
            <div>
              <div class="text-overline text-white opacity-70 mb-n1">Ad Showcase</div>
              <div class="text-h5 font-weight-black text-white">{{ selectedItem?.name }}</div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="tonal" color="white" class="close-btn" @click="showModal = false"></v-btn>
        </div>

        <div class="pa-8 bg-modal-content">
          <div v-if="isLoading" class="d-flex flex-column justify-center align-center" style="height: 450px;">
            <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
            <div class="mt-4 text-body-1 font-weight-medium text-secondary">Fetching latest media...</div>
          </div>

          <div v-else-if="activeVideo">
            <v-row>
              <v-col cols="12" lg="7">
                <div class="video-wrapper elevation-12">
                  <video :src="activeVideo.video_link" controls autoplay class="main-video-player"></video>
                  <div class="video-overlay-badge">
                    <v-chip size="x-small" color="error" class="font-weight-bold" variant="flat">HD ORIGINAL</v-chip>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" lg="5">
                <v-card variant="flat" class="info-side-card pa-6 rounded-xl border h-100 d-flex flex-column">
                  <div class="d-flex align-center mb-4">
                    <v-avatar color="primary" size="48" class="mr-3 elevation-4">
                      <span class="text-h6 text-white">{{ selectedItem?.name?.charAt(0) }}</span>
                    </v-avatar>
                    <div class="overflow-hidden">
                      <div class="text-h6 font-weight-bold leading-tight text-truncate">{{ activeVideo.nama_video }}
                      </div>
                      <div class="text-caption text-medium-emphasis">ID: #{{ activeVideo.id?.toString().slice(-6) ||
                        'N/A' }}</div>
                    </div>
                  </div>

                  <v-divider class="mb-5"></v-divider>

                  <div class="metadata-grid">
                    <div class="meta-item">
                      <v-icon icon="mdi-calendar-range" size="18" color="primary"></v-icon>
                      <div class="ml-3">
                        <div class="meta-label">Broadcast Date</div>
                        <div class="meta-value">{{ formatDateTime(activeVideo.time) }}</div>
                      </div>
                    </div>
                    <div class="meta-item">
                      <v-icon icon="mdi-television-classic" size="18" color="info"></v-icon>
                      <div class="ml-3">
                        <div class="meta-label">Channel</div>
                        <div class="meta-value">{{ activeVideo.channel || 'N/A' }}</div>
                      </div>
                    </div>
                    <div class="meta-item">
                      <v-icon icon="mdi-tag-multiple" size="18" color="success"></v-icon>
                      <div class="ml-3">
                        <div class="meta-label">Category</div>
                        <div class="meta-value text-truncate">{{ activeVideo.category || 'N/A' }}</div>
                      </div>
                    </div>
                  </div>

                  <v-spacer></v-spacer>

                  <v-btn block color="primary" height="48" class="mt-6 font-weight-bold rounded-lg text-none"
                    elevation="4">
                    <v-icon start icon="mdi-chart-box-outline"></v-icon>
                    Full Analytics Report
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>

            <div class="mt-8">
              <div class="d-flex align-center mb-4">
                <span class="text-subtitle-1 font-weight-black text-uppercase tracking-wider">Production Details</span>
                <v-divider class="ml-4"></v-divider>
              </div>

              <v-row dense>
                <v-col cols="12" sm="4">
                  <div class="detail-sheet">
                    <span class="detail-label">Brand Group</span>
                    <span class="detail-text">{{ activeVideo.group?.[0] || 'N/A' }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="detail-sheet">
                    <span class="detail-label">Variant / Type</span>
                    <span class="detail-text">{{ activeVideo.varian?.[0] || 'N/A' }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="detail-sheet">
                    <span class="detail-label">Sub-Category</span>
                    <span class="detail-text">{{ activeVideo.sub_category || 'N/A' }}</span>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="detail-sheet ambassador">
                    <v-icon icon="mdi-account-star" color="amber-darken-2" class="mr-2"></v-icon>
                    <span class="detail-label mr-2">Ambassador:</span>
                    <span class="detail-text">{{ activeVideo.brand_ambassador?.length > 0 ?
                      activeVideo.brand_ambassador.join(', ') : '-' }}</span>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>

          <div v-else class="text-center py-16">
            <v-icon icon="mdi-video-off-outline" size="80" color="grey-lighten-1" class="mb-4"></v-icon>
            <div class="text-h6 font-weight-bold text-grey-darken-1">No Media Assets Found</div>
            <div class="text-body-2 text-grey">The requested video is currently unavailable in our archives.</div>
            <v-btn variant="outlined" color="primary" class="mt-6 px-8" @click="showModal = false">Back to
              Dashboard</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify';
import type { PropType } from 'vue';
import moment from 'moment';
import { fetchData } from '@/utils/apiBuilder';
import { useAppStore } from '@/stores/app';

const props = defineProps({
  showTotal: { type: Boolean, default: true },
  totalTitle: { type: String, default: 'OUR CORPORATE ADS' },
  totalValue: { type: [String, Number], default: '0' },
  items: { type: Array as PropType<any[]>, required: true },
});

const emit = defineEmits(['item-click']);

const theme = useTheme();
const appStore = useAppStore();
const isDark = computed(() => theme.global.current.value.dark);

// Modal & Data States
const showModal = ref(false);
const isLoading = ref(false);
const selectedItem = ref<any>(null);
const brandVideos = ref<any[]>([]);

// Carousel Logic
const carouselContainer = ref<HTMLElement | null>(null);
const scrollLeft = () => carouselContainer.value?.scrollBy({ left: -240, behavior: 'smooth' });
const scrollRight = () => carouselContainer.value?.scrollBy({ left: 240, behavior: 'smooth' });

const activeVideo = computed(() => brandVideos.value.length > 0 ? brandVideos.value[0] : null);

const handleItemClick = async (item: any) => {
  selectedItem.value = item;
  showModal.value = true;
  brandVideos.value = [];
  isLoading.value = true;

  try {
    const specificFilter = {
      group: [appStore.internalGroup],
      brand: [item.name]
    };
    const response = await fetchData('list', specificFilter);
    if (response && response.data) {
      brandVideos.value = response.data;
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  } finally {
    isLoading.value = false;
  }
  emit('item-click', item);
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-';
  return moment(dateStr).format('DD MMM YYYY, HH:mm');
};

const getColorVariant = (index: number) => {
  const variants = ['variant-blue', 'variant-purple', 'variant-pink', 'variant-orange', 'variant-teal'];
  return variants[index % variants.length];
};
</script>

<style scoped>
/* --- UTILITIES --- */
.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}

.gap-6 {
  gap: 24px;
}

.z-index-1 {
  z-index: 1;
}

.tracking-widest {
  letter-spacing: 3px !important;
}

/* --- MAIN CONTAINER --- */
.main-container {
  position: relative;
  transition: all 0.3s ease;
  border: none !important;
}

.theme-light {
  background-color: #ffffff !important;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1) !important;
}

.theme-dark {
  background-color: #1e1e1e !important;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5) !important;
}

/* --- HERO CARD --- */
.hero-card-3d {
  width: 240px;
  min-height: 220px;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 100% 0%, #3B82F6, #2563EB, #1E3A8A);
  box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.6);
}

.hero-number {
  font-size: 88px;
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -3px;
  background: linear-gradient(180deg, #ffffff 20%, #bfdbfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* --- CAROUSEL ITEMS --- */
.carousel-scroll-area {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  scrollbar-width: none;
}

.carousel-scroll-area::-webkit-scrollbar {
  display: none;
}

.item-card-3d {
  width: 200px;
  height: 150px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  background: linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bot) 100%) !important;
  box-shadow: 0 6px 0 var(--shadow-solid), 0 12px 15px -4px var(--shadow-soft), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.variant-blue {
  --bg-top: #3B82F6;
  --bg-bot: #2563EB;
  --shadow-solid: #1D4ED8;
  --shadow-soft: rgba(37, 99, 235, 0.4);
}

.variant-purple {
  --bg-top: #8B5CF6;
  --bg-bot: #7C3AED;
  --shadow-solid: #6D28D9;
  --shadow-soft: rgba(124, 58, 237, 0.4);
}

.variant-pink {
  --bg-top: #F472B6;
  --bg-bot: #DB2777;
  --shadow-solid: #BE185D;
  --shadow-soft: rgba(219, 39, 119, 0.4);
}

.variant-orange {
  --bg-top: #FBBF24;
  --bg-bot: #D97706;
  --shadow-solid: #B45309;
  --shadow-soft: rgba(217, 119, 6, 0.4);
}

.variant-teal {
  --bg-top: #2DD4BF;
  --bg-bot: #0D9488;
  --shadow-solid: #0F766E;
  --shadow-soft: rgba(13, 148, 136, 0.4);
}

.item-card-3d:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 var(--shadow-solid);
}

/* --- MODAL STYLING --- */
.glass-modal {
  background: rgba(var(--v-theme-surface), 0.98) !important;
  backdrop-filter: blur(10px);
}

.modal-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
}

.header-icon-box {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.bg-modal-content {
  background-color: #f8fafc;
}

.theme-dark .bg-modal-content {
  background-color: #0f172a;
}

.video-wrapper {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  border: 4px solid #fff;
}

.theme-dark .video-wrapper {
  border-color: #334155;
}

.main-video-player {
  width: 100%;
  aspect-ratio: 16/9;
  display: block;
  object-fit: contain;
}

.info-side-card {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
}

.theme-dark .info-side-card {
  background: #1e293b !important;
  border-color: #334155 !important;
}

.metadata-grid {
  display: grid;
  gap: 16px;
}

.meta-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #64748b;
}

.meta-value {
  font-size: 0.9rem;
  font-weight: 600;
}

.detail-sheet {
  background: #f1f5f9;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.theme-dark .detail-sheet {
  background: #1e293b;
}

.detail-sheet.ambassador {
  flex-direction: row;
  align-items: center;
  border-left: 4px solid #f59e0b;
}

/* Animations */
.shine-sweep {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: skewX(-20deg);
  animation: shine 6s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }

  20% {
    left: 200%;
  }

  100% {
    left: 200%;
  }
}


.item-card-3d {
  width: 280px;
  /* Gue lebarin dikit biar video kelihatan jelas */
  height: 140px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, var(--bg-top) 0%, var(--bg-bot) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 10px 20px -5px var(--shadow-soft);
}

.item-card-3d:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px -5px var(--shadow-soft);
}

/* Container Video di Sebelah Kiri */
.video-preview-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 60%;
  /* Ambil 60% lebar kartu */
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.card-video-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  /* Biar tetep kelihatan blend sama warna */
}

/* MAGIC GRADIENT: Ini yang bikin video nge-fade ke warna solid */
.video-gradient-overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.1) 40%,
      var(--bg-top) 95%
      /* Menutup video di sisi kanan dengan warna tema */
    );
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
}

.text-content {
  width: 100%;
  padding-left: 55% !important;
  /* Dorong teks ke area solid (kanan) */
  z-index: 2;
}

/* Play button kecil di pojok */
.play-indicator {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Re-define shadow colors agar lebih punchy */
.variant-blue {
  --bg-top: #2563EB;
  --bg-bot: #1E4ED8;
  --shadow-soft: rgba(37, 99, 235, 0.5);
}

.variant-purple {
  --bg-top: #7C3AED;
  --bg-bot: #6D28D9;
  --shadow-soft: rgba(124, 58, 237, 0.5);
}

.variant-pink {
  --bg-top: #DB2777;
  --bg-bot: #BE185D;
  --shadow-soft: rgba(219, 39, 119, 0.5);
}

.variant-orange {
  --bg-top: #D97706;
  --bg-bot: #B45309;
  --shadow-soft: rgba(217, 119, 6, 0.5);
}

.variant-teal {
  --bg-top: #0D9488;
  --bg-bot: #0F766E;
  --shadow-soft: rgba(13, 148, 136, 0.5);
}
</style>