<template>
  <v-card class="pa-0 pb-4 premium-line-card overflow-hidden d-flex flex-column" elevation="0" color="surface"
    style="height: 100%;">
    <div class="d-flex flex-wrap align-center pa-4 ga-4">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
        {{ title }}
      </v-card-title>
      <v-spacer></v-spacer>

      <v-btn-toggle v-if="showToggle" :model-value="toggle" @update:model-value="$emit('toggle-change', $event)"
        density="compact" divided>
        <v-btn value="top10" class="text-capitalize px-3" style="height: 32px;">Top 10</v-btn>
        <v-btn value="all" class="text-capitalize px-3" style="height: 32px;">All</v-btn>
        <v-btn value="bottom10" class="text-capitalize px-3" style="height: 32px;">Bottom 10</v-btn>
      </v-btn-toggle>
    </div>

    <v-divider />

    <v-card-text class="pa-4 d-flex flex-column" style="flex-grow: 1;">
      <template v-if="!isLoading && hasData">
        <LineChart :datasets="mappedDatasets" :labels="labels" :options="chartOptions" />
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
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LineChart from '@/page-components/charts/LineChart.vue';
import type { PropType } from 'vue';
import type { ChartOptions, ChartDataset } from 'chart.js';
interface LineChartDataItem {
  label: string;
  data: number[];
  fill?: boolean | string;
}
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Array as PropType<LineChartDataItem[]>,
    required: true,
  },
  labels: {
    type: Array as PropType<string[]>,
    required: true,
  },
  colors: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  chartOptions: {
    type: Object as PropType<ChartOptions<'line'>>,
    default: () => ({}),
  },
  showToggle: {
    type: Boolean,
    default: false,
  },
  toggle: {
    type: String,
    default: 'top10',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
defineEmits(['toggle-change']);
const hasData = computed(
  () =>
    props.data &&
    props.data.length > 0 &&
    props.labels &&
    props.labels.length > 0
);

const mappedDatasets = computed(() =>
  (props.data || []).map((d, idx) => ({
    label: d.label ?? '',
    data: d.data,
    fill: typeof d.fill === 'boolean' ? d.fill : false,
    borderColor: props.colors?.[idx] ?? '',
    backgroundColor: props.colors?.[idx] ?? '',
    tension: 0.4,
  }))
);
</script>

<style scoped>
.v-btn-toggle .v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}
.premium-line-card {
  border-radius: 20px !important;
  border: 1px solid rgba(var(--v-border-color), 0.05) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease;
}

/* Sempurnakan tampilan Button Toggle agar serasi dengan kartu yang bulat */
.v-btn-toggle {
  border-radius: 12px !important; /* Membuat sudut toggle sedikit lebih lembut */
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
}

.v-btn-toggle .v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

/* Divider yang lebih tipis agar tidak memutus aliran visual secara tajam */
:deep(.v-divider) {
  opacity: 0.05;
}

/* Memastikan chart memiliki ruang yang cukup */
.v-card-text {
  flex-grow: 1;
  min-height: 350px;
}
</style>
