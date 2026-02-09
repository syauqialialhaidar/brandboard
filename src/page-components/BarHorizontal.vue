<template>
  <div class="pa-0 pb-4 d-flex flex-column" style="height: 100%;">
    
    <div class="d-flex flex-wrap align-center pb-4 ga-4">
      <div class="text-subtitle-1 font-weight-bold">{{ title }}</div>
    </div>

    <div class="flex-grow-1" style="min-height: 400px;"> <template v-if="!isLoading && hasData">
        <BarChart :labels="chartLabels" :datasets="chartDatasets" :options="barChartOptions" />
      </template>
      <div v-else-if="isLoading" class="d-flex justify-center align-center fill-height">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '@/page-components/charts/BarChart.vue';
import { generateBrightColors } from '@/utils/colors';

const props = defineProps(['title', 'data', 'segmentLabels', 'isLoading', 'showToggle', 'toggle', 'isStacked']);
const emit = defineEmits(['click-bar', 'toggle-change']);

const chartLabels = computed(() => props.data?.map((item: any) => item.label) || []);
const chartDatasets = computed(() => {
  return props.segmentLabels.map((label: string, idx: number) => ({
    label,
    data: props.data.map((item: any) => item.values[idx] || 0),
    backgroundColor: generateBrightColors(props.data.length),
    borderRadius: 4,
    barThickness: 20,  
  }));
});

const barChartOptions = computed(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
    },
    datalabels: {
      display: false
    }
  },
  onClick: (event: any, elements: any[]) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      emit('click-bar', chartLabels.value[index]);
    }
  },
  scales: {
    x: {
      // Pada Horizontal, X adalah nilai (Value)
      stacked: props.isStacked, 
      beginAtZero: true,
      grid: { display: true }, // Grid vertikal membantu pembacaan nilai
    },
    y: {
      // Pada Horizontal, Y adalah Label (Kategori)
      stacked: props.isStacked, 
      grid: { display: false },
      ticks: { 
        font: { size: 11 },
        autoSkip: false // Memastikan semua nama label di kiri muncul
      }
    }
  }
} as any));

const hasData = computed(() => props.data?.length > 0);
</script>

<style scoped>
/* Style tetap sama dengan versi vertikal */
.v-btn-toggle {
  border-radius: 12px !important;
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  height: 32px;
}

.v-btn-toggle .v-btn {
  border-radius: 8px !important;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>