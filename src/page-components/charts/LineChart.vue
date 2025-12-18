<template>
  <div style="height: 100%; position: relative; display: flex; flex-direction: column;">
    <div style="position: relative; flex: 1 1 auto; min-height: 200px;" class="pb-8">
      <canvas ref="lineChartCanvas"></canvas>
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
          :style="{ backgroundColor: dataset.borderColor }"
        ></span>
        <span
          class="legend-label"
          :class="{ 'is-hidden': hiddenDatasets.includes(dataset.label) }"
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

interface LineChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
}

export default defineComponent({
  name: 'LineChart',
  props: {
    labels: {
      type: Array as PropType<string[]>,
      required: true,
    },
    datasets: {
      type: Array as PropType<LineChartDataset[]>,
      required: true,
    },
    options: {
      type: Object as PropType<ChartOptions<'line'>>,
      default: () => ({}),
    },
  },
  setup(props) {
    const lineChartCanvas = ref<HTMLCanvasElement | null>(null);
    let chartInstance: Chart<'line', number[], string> | null = null;
    const hiddenDatasets = ref<string[]>([]);

    const renderChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }

      if (!lineChartCanvas.value) {
        console.error("Canvas element not found for line chart rendering.");
        return;
      }

      const defaultOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0,0,0,0.05)',
            }
          }
        },
        ...props.options,
      };

      const chartData: ChartData<'line', number[], string> = {
        labels: props.labels,
        datasets: props.datasets,
      };

      chartInstance = new Chart(lineChartCanvas.value, {
        type: 'line',
        data: chartData,
        options: defaultOptions,
      });

      hiddenDatasets.value = [];
    };

    const toggleDataset = (label: string) => {
      if (!chartInstance) return;

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
      (): [string[] | undefined, LineChartDataset[] | undefined] => [props.labels, props.datasets],
      ([newLabels, newDatasets]) => {
        const labels = newLabels ?? [];
        const datasets = (newDatasets ?? []) as ChartDataset<'line', number[]>[];

        if (chartInstance) {
          chartInstance.data.labels = labels;
          chartInstance.data.datasets = datasets;
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
      lineChartCanvas,
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
