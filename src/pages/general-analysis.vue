<template>
  <v-container fluid class="pa-0">

    <PageTitle 
  title="General Analysis" 
  :enabled-filters="['channel', 'group', 'brand', 'variants', 'kategori', 'sub_kategori']"
  @update:filter="handleFilterUpdate" 
/>

    <v-row class="mb-6 d-flex flex-nowrap"> <v-col v-for="(card, i) in metricCards" :key="card.title"
        class="flex-grow-1 flex-shrink-0" style="min-width: 0; width: 20%;">
        <MetricCard v-bind="card" :index="i" class="h-100" />
      </v-col>
    </v-row>

    <!-- <v-row align="stretch" class="mb-8">
      <v-col cols="12" lg="4">
        <v-card 
          variant="flat" 
          color="primary-lighten-5" 
          class="h-100 d-flex align-center justify-center rounded-xl overflow-hidden position-relative" 
          border
        >
          <div class="circle-deco deco-1"></div>
          <div class="circle-deco deco-2"></div>
          
          <v-img 
            src="@/assets/images/tvc.png" 
            max-width="320" 
            width="100%" 
            contain 
            class="floating-img position-relative z-index-2"
          />
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card class="h-100 rounded-xl pa-0 overflow-hidden" border variant="flat">
          <div class="pa-4 d-flex align-center border-b">
            <v-icon color="primary" class="mr-2">mdi-trophy-outline</v-icon>
            <span class="text-h6 font-weight-bold">Top 5 Competitor Company</span>
          </div>
          <div class="pa-4">
             <BrandCarousel :items="top5CorporateAds" />
          </div>
        </v-card>
      </v-col>
    </v-row> -->



    <v-row class="mb-2">
      <v-col cols="12">
        <HighlightsCarousel total-title="All Brands Mentions" item-label="All Brands" :items="allBrandHighlights"
          :total-items-count="rawAllBrands.length" :is-loading-more="isFetchingMore" :total-value="totalAdsAllCorporate"
          :start-date="startDate" :end-date="endDate" :show-modal="showBrandModal" :selected-item="selectedBrandData"
          :active-video="activeVideo" :is-loading-detail="isLoadingVideos" @close-modal="showBrandModal = false"
          @next-page="handleLoadMore" @item-click="handleBrandClick" />
      </v-col>
    </v-row>

    <div class="d-flex align-center mb-4 ga-2">
      <div class="text-h5 font-weight-bold">Trends and Ranking</div>
    </div>

    <v-row class="mb-8">
      <v-col cols="12" lg="4">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Top 10 Corporate Distribution</div>
            <v-btn-toggle v-model="corporateChartType" density="compact" mandatory color="primary" variant="tonal"
              class="rounded-lg">
              <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
              <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <PieChartCard v-if="corporateChartType === 'pie'" title="" :data="corporationPieData" :has-legend="true"
              :is-loading="isLoading" />

            <BarChartCard v-else title="" :data="[{ label: 'Mentions', values: corporationPieData.map(d => d.value) }]"
              :segment-labels="corporationPieData.map(d => d.label)" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4">
            <div class="text-subtitle-1 font-weight-bold">Corporation Trends</div>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <LineChartCard title="" :labels="lineChartLabels" :data="lineChartDatasets" :show-toggle="true"
              :toggle="lineChartToggle" @toggle-change="lineChartToggle = $event" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="flat" border class="pa-4 mb-6 rounded-xl bg-surface">
      <div class="d-flex flex-wrap align-center ga-6">
        <div class="text-subtitle-1 font-weight-bold text-medium-emphasis">View Analysis By:</div>
        <v-btn-toggle v-model="analysisTab" density="comfortable" divided mandatory color="primary" variant="outlined"
          class="rounded-lg">
          <v-btn value="all" class="text-capitalize px-6">All</v-btn>
          <v-btn value="top10" class="text-capitalize px-6">Top 10</v-btn>
          <v-btn value="bottom10" class="text-capitalize px-6">Bottom 10</v-btn>
        </v-btn-toggle>
        <v-spacer></v-spacer>
        <v-switch v-model="alwaysShowInternal" label="Highlight Our Company" color="primary" hide-details inset
          density="compact"></v-switch>
      </div>
    </v-card>

    <v-row class="mb-2">
      <v-col cols="12" md="4">
        <TableCard title="Top Groups" :headers="['Name']" :rows="topGroups" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Brands" :headers="['Name']" :rows="topBrands" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Variants" :headers="['Name']" :rows="topVariants" class="h-100 rounded-xl" />
      </v-col>
    </v-row>

    <div class="d-flex align-center mb-4 ga-2">
      <div class="text-h5 font-weight-bold">Media and Audience Distributions</div>
    </div>

    <v-row class="mb-2">
      <!-- <v-col cols="12" md="6">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Gender</div>
            <v-btn-toggle v-model="genderChartType" density="compact" mandatory color="primary" variant="tonal"
              class="rounded-lg">
              <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
              <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <PieChartCard v-if="genderChartType === 'pie'" title="" :data="genderPieData" :has-legend="true"
              :is-loading="isLoading" suffix="%" />
            <BarChartCard v-else title="" :data="[{ label: 'Gender', values: genderPieData.map(d => d.value) }]"
              :segment-labels="genderPieData.map(d => d.label)" suffix="%" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col> -->

      <!-- <v-col cols="12" md="6">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Age</div>
            <v-btn-toggle v-model="ageChartType" density="compact" mandatory color="primary" variant="tonal"
              class="rounded-lg">
              <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
              <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <BarChartCard v-if="ageChartType === 'bar'" title="" :data="[{ label: 'Age', values: ageBarData.data[0].values }]"
              :segment-labels="ageBarData.segments" suffix="%" :is-loading="isLoading" />
            <PieChartCard v-else title=""
              :data="ageBarData.segments.map((label, i) => ({ label, value: ageBarData.data[0].values[i] }))"
              :has-legend="true" suffix="%" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col> -->
    </v-row>

    <v-row class="mb-2">
      <!-- <v-col cols="12" md="6">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Location</div>
            <v-btn-toggle v-model="locationChartType" density="compact" mandatory color="primary" variant="tonal"
              class="rounded-lg">
              <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
              <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <PieChartCard v-if="locationChartType === 'pie'" title="" :data="locationPieData" :has-legend="true"
              :is-loading="isLoading" />
            <BarChartCard v-else title="" :data="[{ label: 'Location', values: locationPieData.map(d => d.value) }]"
              :segment-labels="locationPieData.map(d => d.label)" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col> -->
      <v-col cols="12" md="4">
        <TableMinim title="Top Brand Ambassador" :headers="['Name']" :rows="topAmbassadorsList" :per-page="5"
          class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Zona Waktu</div>
            <v-btn-toggle v-model="timezoneChartType" density="compact" mandatory color="primary" variant="tonal"
              class="rounded-lg">
              <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
              <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <PieChartCard v-if="timezoneChartType === 'pie'" title="" :data="timezonePieData" :has-legend="true"
              :is-loading="isLoading" />
            <BarChartCard v-else title="" :data="[{ label: 'Total', values: timezonePieData.map(d => d.value) }]"
              :segment-labels="timezonePieData.map(d => d.label)" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Scope</div>
            <v-btn-toggle v-model="scopeChartType" density="compact" mandatory color="primary" variant="tonal"
              class="rounded-lg">
              <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
              <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <BarChartCard v-if="scopeChartType === 'bar'" title="" :data="scopeBarData.data"
              :segment-labels="scopeBarData.segments" :is-loading="isLoading" />
            <PieChartCard v-else title=""
              :data="scopeBarData.segments.map((label, i) => ({ label, value: scopeBarData.data[0].values[i] }))"
              :has-legend="true" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-2">
      

      


    </v-row>
    <v-row class="mb-8">
      <v-col cols="12" md="6">
        <TableMinim title="Top Program" :headers="['Name', 'Channel']" :rows="topProgramsList" :per-page="5"
          class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="6">
        <TableMinim title="Programs Types" :headers="['Name']" :rows="topProgramsType" :per-page="5"
          class="h-100 rounded-xl" />
      </v-col>
    </v-row>


    <!-- <v-row class="mt-4">
      <v-col cols="12" md="6">
        <HeatmapCard title="General Corporation Brand Distribution" :data="heatmapData" :is-loading="isLoading"
          @item-click="handleHeatmapClick">
          <template #append-header>
            <v-btn-toggle v-model="barChartToggle" density="compact" divided mandatory>
              <v-btn value="top10">Top 10</v-btn>
              <v-btn value="all">All</v-btn>
              <v-btn value="bottom10">Bottom 10</v-btn>
            </v-btn-toggle>
          </template>
