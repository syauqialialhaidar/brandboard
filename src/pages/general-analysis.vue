<template>
  <v-container fluid class="pa-0">

    <PageTitle 
      title="General Analysis" 
      :enabled-filters="['channel', 'group', 'brand', 'variants', 'kategori', 'sub_kategori']"
      @update:filter="handleFilterUpdate" 
    />
    <v-row class="mb-6">
      <v-col v-for="(card, i) in metricCards" :key="card.title" cols="12" sm="6" lg="3">
        <MetricCard v-bind="card" :index="i" class="h-100" />
      </v-col>
    </v-row>

    <v-row class="mb-2">
      <v-col cols="12">
        <HighlightsCarousel 
          total-title="All Brands Mentions" 
          item-label="All Brands" 
          :items="allBrandHighlights"
          :total-items-count="rawAllBrands.length" 
          :is-loading-more="isFetchingMore" 
          :total-value="totalAdsAllCorporate"
          :start-date="startDate" 
          :end-date="endDate" 
          :show-modal="showBrandModal" 
          :selected-item="selectedBrandData"
          :active-video="activeVideo" 
          :is-loading-detail="isLoadingVideos" 
          @close-modal="showBrandModal = false"
          @next-page="handleLoadMore" 
          @item-click="handleBrandClick" 
        />
      </v-col>
    </v-row>

    <div class="d-flex align-center mb-4 ga-2">
      <div class="text-h5 font-weight-bold">Trends & Ranking</div>
    </div>

    <v-row class="mb-8">
      <v-col cols="12" lg="4">
        <PieChartCard 
          title="Corporate Distribution" 
          :data="corporationPieData" 
          :has-legend="true"
          :is-loading="isLoading" 
          class="h-100 rounded-xl" 
        />
      </v-col>
      <v-col cols="12" lg="8">
        <LineChartCard 
          title="Corporation Trends" 
          :labels="lineChartLabels" 
          :data="lineChartDatasets"
          :show-toggle="true" 
          :toggle="lineChartToggle" 
          @toggle-change="lineChartToggle = $event"
          :is-loading="isLoading" 
          class="h-100 rounded-xl" 
        />
      </v-col>
    </v-row>

    <v-card variant="flat" border class="pa-4 mb-6 rounded-xl bg-surface">
      <div class="d-flex flex-wrap align-center ga-6">
        <div class="text-subtitle-1 font-weight-bold text-medium-emphasis">View Analysis By:</div>
        <v-btn-toggle 
          v-model="analysisTab" 
          density="comfortable" 
          divided 
          mandatory 
          color="primary" 
          variant="outlined"
          class="rounded-lg"
        >
          <v-btn value="top10" class="text-capitalize px-6">Top 10</v-btn>
          <v-btn value="all" class="text-capitalize px-6">All</v-btn>
          <v-btn value="bottom10" class="text-capitalize px-6">Bottom 10</v-btn>
        </v-btn-toggle>
        <v-spacer></v-spacer>
        <v-switch 
          v-model="alwaysShowInternal" 
          label="Highlight Our Company" 
          color="primary" 
          hide-details 
          inset
          density="compact"
        ></v-switch>
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
      <div class="text-h5 font-weight-bold">Audience Distributions</div>
    </div>

    <v-row class="mb-2">
      <v-col cols="12" md="4">
        <PieChartCard title="Gender" :data="genderPieData" :has-legend="true" :is-loading="isLoading" suffix="%" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <BarChartCard title="Age" :data="ageBarData.data" :segment-labels="ageBarData.segments" suffix="%" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <PieChartCard title="Location" :data="locationPieData" :has-legend="true" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <PieChartCard title="Zona Waktu" :data="timezonePieData" :has-legend="true" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>

      <v-col cols="12" md="5">
        <BarChartCard title="Scope Penyiaran" :data="scopeBarData.data" :segment-labels="scopeBarData.segments" :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>

      <v-col cols="12" md="3" class="d-flex flex-column ga-4">
        <MetricCard title="Rate Card" :value="formattedRateCard" icon="mdi-cash-multiple" :trend-data="adsTrendData" class="rounded-xl flex-grow-1" />
        <MetricCard title="Total Reach" value="1.2M" icon="mdi-trending-up" :trend-data="[5, 15, 10, 20, 25]" class="rounded-xl flex-grow-1" />
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <TableCard title="Top Program" :headers="['Name']" :rows="topProgramsList" :per-page="5" class="h-100 rounded-xl" />
      </v-col>

      <v-col cols="12" md="4">
        <TableCard title="Top Brand Ambassador" :headers="['Name']" :rows="topAmbassadorsList" :per-page="5" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Programs Types" :headers="['Name']" :rows="topProgramsType" :per-page="5" class="h-100 rounded-xl" />
      </v-col>
    </v-row>

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
import { generateBrightColors } from '@/utils/colors';
import moment from 'moment';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import { fetchData } from '@/utils/apiBuilder';

