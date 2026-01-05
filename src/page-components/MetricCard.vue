<template>
  <v-card :color="computedColor" class="metric-stat-card rounded-xl elevation-4 h-100 d-flex flex-column"
    variant="flat">
    <div class="card-overlay"></div>

    <v-card-text class="pa-0 d-flex flex-column h-100 position-relative" style="z-index: 2;">

      <div class="px-6 pt-6 d-flex justify-space-between align-start">
        <div class="d-flex flex-column">
          <span class="category-label text-white font-weight-bold mb-1 opacity-80">
            {{ title }}
          </span>
          <h2 class="display-value text-h3 font-weight-black text-white">
            {{ prefix }}{{ value }}
          </h2>
        </div>

        <v-avatar color="white" variant="tonal" size="48" rounded="lg" class="elevation-0">
          <v-icon :icon="icon" color="white" size="24"></v-icon>
        </v-avatar>
      </div>

      <v-spacer></v-spacer>

      <div class="chart-container mb-2">
        <v-sparkline :model-value="trendData" :labels="labels" :fill="true"
          :gradient="['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.1)', 'transparent']" height="100" padding="12"
          line-width="3" stroke-linecap="round" smooth auto-draw color="white" show-labels label-size="7"
          class="sparkline-custom"></v-sparkline>
      </div>

    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify'; // 1. Import useTheme

const theme = useTheme(); // 2. Akses instance tema

// 3. DEFINISI PALET WARNA
// Palet untuk Light Mode (Warna yang Anda gunakan sebelumnya, cukup vibrant)
const COLORS_LIGHT = [
  'indigo-darken-1',
  'teal-darken-1',
  'purple-darken-1',
  'deep-orange-darken-1',
  'pink-darken-1',
  'cyan-darken-1'
];

// Palet untuk Dark Mode 
// (Biasanya menggunakan varian yang lebih "deep" agar tidak terlalu silau di mata,
// atau varian "accent" jika ingin neon look. Di sini saya pilih varian darken-3/4 agar elegan)
const COLORS_DARK = [
  'indigo-darken-3',
  'teal-darken-3',
  'purple-darken-3',
  'deep-orange-darken-4',
  'pink-darken-3',
  'cyan-darken-3'
];

interface Props {
  title: string;
  value: string | number;
  prefix?: string;
  icon: string;
  trendData: number[];
  labels?: string[];
  index?: number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  labels: () => [],
  prefix: ''
});

// 4. LOGIKA PEMILIHAN WARNA DINAMIS
const computedColor = computed(() => {
  // Jika user override manual, pakai itu
  if (props.color) return props.color;

  // Cek apakah mode gelap sedang aktif
  const isDark = theme.global.current.value.dark;

  // Pilih array warna berdasarkan tema
  const targetPalette = isDark ? COLORS_DARK : COLORS_LIGHT;

  // Ambil warna berdasarkan index
  return targetPalette[props.index % targetPalette.length];
});
</script>

<style scoped>
.metric-stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-height: 200px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22) !important;
}

.category-label {
  font-size: 0.75rem;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.opacity-80 {
  opacity: 0.8;
}

.display-value {
  font-family: 'Inter', sans-serif !important;
  letter-spacing: -1.5px !important;
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.chart-container {
  width: 100%;
}

/* Overlay gradient agar warna solid terlihat lebih "mahal" */
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
  z-index: 1;
}

/* Memaksa text chart menjadi putih */
:deep(g text) {
  fill: rgba(255, 255, 255, 0.9) !important;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-anchor: middle;
  font-size: 6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>