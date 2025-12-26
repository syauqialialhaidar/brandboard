<template>
  <div class="brand-carousel-wrapper">
    <div class="brand-carousel-container">
      <swiper v-if="displayItems && displayItems.length" :effect="'coverflow'" :grab-cursor="true"
        :centered-slides="true" :slides-per-view="'auto'" :navigation="{
          prevEl: '.nav-prev',
          nextEl: '.nav-next'
        }" :coverflow-effect="{
          rotate: 0,
          stretch: 10,
          depth: 100,
          modifier: 2,
          slideShadows: false,
        }" :modules="modules" class="main-swiper" @slideChange="handleSlideChange" @swiper="onSwiperInit">
        <swiper-slide v-for="(item, i) in displayItems" :key="item.id || i" class="brand-slide">
          <v-card class="product-card" :class="'rank-' + item.originalRank" elevation="0">
            <div class="card-content">
              <div class="pa-3 text-center">
                <div class="rank-badge" :class="{ 'is-top-1': item.originalRank === 1 }">
                  <v-icon v-if="item.originalRank === 1" size="small" class="mr-1">mdi-crown</v-icon>
                  TOP {{ item.originalRank }}
                </div>
                <div class="brand-name">{{ item.name }}</div>
              </div>
              <div class="video-container mb-6 mx-3">
                <video v-if="item.preview_video" :ref="(el) => { if (el) videoRefs[i] = el }" :src="item.preview_video"
                  muted loop playsinline class="brand-media">
                </video>
                <v-img v-else :src="item.logo" class="brand-media" cover />
              </div>

              <div class="action-row">
                <v-btn variant="flat" class="view-btn" @click="viewDetails(item)">
                  View Details
                </v-btn>
              </div>
            </div>
          </v-card>
        </swiper-slide>

        <div class="nav-prev custom-nav-btn">
          <v-icon icon="mdi-chevron-left"></v-icon>
        </div>
        <div class="nav-next custom-nav-btn">
          <v-icon icon="mdi-chevron-right"></v-icon>
        </div>
      </swiper>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCoverflow, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

const props = defineProps<{ items: any[] }>();
const emit = defineEmits(['view-details']);
const modules = [EffectCoverflow, Navigation];
const videoRefs = ref<any[]>([]);

// 1. Logic Mengatur Urutan: Top 2, Top 1, Top 3
const displayItems = computed(() => {
  if (!props.items || props.items.length < 3) return props.items;

  // Beri tanda rank asli sebelum ditukar posisinya
  const mapped = props.items.map((item, index) => ({
    ...item,
    originalRank: index + 1
  }));

  const top1 = mapped[0];
  const top2 = mapped[1];
  const top3 = mapped[2];
  const others = mapped.slice(3);

  // Return dengan urutan 2 - 1 - 3
  return [top2, top1, top3, ...others];
});

const onSwiperInit = (swiper: any) => {
  // 2. Mulai langsung di index 1 (yaitu Top 1 yang sudah kita pindah ke tengah)
  setTimeout(() => {
    swiper.slideTo(1, 0);
    controlVideo(1);
  }, 100);
};

const handleSlideChange = (swiper: any) => {
  controlVideo(swiper.activeIndex);
};

const controlVideo = (activeIndex: number) => {
  videoRefs.value.forEach((video, index) => {
    if (video) {
      if (index === activeIndex) video.play().catch(() => { });
      else video.pause();
    }
  });
};

const viewDetails = (item: any) => {
  emit('view-details', item);
};
</script>

<style scoped>
.brand-carousel-wrapper {
  width: 100%;
  overflow: hidden;
}

.main-swiper {
  padding: 20px 0 !important;
  overflow: visible !important;
  position: relative;
  max-width: 350px;
  margin: 0 auto;
}

.brand-slide {
  filter: opacity(0.5);
  transition: all 0.4s ease;
  transform: scale(0.8);
}

.brand-slide.swiper-slide-active {
  filter: opacity(1);
  transform: scale(1.1);
  z-index: 5;
}

/* --- Background Per Card Berdasarkan Rank --- */
.product-card {
  border-radius: 24px !important;
  height: 400px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  position: relative;
  overflow: hidden;
}

/* Glassmorphism & Gradient Effects */
.rank-1 {
  background: linear-gradient(145deg, #fffdf0 0%, #fff9d6 100%) !important;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2) !important;
  border: 1px solid rgba(255, 215, 0, 0.4) !important;
}

.rank-2 {
  background: linear-gradient(145deg, #e0e0e0 0%, #82b2e3 100%) !important;
  box-shadow: 0 10px 25px rgba(160, 174, 192, 0.15) !important;
}

.rank-3 {
  background: linear-gradient(145deg, #f8c3a9 0%, #ffede5 100%) !important;
  box-shadow: 0 10px 25px rgba(205, 127, 50, 0.1) !important;
}

/* Badge Top Rank */
.rank-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.05);
  color: #666;
}

.is-top-1 {
  background: #FFD700 !important;
  color: #5d4d00 !important;
  box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3);
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 5px;
}

/* --- Animasi Zoom & Focus --- */
.brand-slide {
  width: 260px;
  filter: grayscale(40%) blur(1px);
  opacity: 0.6;
  transform: scale(0.85);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brand-slide.swiper-slide-active {
  filter: grayscale(0) blur(0);
  opacity: 1;
  transform: scale(1.1); /* Zoom effect lebih terasa */
  z-index: 10;
}

/* Video Container Glossy */
.video-container {
  height: 160px;
  border-radius: 18px;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.2);
  border: 4px solid white;
}

/* Tombol View Details yang Mengikuti Tema Rank */
.view-btn {
  width: 85%;
  height: 44px !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  background: #333 !important; /* Default gelap */
  color: white !important;
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
}

.rank-1 .view-btn {
  background: linear-gradient(135deg, #FFD700 0%, #f1a40e 100%) !important;
  color: #4a3900 !important;
}

/* Hilangkan tombol jika tidak aktif agar bersih */
.brand-slide:not(.swiper-slide-active) .view-btn,
.brand-slide:not(.swiper-slide-active) .rank-badge {
  opacity: 0;
  transform: translateY(10px);
}

.brand-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #757575;
  margin-bottom: 2px;
}

/* Warna Emas khusus untuk Top 1 */
.brand-label.is-top-1 {
  color: #FFD700 !important;
  font-size: 14px;
}

.brand-name {
  font-weight: 700;
  color: #333;
}

/* --- NAVIGASI --- */
.custom-nav-btn {
  position: absolute;
  top: 52%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  z-index: 999 !important;
  cursor: pointer;
  color: #1565c0;
}

.nav-prev {
  left: -20px;
}

.nav-next {
  right: -20px;
}

.swiper-button-next,
.swiper-button-prev {
  display: none !important;
}

/* --- VIDEO --- */
.video-container {
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.brand-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- BUTTON --- */
.action-row {
  display: flex;
  justify-content: center;
}

.view-btn {
  width: 70%;
  height: 40px !important;
  border-radius: 10px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.brand-slide:not(.swiper-slide-active) .view-btn {
  opacity: 0;
  pointer-events: none;
}
</style>