<template>
  <div v-if="!isLoading">

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">All Brand's Variants</div>
            <v-btn-toggle v-model="variantDistType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
              <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
              <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <PieChartCard 
              v-if="variantDistType === 'pie'" 
              title="" 
              :data="variantPieData" 
              :colors="variantColors"
              :has-legend="true" 
              :is-loading="isLoading" 
            />
            <BarChartCard 
              v-else 
              title="" 
              :data="[{ label: 'Total', values: variantPieData.map(d => d.value) }]" 
              :segment-labels="variantPieData.map(d => d.label)" 
              :is-loading="isLoading" 
            />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <TableCard 
          title="Variant's Ranking" 
          :headers="['Brand Variant']" 
          :rows="variantRankingData" 
          :per-page="5" 
          class="h-100 rounded-xl" 
        />
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12">
        <LineChartCard 
          title="Internal Brand Variant Trends" 
          :labels="variantTrendLabels" 
          :data="variantTrendData" 
          :is-loading="isLoading" 
        />
      </v-col>
    </v-row>
  </div>

  <v-row v-else>
    <v-col cols="12" class="text-center pa-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4 text-grey">Loading Variants Analytics...</p>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import { generateBrightColors } from '@/utils/colors';
import moment from 'moment';

import PieChartCard from '@/page-components/PieChartCard.vue';
import LineChartCard from '@/page-components/LineChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';
import TableCard from '@/page-components/TableCard.vue';

const props = defineProps({
  filters: { type: Object, required: true }
});

const isLoading = ref(true);
const variantDistType = ref('pie');

// Data Raw
const rawTopVarian = ref<any[]>([]);
const rawTrendVarian = ref<any[]>([]);
const variantColors = computed(() => generateBrightColors(15));

async function loadVariantAnalytics() {
  isLoading.value = true;
  try {
    const [top, trend] = await Promise.all([
      fetchData('top/varian', props.filters),
      fetchData('trend/varian', props.filters)
    ]);
    rawTopVarian.value = top || [];
    rawTrendVarian.value = trend || [];
  } catch (e) {
    console.error("Gagal load Variants Distribution:", e);
  } finally {
    isLoading.value = false;
  }
}

// Transformasi Data untuk Pie/Bar
const variantPieData = computed(() => {
  return rawTopVarian.value.slice(0, 10).map(item => ({
    label: item.name,
    value: item.total || 0
  }));
});

// Transformasi Data untuk Table Ranking
const variantRankingData = computed(() => {
  return [...rawTopVarian.value]
    .sort((a, b) => (b.total || 0) - (a.total || 0))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      'brand variant': item.name, // Sesuai header di TableCard
      mention: String(item.total || 0)
    }));
});

// Transformasi Data untuk Line Chart Trend
const variantTrendLabels = computed(() => {
  const dates = [...new Set(rawTrendVarian.value.map(i => i.date))].sort();
  return dates.map(d => moment(d).format('DD MMM'));
});

const variantTrendData = computed(() => {
  if (!rawTrendVarian.value.length) return [];
  
  const variants = [...new Set(rawTrendVarian.value.map(i => i.varian))].sort();
  const apiDates = [...new Set(rawTrendVarian.value.map(i => i.date))].sort();
  
  return variants.map((vName) => {
    const dataPoints = apiDates.map(date => {
      const match = rawTrendVarian.value.find(r => r.varian === vName && r.date === date);
      return match ? match.total : 0;
    });
    
    return {
      label: vName || 'Unknown',
      data: dataPoints,
      fill: true
    };
  });
});

// Watchers
watch(() => props.filters, loadVariantAnalytics, { deep: true });
onMounted(loadVariantAnalytics);
</script>