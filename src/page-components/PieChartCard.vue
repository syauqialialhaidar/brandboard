<template>
  <div class="pa-0 pb-4 d-flex flex-column" style="height: 100%;">
    <div class="d-flex flex-wrap align-center pb-4">
      <div class="text-subtitle-1 font-weight-bold">
        {{ title }}
      </div>
    </div>

    <div class="flex-grow-1 d-flex flex-column" style="min-height: 300px;">
      <template v-if="!isLoading && hasData">
        <PieChart :data="data" :colors="colors" :options="chartOptions" />
      </template>
      
      <template v-else-if="isLoading">
        <div class="d-flex justify-center align-center fill-height">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>
      </template>

      <template v-else>
        <div class="d-flex justify-center align-center fill-height text-grey-darken-1">
          No data available.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PieChart from '@/page-components/charts/PieChart.vue';
import type { PropType } from 'vue';
import type { ChartOptions } from 'chart.js';
interface PieChartDataItem {
  label: string;
  value: number;
}
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Array as PropType<PieChartDataItem[]>,
    required: true,
  },
  colors: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  chartOptions: {
    type: Object as PropType<ChartOptions<'pie'>>,
    default: () => ({}),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
const hasData = computed(() => props.data && props.data.length > 0);
</script>
<style scoped>
.premium-chart-card {
  /* Radius disamakan dengan Highlight.vue */
  border-radius: 20px !important;
  
  /* Border tipis agar terlihat elegan */
  border: 1px solid rgba(var(--v-border-color), 0.05) !important;
  
  /* Shadow halus (Soft Shadow) sesuai Highlight.vue */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
  
  transition: all 0.3s ease;
}

/* Menghilangkan border bottom pada divider agar lebih clean */
:deep(.v-divider) {
  opacity: 0.05;
}

/* Mengatur agar konten chart menyesuaikan dengan container yang bulat */
.v-card-text {
  flex-grow: 1;
  min-height: 300px; /* Sesuaikan dengan kebutuhan layoutmu */
}
</style>