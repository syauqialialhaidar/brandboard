<template>
  <v-card class="pa-0 premium-heatmap-card overflow-hidden d-flex flex-column" elevation="0" color="surface">
    
    <div class="d-flex flex-wrap align-center pa-4">
      <div class="flex-grow-1">
        <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
          {{ title }}
        </v-card-title>
      </div>
      
      <v-text-field 
        v-model="searchQuery" 
        density="compact" 
        label="Search" 
        append-inner-icon="mdi-magnify" 
        single-line
        flat 
        hide-details 
        variant="outlined" 
        class="search-input"
      />
    </div>

    <v-divider></v-divider>

    <v-card-text class="pa-0 d-flex flex-column overflow-hidden">
      
      <div v-if="isLoading" class="d-flex justify-center align-center py-10">
        <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
      </div>

      <div v-else class="heatmap-wrapper custom-scroll pa-4">
        <div class="heatmap-grid" :class="{ 'has-selection': selectedIndex !== null }">
          <v-tooltip v-for="(item, index) in filteredData" :key="index" location="top" open-delay="50">
            <template v-slot:activator="{ props }">
              <div 
                v-bind="props"
                class="mini-block" 
                :class="{ 'is-active': selectedIndex === index }"
                :style="getBlockTheme(item.value)" 
                @click="handleInteraction(item, index)"
              >
                <div class="block-content">
                  <span class="mini-label">{{ item.groupName }}</span>
                  <span class="mini-value">{{ formatNumber(item.value) }}</span>
                </div>
              </div>
            </template>
            <span>{{ item.groupName }}: <strong>{{ item.value.toLocaleString() }}</strong></span>
          </v-tooltip>
        </div>
      </div>
      
      <div class="d-flex justify-center ga-4 pa-4 footer-bg">
        
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface HeatmapDetail { groupName: string; value: number; }

const props = defineProps<{
  title?: string;
  data: Array<{ details: HeatmapDetail[] }>;
  isLoading: boolean;
}>();

const emit = defineEmits(['item-click']);
const searchQuery = ref('');
const selectedIndex = ref<number | null>(null);

watch(searchQuery, () => { selectedIndex.value = null; });

const allData = computed(() => {
  const rawDetails = props.data.flatMap(d => d.details || []);
  const merged = rawDetails.reduce((acc, curr) => {
    const name = curr.groupName;
    const value = Number(curr.value) || 0;
    acc[name] = (acc[name] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(merged).map(([name, val]) => ({
    groupName: name,
    value: val
  }));
});

const formatNumber = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toLocaleString();
};

const filteredData = computed(() => {
  return [...allData.value]
    .filter(item => item.groupName.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .sort((a, b) => b.value - a.value);
});

const getBlockTheme = (val: number) => {
  const max = Math.max(...allData.value.map(i => i.value)) || 1;
  const ratio = val / max;
  const h = 210; 
  const s = 45 + (ratio * 45);
  const l = 85 - (ratio * 40); 

  return {
    '--bg': `hsl(${h}, ${s}%, ${l}%)`,
    '--color': l < 60 ? 'white' : '#1e293b',
  };
};

const handleInteraction = (item: HeatmapDetail, index: number) => {
  selectedIndex.value = selectedIndex.value === index ? null : index;
  emit('item-click', item);
};

const totalMentions = computed(() => filteredData.value.reduce((a, b) => a + b.value, 0));
</script>

<style scoped>
/* Container Card */
.premium-heatmap-card {
  border-radius: 16px !important;
  max-height: 600px; /* Batasi tinggi agar tidak meluber ke bawah */
}

.search-input {
  max-width: 220px;
}

/* Heatmap Wrapper: Mengontrol overflow agar tidak keluar kotak */
.heatmap-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}

/* Menggunakan CSS Grid agar kotak otomatis pas di kontainer */
.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  width: 100%;
}

.mini-block {
  height: 44px;
  background: var(--bg);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.mini-block:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.mini-block.is-active {
  box-shadow: 0 0 0 3px rgb(var(--v-theme-primary));
  z-index: 2;
}

.block-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 4px;
  overflow: hidden;
}

.mini-label {
  font-size: 8px;
  font-weight: 700;
  color: var(--color);
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

.mini-value {
  font-size: 11px;
  font-weight: 800;
  color: var(--color);
}

/* Stat Tags Footer */
.footer-bg {
  background-color: rgb(var(--v-theme-surface));
}

.stat-tag {
  background: rgba(var(--v-theme-on-surface), 0.03);
  padding: 8px 24px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-border-color), 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140px;
}

.tag-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
}

.tag-val {
  font-size: 20px;
  font-weight: 900;
}

/* Selection Effect */
.heatmap-grid.has-selection .mini-block:not(.is-active) {
  opacity: 0.2;
  filter: grayscale(1);
}

/* Scrollbar Custom */
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 10px;
}
</style>