// --- Interfaces ---
interface HighlightItem { logo: string; name: string; count: number | string; preview_video?: string; }
interface TableRow { name: string; mention: number | string; rank?: number; isInternal?: boolean; }
interface PieChartItem { label: string; value: number; }
interface TrendItem { total: number; group: string; date: string; }
interface StackedItem { brand: { [key: string]: number }; total: number; group: string; }
interface DateRange { labels: string[]; apiDates: string[]; }
interface VideoAdItem {
  _id: string; channel: string; time: string; nama_video: string; video_link: string;
  brand: string[]; group: string[]; category: string; sub_category: string; varian: string[]; brand_ambassador: string[];
}
interface MetricCardItem { title: string; value: string | number; icon: string; trendData: number[]; labels?: string[]; }

// --- STATE MANAGEMENT ---
const appStore = useAppStore();
const { startDate, endDate, selectedChannels, internalGroup } = storeToRefs(appStore);

const isLoading = ref(true);

// --- DUMMY DATA (TODO: Replace with API) ---
const genderPieData = ref([{ label: 'Laki-laki', value: 65 }, { label: 'Perempuan', value: 35 }]);
const ageBarData = ref({ segments: ['Anak-anak', 'Remaja', 'Dewasa'], data: [{ label: 'Persentase', values: [20, 30, 50] }] });
const dummyLocations = ref([
  { name: 'Jakarta', total: 1250 }, { name: 'Surabaya', total: 980 },
  { name: 'Bandung', total: 850 }, { name: 'Medan', total: 720 }, { name: 'Semarang', total: 610 },
]);

// --- REACTIVE STATE ---
const rawTimezoneData = ref<any[]>([]);
const rawScopeData = ref<any[]>([]);
const rawAllBrands = ref<any[]>([]);
const allBrandHighlights = ref<any[]>([]);
const totalAdsAllCorporate = ref<number | string>(0);

const rawProgramType = ref<TableRow[]>([]);
const rawTopPrograms = ref<TableRow[]>([]);
const rawTopAmbassadors = ref<TableRow[]>([]);
const totalRateCard = ref<number | string>(0);

const corporateTotal = ref<number | string>('...');
const corporateHighlights = ref<HighlightItem[]>([]);
const rawInternalBrands = ref<any[]>([]);
const rawInternalVariants = ref<any[]>([]);
const rawTableTopGroups = ref<TableRow[]>([]);
const rawTableTopBrands = ref<TableRow[]>([]);
const rawTableTopVariants = ref<TableRow[]>([]);
const rawChartTopGroups = ref<TableRow[]>([]);
const rawChartTrendGroup = ref<TrendItem[]>([]);
const rawChartStackedGroupBrand = ref<StackedItem[]>([]);

// UI Controls
const showBrandModal = ref(false);
const selectedBrandData = ref<HighlightItem | null>(null);
const alwaysShowInternal = ref(false);
const analysisTab = ref('top10');
const lineChartToggle = ref('top10');

// Pagination
const currentPageInternal = ref(0);
const pageSize = 5;
const isFetchingMore = ref(false);

// Metrics
const adsTrendData = ref<number[]>([]);
const groupsTrendData = ref<number[]>([]);
const brandsTrendData = ref<number[]>([]);
const variantsTrendData = ref<number[]>([]);
const metricCards = ref<MetricCardItem[]>([
  { title: 'Rate Card', value: '...', icon: 'mdi-cash-multiple', trendData: [] },
  { title: 'Total Corporates', value: '...', icon: 'mdi-domain', trendData: [] },
  { title: 'Total Brands', value: '...', icon: 'mdi-tag', trendData: [] },
  { title: 'Total Brand Variants', value: '...', icon: 'mdi-tag-multiple', trendData: [] },
]);

