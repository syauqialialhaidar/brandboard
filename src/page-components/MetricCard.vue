<template>
  <v-card 
    class="metric-stat-card rounded-lg elevation-1 h-100" 
    variant="flat"
  >
    <v-card-text class="pa-5 d-flex flex-column h-100 position-relative">
      
      <div class="chart-bg-absolute">
        <v-sparkline
          :model-value="trendData"
          :fill="true"
          :gradient="chartGradient"
          height="80"
          padding="0"
          line-width="4"
          smooth
          auto-draw
        ></v-sparkline>
      </div>

      <div class="d-flex align-center mb-5" style="z-index: 2">
        <v-avatar color="primary" variant="tonal" size="32" rounded="lg" class="mr-3">
          <v-icon :icon="icon" size="18"></v-icon>
        </v-avatar>
        <span class="category-label text-medium-emphasis font-weight-bold">
          {{ title }}
        </span>
      </div>

      <div class="mb-4" style="z-index: 2">
        <h2 class="display-value text-h4 font-weight-black mb-2 text-high-emphasis">
          {{ prefix }}{{ value }}
        </h2>
      </div>

      <div class="mt-auto" style="height: 60px; z-index: 2"></div>

      <div style="z-index: 2">
        
        <div 
          class="action-footer d-flex justify-space-between align-center cursor-pointer" 
          @click="showDetail = true"
        >
          <span class="text-caption font-weight-bold text-primary">Click for Details</span>
          <v-icon icon="mdi-chevron-right" size="18" color="primary"></v-icon>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

interface Props {
  title: string;
  value: string | number;
  prefix?: string;
  icon: string;
  trendData: number[];
}


const props = defineProps<Props>();
const chartGradient = computed(() => {
  return theme.global.current.value.dark 
    ? ['#4FC3F7', 'rgba(79, 195, 247, 0.1)', 'transparent'] 
    : ['#1976D2', 'rgba(25, 118, 210, 0.1)', 'transparent'];
});

const showDetail = ref(false);
</script>

<style scoped>
.category-label {
  font-size: 0.7rem;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.metric-stat-card {
  background-color: rgb(var(--v-theme-surface)) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-height: 220px; 
}

.metric-stat-card:hover {
  transform: translateY(-4px);
  /* Shadow menyesuaikan kegelapan tema */
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2) !important;
}

.display-value {
  font-family: 'Inter', sans-serif !important;
  letter-spacing: -1.5px !important;
  line-height: 1.2;
}

.chart-bg-absolute {
  position: absolute;
  bottom: 60px; 
  left: 0;
  right: 0;
  height: 85px;
  opacity: 0.4; /* Dikurangi agar lebih subtle di mode gelap */
  pointer-events: none;
  z-index: 1;
}

.action-footer:hover span {
  text-decoration: underline;
}

.position-relative {
  position: relative;
}
</style>