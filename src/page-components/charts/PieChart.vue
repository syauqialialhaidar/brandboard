<template>
  <div style="height: 100%; position: relative; display: flex; flex-direction: column;">
    <div style="position: relative; height: 240px;" class="pb-8">
      <canvas ref="pieChartCanvas"></canvas>
    </div>

    <div class="html-legend">
      <button
        v-for="(item, index) in props.data"
        :key="item.label"
        class="legend-item"
        @click="toggleSlice(item.label)"
      >
        <span
          class="legend-color-box"
          :style="{ backgroundColor: chartColors[index] }"
        ></span>
        <span
          class="legend-label"
          :class="{ 'is-hidden': hiddenSlices.includes(item.label) }"
        >
          {{ item.label }}
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
import { generateBrightColors } from '@/utils/colors';

Chart.register(...registerables);

interface PieChartDataItem {
  label: string;
  value: number;
}

export default defineComponent({
  name: 'BasePieChart',
  props: {
    data: {
      type: Array as PropType<PieChartDataItem[]>,
      required: true,
    },
    colors: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    defaultColorCount: {
      type: Number,
      default: 10,
    },
    options: {
      type: Object as PropType<ChartOptions<'pie'>>,
      default: () => ({}),
    },
  },

  setup(props) {
    const pieChartCanvas = ref<HTMLCanvasElement | null>(null);
    let chartInstance: Chart<'pie', number[], string> | null = null;
    const hiddenSlices = ref<string[]>([]);
    const chartColors = ref<string[]>([]);

    const updateChartColors = () => {
      if (props.colors.length > 0) {
        chartColors.value = props.colors;
      } else {
        chartColors.value = generateBrightColors(
          Math.max(props.defaultColorCount, props.data.length)
        );
      }
    };

    const renderChart = () => {
      if (chartInstance) chartInstance.destroy();

      const canvas = pieChartCanvas.value;
      if (!canvas) return;

      updateChartColors();

      const chartData: ChartData<'pie', number[], string> = {
        labels: props.data.map(d => d.label),
        datasets: [
          {
            data: props.data.map(d => d.value),
            backgroundColor: chartColors.value,
            borderColor: '#fff',
            borderWidth: 1,
          } as ChartDataset<'pie', number[]>,
        ],
      };

      const defaultOptions: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                const label = context.label || '';
                const value = context.parsed ?? 0;
                return `${label}: ${value}`;
              },
            },
          },
        },
        ...props.options,
      };

      chartInstance = new Chart(canvas, {
        type: 'pie',
        data: chartData,
        options: defaultOptions,
      });

      hiddenSlices.value = [];
    };

    const toggleSlice = (label: string) => {
      if (!chartInstance) return;

      const index = chartInstance.data.labels?.indexOf(label);
      if (index === undefined || index === -1) return;

      const dataset = chartInstance.data.datasets?.[0];
      if (!dataset) return;

      const dataItem = props.data[index];
      if (!dataItem) return;
      const currentValue = dataItem.value;

      const supportsDataVisibility =
        typeof (chartInstance as any).setDataVisibility === 'function';

      if (supportsDataVisibility) {
        const isVisible = (chartInstance as any).getDataVisibility(index);
        (chartInstance as any).setDataVisibility(index, !isVisible);
        if (isVisible) hiddenSlices.value.push(label);
        else hiddenSlices.value = hiddenSlices.value.filter(l => l !== label);
      } else {
        const hidden = hiddenSlices.value.includes(label);
        if (hidden) {
          dataset.data[index] = currentValue;
          hiddenSlices.value = hiddenSlices.value.filter(l => l !== label);
        } else {
          dataset.data[index] = 0;
          hiddenSlices.value.push(label);
        }
      }

      chartInstance.update();
    };

    onMounted(() => renderChart());

    watch(
      () => props.data,
      (newData) => {
        if (!chartInstance) return renderChart();

        updateChartColors();

        chartInstance.data.labels = newData.map(d => d.label);

        const dataset = chartInstance.data.datasets?.[0];
        if (!dataset) return;

        dataset.data = newData.map(d => d.value);
        dataset.backgroundColor = chartColors.value;

        hiddenSlices.value = [];
        chartInstance.update();
      },
      { deep: true }
    );

    return { pieChartCanvas, hiddenSlices, chartColors, toggleSlice, props };
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