</HeatmapCard>
</v-col>

<v-col cols="12" md="6">
  <v-card class="pa-0 pb-4 rounded-lg overflow-hidden d-flex flex-column h-100" color="surface">
    <div class="d-flex align-center pa-4 ga-4">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
        Brand Detail:
        <span class="text-primary">
          {{ selectedGroupForDetail === 'ALL_DATA' ? 'All Corporations' : (selectedGroupForDetail ||
          'SelectaCorporation') }}
        </span>
      </v-card-title>
      <v-spacer></v-spacer>
      <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-view-grid"
        class="text-capitalize font-weight-bold" @click="selectedGroupForDetail = 'ALL_DATA'">
        View All
      </v-btn>
    </div>

    <v-divider class="mb-4"></v-divider>

    <v-card-text class="pa-4 flex-grow-1">
      <div v-if="selectedGroupForDetail" class="h-100">
        <BarChartCard title="" :data="detailedBarChartData.data" :segment-labels="detailedBarChartData.segments"
          :show-toggle="false" :is-loading="isLoading" />
      </div>
      <div v-else class="d-flex align-center justify-center h-100 text-medium-emphasis flex-column py-10">
        <v-icon size="64" class="mb-2 opacity-20">mdi-chart-bar</v-icon>
        <p>Click a grid in the heatmap to see breakdown</p>
      </div>
    </v-card-text>
  </v-card>
