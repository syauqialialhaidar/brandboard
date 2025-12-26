<template>
  <div>
    <div class="d-flex flex-wrap align-center mb-6 ga-4">
      <div class="text-h6 font-weight-bold">Competitor Analysis</div>
      <v-spacer></v-spacer>
      <v-sheet width="300" color="transparent">
        <v-select v-model="selectedExternalGroup" density="compact" label="Select Competitor Group" variant="outlined"
          hide-details :items="masterExternalGroups"></v-select>
      </v-sheet>
    </div>

    <v-row>
      <v-col v-for="card in externalMetricCards" :key="card.title" cols="12" sm="6" md="4">
        <MetricCard :title="card.title" :value="card.value" :icon="card.icon" :color="card.color"
          :trend-data="card.trendData" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <PieChartCard :title="externalPieTitle" :data="externalPieData" :has-legend="true" :is-loading="isLoading" />
      </v-col>
      <v-col cols="12" md="8">
        <LineChartCard title="Brand Trends" :labels="brandTrendLabels" :data="externalLineData"
          :is-loading="isLoading" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <TableCard title="Brand Ranking" :headers="['Brand']" :rows="brandRankingData" :per-page="5" />
      </v-col>
      <v-col cols="12" md="8">
        <BarChartCard :title="externalBarTitle" :data="variantDistributionData"
          :segment-labels="variantDistributionSegments" :is-loading="isLoading" />
      </v-col>
    </v-row>

    <div class="d-flex flex-wrap align-center my-6 ga-4">
      <div class="text-h6 font-weight-bold">Brand Variations</div>
    </div>

    <v-row class="mb-6" align="stretch"> <v-col cols="12" md="4">
    <TableCard 
      title="Brand Variant Data" 
      :headers="['Brand Variant']" 
      :rows="variantRankingData" 
      :per-page="5" 
    />
  </v-col>
  <v-col cols="12" md="8">
    <HighlightsCarousel 
      class="fill-height"
      :items="variantHighlights" 
      :show-modal="showModal" 
      :selected-item="selectedItem"
      :active-video="videoList[0]" 
      :is-loading-detail="isVideoLoading" 
      @close-modal="showModal = false"
      @item-click="handleItemClick" 
    />
  </v-col>
</v-row>

    <v-row class="mb-6">
      <v-col cols="12">
        <LineChartCard title="Brand Variant Trends" :labels="variantTrendLabels" :data="variantTrendData"
          :is-loading="isLoading" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
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
interface TableRow { name: string; mention: number; rank?: number; }
interface PieChartItem { label: string; value: number; }
interface TrendItem { total: number; brand: string; date: string; }
interface TrendVarianItem { total: number; varian: string; date: string; }
interface StackedItem { varian: { [key: string]: number }; total: number; brand: string; }
interface DateRange { labels: string[]; apiDates: string[]; }
interface MetricCardItem { title: string; value: string | number; icon: string; color: string; trendData: number[]; }

// --- State Management ---
const appStore = useAppStore();
const { startDate, endDate, selectedChannels, internalGroup } = storeToRefs(appStore);

const isLoading = ref(true);
const masterExternalGroups = ref<string[]>([]);
const selectedExternalGroup = ref<string | null>(null);

// Modal States
const showModal = ref(false);
const selectedItem = ref<any>(null);
const videoList = ref<any[]>([]);
const isVideoLoading = ref(false);

const externalMetricCards = ref<MetricCardItem[]>([
  { title: 'Total Group Ads', value: '...', icon: 'mdi-chart-pie', color: 'primary', trendData: [] },
  { title: 'Number of Brands', value: '...', icon: 'mdi-tag', color: 'primary', trendData: [] },
  { title: 'Number of Brand Variants', value: '...', icon: 'mdi-tag-multiple', color: 'primary', trendData: [] },
]);

const rawTopBrand = ref<TableRow[]>([]);
const rawTrendBrand = ref<TrendItem[]>([]);
const rawStackedBrandVarian = ref<StackedItem[]>([]);
const rawTopVarian = ref<TableRow[]>([]);
const rawTrendVarian = ref<TrendVarianItem[]>([]);