// Video Detail
const brandVideos = ref<any[]>([]);
const isLoadingVideos = ref(false);
const activeVideo = computed<VideoAdItem | null>(() => brandVideos.value?.length > 0 ? brandVideos.value[0] : null);


// Filter
const selectedGroups = ref<string[]>([]);
const selectedBrands = ref<string[]>([]);
const selectedVariants = ref<string[]>([]);
const selectedCategory = ref<string[]>([]);
const selectedSubCategory = ref<string[]>([]);

// --- HANDLER FILTER (Tambahkan fungsi ini) ---
const handleFilterUpdate = async (newFilters: any) => {
  console.log('Filter dari Modal:', newFilters);

  // 1. Update Channel Global (jika ada)
  if (newFilters.channel) {
    appStore.selectedChannels = newFilters.channel;
  }

  // 2. Update State Lokal
  // Gunakan logic "undefined check" agar filter bisa di-reset (kosong)
  if (newFilters.group !== undefined) selectedGroups.value = newFilters.group;
  if (newFilters.brand !== undefined) selectedBrands.value = newFilters.brand;
  if (newFilters.variants !== undefined) selectedVariants.value = newFilters.variants;
  
  // Mapping nama indonesia dari UI ke variable script
  if (newFilters.kategori !== undefined) selectedCategory.value = newFilters.kategori;
  if (newFilters.sub_kategori !== undefined) selectedSubCategory.value = newFilters.sub_kategori;

  // 3. Panggil ulang data
  await fetchGlobalData();
};

// --- COMPUTED PROPERTIES ---

const locationPieData = computed<PieChartItem[]>(() => dummyLocations.value.map(item => ({ label: item.name, value: Number(item.total) })));

const timezonePieData = computed<PieChartItem[]>(() => rawTimezoneData.value.map(item => ({
  label: item.name || item.label, value: Number(item.total || item.value) || 0
})));

const scopeBarData = computed(() => {
  const labels = rawScopeData.value.map(item => item.name || item.label);
  const values = rawScopeData.value.map(item => Number(item.total || item.value) || 0);
  return { segments: labels, data: [{ label: 'Total Ads', values: values }] };
});

const formattedRateCard = computed(() => {
  const val = Number(totalRateCard.value);
  if (isNaN(val)) return 0;
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'M';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'Jt';
  return val.toLocaleString('id-ID');
});

// Helper for Top Lists
const processSimpleTopList = (data: TableRow[]) => [...data].sort((a, b) => Number(b.mention) - Number(a.mention)).map((item, index) => ({ name: item.name, mention: item.mention, rank: index + 1 }));

const topProgramsType = computed(() => processSimpleTopList(rawProgramType.value));
const topProgramsList = computed(() => processSimpleTopList(rawTopPrograms.value));
const topAmbassadorsList = computed(() => processSimpleTopList(rawTopAmbassadors.value));

// --- METHODS ---

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

const transformApiResponse = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({ name: item.name, mention: item.total || 0, }));
};

const processTableData = (rawData: TableRow[], sortMode: string, type: 'group' | 'brand' | 'variant' = 'group') => {
  if (!rawData || rawData.length === 0) return [];
  let dataCopy = [...rawData];

  // Sorting
  dataCopy.sort((a, b) => sortMode === 'bottom10' ? Number(a.mention) - Number(b.mention) : Number(b.mention) - Number(a.mention));
  
  let displayList = sortMode === 'all' ? dataCopy : dataCopy.slice(0, 10);

  // Highlighting Logic
  const isItemInternal = (name: string) => {
    if (type === 'group') return name === internalGroup.value;
    if (type === 'brand') return rawInternalBrands.value.some(b => b.name === name);
    if (type === 'variant') return rawInternalVariants.value.some(v => v.name === name);
    return false;
  };

  if (alwaysShowInternal.value && sortMode === 'top10') {
    const internalItem = dataCopy.find(item => isItemInternal(item.name));
    if (internalItem && !displayList.some(d => d.name === internalItem.name)) {
      displayList[9] = internalItem;
    }
  }

  return displayList.map((item) => {
    const actualRank = dataCopy.findIndex(d => d.name === item.name) + 1;
    return { ...item, rank: actualRank, mention: String(item.mention), isInternal: alwaysShowInternal.value ? isItemInternal(item.name) : false };
  });
};

