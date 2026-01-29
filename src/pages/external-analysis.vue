<template>
  <v-container fluid class="pa-0">
    <PageTitle title="External Analysis" exclude-internal
      :enabled-filters="['channel', 'group', 'brand', 'variants', 'kategori', 'sub_kategori']" />

    <div>
      <!-- <h2 class="text-h6 font-weight-bold mb-4">General External Overview</h2>
      <v-row class="mb-6">
        <v-col v-for="(card, i) in overallMetricCards" :key="card.title" cols="12" sm="6" md="3">
          <MetricCard :title="card.title" :value="card.value" :icon="card.icon" :index="i" :trend-data="card.trendData"
            :labels="card.labels" />
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap align-center my-6 ga-4">
        <div class="text-h6 font-weight-bold">All Competitor Brands</div>
      </div>

      <v-row class="mb-8">
        <v-col cols="12">
          <HighlightsCarousel total-title="Total Brand Mentions" item-label="Brands" :show-total="true"
            :total-value="brandMentionsTotalValue" :total-items-count="brandMentionsCount"
            :items="brandMentionsHighlights" :start-date="startDate" :end-date="endDate" :show-modal="showModal"
            :selected-item="selectedItem" :active-video="videoList[0]" :is-loading-detail="isVideoLoading"
            @close-modal="showModal = false" @item-click="handleBrandHighlightClick" />
        </v-col>
      </v-row> -->

      <div class="d-flex flex-wrap align-center mb-6 ga-4">
        <div class="text-h6 font-weight-bold">Specific Competitor Analysis</div>
        <v-spacer></v-spacer>
        <v-sheet width="300" color="transparent">
          <v-select v-model="selectedExternalGroup" density="compact" label="Select Competitor Group" variant="outlined"
            hide-details :items="masterExternalGroups"></v-select>
        </v-sheet>
      </div>

      <v-row>
        <v-col v-for="(card, i) in externalMetricCards" :key="card.title" cols="12" sm="6" md="4">
          <MetricCard :title="card.title" :value="card.value" :icon="card.icon" :index="i" :trend-data="card.trendData"
            :labels="card.labels" />
        </v-col>
      </v-row>

      <v-row class="mb-8">
      <v-col cols="12" md="4">
        <TableCard title="Top Program" :headers="['Program Name']" :rows="topPrograms" :per-page="5"
          class="h-100 rounded-xl" />
      </v-col>

      <v-col cols="12" md="4">
        <TableCard title="Top Brand Ambasador" :headers="['Program Name']" :rows="topPrograms" :per-page="5"
          class="h-100 rounded-xl" />
      </v-col>

      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-row>
          <v-col cols="12">
            <MetricCard title="Rate Card" value="3.m" icon="mdi-video"
              :trend-data="[10, 20, 15, 25, 30]" class="rounded-xl" />
          </v-col>
          <v-col cols="12">
            <MetricCard title="Total Reach" value="1.2M" icon="mdi-trending-up" :trend-data="[5, 15, 10, 20, 25]"
              class="rounded-xl" />
          </v-col>
        </v-row>
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
        <v-col cols="12" md="5">
          <TableCard title="Brand Ranking" :headers="['Brand']" :rows="brandRankingData" :per-page="5" />
        </v-col>
        <v-col cols="12" md="7">
          <BarChartCard :title="externalBarTitle" :data="variantDistributionData"
            :segment-labels="variantDistributionSegments" :is-loading="isLoading" />
        </v-col>
      </v-row>

      <v-row class="mt-12">
        <v-col cols="12">
          <PageTitle title="External Brand and Variants" :show-date-filter="false" 
            :enabled-filters="['brand']" />
        </v-col>
      </v-row>

      <v-row class="mb-6" align="stretch">
        <v-col cols="12" md="4">
          <TableCard title="Brand Variant Data" :headers="['Brand Variant']" :rows="variantRankingData" :per-page="5" />
        </v-col>
        <v-col cols="12" md="8">
          <LineChartCard title="Brand Variant Trends" :labels="variantTrendLabels" :data="variantTrendData"
            :is-loading="isLoading" />
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12">
          <HighlightsCarousel total-title="Variants Mentions" item-label="Variants" :show-total="true"
            :total-value="carouselTotalAds" :total-items-count="carouselTotalVariants" :items="variantHighlights"
            :start-date="startDate" :end-date="endDate" :show-modal="showModal" :selected-item="selectedItem"
            :active-video="videoList[0]" :is-loading-detail="isVideoLoading" @close-modal="showModal = false"
            @item-click="handleItemClick" />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import MetricCard from '@/page-components/MetricCard.vue';
