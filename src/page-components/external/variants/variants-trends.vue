<template>
  <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
    <div class="pa-4">
      <div class="text-subtitle-1 font-weight-bold">Brand Variant Trends</div>
    </div>
    <v-divider />
    <div class="pa-4 flex-grow-1">
      <LineChartCard 
        title="" 
        :labels="trendLabels" 
        :data="trendData" 
        :is-loading="loading" 
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import LineChartCard from '@/page-components/LineChartCard.vue';
import { fetchData } from '@/utils/apiBuilder';
import moment from 'moment';

const props = defineProps<{
  filters: Record<string, any>
}>();

const rawTrendVarian = ref<any[]>([]);
const loading = ref(false);

// Logic disamakan dengan Kode 1: Mengambil label hanya dari data yang ada
const trendLabels = computed(() => {
  if (!rawTrendVarian.value.length) return [];
  const dates = [...new Set(rawTrendVarian.value.map(i => i.date))].sort();
  return dates.map(d => moment(d).format('DD MMM'));
});

// Logic disamakan dengan Kode 1: Mapping varian berdasarkan tanggal yang tersedia di data
const trendData = computed(() => {
  if (!rawTrendVarian.value.length) return [];
  
  const variants = [...new Set(rawTrendVarian.value.map(i => i.varian))].sort();
  const apiDates = [...new Set(rawTrendVarian.value.map(i => i.date))].sort();
  
  return variants.map((vName) => ({
    label: vName || 'Unknown',
    data: apiDates.map(date => {
      const match = rawTrendVarian.value.find(r => r.varian === vName && r.date === date);
      return match ? match.total : 0;
    }),
    fill: true,
    tension: 0.4 // Tambahan agar grafik tetap smooth
  }));
});

const fetchTrends = async () => {
  loading.value = true;
  try {
    const res = await fetchData('trend/varian', props.filters);
    rawTrendVarian.value = res || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

watch(() => props.filters, fetchTrends, { deep: true });
onMounted(fetchTrends);
</script>