const topGroups = computed(() => processTableData(rawTableTopGroups.value, analysisTab.value, 'group'));
const topBrands = computed(() => processTableData(rawTableTopBrands.value, analysisTab.value, 'brand'));
const topVariants = computed(() => processTableData(rawTableTopVariants.value, analysisTab.value, 'variant'));

const corporationPieData = computed<PieChartItem[]>(() => {
  const top10 = [...rawChartTopGroups.value].sort((a, b) => (Number(b.mention) - Number(a.mention))).slice(0, 10);
  return top10.map((item) => ({ label: item.name, value: Number(item.mention) }));
});

const lineChartData = computed(() => {
  if (!rawChartTrendGroup.value || rawChartTrendGroup.value.length === 0) return { labels: [], datasets: [] };
  
  const filteredNames = processTableData(rawChartTopGroups.value, lineChartToggle.value).map(g => g.name);
  const filteredData = rawChartTrendGroup.value.filter((item) => filteredNames.includes(item.group));
  
  const dateRange = generateDateRange(startDate.value, endDate.value);
  const labels = dateRange.labels;

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
    datasets.push({ label: groupName, data: dataPoints, borderColor: color, backgroundColor: color + '33', fill: true, tension: 0.4 });
  }
  return { labels, datasets };
});

const lineChartLabels = computed(() => lineChartData.value.labels);
const lineChartDatasets = computed(() => lineChartData.value.datasets);

// --- ASYNC ACTIONS ---

async function handleLoadMore() {
  if (isFetchingMore.value) return;
  const nextStartIndex = (currentPageInternal.value + 1) * pageSize;
  if (allBrandHighlights.value.length <= nextStartIndex && nextStartIndex < rawAllBrands.value.length) {
    isFetchingMore.value = true;
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
        const videoRes = await fetchData('list', { brand: [brand.name] });
        if (videoRes?.data && videoRes.data.length > 0) previewVideo = videoRes.data[0].video_link;
      } catch (e) { }
      return { name: brand.name, count: brand.total || 0, preview_video: previewVideo, logo: '' };
    })
  );
  allBrandHighlights.value.push(...detailedBatch);
}

async function handleBrandClick(item: HighlightItem) {
  selectedBrandData.value = item;
  showBrandModal.value = true;
  brandVideos.value = [];
  isLoadingVideos.value = true;
  try {
    const response = await fetchData('list', { brand: [item.name] });
    if (response?.data) brandVideos.value = response.data;
  } catch (error) { console.error(error); } finally { isLoadingVideos.value = false; }
}

