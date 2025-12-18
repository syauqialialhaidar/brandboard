<template>
  <v-card class="pa-0 pb-4 rounded-lg overflow-hidden d-flex flex-column" color="surface" style="height: 100%;">
    <div class="d-flex flex-wrap align-center pa-4 ga-4">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
        {{ title }}
      </v-card-title>
      <v-spacer></v-spacer>

      <v-btn-toggle
        v-if="showToggle"
        :model-value="toggle"
        @update:model-value="$emit('toggle-change', $event)"
        density="compact"
        divided
      >
        <v-btn value="top10" class="text-capitalize px-3" style="height: 32px;"
          >Top 10</v-btn
        >
        <v-btn value="all" class="text-capitalize px-3" style="height: 32apx;"
          >All</v-btn
        >
        <v-btn
          value="bottom10"
          class="text-capitalize px-3"
          style="height: 32px;"
          >Bottom 10</v-btn
        >
      </v-btn-toggle>
    </div>

    <v-divider class="mb-4"></v-divider>

    <v-card-text class="pa-4 d-flex flex-column" style="flex-grow: 1;">
      <template v-if="!isLoading && hasData">
        <BarChart
          :labels="chartLabels"
          :datasets="chartDatasets"
          :options="barChartOptions"
        />
      </template>
      <template v-else-if="isLoading">
        <div class="d-flex justify-center align-center fill-height">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </div>
      </template>
      <template v-else>
        <div
          class="d-flex justify-center align-center fill-height text-grey-darken-1"
        >
          No data available.
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import BarChart from '@/page-components/charts/BarChart.vue';
import { type ChartOptions, type ChartDataset } from 'chart.js';
import { generateBrightColors } from '@/utils/colors';
interface BarChartDataItem {
  label: string;
  values: number[];
}
const props = defineProps({
  title: { type: String, required: true },
  data: { type: Array as PropType<BarChartDataItem[]>, required: true },
  segmentLabels: { type: Array as PropType<string[]>, required: true },
  colors: { type: Array as PropType<string[]>, default: () => [] },
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
const chartColors = computed<string[]>(() => {
  if (props.colors && props.colors.length > 0) {
    return props.colors.filter((c): c is string => !!c);
  }
  return generateBrightColors(
    Math.max(props.segmentLabels.length, props.colors.length || 0)
  );
});
const chartLabels = computed<string[]>(() => {
  return props.data.map(item => item.label);
});
const chartDatasets = computed<ChartDataset<'bar', number[]>[]>(() => {
  return props.segmentLabels.map((segmentLabel, segmentIndex) => {
    const color = chartColors.value[segmentIndex] ?? '#ccc';
    return {
      label: segmentLabel,
      data: props.data.map(item => item.values[segmentIndex] || 0),
      backgroundColor: color,
      borderColor: '#fff',
      borderWidth: 1,
    };
  });
});
const barChartOptions = computed<ChartOptions<'bar'>>(() => ({
  plugins: {
    legend: {
      display: false,
      position: 'bottom',
      labels: { boxWidth: 12, boxHeight: 12, padding: 20 },
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
      },
    },
  },
  scales: {
    x: { stacked: true, grid: { display: false } },
    y: { stacked: true, grid: { color: 'rgba(0,0,0,0.05)' } },
  },
}));
const hasData = computed(
  () =>
    props.data &&
    props.data.length > 0 &&
    props.segmentLabels &&
    props.segmentLabels.length > 0
);
</script>

<style scoped>
.v-btn-toggle .v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
