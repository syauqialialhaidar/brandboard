<template>
  <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
    <div class="pa-4 d-flex align-center justify-space-between">
      <div class="text-subtitle-1 font-weight-bold">Age Distribution</div>
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

      <div v-else class="h-100">
        <PieChartCard 
          v-if="chartType === 'pie'" 
          title="" 
          :data="formattedChartData" 
          :has-legend="true"
          suffix="%" 
        />

        <BarChartCard 
          v-else 
          title="" 
          :data="[{ label: 'Audience', values: formattedChartData.map(d => d.value) }]"
          :segment-labels="formattedChartData.map(d => d.label)" 
          suffix="%" 
        />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import PieChartCard from '@/page-components/PieChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';

// Props: Filters dari Parent
const props = defineProps<{
  filters: Record<string, any>
}>();

const isLoading = ref(false);
const chartType = ref('bar');
const rawData = ref<any[]>([]);

// Computed: Transformasi Data API ke Format Chart
const formattedChartData = computed(() => {
  return rawData.value
    .filter(item => item.name || item.age_group || item.age)
    .map(item => ({
      label: item.name || item.age_group || item.age, 
      value: Number(item.total || item.value || 0)
    }));
});

// Fetch Data Function
async function loadAgeData() {
  isLoading.value = true;
  try {
    const res = await fetchData('top/ages', props.filters);
    
    if (Array.isArray(res)) {
      rawData.value = res;
    } else {
      rawData.value = [];
    }
  } catch (e) {
    console.error("Age Dist Error:", e);
    rawData.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Watcher: Reload saat filter berubah
watch(
  () => props.filters, 
  () => { loadAgeData(); }, 
  { deep: true }
);

// Initial Load
onMounted(() => {
  loadAgeData();
});
</script>