</v-col>
</v-row> -->

    <!-- <FilterComponent title="Product Filter" :levels="[
      { key: 'group', label: 'Select Group', endpoint: 'top/brand' },
      { key: 'brand', label: 'Select Brand', endpoint: 'top/varian' },
      { key: 'variant', label: 'Select Variant' }
    ]" @update:filter="(val) => console.log('General Filter:', val)" />

    <v-row class="mb-6">
      <v-col cols="12">
        <MultiCard :stats="multiCardData" />
      </v-col>
    </v-row> -->
    <!-- <v-row class="mb-8">
      <v-col cols="12" lg="4">
        <PieChartCard title="Scope Ads" :has-legend="true" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" lg="8">
        <LineChartCard title="Day to Day" :labels="lineChartLabels" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
    </v-row> -->

    <!-- <v-row class="mb-8">
      <v-col cols="12" md="6">
        <TableCard title="Brands Ambasador" :headers="['Name']" :rows="topVariants" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="6">
        <BarChartCard title="Tipe Ads" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
    </v-row> -->



  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import PageTitle from '@/page-components/PageTitle.vue';
import MetricCard from '@/page-components/MetricCard.vue';
import HighlightsCarousel from '@/page-components/HighlightsCarousel.vue';
import TableCard from '@/page-components/TableCard.vue';
import PieChartCard from '@/page-components/PieChartCard.vue';
import LineChartCard from '@/page-components/LineChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';
import TableMinim from '@/page-components/TableMinim.vue';
import FilterComponent from '@/page-components/Filter.vue';
import HeatmapCard from '@/page-components/HeatmapCard.vue';
import BrandCarousel from '@/page-components/BrandCarousel.vue';
import { generateBrightColors } from '@/utils/colors';
import moment from 'moment';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import { fetchData } from '@/utils/apiBuilder';
import unileverLogo from '@/assets/images/Unilever.png';

import MultiCard from '@/page-components/MultiCard.vue';


interface HighlightItem {
  logo: string;
  name: string;
  count: number | string;
  preview_video?: string;
}
interface TableRow {
  name: string;
  mention: number | string;
  rank?: number;
  isInternal?: boolean;
}
interface PieChartItem {
  label: string;
  value: number;
}
interface TrendItem {
  total: number;
  group: string;
  date: string;
}
interface StackedItem {
  brand: { [key: string]: number };
  total: number;
  group: string;
}
interface DateRange {
  labels: string[];
  apiDates: string[];
}
interface VideoAdItem {
  _id: string;
  channel: string;
  time: string;
  nama_video: string;
  video_link: string;
  brand: string[];
  group: string[];
  category: string;
  sub_category: string;
  varian: string[];
  brand_ambassador: string[];
}
interface MetricCardItem {
  title: string;
  value: string | number;
  icon: string;
  trendData: number[];
  labels?: string[];
}
const rawInternalVariants = ref<any[]>([]);

const rawTimezoneData = ref<any[]>([]);
const rawScopeData = ref<any[]>([]);

//===filter
const selectedGroups = ref([]);
const selectedBrands = ref([]);
const selectedVariants = ref([]);
const selectedCategory = ref([]);
const selectedSubCategory = ref([]);
const handleFilterUpdate = async (newFilters) => {
  if (newFilters.group !== undefined) selectedGroups.value = newFilters.group;
  if (newFilters.brand !== undefined) selectedBrands.value = newFilters.brand;
  if (newFilters.variants !== undefined) selectedVariants.value = newFilters.variants;
  if (newFilters.kategori !== undefined) selectedCategory.value = newFilters.kategori;
  if (newFilters.sub_kategori !== undefined) selectedSubCategory.value = newFilters.sub_kategori;

  await fetchGlobalData(); // Panggil ulang API dengan filter baru
};



