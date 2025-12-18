<template>
  <v-card class="heatmap-card pa-6 rounded-lg d-flex flex-column elevation-2">
    
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h3 class="text-h6 font-weight-bold text-high-emphasis mb-0">
          {{ title }}
        </h3>
        <span class="text-caption text-medium-emphasis">Interactive Data Grid</span>
      </div>
      
      <v-select
        v-model="internalSelected"
        :items="channels"
        variant="outlined"
        density="compact"
        hide-details
        rounded="lg"
        class="custom-select"
        style="max-width: 150px"
      ></v-select>
    </div>

    <div v-if="isLoading" class="d-flex justify-center align-center flex-grow-1" style="min-height: 300px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>
    
    <div v-else class="grid-wrapper">
      <div class="heatmap-grid-blocks">
        <div 
          v-for="(item, index) in displayData" 
          :key="index"
          :class="['block-3d', getColorClass(item.value), getSpanClass(index)]"
        >
          <div class="block-face">
            <div class="d-flex flex-column align-center justify-center h-100">
              <span class="block-label text-truncate">{{ item.groupName }}</span>
              <span class="block-value">{{ formatNumber(item.value) }}</span>
            </div>
          </div>

          <v-tooltip activator="parent" location="top" open-delay="200">
            <span class="font-weight-bold">{{ item.groupName }}: {{ item.value }}</span>
          </v-tooltip>
        </div>
      </div>
    </div>

    <v-divider class="my-6"></v-divider>
    <div class="d-flex justify-space-around align-center">
      <div class="text-center">
        <div class="text-caption text-uppercase text-medium-emphasis font-weight-bold">Total Corporate</div>
        <div class="text-h6 font-weight-bold">{{ totalCorporate }}</div>
      </div>
      <v-divider vertical inset class="mx-2"></v-divider>
      <div class="text-center">
        <div class="text-caption text-uppercase text-medium-emphasis font-weight-bold">Total Mentions</div>
        <div class="text-h6 font-weight-bold">{{ totalMentions.toLocaleString() }}</div>
      </div>
    </div>
  </v-card>

  
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface HeatmapDetail {
  groupName: string;
  value: number;
}

const props = defineProps<{
  title: string;
  data: Array<{ label: string; details: HeatmapDetail[] }>;
  isLoading: boolean;
}>();

const internalSelected = ref('All');

// List of channels for the dropdown
const channels = computed(() => ['All', ...props.data.map(d => d.label)]);

// Data being displayed based on selection
const displayData = computed(() => {
  if (internalSelected.value === 'All') {
    // Show all details from all labels
    return props.data.flatMap(d => d.details);
  }
  const found = props.data.find(d => d.label === internalSelected.value);
  return found ? found.details : [];
});

// Calculate Total Corporate (Count of items)
const totalCorporate = computed(() => {
  return displayData.value.length;
});

// Calculate Total Mentions (Sum of values)
const totalMentions = computed(() => {
  return displayData.value.reduce((acc, item) => acc + item.value, 0);
});

const formatNumber = (num: number) => {
  if (num >= 1000) return (num/1000).toFixed(1) + 'k';
  return num;
};

// Grid logic for varied block sizes
const getSpanClass = (index: number) => {
  const variations = ['span-1-1', 'span-2-1', 'span-1-1', 'span-1-1', 'span-1-2', 'span-1-1'];
  return variations[index % variations.length];
};

const getColorClass = (value: number) => {
  if (value === 0) return 'style-empty';
  if (value < 100) return 'style-low';
  if (value < 500) return 'style-medium';
  return 'style-high';
};
</script>

<style scoped>
.heatmap-card {
  transition: background-color 0.3s ease;
}

.border-top { border-top: 1px solid rgba(128, 128, 128, 0.2); }

/* GRID LAYOUT */
.heatmap-grid-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
  grid-auto-rows: 75px;
  grid-auto-flow: dense; 
  gap: 12px; 
  padding: 4px;
}

.span-1-1 { grid-column: span 1; grid-row: span 1; }
.span-2-1 { grid-column: span 2; grid-row: span 1; }
.span-1-2 { grid-column: span 1; grid-row: span 2; }

/* 3D BLOCK STYLE */
.block-3d {
  position: relative;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.1s ease;
  border-bottom: 5px solid rgba(0,0,0,0.2); 
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.block-face {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-bottom: none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.05);
  padding: 8px;
  color: white;
}

/* COLORS */
.style-empty {
  background-color: #e5e7eb; 
  border-bottom-color: #9ca3af;
}
.style-empty .block-face {
  color: #6b7280;
}

:deep(.v-theme--dark) .style-empty {
  background-color: #2b2b36;
  border-bottom-color: #1a1a20;
}

.style-low {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
  border-bottom-color: #1d4ed8;
}

.style-medium {
  background: linear-gradient(to bottom, #8b5cf6, #7c3aed);
  border-bottom-color: #6d28d9;
}

.style-high {
  background: linear-gradient(to bottom, #06b6d4, #0891b2);
  border-bottom-color: #155e75;
}

/* HOVER & ACTIVE */
.block-3d:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.block-3d:active {
  transform: translateY(4px);
  border-bottom-width: 1px;
  box-shadow: none;
}

.block-label {
  font-size: 0.7rem;
  opacity: 0.9;
  width: 100%;
  text-align: center;
}

.block-value {
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.2;
}

/* FOOTER STATS */
.gap-6 { gap: 24px; }
.gap-8 { gap: 32px; }
.stats-item {
  display: flex;
  flex-direction: column;
}
</style>