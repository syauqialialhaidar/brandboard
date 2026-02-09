<template>
  <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
    <div class="pa-4">
      <div class="text-subtitle-1 font-weight-bold">Brand Trends</div>
    </div>
    <v-divider />
    <div class="pa-4 flex-grow-1">
      <LineChartCard 
        title="" 
        :labels="chartLabels" 
        :data="chartData"
        :is-loading="isLoading" 
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import { generateBrightColors } from '@/utils/colors'; // Pastikan utils ini ada
import LineChartCard from '@/page-components/LineChartCard.vue';
import moment from 'moment';

const props = defineProps<{ filters: Record<string, any> }>();

const isLoading = ref(false);
const chartData = ref<any[]>([]);
const chartLabels = ref<string[]>([]);

// --- Helper: Generate Date Range ---
function generateDateLabels(start: string, end: string) {
  const dates: string[] = [];
  const labels: string[] = [];
  let curr = moment(start);
  const stop = moment(end);
  while (curr.isSameOrBefore(stop)) {
    dates.push(curr.format('YYYY-MM-DD'));
    labels.push(curr.format('DD MMM'));
    curr.add(1, 'day');
  }
  return { dates, labels };
}

async function loadData() {
  isLoading.value = true;
  try {
    const res = await fetchData('trend/brand', props.filters);
    
    // 1. Group data by Brand
    const brandsMap = new Map<string, any[]>();
    (res || []).forEach((item: any) => {
      if (!brandsMap.has(item.brand)) brandsMap.set(item.brand, []);
      brandsMap.get(item.brand)!.push(item);
    });

    // 2. Siapkan Label Tanggal (Sumbu X)
    const { dates, labels } = generateDateLabels(props.filters.start_date, props.filters.end_date);
    chartLabels.value = labels;

    // 3. Mapping Data per Brand ke Tanggal
    const colors = generateBrightColors(brandsMap.size);
    let colorIndex = 0;

    chartData.value = [...brandsMap.keys()].sort().map(brandName => {
      const items = brandsMap.get(brandName)!;
      const dataMap = new Map(items.map(i => [i.date, Number(i.total)]));
      const color = colors[colorIndex++] || '#000';

      return {
        label: brandName,
        data: dates.map(d => dataMap.get(d) || 0), // Isi 0 jika tanggal kosong
        borderColor: color,
        backgroundColor: color + '33', // Transparan
        fill: true,
        tension: 0.4
      };
    });

  } catch (e) {
    console.error("Brands Trend Error:", e);
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.filters, loadData, { deep: true });
onMounted(loadData);
</script>