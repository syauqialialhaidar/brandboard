<template>
  <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
    <div class="pa-4 d-flex align-center justify-space-between">
      <div class="text-subtitle-1 font-weight-bold">Gender Distribution</div>
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
        <PieChartCard v-if="chartType === 'pie'" title="" :data="chartData" :has-legend="true" suffix="%" />
        <BarChartCard v-else title="" :data="[{ label: 'Gender', values: chartData.map(d => d.value) }]"
          :segment-labels="chartData.map(d => d.label)" suffix="%" />
      </template>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import PieChartCard from '@/page-components/PieChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';

// Terimalah props filters dari dashboard utama
const props = defineProps<{
  filters: Record<string, any>
}>();

const chartType = ref('pie');
const isLoading = ref(false);
const rawData = ref<any[]>([]);

// Mapping data sesuai format JSON kamu (name & total)
const chartData = computed(() => {
  return rawData.value
    .filter(item => item.gender || item.name)
    .map(item => ({
      label: item.gender || item.name,
      value: Number(item.total || item.value || 0)
    }));
});

async function loadGenderData() {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    // Asumsi endpoint API: top/gender
    const res = await fetchData('top/genders', props.filters);
    rawData.value = Array.isArray(res) ? res : [];
  } catch (e) {
    console.error("Gender Dist Error:", e);
  } finally {
    isLoading.value = false;
  }
}

// Pantau perubahan filter
watch(() => props.filters, loadGenderData, { deep: true });

onMounted(loadGenderData);
</script>