// ==========================================================Carousel
const rawAllBrands = ref<any[]>([]);
const allBrandHighlights = ref<any[]>([]);
const totalAdsAllCorporate = ref<number | string>(0);

// ==========================================================DUmmmy
const genderPieData = ref([
  { label: 'Laki-laki', value: 65 },
  { label: 'Perempuan', value: 35 },
]);

const ageBarData = ref({
  segments: ['Anak-anak', 'Remaja', 'Dewasa'],
  data: [
    { label: 'Persentase', values: [20, 30, 50] }
  ]
});
// --- DUMMY LOCATION DATA ---
const dummyLocations = ref([
  { name: 'Jakarta', total: 1250 },
  { name: 'Surabaya', total: 980 },
  { name: 'Bandung', total: 850 },
  { name: 'Medan', total: 720 },
  { name: 'Semarang', total: 610 },
]);

const locationPieData = computed<PieChartItem[]>(() => {
  // Jika nanti pakai API, ganti dummyLocations.value dengan rawLocationData.value
  return dummyLocations.value.map(item => ({
    label: item.name,
    value: Number(item.total)
  }));
});


// Zona Waktu (Pie) - Mapping dari /top/periode
const timezonePieData = computed<PieChartItem[]>(() => {
  return rawTimezoneData.value.map(item => ({
    label: item.name || item.label,
    value: Number(item.total || item.value) || 0
  }));
});

// Scope Penyiaran (Bar) - Mapping dari /top/scope
const scopeBarData = computed(() => {
  const labels = rawScopeData.value.map(item => item.name || item.label);
  const values = rawScopeData.value.map(item => Number(item.total || item.value) || 0);

  return {
    segments: labels,
    data: [{ label: 'Total Ads', values: values }]
  };
});


//==========================================================Top Programs 
const rawProgramType = ref<TableRow[]>([]);
const rawTopPrograms = ref<TableRow[]>([]);
const rawTopAmbassadors = ref<TableRow[]>([]);
const totalRateCard = ref<number | string>(0);

// ---------------------------------------------------------
// 3. TAMBAHKAN Computed Properties untuk Display
// ---------------------------------------------------------
// Mengambil 5 teratas untuk Program
const processSimpleTopList = (data: TableRow[], limit: number = 5): TableRow[] => {
  // 1. Copy & Sort dari terbesar
  return [...data]
    .sort((a, b) => Number(b.mention) - Number(a.mention))
    .map((item, index) => ({
      name: item.name,
      mention: item.mention,
      rank: index + 1,
      isInternal: false
    }));
};

// --- Computed Properties Baru ---
// Kita tambahkan <TableRow[]> agar TypeScript yakin tipe datanya benar
const topProgramsType = computed<TableRow[]>(() => {
  return processSimpleTopList(rawProgramType.value);
});

const topProgramsList = computed<TableRow[]>(() => {
  return processSimpleTopList(rawTopPrograms.value);
});

const topAmbassadorsList = computed<TableRow[]>(() => {
  return processSimpleTopList(rawTopAmbassadors.value);
});
// Format Rate Card (Opsional: Format mata uang)
const formattedRateCard = computed(() => {
  const val = Number(totalRateCard.value);
  if (isNaN(val)) return 0;
  // Format ke Rupiah Singkat (Jt/M) atau angka biasa
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'M';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'Jt';
  return val.toLocaleString('id-ID');
});


const appStore = useAppStore();
const {
  startDate,
  endDate,
  selectedChannels,
  internalGroup,
} = storeToRefs(appStore);

const isLoading = ref(true);

// --- MODAL & UI STATES ---
const showBrandModal = ref(false);
const selectedBrandData = ref<HighlightItem | null>(null);
const alwaysShowInternal = ref(false);
const analysisTab = ref('all');
const lineChartToggle = ref('all');
const barChartToggle = ref('all');
const selectedGroupForDetail = ref<string>('');

// --- DATA STATES ---
const corporateTotal = ref<number | string>('...');
const corporateHighlights = ref<HighlightItem[]>([]);
const rawInternalBrands = ref<any[]>([]);
const myBrandHighlights = ref<any[]>([]);
const rawTableTopGroups = ref<TableRow[]>([]);
const rawTableTopBrands = ref<TableRow[]>([]);
const rawTableTopVariants = ref<TableRow[]>([]);
const rawChartTopGroups = ref<TableRow[]>([]);
const rawChartTrendGroup = ref<TrendItem[]>([]);
const rawChartStackedGroupBrand = ref<StackedItem[]>([]);

// --- PAGINATION STATE ---
const currentPageInternal = ref(0);
const pageSize = 5;
const isFetchingMore = ref(false);

