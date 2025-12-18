<template>
  <div style="height: 100%; position: relative; display: flex; flex-direction: column;">
    <div style="position: relative; flex: 1 1 auto; min-height: 200px;" class="pb-8">
      <canvas ref="barChartCanvas"></canvas>
    </div>

    <div class="html-legend">
      <button
        v-for="dataset in datasets"
        :key="dataset.label"
        class="legend-item"
        @click="toggleDataset(dataset.label)"
      >
        <span
          class="legend-color-box"
          :style="{ backgroundColor: dataset.backgroundColor as string }"
        ></span>
        <span
          class="legend-label"
          :class="{ 'is-hidden': hiddenDatasets.includes(dataset.label!) }"
        >
          {{ dataset.label }}
        </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import { Chart, registerables } from 'chart.js';
import type { ChartOptions, ChartData, ChartDataset } from 'chart.js';

Chart.register(...registerables);

export default defineComponent({
  name: 'BaseBarChart',
  props: {
    labels: {
      type: Array as PropType<string[]>,
      required: true,
    },
    datasets: {
      type: Array as PropType<ChartDataset<'bar', number[]>[]>,
      required: true,
    },
    options: {
      type: Object as PropType<ChartOptions<'bar'>>,
      default: () => ({}),
    },
  },

  setup(props) {
    const barChartCanvas = ref<HTMLCanvasElement | null>(null);
    let chartInstance: Chart<'bar', number[], string> | null = null;
    const hiddenDatasets = ref<string[]>([]);

    const renderChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }

      const canvas = barChartCanvas.value;
      if (!canvas) {
        console.error('Canvas element not found for bar chart rendering.');
        return;
      }

      const defaultOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
          },
        },
        ...props.options,
      };

      const chartData: ChartData<'bar', number[], string> = {
        labels: props.labels,
        datasets: props.datasets,
      };

      chartInstance = new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: defaultOptions,
      });

      hiddenDatasets.value = [];
    };

    const toggleDataset = (label?: string) => {
      if (!label || !chartInstance) return;

      const datasetIndex = chartInstance.data.datasets.findIndex(d => d.label === label);
      if (datasetIndex === -1) return;

      const isVisible = chartInstance.isDatasetVisible(datasetIndex);

      if (isVisible) {
        chartInstance.setDatasetVisibility(datasetIndex, false);
        hiddenDatasets.value.push(label);
      } else {
        chartInstance.setDatasetVisibility(datasetIndex, true);
        hiddenDatasets.value = hiddenDatasets.value.filter(l => l !== label);
      }

      chartInstance.update();
    };

    onMounted(() => {
      renderChart();
    });

    watch(
      [() => props.labels, () => props.datasets],
      ([newLabels, newDatasets]) => {
        if (chartInstance) {
          chartInstance.data.labels = newLabels;
          chartInstance.data.datasets = newDatasets as ChartDataset<'bar', number[]>[];
          hiddenDatasets.value = [];
          chartInstance.update();
        } else {
          renderChart();
        }
      },
      { deep: true }
    );

    watch(
      () => props.options,
      () => {
        renderChart();
      },
      { deep: true }
    );

    return {
      barChartCanvas,
      hiddenDatasets,
      toggleDataset,
    };
  },
});
</script>

<style scoped>
.html-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 12px;
  width: 100%;
  max-height: 70px;
  overflow-y: auto;
  padding: 8px 4px;
  flex: 0 0 auto;
}

.legend-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
}

.legend-color-box {
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 2px;
}

.legend-label {
  color: rgb(var(--v-theme-grey-500));
  transition: all 0.2s;
}

.legend-label.is-hidden {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
