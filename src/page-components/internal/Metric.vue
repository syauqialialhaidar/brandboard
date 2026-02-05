<template>
  <v-row>
    <v-col 
      v-for="(card, i) in processedCards" 
      :key="card.title" 
      cols="12" sm="6" md="3"
    >
      <MetricCard 
        :title="card.title" 
        :value="card.value" 
        :icon="card.icon" 
        :index="i" 
        :trend-data="card.trendData"
        :labels="card.labels" 
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import MetricCard from '@/page-components/MetricCard.vue';
import { fetchData } from '@/utils/apiBuilder';
import moment from 'moment';

// Definisi Props untuk menerima filter dari Dashboard utama
const props = defineProps<{
  filters: Record<string, any>
}>();

// State Reaktif
const isLoading = ref(true);
const stats = ref({ totalAds: 0, totalBrands: 0, totalVariants: 0 });
const trendData = ref<number[]>([]);
const trendLabels = ref<string[]>([]);

async function fetchMetricData() {
  isLoading.value = true;
  try {
    // Susun filter API agar tidak mengirim array kosong
    const apiFilter = {
      group: props.filters.group,
      ...(props.filters.brand?.length > 0 && { brand: props.filters.brand }),
      ...(props.filters.category?.length > 0 && { category: props.filters.category }),
      ...(props.filters.sub_category?.length > 0 && { sub_category: props.filters.sub_category }),
      ...(props.filters.varian?.length > 0 && { varian: props.filters.varian }),
    };

    // Parallel Fetching untuk kecepatan maksimal
    const [ads, brands, variants, trend] = await Promise.all([
      fetchData('total/ads', apiFilter),
      fetchData('total/brand', apiFilter),
      fetchData('total/varian', apiFilter),
      fetchData('trend/brand', apiFilter),
    ]);

    // Update nilai statistik
    stats.value = {
      totalAds: ads?.total || 0,
      totalBrands: brands?.total || 0,
      totalVariants: variants?.total || 0
    };

    // Olah data tren untuk grafik v-sparkline
    if (trend && Array.isArray(trend)) {
      const dailyMap: Record<string, number> = {};
      
      trend.forEach((item: any) => {
        const d = item.date;
        if (d) {
          dailyMap[d] = (dailyMap[d] || 0) + (Number(item.total) || 0);
        }
      });

      const sortedDates = Object.keys(dailyMap).sort();
      
      // Update ref - DISINI PERBAIKANNYA (pastikan .value ada)
      trendLabels.value = sortedDates.map(date => moment(date).format('DD MMM'));
      trendData.value = sortedDates.map(date => dailyMap[date] || 0);
    } else {
      // Reset jika data trend kosong
      trendData.value = [];
      trendLabels.value = [];
    }
  } catch (e) {
    console.error("Metric API Error:", e);
  } finally {
    isLoading.value = false;
  }
}

// Pantau perubahan filter (Deep Watch)
watch(() => props.filters, () => fetchMetricData(), { deep: true });

onMounted(() => fetchMetricData());

/**
 * Computed untuk mendistribusikan data ke masing-masing kartu.
 * Kita menggunakan .value karena trendData adalah sebuah Ref.
 */
const processedCards = computed(() => [
  {
    title: 'Total Unilever Ads',
    value: isLoading.value ? '...' : stats.value.totalAds,
    icon: 'mdi-chart-line',
    trendData: trendData.value, // Mengirim array [number, number, ...]
    labels: trendLabels.value
  },
  {
    title: 'Total of Brands',
    value: isLoading.value ? '...' : stats.value.totalBrands,
    icon: 'mdi-tag',
    // Simulasi tren jika API khusus brand belum ada
    trendData: trendData.value.map(v => Math.max(1, Math.round(v / 5))),
    labels: trendLabels.value
  },
  {
    title: 'Total of Brand Variants',
    value: isLoading.value ? '...' : stats.value.totalVariants,
    icon: 'mdi-tag-multiple',
    trendData: trendData.value.map(v => Math.round(v / 2)),
    labels: trendLabels.value
  },
  {
    title: 'Total Spending',
    value: '...', // Update bagian ini jika ada API spending
    icon: 'mdi-cash-multiple',
    trendData: trendData.value.map(v => Math.max(1, Math.round(v / 10))),
    labels: trendLabels.value
  },
]);
</script>