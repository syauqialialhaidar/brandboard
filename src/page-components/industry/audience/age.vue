<template>
  <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
    <div class="px-3 py-2 d-flex align-center justify-space-between">
      <div class="text-subtitle-2 font-weight-bold">Age Distribution</div>
      <v-btn-toggle v-model="chartType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
        <v-btn value="pie" icon size="small"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
        <v-btn value="bar" icon size="small"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
      </v-btn-toggle>
    </div>

    <v-divider />

    <div class="pa-2 flex-grow-1" style="min-height: 200px;">
      <v-row v-if="isLoading" class="fill-height" align="center" justify="center">
        <v-progress-circular indeterminate color="primary" size="24" />
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
// ... (Script sama persis, tidak perlu diubah) ...
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import PieChartCard from '@/page-components/PieChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';

const props = defineProps<{ filters: Record<string, any> }>();
const isLoading = ref(false);
const chartType = ref('bar');
const rawData = ref<any[]>([]);

const formattedChartData = computed(() => {
  return rawData.value
    .filter(item => item.name || item.age_group || item.age)
    .map(item => ({
      label: item.name || item.age_group || item.age, 
      value: Number(item.total || item.value || 0)
    }));
});

async function loadAgeData() {
  isLoading.value = true;
  try {
    const res = await fetchData('top/ages', props.filters);
    rawData.value = Array.isArray(res) ? res : [];
  } catch (e) {
    console.error("Age Dist Error:", e);
    rawData.value = [];
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.filters, () => { loadAgeData(); }, { deep: true });
onMounted(() => { loadAgeData(); });
</script>