//---TOGQGLE STATE---
const corporateChartType = ref('pie');
const genderChartType = ref('pie');
const ageChartType = ref('bar');
const locationChartType = ref('pie');
const timezoneChartType = ref('pie');
const scopeChartType = ref('bar');

// --- METRIC CARDS STATE ---
const adsTrendData = ref<number[]>([]);
const groupsTrendData = ref<number[]>([]);
const brandsTrendData = ref<number[]>([]);
const variantsTrendData = ref<number[]>([]);
const metricCards = ref<MetricCardItem[]>([
  { title: 'Rate Card', value: '...', icon: 'mdi-cash-multiple', trendData: [] }, // Diubah
  { title: 'Total Corporates', value: '...', icon: 'mdi-domain', trendData: [] },
  { title: 'Total Brands', value: '...', icon: 'mdi-tag', trendData: [] },
  { title: 'Total Brand Variants', value: '...', icon: 'mdi-tag-multiple', trendData: [] },
]);

// --- VIDEO DETAIL STATE ---
const brandVideos = ref<any[]>([]);
const isLoadingVideos = ref(false);
const activeVideo = computed<VideoAdItem | null>(() => {
  return brandVideos.value?.length > 0 ? brandVideos.value[0] : null;
});

//----Comparison Filter State----
const categories = ref<string[]>([]); // Data awal untuk dropdown pertama

// --- LOGIKA FETCH DATA AWAL ---
async function fetchInitialGroups() {
  try {
    const response = await fetchData('top/group');
    if (response && Array.isArray(response)) {
      // Ambil nama group untuk mengisi dropdown pertama
      categories.value = response.map((item: any) => item.name).sort();
    }
  } catch (error) {
    console.error("Gagal mengambil data group awal:", error);
  }
}

// Tambahkan pemanggilan fetchInitialGroups di onMounted
onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      fetchGlobalData(),
      fetchInitialGroups() // Tambahkan ini
    ]);
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});


const masterCorporateGroups = computed(() => {
  if (!rawTableTopGroups.value || rawTableTopGroups.value.length === 0) return [];

  // Map ke nama group dan sort abjad agar rapi
  return rawTableTopGroups.value
    .map((item) => item.name)
    .sort();
});



// 1. TAMBAHKAN DEFINISI INI
const multiCardData = ref<MetricCardItem[]>([]);


// ==========================================================
// LOGIC
// ==========================================================

// 1. Pagination Logic
async function handleLoadMore() {
  if (isFetchingMore.value) return;

  const nextStartIndex = (currentPageInternal.value + 1) * pageSize;

  // Ganti referensi pengecekan dari 'myBrandHighlights' ke 'allBrandHighlights'
  if (allBrandHighlights.value.length <= nextStartIndex && nextStartIndex < rawAllBrands.value.length) {
    isFetchingMore.value = true;

    // Panggil fetchMoreBrands (fungsi yang memproses data global)
    await fetchMoreBrands(nextStartIndex, pageSize);

    currentPageInternal.value++;
    isFetchingMore.value = false;
  } else if (nextStartIndex < rawAllBrands.value.length) {
    currentPageInternal.value++;
  }
}

async function fetchMoreBrands(startIndex: number, fetchLimit: number) {
  const nextBatch = rawAllBrands.value.slice(startIndex, startIndex + fetchLimit);
  if (nextBatch.length === 0) return;

  const detailedBatch = await Promise.all(
    nextBatch.map(async (brand: any) => {
      let previewVideo = '';
      try {
        // Ambil video tanpa filter group agar brand apapun bisa muncul videonya
        const videoRes = await fetchData('list', { brand: [brand.name] });
        if (videoRes?.data && videoRes.data.length > 0) {
          previewVideo = videoRes.data[0].video_link;
        }
      } catch (e) { console.error(e); }

      return {
        name: brand.name,
        count: brand.total || 0,
        preview_video: previewVideo,
        logo: '', // Anda bisa menambahkan logic mapping logo di sini
      };
    })
  );
  allBrandHighlights.value.push(...detailedBatch);
}

// 2. Heatmap & Bar Logic
function handleHeatmapClick(item: any) {
  if (selectedGroupForDetail.value === item.groupName) {
    selectedGroupForDetail.value = '';
  } else {
    selectedGroupForDetail.value = item.groupName;
  }
}

const filteredGroupNamesForBar = computed(() => {
  if (!rawChartTopGroups.value || rawChartTopGroups.value.length === 0) return [];
  let dataCopy = [...rawChartTopGroups.value];

  if (barChartToggle.value === 'bottom10') {
    dataCopy.sort((a, b) => Number(a.mention) - Number(b.mention));
  } else {
    dataCopy.sort((a, b) => Number(b.mention) - Number(a.mention));
  }

  if (barChartToggle.value === 'all') {
    return dataCopy.map(item => item.name);
  } else {
    return dataCopy.slice(0, 10).map(item => item.name);
  }
});

