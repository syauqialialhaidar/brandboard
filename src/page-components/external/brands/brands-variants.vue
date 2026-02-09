<template>
  <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
    <div class="pa-4 d-flex align-center justify-space-between">
      <div class="text-subtitle-1 font-weight-bold">Brand Variants Distribution</div>
      <v-btn-toggle v-model="chartType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
        <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
        <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
      </v-btn-toggle>
    </div>
    <v-divider />

    <div class="pa-4 flex-grow-1">
      <BarChartCard 
        v-if="chartType === 'bar'" 
        title="" 
        :data="barData"
        :segment-labels="barSegments" 
        :is-loading="isLoading" 
        :is-stacked="true"
      />
      
      <PieChartCard 
        v-else 
        title="" 
        :data="pieData"
        :has-legend="true" 
        :is-loading="isLoading" 
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import BarChartCard from '@/page-components/BarChartCard.vue';
import PieChartCard from '@/page-components/PieChartCard.vue';

const props = defineProps<{ filters: Record<string, any> }>();

const isLoading = ref(false);
const chartType = ref('bar');
const rawStackedData = ref<any[]>([]);

// --- Computed Data ---

// 1. Logic untuk Stacked Bar
const processedBar = computed(() => {
  const allVariants = new Set<string>();
  
  // Kumpulkan semua nama varian unik
  rawStackedData.value.forEach(item => {
    if (item.varian) Object.keys(item.varian).forEach(v => allVariants.add(v));
  });

  const segments = [...allVariants].sort(); // List nama varian (Legend)

  // Mapping data per brand
  const data = rawStackedData.value.map(brandItem => ({
    label: brandItem.brand,
    values: segments.map(vName => brandItem.varian?.[vName] || 0)
  }));

  return { data, segments };
});

const barData = computed(() => processedBar.value.data);
const barSegments = computed(() => processedBar.value.segments);

// 2. Logic untuk Pie (Flattening Stacked Data)
const pieData = computed(() => {
  const variantTotals: Record<string, number> = {};
  
  rawStackedData.value.forEach(item => {
    if (item.varian) {
      Object.entries(item.varian).forEach(([vName, count]) => {
        variantTotals[vName] = (variantTotals[vName] || 0) + (Number(count) || 0);
      });
    }
  });

  // Convert object ke array format PieChart
  return Object.entries(variantTotals)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value) // Urutkan terbesar
    .slice(0, 10); // Ambil top 10 agar chart tidak penuh
});

async function loadData() {
  isLoading.value = true;
  try {
    // Endpoint ini mengembalikan { brand: "A", varian: { "Var1": 10, "Var2": 5 } }
    const res = await fetchData('stacked/brand/varian', props.filters);
    rawStackedData.value = res || [];
  } catch (e) {
    console.error("Variant Dist Error:", e);
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.filters, loadData, { deep: true });
onMounted(loadData);
</script>