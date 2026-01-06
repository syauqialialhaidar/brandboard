<template>
  <v-card class="pa-0 pb-4 premium-heatmap-card overflow-hidden d-flex flex-column" elevation="0" color="surface"
    style="height: 100%;">

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

      <div v-else class="content-container flex-grow-1 d-flex flex-column justify-center align-center">
        <div class="staggered-grid" :class="{ 'has-selection': selectedIndex !== null }">
          <div v-for="(row, rowIndex) in structuredRows" :key="rowIndex" 
               class="grid-row" :class="{ 'row-offset': rowIndex % 2 !== 0 }">
            
            <div v-for="(item, colIndex) in row" :key="colIndex" class="grid-slot">
              <div v-if="item" class="mini-block" 
                :class="{ 'is-active': selectedIndex === (rowIndex * columns + colIndex) }"
                :style="getBlockTheme(item.value)" 
                @click="handleInteraction(item, (rowIndex * columns + colIndex))">
                <div class="text-center px-1 w-100">
                  <div class="mini-label">{{ item.groupName }}</div>
                  <div class="mini-value">{{ formatNumber(item.value) }}</div>
                </div>
              </div>
              <div v-else class="mini-block placeholder"></div>
            </div>

          </div>
        </div>

        <div class="d-flex justify-center gap-4 mt-4">
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

const props = defineProps<{
  title?: string;
  data: Array<{ details: any[] }>;
  isLoading: boolean;
}>();

const emit = defineEmits(['item-click']);
const selectedIndex = ref<number | null>(null);
const allData = computed(() => props.data.flatMap(d => d.details));

// --- KONFIGURASI LAYOUT ---
const columns = 6; // Jumlah kolom per baris
const blockWidth = 70;
const blockHeight = 40;

// Mengatur data ke dalam baris-baris (Array of Arrays)
const structuredRows = computed(() => {
  const data = [...allData.value].sort((a, b) => b.value - a.value);
  const rows = [];
  for (let i = 0; i < data.length; i += columns) {
    rows.push(data.slice(i, i + columns));
  }
  return rows;
});

const getBlockTheme = (val: number) => {
  const max = Math.max(...allData.value.map(i => i.value)) || 1;
  const ratio = val / max;
  const h = 210; 
  const s = 30 + (ratio * 50);
  const l = 92 - (ratio * 50);

  return {
    '--bg': `hsl(${h}, ${s}%, ${l}%)`,
    '--color': l < 60 ? 'white' : '#475569',
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

.d-flex.justify-center {
  gap: 16px;
}
.premium-heatmap-card {
  border-radius: 20px !important;
  border: 1px solid rgba(var(--v-border-color), 0.05) !important;
}

/* Container utama Grid */
.staggered-grid {
  display: flex;
  flex-direction: column;
  gap: 8px; /* Jarak vertikal antar baris */
  padding: 20px;
}

/* Baris Grid */
.grid-row {
  display: flex;
  justify-content: center;
  gap: 10px; /* Jarak horizontal antar kotak */
}

/* Efek Offset untuk baris genap (indeks 1, 3, 5...) */
.row-offset {
  margin-left: 40px; /* Setengah dari lebar kotak + gap untuk efek zigzag */
}

.mini-block {
  width: 70px;
  height: 40px;
  background: var(--bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.placeholder {
  background: transparent;
  border: none;
  pointer-events: none;
}

.mini-block:hover:not(.is-active) {
  transform: scale(1.1);
  z-index: 5;
}

.mini-block.is-active {
  transform: scale(1.8);
  padding: 4px;
  z-index: 100;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: 2px solid #1976D2;
}

.mini-label {
  font-size: 8px;
  font-weight: 700;
  color: var(--color);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
}

.mini-block.is-active .mini-label {
  white-space: normal;     
  overflow: visible;        
  text-overflow: clip;      
  font-size: 6px;          
  word-break: break-word;  
  display: -webkit-box;    
  -webkit-box-orient: vertical;
}
.mini-value {
  font-size: 11px;
  font-weight: 900;
  color: var(--color);
  white-space: normal;
}


/* Blur effect saat ada yang dipilih */
.staggered-grid.has-selection .mini-block:not(.is-active) {
  filter: blur(2px) opacity(0.3);
  transform: scale(0.9);
}

/* Stats Styling */
.stat-tag {
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.87);
  padding: 10px 24px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.stat-tag.dark-blue {
  background: #1976D2; /* Biru Vuetify */
  color: white;
  border: none;
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.3);
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
</style>