const heatmapData = computed(() => {
  const filteredGroups = processTableData(rawChartTopGroups.value, barChartToggle.value);
  return [{
    label: 'Corporations',
    details: filteredGroups.map(item => ({
      groupName: item.name,
      value: Number(item.mention)
    }))
  }];
});

const detailedBarChartData = computed(() => {
  if (!rawChartStackedGroupBrand.value || !selectedGroupForDetail.value) {
    return { data: [], segments: [] };
  }

  let brandMap: { [key: string]: number } = {};

  if (selectedGroupForDetail.value === 'ALL_DATA') {
    rawChartStackedGroupBrand.value.forEach(groupData => {
      if (groupData.brand) {
        Object.entries(groupData.brand).forEach(([name, val]) => {
          brandMap[name] = (brandMap[name] || 0) + (val as number);
        });
      }
    });
  } else {
    const groupData = rawChartStackedGroupBrand.value.find(
      (item) => item.group === selectedGroupForDetail.value
    );
    if (groupData && groupData.brand) {
      brandMap = groupData.brand as { [key: string]: number };
    }
  }

  const brandsInGroup = Object.entries(brandMap)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  const brandNames = brandsInGroup.map(([name]) => name);
  const brandValues = brandsInGroup.map(([_, val]) => val);
  const count = brandNames.length;

  return {
    segments: brandNames,
    data: brandNames.map((name, index) => {
      const emptySlots = new Array(count).fill(0);
      emptySlots[index] = brandValues[index];
      return {
        label: name,
        values: emptySlots
      };
    })
  };
});

// 3. Modal Logic
async function handleBrandClick(item: HighlightItem) {
  selectedBrandData.value = item;
  showBrandModal.value = true;
  brandVideos.value = [];
  isLoadingVideos.value = true;

  try {
    const specificFilter = {
      brand: [item.name]
    };

    const response = await fetchData('list', specificFilter);
    if (response && response.data) {
      brandVideos.value = response.data;
    }
  } catch (error) {
    console.error("Gagal mengambil data video brand:", error);
  } finally {
    isLoadingVideos.value = false;
  }
}

// 4. Data Transformation Helpers
const transformApiResponse = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    mention: item.total || 0,
  }));
};

const processTableData = (rawData: TableRow[], sortMode: string, type: 'group' | 'brand' | 'variant' = 'group') => {
  if (!rawData || rawData.length === 0) return [];
  let dataCopy = [...rawData];

  // 1. Sorting (tetap sama)
  if (sortMode === 'bottom10') {
    dataCopy.sort((a, b) => Number(a.mention) - Number(b.mention));
  } else {
    dataCopy.sort((a, b) => Number(b.mention) - Number(a.mention));
  }

  let displayList = sortMode === 'all' ? dataCopy : dataCopy.slice(0, 10);

  // 2. Logika Identifikasi & Paksa Muncul (Highlight)
  const isItemInternal = (name: string) => {
    if (type === 'group') return name === internalGroup.value;
    if (type === 'brand') return rawInternalBrands.value.some(b => b.name === name);
    if (type === 'variant') return rawInternalVariants.value.some(v => v.name === name);
    return false;
  };

  if (alwaysShowInternal.value && sortMode === 'top10') {
    const internalItem = dataCopy.find(item => isItemInternal(item.name));

    // Jika data kita ada tapi tidak masuk 10 besar, selipkan di urutan terakhir
    if (internalItem && !displayList.some(d => d.name === internalItem.name)) {
      displayList[9] = internalItem;
    }
  }

  // 3. Mapping hasil akhir dengan flag isInternal
  return displayList.map((item) => {
    const actualRank = dataCopy.findIndex(d => d.name === item.name) + 1;

    // Mark 'isInternal' hanya akan true jika switch ON DAN item tersebut memang internal
    const isInternal = alwaysShowInternal.value ? isItemInternal(item.name) : false;

    return {
      ...item,
      rank: actualRank,
      mention: String(item.mention),
      isInternal: isInternal
    };
  });
};

function generateDateRange(start: string, end: string): DateRange {
  const labels: string[] = [];
  const apiDates: string[] = [];
  let current = moment(start);
  const stop = moment(end);
  while (current.isSameOrBefore(stop, 'day')) {
    labels.push(current.format('DD MMM'));
    apiDates.push(current.format('YYYY-MM-DD'));
    current.add(1, 'day');
  }
  return { labels, apiDates };
}

