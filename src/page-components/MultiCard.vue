<template>
  <div class="stat-wrapper">
    <div class="custom-grid-5">
      <div
        v-for="(item, index) in stats"
        :key="index"
        class="card-container"
      >
        <v-card
          class="stat-card rounded-xl h-100 d-flex flex-column position-relative overflow-hidden"
          :class="{ 'on-hover': hoverIndex === index }"
          variant="outlined"
          :color="hoverIndex === index ? item.color : 'grey-lighten-4'"
          @click="openDetail(item)"
          @mouseenter="hoverIndex = index"
          @mouseleave="hoverIndex = null"
          v-ripple
        >
          <v-icon
            :color="item.color || 'primary'"
            class="bg-icon-watermark"
            size="140"
          >
            {{ item.icon || 'mdi-chart-bar' }}
          </v-icon>
          <v-card-text class="pa-5 position-relative z-index-1 h-100 d-flex flex-column">
            <div class="d-flex align-start justify-space-between mb-4">
              <div>
                <div class="text-caption text-medium-emphasis font-weight-bold text-uppercase ls-1 mb-1">
                  {{ item.title }}
                </div>
                <h3 class="text-h4 font-weight-black text-high-emphasis tracking-tight">
                  {{ item.value }}
                </h3>
              </div>

              <v-chip
                v-if="item.percentage !== undefined"
                :color="item.percentage >= 0 ? 'success' : 'error'"
                variant="tonal"
                size="small"
                class="font-weight-bold px-2 mt-1"
                label
              >
                <v-icon start size="14">
                  {{ item.percentage >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                </v-icon>
                {{ Math.abs(item.percentage) }}%
              </v-chip>
            </div>
            
            <v-spacer></v-spacer>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <v-dialog 
      v-model="showModal" 
      max-width="900" 
      transition="dialog-bottom-transition"
      scrim="rgba(0,0,0,0.3)"
    >
      <v-card class="rounded-xl overflow-hidden" elevation="10">
        <v-toolbar color="white" class="px-2 border-b" density="comfortable" flat>
          <v-toolbar-title class="text-h6 font-weight-bold pl-4">
             <v-icon :color="selectedItem?.color" class="mr-2">{{ selectedItem?.icon }}</v-icon>
             Detail: {{ selectedItem?.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" density="comfortable" @click="showModal = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6 bg-grey-lighten-5">
          <v-row>
            <v-col cols="12" md="3">
              <v-card class="fill-height rounded-lg pa-4" flat border>
                <div class="text-overline text-medium-emphasis mb-2">Total Value</div>
                <div class="text-h4 font-weight-bold mb-4 text-primary">{{ selectedItem?.value }}</div>
                <v-divider class="mb-4"></v-divider>
                <div class="text-caption text-grey">
                  Ringkasan data statistik untuk metrik terpilih.
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="9">
              <v-card class="rounded-lg pa-2 fill-height d-flex flex-column justify-center" flat border>
                <div v-if="hasChartData" class="chart-container w-100 pa-2">
                  <apexchart
                    width="100%"
                    height="320"
                    :type="selectedItem?.chartType || 'area'"
                    :options="chartOptions"
                    :series="seriesData"
                  ></apexchart>
                </div>
                <div v-else class="text-center py-10">
                  <v-icon size="60" color="grey-lighten-2" class="mb-2">mdi-chart-bar-off</v-icon>
                  <p class="text-caption text-grey">Tidak ada data grafik tersedia.</p>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="bg-white px-6 py-4 border-t">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showModal = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;

// --- TYPES ---
export interface StatItem {
  title: string;
  value: string | number;
  icon?: string;
  color?: string; 
  percentage?: number;
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'donut'; 
  chartLabels?: string[]; 
  chartData?: number[]; 
}

// --- PROPS ---
const props = defineProps({
  stats: {
    type: Array as () => StatItem[],
    default: () => [],
  },
});

// --- STATE ---
const hoverIndex = ref<number | null>(null);
const showModal = ref(false);
const selectedItem = ref<StatItem | null>(null);

// --- METHODS ---
const openDetail = (item: StatItem) => {
  selectedItem.value = item;
  showModal.value = true;
};

const getColorHex = (colorName: string = 'primary') => {
  const map: Record<string, string> = {
    primary: '#6366F1', secondary: '#64748B', success: '#10B981', info: '#3B82F6',
    warning: '#F59E0B', error: '#EF4444', purple: '#8B5CF6', orange: '#F97316'
  };
  return map[colorName] || '#6366F1';
};

// --- COMPUTED ---
const hasChartData = computed(() => {
  return selectedItem.value?.chartData && selectedItem.value.chartData.length > 0;
});

const chartOptions = computed(() => {
  if (!selectedItem.value) return {};
  const color = getColorHex(selectedItem.value.color);
  
  return {
    chart: { id: 'stat-chart', toolbar: { show: false }, fontFamily: 'inherit', animations: { enabled: true } },
    colors: [color],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4, padding: { left: 10, right: 0 } },
    xaxis: { categories: selectedItem.value.chartLabels || [], axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#94a3b8', fontSize: '12px' } } },
    yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '12px' } } },
    tooltip: { theme: 'light' }
  };
});

const seriesData = computed(() => {
  if (!hasChartData.value) return [];
  const type = selectedItem.value?.chartType || 'area';
  if (type === 'pie' || type === 'donut') {
    return selectedItem.value?.chartData;
  } else {
    return [{ name: selectedItem.value?.title || 'Data', data: selectedItem.value?.chartData || [] }];
  }
});
</script>

<style scoped>
/* Grid Responsive */
.custom-grid-5 {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(1, 1fr);
}
@media (min-width: 600px) { .custom-grid-5 { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 960px) { .custom-grid-5 { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1400px) { .custom-grid-5 { grid-template-columns: repeat(5, 1fr); } }

/* Card Styling */
.stat-card {
  border: 1px solid rgba(0,0,0,0.08) !important;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* Pastikan position relative agar icon absolut di dalamnya */
  position: relative; 
}

.stat-card.on-hover {
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  box-shadow: 0 12px 20px -10px rgba(0, 0, 0, 0.1) !important;
}

/* --- STYLE BARU UNTUK ICON BACKGROUND --- */
.bg-icon-watermark {
  position: absolute;
  bottom: -25px; /* Mengatur posisi di bawah */
  right: -25px;  /* Mengatur posisi di kanan */
  opacity: 0.08; /* Opasitas sangat rendah (transparan) */
  transform: rotate(-15deg); /* Sedikit dimiringkan agar dinamis */
  z-index: 0; /* Di belakang teks */
  pointer-events: none; /* Agar tidak mengganggu klik pada kartu */
  transition: all 0.3s ease;
}

/* Opsional: Saat hover, icon sedikit lebih jelas dan bergeser */
.stat-card.on-hover .bg-icon-watermark {
    opacity: 0.12;
    bottom: -20px;
    right: -20px;
}

/* Memastikan teks berada di atas icon background */
.z-index-1 {
  position: relative;
  z-index: 1;
}

.ls-1 { letter-spacing: 0.5px; }
.tracking-tight { letter-spacing: -0.5px; }
</style>