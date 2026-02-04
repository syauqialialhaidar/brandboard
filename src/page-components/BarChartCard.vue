<template>
  <div class="pa-0 pb-4 d-flex flex-column" style="height: 100%;">
    
    <div class="d-flex flex-wrap align-center pb-4 ga-4">
      <div class="text-subtitle-1 font-weight-bold">{{ title }}</div>
      <v-spacer></v-spacer>
      <v-btn-toggle v-if="showToggle" :model-value="toggle" @update:model-value="$emit('toggle-change', $event)"
        density="compact" divided>
        <v-btn value="top10" class="text-capitalize px-3">Top 10</v-btn>
        <v-btn value="all" class="text-capitalize px-3">All</v-btn>
        <v-btn value="bottom10" class="text-capitalize px-3">Bottom 10</v-btn>
      </v-btn-toggle>
    </div>

    <div class="flex-grow-1" style="min-height: 350px;">
      <template v-if="!isLoading && hasData">
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
    backgroundColor: generateBrightColors(props.segmentLabels.length)[idx]
  }));
});

const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    // 1. NYALAKAN LEGEND (Agar nama Brand muncul di bawah/atas chart)
    legend: {
      display: false
    },

    // 2. NYALAKAN TOOLTIP (Agar nilai muncul saat hover)
    tooltip: {
      enabled: true, // Ubah jadi true
      mode: 'nearest', // PENTING: Agar tooltip "pintar" memilih batang terdekat
      intersect: true, // PENTING: Hanya muncul jika kursor kena batangnya
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 10,
      callbacks: {
        // Custom format: "Nama Brand: 123"
        label: function (context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y;
          }
          return label;
        }
      }
    },

    // 3. MATIKAN DATA LABELS (Jaga-jaga jika plugin terinstall global)
    // Agar angka tidak muncul menumpuk di dalam batang
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
  onHover: (event: any, elements: any[]) => {
    event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
  },
  scales: {
    x: {
      // Gunakan props.isStacked di sini
      stacked: props.isStacked, 
      display: true,
      grid: { display: false },
      ticks: {
        // Jika tidak stacked (normal), biasanya label X harus muncul agar jelas
        display: props.isStacked ? false : true, 
      }
    },
    y: {
      // Gunakan props.isStacked di sini
      stacked: props.isStacked, 
      beginAtZero: true,
      ticks: { font: { size: 10 } }
    }
  }
} as any));

const hasData = computed(() => props.data?.length > 0);
</script>
<style scoped>
/* Class Utama Card disamakan dengan Highlight.vue */
.premium-bar-card {
  border-radius: 20px !important;
  border: 1px solid rgba(var(--v-border-color), 0.05) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease;
}

/* Divider tipis agar tidak mengganggu visual chart */
:deep(.v-divider) {
  opacity: 0.05;
}

/* Menyelaraskan Toggle Button dengan estetika Highlight */
.v-btn-toggle {
  border-radius: 12px !important; /* Membuat sudut toggle lebih lembut */
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  height: 32px;
}

.v-btn-toggle .v-btn {
  border-radius: 8px !important;
  font-size: 0.75rem;
  font-weight: 600;
}

.v-btn-toggle .v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

/* Memastikan area chart memiliki ruang yang konsisten */
.v-card-text {
  flex-grow: 1;
  min-height: 350px; /* Standar minimal untuk chart bar agar tidak gepeng */
}
</style>