// 5. Computed Display Data
const topGroups = computed(() => processTableData(rawTableTopGroups.value, analysisTab.value, 'group'));
const topBrands = computed(() => processTableData(rawTableTopBrands.value, analysisTab.value, 'brand'));
const topVariants = computed(() => processTableData(rawTableTopVariants.value, analysisTab.value, 'variant'));

const corporationPieData = computed<PieChartItem[]>(() => {
  const top10 = [...rawChartTopGroups.value]
    .sort((a, b) => (Number(b.mention) - Number(a.mention)))
    .slice(0, 10);
  return top10.map((item) => ({
    label: item.name,
    value: Number(item.mention),
  }));
});

const lineChartFilteredGroupNames = computed<string[]>(() => {
  return processTableData(rawChartTopGroups.value, lineChartToggle.value).map(g => g.name);
});

const lineChartData = computed(() => {
  if (!rawChartTrendGroup.value || rawChartTrendGroup.value.length === 0) {
    return { labels: [], datasets: [] };
  }
  const filteredData = rawChartTrendGroup.value.filter((item) =>
    lineChartFilteredGroupNames.value.includes(item.group)
  );
  const dateRange = generateDateRange(startDate.value, endDate.value);
  const labels = dateRange.labels;
  if (filteredData.length === 0) return { labels, datasets: [] };

  const groups = new Map<string, any[]>();
  for (const item of filteredData) {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group)!.push(item);
  }
  const datasets = [];
  const colors = generateBrightColors(groups.size);
  let colorIndex = 0;
  for (const [groupName, items] of groups.entries()) {
    const dataMap = new Map(items.map((i) => [i.date, i.total]));
    const dataPoints = dateRange.apiDates.map((date) => dataMap.get(date) || 0);
    const color = colors[colorIndex++];
    datasets.push({
      label: groupName,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color + '33',
      fill: true,
      tension: 0.4,
    });
  }
  return { labels, datasets };
});

const lineChartLabels = computed(() => lineChartData.value.labels);
const lineChartDatasets = computed(() => lineChartData.value.datasets);
const top5CorporateAds = computed(() => corporateHighlights.value.slice(0, 5));

const activeFilters = ref({
  groups: [],
  brands: [],
  variants: []
});

function handleFilterChange(payload: any) {
  activeFilters.value = payload;
  // Di sini Anda bisa memanggil API fetch ulang berdasarkan filter baru
  console.log('Filter updated:', payload);
}