import HighlightsCarousel from '@/page-components/HighlightsCarousel.vue';
import TableCard from '@/page-components/TableCard.vue';
import PieChartCard from '@/page-components/PieChartCard.vue';
import LineChartCard from '@/page-components/LineChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';
import PageTitle from '@/page-components/PageTitle.vue';
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
interface MetricCardItem { title: string; value: string | number; icon: string; trendData: number[]; labels: string[]; }

const topPrograms = ref([
  { name: 'Ikatan Cinta', mention: '85%' },
  { name: 'Preman Pensiun', mention: '72%' },
  { name: 'Dahsyat', mention: '60%' },
  { name: 'MasterChef Indonesia', mention: '55%' },
  { name: 'Amanah Wali', mention: '48%' },
]);

// --- State Management ---
const appStore = useAppStore();
const { startDate, endDate, selectedChannels, internalGroup } = storeToRefs(appStore);

const isLoading = ref(true);
const masterExternalGroups = ref<string[]>([]);
const selectedExternalGroup = ref<string | null>(null);

const showModal = ref(false);
const selectedItem = ref<any>(null);
const videoList = ref<any[]>([]);
const isVideoLoading = ref(false);

const rawGlobalBrands = ref<HighlightItem[]>([]);
const isBrandsLoading = ref(false);

const brandMentionsHighlights = ref<HighlightItem[]>([]);
const brandMentionsTotalValue = ref<number | string>(0);
const brandMentionsCount = ref<number>(0);

// --- Helpers ---
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

