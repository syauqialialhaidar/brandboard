<template>
  <v-row class="mb-2">
    <template v-if="isLoading">
      <v-col v-for="n in 4" :key="n" cols="12" sm="6" md="3">
        <v-skeleton-loader type="card" class="rounded-xl" height="140" />
      </v-col>
    </template>

    <template v-else>
      <v-col v-for="(card, i) in cards" :key="card.title" cols="12" sm="6" md="3">
        <MetricCard 
          :title="card.title" 
          :value="card.value" 
          :icon="card.icon" 
          :index="i" 
          :trend-data="card.trendData"
          :labels="card.labels" 
        />
      </v-col>
    </template>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app'; // Import store untuk mengambil daftar group external
import { fetchData } from '@/utils/apiBuilder';
import MetricCard from '@/page-components/MetricCard.vue';
import moment from 'moment';

const props = defineProps<{
  filters: Record<string, any>; // Menerima filter dari parent (ExternalAnalysis.vue)
}>();

// Setup Store
const appStore = useAppStore();
const { externalGroups } = storeToRefs(appStore);

const isLoading = ref(false);
const cards = ref<any[]>([]);

/**
 * Helper untuk memproses data trend harian
 */
const processTrend = (trendData: any[]) => {
  if (!trendData || !Array.isArray(trendData)) return { values: [], labels: [] };
  
  const dailyMap: Record<string, number> = {};
  trendData.forEach((item: any) => {
    const d = String(item.date);
    dailyMap[d] = (dailyMap[d] || 0) + (Number(item.total) || 0);
  });
  
  const sortedDates = Object.keys(dailyMap).sort();
  return {
    labels: sortedDates.map(d => moment(d).format('DD MMM')),
    values: sortedDates.map(d => dailyMap[d] || 0)
  };
};

async function loadData() {
  isLoading.value = true;
  try {
    // 1. Ambil filter dari props
    const apiFilter = { ...props.filters };
    
    /**
     * 2. LOGIKA PERBAIKAN:
     * Jika di filter tidak ada 'group' yang dipilih secara manual oleh user,
     * kita timpa parameter 'group' dengan daftar externalGroups (43 group kompetitor)
     * agar backend memprosesnya sebagai filter 'IN' (dimengerti backend).
     */
    if (!apiFilter.group || apiFilter.group.length === 0) {
      apiFilter.group = externalGroups.value; 
      // Hapus exclude_group jika ada agar tidak membingungkan backend
      if (apiFilter.exclude_group) delete apiFilter.exclude_group;
    }

    // 3. Request parallel ke API
    const [ads, brands, variants, categories, trend] = await Promise.all([
      fetchData('total/ads', apiFilter),
      fetchData('total/brand', apiFilter), // Harusnya sekarang return 43
      fetchData('total/varian', apiFilter),
      fetchData('total/category', apiFilter),
      fetchData('trend/brand', apiFilter),
    ]);

    const { values: trendValues, labels: trendLabels } = processTrend(trend);

    // 4. Mapping data ke dalam bentuk kartu
    cards.value = [
      { 
        title: 'Total Ads', 
        value: ads?.total || 0, 
        icon: 'mdi-chart-pie', 
        trendData: trendValues, 
        labels: trendLabels 
      },
      { 
        title: 'Total Brands', 
        value: brands?.total || 0, 
        icon: 'mdi-tag', 
        trendData: trendValues.map(v => Math.ceil(v / 5)), // Simulasi trend brand
        labels: trendLabels 
      },
      { 
        title: 'Total Variants', 
        value: variants?.total || 0, 
        icon: 'mdi-tag-multiple', 
        trendData: trendValues.map(v => Math.ceil(v / 2)), 
        labels: trendLabels 
      },
      { 
        title: 'Total Categories', 
        value: categories?.total || 0, 
        icon: 'mdi-shape-outline', 
        trendData: trendValues.map(v => Math.ceil(v / 10)), 
        labels: trendLabels 
      },
    ];

  } catch (error) {
    console.error("Metric Error:", error);
  } finally {
    isLoading.value = false;
  }
}

// Watch perubahan filter (seperti tanggal atau pilihan grup spesifik)
watch(() => props.filters, () => {
  loadData();
}, { deep: true });

onMounted(() => {
  if (externalGroups.value.length === 0) {
    appStore.fetchMasterFilters().then(() => loadData());
  } else {
    loadData();
  }
});
</script>