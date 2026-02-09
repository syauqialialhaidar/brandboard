<template>
  <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
    <div class="pa-4 d-flex align-center justify-space-between">
      <div class="text-subtitle-1 font-weight-bold">Top Locations</div>
      <v-btn-toggle v-model="chartType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
        <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
        <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
      </v-btn-toggle>
    </div>
    <v-divider />

    <div class="pa-4 flex-grow-1" style="min-height: 300px;">
      <v-row v-if="isLoading" class="fill-height" align="center" justify="center">
        <v-progress-circular indeterminate color="primary" />
      </v-row>

      <template v-else>
        <PieChartCard 
          v-if="chartType === 'pie'" 
          title="" 
          :data="chartData" 
          :has-legend="true" 
          :is-loading="isLoading"
        />

        <BarChartCard 
          v-else 
          title="" 
          :data="[{ label: 'Total Mentions', values: chartData.map(d => d.value) }]" 
          :segment-labels="chartData.map(d => d.label)" 
          :is-loading="isLoading"
        />
      </template>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import PieChartCard from '@/page-components/PieChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';

const props = defineProps<{
  filters: Record<string, any>
}>();

const chartType = ref('pie');
const isLoading = ref(false);
const rawData = ref<any[]>([]);

// Mapping data sesuai JSON yang kamu punya (name & total)
const chartData = computed(() => {
  return rawData.value
    .filter(item => item.name || item.location || item.city)
    .map(item => ({
      label: item.name || item.location || item.city, 
      value: Number(item.total || item.value || 0)
    }));
});

async function loadLocationData() {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    // Sesuaikan endpoint API dengan backend kamu, misal: 'top/locations'
    const res = await fetchData('top/locations', props.filters);
    rawData.value = Array.isArray(res) ? res : [];
  } catch (e) {
    console.error("Location Dist Error:", e);
    rawData.value = [];
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.filters, loadLocationData, { deep: true });
onMounted(loadLocationData);
</script>