// --- Helper Functions ---
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
  const color = Math.floor(Math.abs(Math.sin(hash) * 16777215) % 16777215).toString(16).padStart(6, '0');
  return `#${color}`;
}

const transformApiResponse = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({ name: item.name, mention: item.total || 0 }));
};

const createLogo = (name: string) => {
  const initial = (name || 'E').charAt(0).toUpperCase();
  const color = stringToColor(name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='${color}' /><text x='50%' y='55%' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial'>${initial}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
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

// --- Computed Properties ---
const externalPieTitle = computed(() => `${selectedExternalGroup.value || 'Group'} Brand Distribution`);
const externalPieData = computed<PieChartItem[]>(() => rawTopBrand.value.slice(0, 10).map(item => ({ label: item.name, value: item.mention })));
const brandRankingData = computed(() => [...rawTopBrand.value].sort((a, b) => b.mention - a.mention).map((item, index) => ({ ...item, mention: String(item.mention), rank: index + 1, 'brand': item.name })));
const externalBarTitle = computed(() => `${selectedExternalGroup.value || 'Group'} Brand Variants Distribution`);

const brandTrendLabels = computed(() => {
  const dateRange = generateDateRange(startDate.value, endDate.value);
  return dateRange.labels;
});

const externalLineData = computed(() => {
  const dateRange = generateDateRange(startDate.value, endDate.value);
  const brands = new Map<string, any[]>();
  rawTrendBrand.value.forEach(item => {
    if (!brands.has(item.brand)) brands.set(item.brand, []);
    brands.get(item.brand)!.push(item);
  });
  const colors = generateBrightColors(brands.size);
  let colorIndex = 0;
  return [...brands.keys()].sort().map(brandName => {
    const items = brands.get(brandName)!;
    const dataMap = new Map(items.map(i => [i.date, i.total]));
    const color = colors[colorIndex++];
    return {
      label: brandName,
      data: dateRange.apiDates.map(date => dataMap.get(date) || 0),
      borderColor: color,
      backgroundColor: color + '33',
      fill: true,
      tension: 0.4
    };
  });
});

const variantBarChartData = computed(() => {
  const allVariants = new Set<string>();
  rawStackedBrandVarian.value.forEach(item => { if (item.varian) Object.keys(item.varian).forEach(name => allVariants.add(name)); });
  const segments = [...allVariants].sort();
  const data = rawStackedBrandVarian.value.map(brandItem => ({
    label: brandItem.brand,
    values: segments.map(v => brandItem.varian?.[v] || 0)
  }));
  return { data, segments };
});
const variantDistributionData = computed(() => variantBarChartData.value.data);
const variantDistributionSegments = computed(() => variantBarChartData.value.segments);

const variantHighlights = computed<HighlightItem[]>(() => rawTopVarian.value.map(item => ({ name: item.name, count: item.mention, logo: createLogo(item.name), preview_video: (item as any).preview_video })));
const variantRankingData = computed(() => [...rawTopVarian.value].sort((a, b) => b.mention - a.mention).map((item, index) => ({ ...item, mention: String(item.mention), rank: index + 1, 'brand variant': item.name })));

const variantTrendLabels = computed(() => generateDateRange(startDate.value, endDate.value).labels);
const variantTrendData = computed(() => {
  const dateRange = generateDateRange(startDate.value, endDate.value);
  const variants = new Map<string, any[]>();
  rawTrendVarian.value.forEach(item => {
    const name = item.varian || 'Unknown';
    if (!variants.has(name)) variants.set(name, []);
    variants.get(name)!.push(item);
  });
  const colors = generateBrightColors(variants.size);
  let colorIndex = 0;
  return [...variants.keys()].sort().map(name => {
    const items = variants.get(name)!;
    const dataMap = new Map(items.map(i => [i.date, i.total]));
    const color = colors[colorIndex++];
    return { label: name, data: dateRange.apiDates.map(d => dataMap.get(d) || 0), borderColor: color, backgroundColor: color + '33', fill: true, tension: 0.4 };
  });
});

// --- Actions ---
async function handleItemClick(item: any) {
  selectedItem.value = item;
  showModal.value = true;
  videoList.value = [];
  isVideoLoading.value = true;
  try {
    const response = await fetchData('list', { group: [selectedExternalGroup.value!], varian: [item.name] });
    if (response?.data) videoList.value = response.data;
  } catch (error) { console.error(error); } finally { isVideoLoading.value = false; }
}

async function fetchGroupFilterDropdown() {
  try {
    const groupData = await fetchData('top/group');
    const transformed = transformApiResponse(groupData);
    masterExternalGroups.value = transformed.map(g => g.name).filter(n => n !== internalGroup.value);
    // SOLUSI: Jika undefined, jadikan null
    if (masterExternalGroups.value.length > 0) {
      selectedExternalGroup.value = masterExternalGroups.value[0] ?? null;
    }
  } catch (error) { console.error(error); }
}

async function fetchAllData() {
  // Pengecekan awal
  if (!selectedExternalGroup.value) { isLoading.value = false; return; }

  isLoading.value = true;

  // PERBAIKAN 1: Tambahkan tanda seru (!) untuk menegaskan value tidak null
  const externalFilter = { group: [selectedExternalGroup.value!] };

  try {
    const [
      totalAds, totalBrands, totalVariants,
      topBrandData, trendBrandData, stackedBrandVarianData,
      topVarianRaw, trendVarianData
    ] = await Promise.all([
      fetchData('total/ads', externalFilter),
      fetchData('total/brand', externalFilter),
      fetchData('total/varian', externalFilter),
      fetchData('top/brand', externalFilter),
      fetchData('trend/brand', externalFilter),
      fetchData('stacked/brand/varian', externalFilter),
      fetchData('top/varian', externalFilter),
      fetchData('trend/varian', externalFilter),
    ]);

    let processedTrend: number[] = [];

    // PERBAIKAN 2 & 3: Type Safety untuk dailyMap
    if (trendBrandData && Array.isArray(trendBrandData)) {
      const dailyMap: Record<string, number> = {};

      trendBrandData.forEach((item: any) => {
        // Explicitly convert date to string agar key aman
        const dateKey = String(item.date);

        if (!dailyMap[dateKey]) dailyMap[dateKey] = 0;
        dailyMap[dateKey] += (Number(item.total) || 0);
      });

      processedTrend = Object.keys(dailyMap).sort().map(d => dailyMap[d] ?? 0);
    }

    externalMetricCards.value = [
      { title: 'Total Group Ads', value: totalAds?.total || 0, icon: 'mdi-chart-pie', color: 'primary', trendData: processedTrend },
      { title: 'Number of Brands', value: totalBrands?.total || 0, icon: 'mdi-tag', color: 'primary', trendData: [...processedTrend].reverse() },
      { title: 'Number of Brand Variants', value: totalVariants?.total || 0, icon: 'mdi-tag-multiple', color: 'primary', trendData: processedTrend.map(v => Math.floor(v * 0.8)) },
    ];

    rawTopBrand.value = transformApiResponse(topBrandData);
    rawTrendBrand.value = trendBrandData || [];
    rawStackedBrandVarian.value = stackedBrandVarianData || [];
    rawTrendVarian.value = trendVarianData || [];

    // Fetch Preview Videos for Cards
    const rawVariantsList = transformApiResponse(topVarianRaw);
    rawTopVarian.value = await Promise.all(rawVariantsList.map(async (variant) => {
      let videoLink = '';
      try {
        // PERBAIKAN TAMBAHAN: Pastikan di sini juga menggunakan (!)
        const res = await fetchData('list', { group: [selectedExternalGroup.value!], varian: [variant.name] });
        if (res?.data?.length > 0) videoLink = res.data[0].video_link;
      } catch (e) { console.error(e); }
      return { ...variant, preview_video: videoLink };
    }));

  } catch (error) { console.error(error); } finally { isLoading.value = false; }
}

// --- Watchers & Lifecycle ---
watch([startDate, endDate, selectedChannels], () => fetchAllData(), { deep: true });
watch(selectedExternalGroup, (newVal) => { if (newVal) fetchAllData(); });

onMounted(() => fetchGroupFilterDropdown());
</script>