// 6. API Fetching
async function fetchGlobalData() {
  // 1. Membangun Objek Filter Dinamis
  const dynamicFilter = {};
  if (selectedGroups.value.length > 0) dynamicFilter.group = selectedGroups.value;
  if (selectedBrands.value.length > 0) dynamicFilter.brand = selectedBrands.value;
  if (selectedVariants.value.length > 0) dynamicFilter.varian = selectedVariants.value;
  if (selectedCategory.value.length > 0) dynamicFilter.category = selectedCategory.value;
  if (selectedSubCategory.value.length > 0) dynamicFilter.sub_category = selectedSubCategory.value;

  // Filter khusus untuk data internal (Highlight Company)
  const internalFilter = { group: [internalGroup.value] };

  isLoading.value = true;

  try {
    // 2. Eksekusi Parallel Fetch dengan Filter Terpasang
    const [
      totalAds,
      totalGroups,
      totalBrands,
      totalVariants,
      totalAdsInternal,
      topGroupsRes,
      chartTrendGroupData,
      chartStackedGroupBrandData,
      topBrandsRes,
      internalBrandsRes,
      internalVariantsRes,
      rateCardRes,
      topVariantsRes,
      topProgramData,
      topAmbassadorData,
      topProgramTypeData,
      timezoneRes,
      scopeRes
    ] = await Promise.all([
      fetchData('total/ads', dynamicFilter),
      fetchData('total/group', dynamicFilter),
      fetchData('total/brand', dynamicFilter),
      fetchData('total/varian', dynamicFilter),
      fetchData('total/ads', internalFilter), // Tetap internal untuk highlight
      fetchData('top/group', dynamicFilter),
      fetchData('trend/group', dynamicFilter),
      fetchData('stacked/group/brand', dynamicFilter),
      fetchData('top/brand', dynamicFilter),
      fetchData('top/brand', internalFilter),
      fetchData('top/varian', internalFilter),
      fetchData('total/rate', dynamicFilter),
      fetchData('top/varian', dynamicFilter),
      fetchData('top/program', dynamicFilter),
      fetchData('top/brand_ambassador', dynamicFilter),
      fetchData('top/program_type', dynamicFilter),
      fetchData('top/periode', dynamicFilter),
      fetchData('top/scope', dynamicFilter)
    ]);

    // 3. Assign Data Dasar & Rate Card
    totalRateCard.value = rateCardRes?.total || 0;
    rawInternalBrands.value = internalBrandsRes || [];
    rawInternalVariants.value = internalVariantsRes || [];

    // 4. Proses Logika Trend & Metric Cards
    const dateRangeObj = generateDateRange(startDate.value, endDate.value);
    const chartLabels = dateRangeObj.labels;
    let filledTrendData = [];

    if (chartTrendGroupData && Array.isArray(chartTrendGroupData)) {
      const dailyMap = {};
      chartTrendGroupData.forEach((item) => {
        const d = item.date;
        dailyMap[d] = (dailyMap[d] || 0) + (Number(item.total) || 0);
      });
      filledTrendData = dateRangeObj.apiDates.map(dateStr => dailyMap[dateStr] || 0);
    } else {
      filledTrendData = new Array(chartLabels.length).fill(0);
    }

    adsTrendData.value = filledTrendData;

    // Update Metric Cards Array
    metricCards.value = [
      {
        title: 'Total Ads Detection',
        value: totalAds?.total || 0,
        icon: 'mdi-chart-line',
        trendData: adsTrendData.value,
        labels: chartLabels
      },
      {
        title: 'Total Corporates',
        value: totalGroups?.total || 0,
        icon: 'mdi-domain',
        trendData: filledTrendData.map(v => Math.round(v * 0.4)), // Dummy trend ratio
        labels: chartLabels
      },
      {
        title: 'Total Brands',
        value: totalBrands?.total || 0,
        icon: 'mdi-tag',
        trendData: [...filledTrendData].reverse(),
        labels: chartLabels
      },
      {
        title: 'Total Brand Variants',
        value: totalVariants?.total || 0,
        icon: 'mdi-tag-multiple',
        trendData: filledTrendData.map(v => Math.floor(v * 0.8)),
        labels: chartLabels
      },
      {
        title: 'Total Spending',
        value: formattedRateCard.value,
        icon: 'mdi-cash-multiple',
        trendData: filledTrendData,
        labels: chartLabels
      }
    ];

    // 5. Update Carousel Highlights
    corporateTotal.value = totalAdsInternal?.total || 0;
    totalAdsAllCorporate.value = totalAds?.total || 0;

    if (topBrandsRes && Array.isArray(topBrandsRes)) {
      rawAllBrands.value = topBrandsRes;
      allBrandHighlights.value = [];
      currentPageInternal.value = 0;
      await fetchMoreBrands(0, 5); // Load batch pertama
    }

    // 6. Update Chart & Table States
    rawChartTopGroups.value = transformApiResponse(topGroupsRes);
    rawChartTrendGroup.value = chartTrendGroupData || [];
    rawChartStackedGroupBrand.value = chartStackedGroupBrandData || [];

    rawTableTopGroups.value = transformApiResponse(topGroupsRes);
    rawTableTopBrands.value = transformApiResponse(topBrandsRes);
    rawTableTopVariants.value = transformApiResponse(topVariantsRes);

    rawTopPrograms.value = transformApiResponse(topProgramData);
    rawTopAmbassadors.value = transformApiResponse(topAmbassadorData);
    rawProgramType.value = transformApiResponse(topProgramTypeData);

    rawTimezoneData.value = timezoneRes || [];
    rawScopeData.value = scopeRes || [];

  } catch (error) {
    console.error('Gagal mengambil data global dashboard:', error);
  } finally {
    isLoading.value = false;
  }
}


onMounted(async () => {
  // Hanya panggil fetchGlobalData dan fetchInitialGroups (dropdown)
  await Promise.all([
    fetchGlobalData(),
    fetchInitialGroups()
  ]);
});

// Update Watch
watch([startDate, endDate, selectedChannels], async () => {
  adsTrendData.value = [];
  currentPageInternal.value = 0;
  await fetchGlobalData(); // Cukup panggil ini
}, { deep: true });
</script>

<style scoped>
.circle-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.08);
}

.deco-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -50px;
}

.deco-2 {
  width: 150px;
  height: 150px;
  bottom: -30px;
  left: 10%;
}

.floating-img {
  animation: floating 4s ease-in-out infinite;
  filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.1));
}

@keyframes floating {
  0% {
    transform: translate(0, 0px);
  }

  50% {
    transform: translate(0, -10px);
  }

  100% {
    transform: translate(0, 0px);
  }
}

.line-height-tight {
  line-height: 1.1;
}

.z-index-2 {
  z-index: 2;
}
</style>