<template>
  <v-card class="pa-0 pb-4 rounded-lg overflow-hidden d-flex flex-column" color="surface" style="height: 100%;">

    <div class="d-flex flex-wrap align-center pa-4 ga-4">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-0">{{ title }}</v-card-title>
      <v-spacer></v-spacer>
      <slot name="append-header"></slot>
    </div>

    <v-divider class="mb-4"></v-divider>

    <v-card-text class="pa-4 d-flex flex-column flex-grow-1">
      <div v-if="isLoading" class="d-flex justify-center align-center fill-height">
        <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
      </div>

      <div v-else class="content-container flex-grow-1 d-flex flex-column justify-center">
        <div class="grid-container" :class="{ 'has-selection': selectedIndex !== null }" :style="gridStyle">
          <div v-for="(item, index) in radialData" :key="index" class="grid-slot">
            <div v-if="item" class="mini-block" :class="{ 'is-active': selectedIndex === index }"
              :style="getBlockTheme(item.value)" @click="handleInteraction(item, index)">
              <div class="text-center px-1">
                <div class="mini-label">{{ item.groupName }}</div>
                <div class="mini-value">{{ formatNumber(item.value) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-center gap-6 mt-12">
          <div class="stat-tag" @click="selectedIndex = null">
            <span class="tag-label">Total</span>
            <span class="tag-val">{{ totalCorporate }}</span>
          </div>
          <div class="stat-tag dark-blue">
            <span class="tag-label">Mentions</span>
            <span class="tag-val">{{ totalMentions.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface HeatmapDetail { groupName: string; value: number; }
interface GridPosition { r: number; c: number; dist: number; }

const props = defineProps<{
  title?: string; // Tambahan prop untuk judul
  data: Array<{ details: any[] }>;
  isLoading: boolean;
}>();

const emit = defineEmits(['item-click']);
const selectedIndex = ref<number | null>(null);
const allData = computed(() => props.data.flatMap(d => d.details));

const columns = 8;
const blockSizing = 75;
const gapSize = 14;

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns}, ${blockSizing}px)`,
  justifyContent: 'center',
  gap: `${gapSize}px`,
  perspective: '1200px'
}));

const radialData = computed(() => {
  if (allData.value.length === 0) return [];
  const sorted = [...allData.value].sort((a, b) => b.value - a.value);
  const rows = Math.ceil(sorted.length / columns);
  const grid = new Array<HeatmapDetail | null>(rows * columns).fill(null);
  const centerX = (columns - 1) / 2;
  const centerY = (rows - 1) / 2;

  const positions: GridPosition[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const dist = Math.sqrt(Math.pow(r - centerY, 2) + Math.pow(c - centerX, 2));
      positions.push({ r, c, dist });
    }
  }
  positions.sort((a, b) => a.dist - b.dist);
  sorted.forEach((item, index) => {
    if (positions[index]) {
      const { r, c } = positions[index];
      grid[r * columns + c] = item;
    }
  });
  return grid;
});

const getBlockTheme = (val: number) => {
  const max = Math.max(...allData.value.map(i => i.value)) || 1;
  const ratio = val / max;
  const h = 210; // 165 (Hijau) diganti ke 210 (Biru)
  const s = 30 + (ratio * 50);
  const l = 95 - (ratio * 55);

  return {
    '--bg': `hsl(${h}, ${s}%, ${l}%)`,
    '--color': l < 60 ? 'white' : '#475569',
    '--shd': l < 60 ? 'rgba(25, 118, 210, 0.2)' : '#d1d9e6'
  };
};


const handleInteraction = (item: HeatmapDetail, index: number) => {
  selectedIndex.value = selectedIndex.value === index ? null : index;
  emit('item-click', item);
};

const formatNumber = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;
const totalCorporate = computed(() => allData.value.length);
const totalMentions = computed(() => allData.value.reduce((a, b) => a + b.value, 0));
</script>

<style scoped>
.v-card {
  /* Biarkan Vuetify mengatur background secara otomatis */
  transition: all 0.3s ease;
}

.grid-container.has-selection .mini-block:not(.is-active) {
  filter: blur(3px) grayscale(0.8) opacity(0.4);
  transform: scale(0.9);
  /* Opsional: sedikit mengecilkan yang tidak terpilih */
  pointer-events: none;
  /* Mencegah interaksi pada item yang ter-blur */
}

.mini-block {
  width: 75px;
  height: 75px;
  background: var(--bg);
  border-radius: 12px;
  /* Sesuaikan dengan rounded-lg */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  /* Gunakan shadow yang lebih halus/standar */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 2px solid rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
}

.mini-block:hover:not(.is-active) {
  transform: scale(1.1);
  z-index: 5;
}

.mini-block.is-active {
  transform: scale(1.5) translateY(-10px);
  z-index: 100;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 0 20px rgba(25, 118, 210, 0.4);
  /* Ganti ke biru */
  border: 2px solid #1976D2;
  /* Ganti ke biru */
}

.mini-block.is-active .mini-label {
  white-space: normal;
  /* Mengizinkan teks turun ke bawah */
  max-width: 100%;
  /* Mengambil lebar penuh kotak yang sudah membesar */
  overflow: visible;
  /* Menampilkan teks yang tadinya terpotong */
  text-overflow: clip;
  /* Menghilangkan titik-titik (...) */
  line-height: 1.1;
  /* Mengatur jarak antar baris agar rapi */
  margin-bottom: 2px;
  /* Memberi sedikit ruang dengan angka di bawahnya */
}

.mini-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--color);
  max-width: 68px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.85;
  transition: all 0.3s ease;
}

.mini-value {
  font-size: 16px;
  font-weight: 900;
  color: var(--color);
  line-height: 1;
}

.stat-tag {
  /* Menggunakan warna surface variant agar adaptif (gelap di dark mode, terang di light mode) */
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.87);
  padding: 10px 24px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  /* Border halus agar terlihat di dark mode */
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.stat-tag:hover {
  background: rgba(var(--v-theme-on-surface), 0.1);
}

/* Tombol Mentions yang sekarang berwarna Biru */
.stat-tag.dark-blue {
  background: #1976D2;
  /* Warna Biru Primer */
  color: white;
  border: none;
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.3);
}

.stat-tag.dark-blue:hover {
  background: #1565C0;
  /* Biru sedikit lebih gelap saat hover */
}

.tag-label {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.8;
}

.tag-val {
  font-size: 20px;
  font-weight: 900;
}

/* Penyesuaian khusus blok aktif agar tidak pakai border hijau */
.mini-block.is-active {
  transform: scale(1.5) translateY(-10px);
  z-index: 100;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), 0 0 20px rgba(25, 118, 210, 0.5);
  border: 2px solid #1976D2;
  /* Border Biru */
}


.stat-tag.dark-teal {
  background: #1976D2;
  /* Ganti dari #0f766e */
  color: white;
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.3);
  /* Sesuaikan shadow */
}

.tag-label {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.9;
}

.tag-val {
  font-size: 20px;
  font-weight: 900;
}

.d-flex.justify-center {
  gap: 16px;
  /* Mengatur jarak horizontal sebesar 16px */
}
</style>