async function fetchGlobalData() {
  const dynamicFilter: Record<string, any> = {};

  // Masukkan filter hanya jika user memilihnya
  if (selectedGroups.value.length > 0) dynamicFilter.group = selectedGroups.value;
  if (selectedBrands.value.length > 0) dynamicFilter.brand = selectedBrands.value;
  if (selectedVariants.value.length > 0) dynamicFilter.varian = selectedVariants.value;
  if (selectedCategory.value.length > 0) dynamicFilter.category = selectedCategory.value;
  if (selectedSubCategory.value.length > 0) dynamicFilter.sub_category = selectedSubCategory.value;

  // Filter khusus internal (tetap dipertahankan untuk perbandingan)
  const internalFilter = { group: [internalGroup.value] };

  try {
    // --- PERBAIKAN 3: Masukkan dynamicFilter ke fetch utama ---
    // Note: fetchData akan menggabungkan dynamicFilter dengan filter tanggal/channel otomatis
    
    const [
      totalAds, totalGroups, totalBrands, totalVariants,
      totalAdsWithGroup, // Ini biasanya data internal, biarkan internalFilter atau ganti dynamicFilter tergantung kebutuhan
      topGroupsRes, chartTrendGroupData, chartStackedGroupBrandData,
      topBrandsRes, 
      internalBrandsRes, internalVariantsRes,
      rateCardRes, topVariantsRes, 
      topProgramData, topAmbassadorData, topProgramTypeData, 
      timezoneRes, scopeRes
    ] = await Promise.all([
      fetchData('total/ads', dynamicFilter),         // <-- Pakai Filter
      fetchData('total/group', dynamicFilter),       // <-- Pakai Filter
      fetchData('total/brand', dynamicFilter),       // <-- Pakai Filter
      fetchData('total/varian', dynamicFilter),      // <-- Pakai Filter
      
      fetchData('total/ads', internalFilter),        // Tetap Internal (Static) untuk perbandingan
      
      fetchData('top/group', dynamicFilter),         // <-- Pakai Filter
      fetchData('trend/group', dynamicFilter),       // <-- Pakai Filter
      fetchData('stacked/group/brand', dynamicFilter), // <-- Pakai Filter
      
      fetchData('top/brand', dynamicFilter),         // <-- Pakai Filter
      
      fetchData('top/brand', internalFilter),        // Tetap Internal (Static)
      fetchData('top/varian', internalFilter),       // Tetap Internal (Static)
      
      fetchData('total/rate', dynamicFilter),        // <-- Pakai Filter
      fetchData('top/varian', dynamicFilter),        // <-- Pakai Filter
      fetchData('top/program', dynamicFilter),       // <-- Pakai Filter
      fetchData('top/brand_ambassador', dynamicFilter), // <-- Pakai Filter
      fetchData('top/program_type', dynamicFilter),  // <-- Pakai Filter
      fetchData('top/periode', dynamicFilter),       // <-- Pakai Filter
      fetchData('top/scope', dynamicFilter)          // <-- Pakai Filter
    ]);

    totalRateCard.value = rateCardRes?.total || 0;
    rawInternalBrands.value = internalBrandsRes || [];
    rawInternalVariants.value = internalVariantsRes || [];

    // Metric Cards Trends
    const dateRangeObj = generateDateRange(startDate.value, endDate.value);
    let filledTrendData: number[] = [];
    if (chartTrendGroupData && Array.isArray(chartTrendGroupData)) {
       const dailyMap: Record<string, number> = {};
       chartTrendGroupData.forEach((item: any) => {
         const d = item.date;
         dailyMap[d] = (dailyMap[d] || 0) + (Number(item.total) || 0);
       });
       filledTrendData = dateRangeObj.apiDates.map(dateStr => dailyMap[dateStr] || 0);
    }
    adsTrendData.value = filledTrendData;

    metricCards.value = [
      { title: 'Total Brand Mentions', value: totalAds?.total || 0, icon: 'mdi-chart-line', trendData: adsTrendData.value, labels: dateRangeObj.labels },
      { title: 'Total Corporates', value: totalGroups?.total || 0, icon: 'mdi-domain', trendData: filledTrendData.map(v => Math.round(v * 0.4)), labels: dateRangeObj.labels },
      { title: 'Total Brands', value: totalBrands?.total || 0, icon: 'mdi-tag', trendData: [...filledTrendData].reverse(), labels: dateRangeObj.labels },
      { title: 'Total Brand Variants', value: totalVariants?.total || 0, icon: 'mdi-tag-multiple', trendData: filledTrendData.map(v => Math.floor(v * 0.8)), labels: dateRangeObj.labels },
    ];

    // Highlights
    corporateTotal.value = totalAdsWithGroup?.total || 0;
    totalAdsAllCorporate.value = totalAds?.total || 0;
    if (topBrandsRes && Array.isArray(topBrandsRes)) {
      rawAllBrands.value = topBrandsRes;
      allBrandHighlights.value = [];
      currentPageInternal.value = 0;
      await fetchMoreBrands(0, 5);
    }

    // Charts & Tables
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

  } catch (error) { console.error('Error fetching dashboard data:', error); } finally { isLoading.value = false; }
}

onMounted(async () => {
  await fetchGlobalData();
});

watch([startDate, endDate, selectedChannels], async () => {
  adsTrendData.value = [];
  currentPageInternal.value = 0;
  await fetchGlobalData();
}, { deep: true });
</script>

<style scoped>
.circle-deco { position: absolute; border-radius: 50%; background: rgba(var(--v-theme-primary), 0.08); }
.deco-1 { width: 300px; height: 300px; top: -100px; right: -50px; }
.deco-2 { width: 150px; height: 150px; bottom: -30px; left: 10%; }
</style>