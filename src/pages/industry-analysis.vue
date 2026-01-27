<template>
  <v-container fluid class="pa-0">
    <PageTitle title="Industry Analysis" />

    <!-- <v-row>
      <v-col v-for="(stat, index) in industryStats" :key="index" cols="12" sm="6" lg="3">
        <MetricCard :title="stat.title" :value="stat.value" :icon="stat.icon" :trend-data="stat.trendData" :index="index" />
      </v-col>
    </v-row> -->

    <v-row class="mt-4">
      <v-col cols="12" lg="6">
        <v-card class="pa-0 pb-4 premium-card overflow-hidden d-flex flex-column" elevation="0">
          <div class="d-flex flex-wrap align-center pa-4 ga-4">
            <v-card-title class="text-subtitle-1 font-weight-bold pa-0">Ad Spend Trend</v-card-title>
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="lineToggle" density="compact" divided>
              <v-btn value="top10" class="text-capitalize px-3">Top 10</v-btn>
              <v-btn value="all" class="text-capitalize px-3">All</v-btn>
              <v-btn value="bottom10" class="text-capitalize px-3">Bottom 10</v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <v-card-text class="pa-4 chart-container">
            <LineChart :datasets="lineDatasets" :labels="['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']" :options="lineOptions" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="pa-0 pb-4 premium-card overflow-hidden d-flex flex-column" elevation="0">
          <div class="d-flex flex-wrap align-center pa-4 ga-4">
            <v-card-title class="text-subtitle-1 font-weight-bold pa-0">Brand Performance</v-card-title>
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="barToggle" density="compact" divided>
              <v-btn value="top10" class="text-capitalize px-3">Top 10</v-btn>
              <v-btn value="all" class="text-capitalize px-3">All</v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <v-card-text class="pa-4 chart-container">
            <BarChart :labels="barLabels" :datasets="barDatasets" :options="barOptions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col v-for="(table, index) in industryTables" :key="index" cols="12" lg="6">
        <PremiumTable 
          :title="table.title"
          :headers="table.headers"
          :rows="table.data"
          :per-page="5"
        />
      </v-col>
    </v-row>

    <div class="d-flex align-center mb-4 mt-4 ga-2">
      <div class="text-h5 font-weight-bold">Deep-Dive Insights</div>
    </div>

    <!-- <v-row class="mb-8">
      <v-col cols="12" lg="4">
        <BarChartCard title="Age Distribution" :has-legend="true" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" lg="4">
        <PieChartCard title="Location Distribution" :labels="PieChartCard" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" lg="4">
        <PieChartCard title="Gender Distribution" :labels="PieChartCard" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
    </v-row> -->
    
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageTitle from '@/page-components/PageTitle.vue';
import MetricCard from '@/page-components/MetricCard.vue';
import LineChart from '@/page-components/charts/LineChart.vue';
import BarChart from '@/page-components/charts/BarChart.vue';
import FilterComponent from '@/page-components/Filter.vue';
import PremiumTable from '@/page-components/TableCard.vue';
import { fetchData } from '@/utils/apiBuilder';
import BarChartCard from '@/page-components/BarChartCard.vue';
import PieChartCard from '@/page-components/PieChartCard.vue';

// 1. Filter Configuration
const categories = ref<string[]>([]);
const industryLevels = [
  { key: 'category', label: 'Pilih Kategori', endpoint: 'top/sub-category', paramName: 'cat_id' },
  { key: 'subCategory', label: 'Pilih Sub Kategori' }
];

// Load initial categories
onMounted(async () => {
  try {
    const response = await fetchData('top/category');
    if (response && Array.isArray(response)) {
      categories.value = response.map((item: any) => item.name).sort();
    }
  } catch (error) {
    console.error("Failed to load initial categories", error);
  }
});

// Handle data dari filter
const handleFilterUpdate = (filters: any) => {
  console.log('Filter Terpilih di Industri Page:', filters);
  // Panggil fungsi refresh data chart/metrics di sini berdasarkan filters.category & filters.subCategory
};

// 2. Data Metric Cards & Charts (Statik untuk contoh)
const lineToggle = ref('all');
const barToggle = ref('top10');
const industryStats = ref([
  { title: 'Total Ad Spend', value: '24.5M', icon: 'mdi-chart-arc', trendData: [20, 22, 18, 24, 23, 25, 24.5] },
  { title: 'Total Impressions', value: '842.8M', icon: 'mdi-currency-usd', trendData: [400, 550, 480, 620, 700, 810, 842] },
  { title: 'Active Brands', value: '12.4k', icon: 'mdi-account-group', trendData: [8, 9, 11, 10, 12, 13, 12.4] },
  { title: 'Average Reach', value: '15.2%', icon: 'mdi-trending-up', trendData: [5, 8, 7, 12, 10, 14, 15.2] }
]);

const lineDatasets = computed(() => [{
  label: 'Monthly Spending',
  data: [30, 45, 35, 50, 40, 60, 55],
  borderColor: '#6366f1',
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  fill: true, tension: 0.4
}]);
const lineOptions = { responsive: true, maintainAspectRatio: false };

const barLabels = ref(['Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Vivo']);
const barDatasets = computed(() => [
  { label: 'Digital', data: [40, 50, 30, 25, 20], backgroundColor: '#6366f1' },
  { label: 'Social', data: [30, 20, 45, 30, 25], backgroundColor: '#8b5cf6' }
]);
const barOptions = { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } };



const industryTables = ref([
  {
    title: 'Top Sub-Brands',
    headers: ['Sub-Brand', 'Company', 'Spend'],
    data: [] // Kosong sementara
  },
  {
    title: 'Top TV Programs',
    headers: ['Program', 'Channel', 'Rating'],
    data: []
  },
  {
    title: 'Top TV Channels',
    headers: ['Channel', 'Audience Share', 'Growth'],
    data: []
  },
  {
    title: 'Top Ad Spending',
    headers: ['Brand', 'Category', 'Total Spend'],
    data: []
  },
  {
    title: 'Prime Time Leaders',
    headers: ['Program', 'Time Slot', 'Viewers'],
    data: []
  },
  {
    title: 'Top Program Types',
    headers: ['Genre', 'Total Programs', 'Popularity'],
    data: []
  }
]);
</script>

<style scoped>
.premium-card {
  border-radius: 20px !important;
  border: 1px solid rgba(var(--v-border-color), 0.05) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05) !important;
  height: 100%;
}
.chart-container {
  min-height: 350px;
  flex-grow: 1;
}
.v-btn-toggle {
  border-radius: 12px !important;
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
  height: 32px;
}
</style>