// MODIFIKASI: Menghapus latar belakang kotak (watermark-like) dan menggunakan lingkaran bersih
const createLogo = (name: string) => {
  const initial = (name || 'E').charAt(0).toUpperCase();
  const color = stringToColor(name);
  // Menggunakan Circle dan background transparan untuk menghindari efek "kotakan putih"
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>
    <circle cx='40' cy='40' r='38' fill='${color}' />
    <text x='50%' y='50%' font-size='35' fill='white' text-anchor='middle' dominant-baseline='central' font-family='Arial, sans-serif' font-weight='bold'>${initial}</text>
  </svg>`;
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

// --- Logic & Actions ---
async function fetchGlobalCompetitorBrands() {
  isBrandsLoading.value = true;
  try {
    const allBrandsRaw = await fetchData('top/brand', {});
    const transformed = transformApiResponse(allBrandsRaw);
    const internalBrandsRaw = await fetchData('top/brand', { group: [internalGroup.value] });
    const internalNames = transformApiResponse(internalBrandsRaw).map(b => b.name);

    rawGlobalBrands.value = transformed
      .filter(brand => !internalNames.includes(brand.name))
      .map(brand => ({
        name: brand.name,
        count: brand.mention,
        logo: createLogo(brand.name),
      }));
  } catch (error) {
    console.error(error);
  } finally {
    isBrandsLoading.value = false;
  }
}

async function handleBrandHighlightClick(item: any) {
  selectedItem.value = item;
  showModal.value = true;
  videoList.value = [];
  isVideoLoading.value = true;
  try {
    const response = await fetchData('list', { brand: [item.name] });
    if (response?.data) videoList.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    isVideoLoading.value = false;
  }
}

async function fetchBrandHighlightsData() {
  try {
    const topBrandsRaw = await fetchData('top/brand', {});
    const transformed = transformApiResponse(topBrandsRaw);
    const filteredBrands = transformed.filter(b => b.name !== internalGroup.value);
    const totalMentions = filteredBrands.reduce((acc, curr) => acc + (Number(curr.mention) || 0), 0);

    brandMentionsHighlights.value = filteredBrands.map(brand => ({
      name: brand.name,
      count: brand.mention,
      logo: createLogo(brand.name),
      preview_video: ''
    }));

    brandMentionsTotalValue.value = totalMentions;
    brandMentionsCount.value = filteredBrands.length;
  } catch (error) {
    console.error(error);
  }
}

// --- Computed ---
const carouselTotalAds = computed(() => externalMetricCards.value[0]?.value || 0);
const carouselTotalVariants = computed(() => {
  const val = externalMetricCards.value[2]?.value;
  return val === '...' ? 0 : Number(val);
});

const overallMetricCards = ref<MetricCardItem[]>([
  { title: 'Total External Ads', value: '...', icon: 'mdi-chart-line', trendData: [], labels: [] },
  { title: 'Total Competitor Brands', value: '...', icon: 'mdi-tag', trendData: [], labels: [] },
  { title: 'Total Variants', value: '...', icon: 'mdi-tag-multiple', trendData: [], labels: [] },
  { title: 'Total Category', value: '...', icon: 'mdi-shape-outline', trendData: [], labels: [] },
]);

const externalMetricCards = ref<MetricCardItem[]>([
  { title: 'Total Group Ads', value: '...', icon: 'mdi-chart-pie', trendData: [], labels: [] },
  { title: 'Total of Brands', value: '...', icon: 'mdi-tag', trendData: [], labels: [] },
  { title: 'Total of Variants', value: '...', icon: 'mdi-tag-multiple', trendData: [], labels: [] },
]);

const rawTopBrand = ref<TableRow[]>([]);
const rawTrendBrand = ref<TrendItem[]>([]);
const rawStackedBrandVarian = ref<StackedItem[]>([]);
const rawTopVarian = ref<TableRow[]>([]);
const rawTrendVarian = ref<TrendVarianItem[]>([]);

const externalPieTitle = computed(() => `Brand Distribution`);
const externalPieData = computed<PieChartItem[]>(() => rawTopBrand.value.slice(0, 10).map(item => ({ label: item.name, value: item.mention })));
const brandRankingData = computed(() => [...rawTopBrand.value].sort((a, b) => b.mention - a.mention).map((item, index) => ({ ...item, mention: String(item.mention), rank: index + 1, 'brand': item.name })));
const externalBarTitle = computed(() => `Brand Variants Distribution`);

const brandTrendLabels = computed(() => generateDateRange(startDate.value, endDate.value).labels);

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

async function fetchOverallExternalData() {
  const internalFilter = { group: [internalGroup.value] };
  const noFilter = {};
  try {
    const [
      industryAds, industryBrands, industryVariants, industryCategories, industryTrend,
      myAds, myBrands, myVariants, myCategories, myTrend, topBrandsRaw
    ] = await Promise.all([
      fetchData('total/ads', noFilter),
      fetchData('total/brand', noFilter),
      fetchData('total/varian', noFilter),
      fetchData('total/category', noFilter),
      fetchData('trend/brand', noFilter),
      fetchData('total/ads', internalFilter),
      fetchData('total/brand', internalFilter),
      fetchData('total/varian', internalFilter),
      fetchData('total/category', internalFilter),
      fetchData('trend/brand', internalFilter),
      fetchData('top/brand', noFilter)
    ]);

    const industryDailyMap: Record<string, number> = {};
    if (industryTrend && Array.isArray(industryTrend)) {
      industryTrend.forEach((item: any) => {
        const d = String(item.date);
        industryDailyMap[d] = (industryDailyMap[d] || 0) + (Number(item.total) || 0);
      });
    }

    const myDailyMap: Record<string, number> = {};
    if (myTrend && Array.isArray(myTrend)) {
      myTrend.forEach((item: any) => {
        const d = String(item.date);
        myDailyMap[d] = (myDailyMap[d] || 0) + (Number(item.total) || 0);
      });
    }

    const sortedDates = Object.keys(industryDailyMap).sort();
    const processedLabels = sortedDates.map(d => moment(d).format('DD MMM'));
    const externalTrendData = sortedDates.map(date => Math.max(0, (industryDailyMap[date] || 0) - (myDailyMap[date] || 0)));

    overallMetricCards.value = [
      { title: 'Total External Ads', value: Math.max(0, (industryAds?.total || 0) - (myAds?.total || 0)), icon: 'mdi-chart-line', trendData: externalTrendData, labels: processedLabels },
      { title: 'Total Competitor Brands', value: Math.max(0, (industryBrands?.total || 0) - (myBrands?.total || 0)), icon: 'mdi-tag', trendData: externalTrendData.map(v => Math.ceil(v / 5)), labels: processedLabels },
      { title: 'Total Variants', value: Math.max(0, (industryVariants?.total || 0) - (myVariants?.total || 0)), icon: 'mdi-tag-multiple', trendData: externalTrendData.map(v => Math.ceil(v / 2)), labels: processedLabels },
      { title: 'Total Category', value: Math.max(0, (industryCategories?.total || 0) - (myCategories?.total || 0)), icon: 'mdi-shape-outline', trendData: externalTrendData.map(v => Math.ceil(v / 10)), labels: processedLabels },
    ];
  } catch (error) {
    console.error(error);
  }
}

async function fetchGroupFilterDropdown() {
  try {
    const groupData = await fetchData('top/group');
    masterExternalGroups.value = transformApiResponse(groupData).map(g => g.name).filter(n => n !== internalGroup.value);
    fetchOverallExternalData();
    if (masterExternalGroups.value.length > 0) selectedExternalGroup.value = masterExternalGroups.value[0] ?? null;
  } catch (error) { console.error(error); }
}

async function fetchAllData() {
  if (!selectedExternalGroup.value) { isLoading.value = false; return; }
  isLoading.value = true;
  const specificFilter = { group: [selectedExternalGroup.value!] };
  try {
    const [
      totalAds, totalBrands, totalVariants,
      topBrandData, trendBrandData, stackedBrandVarianData,
      topVarianRaw, trendVarianData
    ] = await Promise.all([
      fetchData('total/ads', specificFilter), fetchData('total/brand', specificFilter), fetchData('total/varian', specificFilter),
      fetchData('top/brand', specificFilter), fetchData('trend/brand', specificFilter), fetchData('stacked/brand/varian', specificFilter),
      fetchData('top/varian', specificFilter), fetchData('trend/varian', specificFilter),
    ]);

    let processedTrend: number[] = [];
    let processedLabels: string[] = [];
    if (trendBrandData && Array.isArray(trendBrandData)) {
      const dailyMap: Record<string, number> = {};
      trendBrandData.forEach((item: any) => { const d = String(item.date); dailyMap[d] = (dailyMap[d] || 0) + (Number(item.total) || 0); });
      const sortedDates = Object.keys(dailyMap).sort();
      processedLabels = sortedDates.map(d => moment(d).format('DD MMM'));
      processedTrend = sortedDates.map(d => dailyMap[d] ?? 0);
    }

    externalMetricCards.value = [
      { title: 'Total Group Ads', value: totalAds?.total || 0, icon: 'mdi-chart-pie', trendData: processedTrend, labels: processedLabels },
      { title: 'Total of Brands', value: totalBrands?.total || 0, icon: 'mdi-tag', trendData: [...processedTrend].reverse(), labels: processedLabels },
      { title: 'Total of Variants', value: totalVariants?.total || 0, icon: 'mdi-tag-multiple', trendData: processedTrend.map(v => Math.floor(v * 0.8)), labels: processedLabels },
    ];

    rawTopBrand.value = transformApiResponse(topBrandData);
    rawTrendBrand.value = trendBrandData || [];
    rawStackedBrandVarian.value = stackedBrandVarianData || [];
    rawTrendVarian.value = trendVarianData || [];

    const rawVariantsList = transformApiResponse(topVarianRaw);
    rawTopVarian.value = await Promise.all(rawVariantsList.map(async (variant) => {
      let videoLink = '';
      try {
        const res = await fetchData('list', { group: [selectedExternalGroup.value!], varian: [variant.name] });
        if (res?.data?.length > 0) videoLink = res.data[0].video_link;
      } catch (e) { }
      return { ...variant, preview_video: videoLink, logo: createLogo(variant.name) };
    }));
  } catch (error) { console.error(error); } finally { isLoading.value = false; }
}

watch([startDate, endDate, selectedChannels], async () => {
  isLoading.value = true;
  await Promise.all([fetchOverallExternalData(), fetchAllData(), fetchBrandHighlightsData(), fetchGlobalCompetitorBrands()]);
  isLoading.value = false;
}, { deep: true });

watch(selectedExternalGroup, async (newVal) => { if (newVal) await fetchAllData(); });

onMounted(() => {
  fetchGroupFilterDropdown();
  fetchGlobalCompetitorBrands();
  fetchBrandHighlightsData();
});
</script>