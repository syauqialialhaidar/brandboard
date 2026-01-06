<template>
  <v-container fluid class="pa-0">
    <PageTitle title="Internal Analysis" :show-channel-filter="true" class="mb-6" />
    <div>

      <h2 class="text-h6 font-weight-bold mb-4">General Internal</h2>

      <v-dialog v-model="showModal" max-width="800">
        <v-card class="rounded-xl pa-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Detail Varian: {{ selectedItem?.name }}</span>
            <v-btn icon="mdi-close" variant="text" @click="showModal = false"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="7" class="bg-black d-flex align-center justify-center rounded-lg"
                style="min-height: 300px;">
                <div v-if="isVideoLoading">
                  <v-progress-circular indeterminate color="white"></v-progress-circular>
                </div>

                <div v-else-if="videoList.length > 0" class="w-100 h-100">
                  <video :key="videoList[0].video_link" controls width="100%" :src="videoList[0].video_link"
                    class="rounded-lg" autoplay>
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div v-else class="text-white d-flex flex-column align-center">
                  <v-icon size="48" color="grey">mdi-video-off</v-icon>
                  <p>Video tidak tersedia untuk varian ini</p>
                </div>
              </v-col>

              <v-col cols="12" md="5">
                <h2 class="text-h5 font-weight-bold">{{ selectedItem?.name }}</h2>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-row>
        <v-col v-for="(card, i) in internalMetricCards" :key="card.title" cols="12" sm="6" md="3">
          <MetricCard :title="card.title" :value="card.value" :icon="card.icon" :index="i" :trend-data="card.trendData"
            :labels="card.labels" />
        </v-col>
      </v-row>

      <v-row class="mt-2 d-flex">
        <v-col cols="12" md="4">
          <PieChartCard title="Internal Brand Distribution Pie" :data="internalPieData" :has-legend="true"
            :is-loading="isGeneralLoading" />
        </v-col>
        <v-col cols="12" md="8">
          <LineChartCard title="Internal Brand Trends" :labels="brandTrendLabels" :data="internalLineData"
            :is-loading="isGeneralLoading" />
        </v-col>
      </v-row>

      <v-row class="mt-2 d-flex">
        <v-col cols="12" md="4">
          <TableCard title="Internal Brand Ranking" :headers="['Brand']" :rows="internalBrandRanking" :per-page="5" />
        </v-col>
        <v-col cols="12" md="8">
          <BarChartCard title="Unilever Brand Variants Distribution" :data="variantDistributionData"
            :segment-labels="variantDistributionSegments" :is-loading="isGeneralLoading" />
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap align-center my-6 ga-4">
        <div class="text-h6 font-weight-bold">Internal Brand and Variants</div>
        <v-spacer></v-spacer>
        <v-sheet width="250" color="transparent">
          <v-select v-model="selectedInternalBrand" density="compact" label="Select Brand" variant="outlined"
            hide-details :items="masterBrandsInternal"></v-select>
        </v-sheet>
      </div>

      <v-row class="mb-6" align="center">
        <v-col cols="12" md="3">
          <v-row>
            <v-col v-for="card in variantMetricCards" :key="card.title" cols="12">
              <MetricCard :title="card.title" :value="card.value" :icon="card.icon" :color="card.color"
                :trend-data="card.trendData" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="4">
          <PieChartCard title="All Brand's Variants" :data="variantPieData" :has-legend="true"
            :is-loading="isVariantLoading" />
        </v-col>
        <v-col cols="12" md="5">
          <TableCard title="Variant's Ranking" :headers="['Brand Variant']" :rows="variantRankingData" :per-page="5"
            class="h-100" />
        </v-col>

        
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12">
          <HighlightsCarousel total-title="Variants Mentions" item-label="Variants" :show-total="true"
            total-icon="mdi-domain" total-icon-color="primary" :total-value="carouselTotalValue"
            :items="variantHighlights" :show-modal="showModal" :selected-item="selectedItem"
            :active-video="videoList[0]" :is-loading-detail="isVideoLoading" @close-modal="showModal = false"
            @item-click="handleItemClick" />
        </v-col>
        
      </v-row>
      <v-row class="mb-6">
        <v-col cols="12">
          <LineChartCard title="Internal Brand Variant Trends" :labels="variantTrendLabels" :data="variantTrendData"
            :is-loading="isVariantLoading" />
        </v-col>
      </v-row>
    </div>
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

interface HighlightItem {
  logo: string;
  name: string;
  count: number | string;
}
interface TableRow {
  name: string;
  mention: number;
  rank?: number;
}
interface PieChartItem {
  label: string;
  value: number;
}
interface TrendItem {
  total: number;
  brand: string;
  date: string;
}
interface TrendVarianItem {
  total: number;
  varian: string;
  date: string;
}
interface StackedItem {
  varian: { [key: string]: number };
  total: number;
  brand: string;
}
interface DateRange {
  labels: string[];
  apiDates: string[];
}
interface MetricCardItem {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  trendData: number[];
  labels?: string[];
}

const unileverAdsTrend = ref<number[]>([]);
const brandsTrend = ref<number[]>([]);
const variantsTrend = ref<number[]>([]);
const categoriesTrend = ref<number[]>([]);


const appStore = useAppStore();
const {
  startDate,
  endDate,
  selectedChannels,
  internalGroup,
} = storeToRefs(appStore);

const isGeneralLoading = ref(true);
const isVariantLoading = ref(true);

const internalMetricCards = ref<MetricCardItem[]>([
  // Hapus properti color, atau set null/undefined
  { title: 'Total of Unilever Ads', value: '...', icon: 'mdi-chart-line', trendData: [] },
  { title: 'Number of Brands', value: '...', icon: 'mdi-tag', trendData: [] },
  { title: 'Number of Brand Variants', value: '...', icon: 'mdi-tag-multiple', trendData: [] },
  { title: 'Total Category', value: '...', icon: 'mdi-shape-outline', trendData: [] },
]);

const rawInternalTopBrand = ref<TableRow[]>([]);
const rawInternalTrendBrand = ref<TrendItem[]>([]);
const rawInternalStackedBrandVarian = ref<StackedItem[]>([]);
const masterBrandsInternal = ref<string[]>([]);
const selectedInternalBrand = ref<string | null>(null);
const carouselTotalValue = ref<number | string>('...');

const variantMetricCards = ref<MetricCardItem[]>([
  { title: 'Total Brand Ads Detected', value: '...', icon: 'mdi-food-variant', color: 'purple', trendData: [] },
  { title: 'Number of Brand Variants', value: '...', icon: 'mdi-tag-multiple', color: 'purple', trendData: [] }
]);

const rawVariantTopVarian = ref<TableRow[]>([]);
const rawVariantTrendVarian = ref<TrendVarianItem[]>([]);

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(
    Math.abs(Math.sin(hash) * 16777215) % 16777215
  )
    .toString(16)
    .padStart(6, '0');
  return `#${color}`;
}

const transformApiResponse = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    mention: item.total || 0,
  }));
};

const processTableDataRanks = (rawData: TableRow[]) => {
  if (!rawData) return [];
  return [...rawData]
    .sort((a, b) => b.mention - a.mention)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      'brand variant': item.name,
      mention: String(item.mention)
    }));
};

const createLogo = (name: string) => {
  const initial = (name || 'U').charAt(0).toUpperCase();
  const color = stringToColor(name);
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
      <rect width='100%' height='100%' fill='${color}' />
      <text x='50%' y='55%' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial'>
        ${initial}
      </text>
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

const internalPieData = computed<PieChartItem[]>(() => {
  return rawInternalTopBrand.value
    .slice(0, 10)
    .map(item => ({
      label: item.name,
      value: item.mention
    }));
});

const internalBrandRanking = computed(() => {
  return [...rawInternalTopBrand.value]
    .sort((a, b) => b.mention - a.mention)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      'brand': item.name,
      mention: String(item.mention)
    }));
});

const internalLineChartData = computed(() => {
  if (!rawInternalTrendBrand.value || rawInternalTrendBrand.value.length === 0) {
    const emptyLabels = generateDateRange(startDate.value, endDate.value).labels;
    return { labels: emptyLabels, datasets: [] };
  }
  const data = rawInternalTrendBrand.value;
  const dateRange = generateDateRange(startDate.value, endDate.value);
  const labels = dateRange.labels;
  const brands = new Map<string, any[]>();
  for (const item of data) {
    if (!brands.has(item.brand)) brands.set(item.brand, []);
    brands.get(item.brand)!.push(item);
  }
  const datasets = [];
  const colors = generateBrightColors(brands.size);
  let colorIndex = 0;
  const sortedBrandNames = [...brands.keys()].sort();
  for (const brandName of sortedBrandNames) {
    const items = brands.get(brandName)!;
    const dataMap = new Map(items.map(i => [i.date, i.total]));
    const dataPoints = dateRange.apiDates.map(date => dataMap.get(date) || 0);
    const color = colors[colorIndex++];
    datasets.push({
      label: brandName,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color + '33',
      fill: true,
      tension: 0.4
    });
  }
  return { labels, datasets };
});

const brandTrendLabels = computed(() => internalLineChartData.value.labels);
const internalLineData = computed(() => internalLineChartData.value.datasets);

const variantBarChartData = computed(() => {
  if (!rawInternalStackedBrandVarian.value || rawInternalStackedBrandVarian.value.length === 0) {
    return { data: [], segments: [] };
  }
  const allVariants = new Set<string>();
  for (const item of rawInternalStackedBrandVarian.value) {
    if (item.varian) {
      Object.keys(item.varian).forEach(name => allVariants.add(name));
    }
  }
  const segments = [...allVariants].sort();
  const data = rawInternalStackedBrandVarian.value.map(brandItem => {
    const values = segments.map(variantName => {
      return brandItem.varian?.[variantName] || 0;
    });
    return {
      label: brandItem.brand,
      values: values
    };
  });
  return { data, segments };
});

const variantDistributionData = computed(() => variantBarChartData.value.data);
const variantDistributionSegments = computed(() => variantBarChartData.value.segments);

const carouselTotalTitle = computed(() => {
  return selectedInternalBrand.value ? `${selectedInternalBrand.value} Total Ads` : 'Total Ads';
});

const variantHighlights = computed<HighlightItem[]>(() => {
  return rawVariantTopVarian.value.map(item => ({
    name: item.name,
    count: item.mention,
    logo: createLogo(item.name),
    preview_video: (item as any).preview_video // Tambahkan baris ini
  }));
});

const variantPieData = computed<PieChartItem[]>(() => {
  return rawVariantTopVarian.value
    .slice(0, 10)
    .map(item => ({
      label: item.name,
      value: item.mention
    }));
});

const variantRankingData = computed(() => {
  return processTableDataRanks(rawVariantTopVarian.value);
});

const variantLineChartData = computed(() => {
  if (!rawVariantTrendVarian.value || rawVariantTrendVarian.value.length === 0) {
    const emptyLabels = generateDateRange(startDate.value, endDate.value).labels;
    return { labels: emptyLabels, datasets: [] };
  }
  const data = rawVariantTrendVarian.value;
  const dateRange = generateDateRange(startDate.value, endDate.value);
  const labels = dateRange.labels;
  const variants = new Map<string, any[]>();
  for (const item of data) {
    const variantName = item.varian || 'Unknown';
    if (!variants.has(variantName)) variants.set(variantName, []);
    variants.get(variantName)!.push(item);
  }
  const datasets = [];
  const colors = generateBrightColors(variants.size);
  let colorIndex = 0;
  const sortedVariantNames = [...variants.keys()].sort();
  for (const variantName of sortedVariantNames) {
    const items = variants.get(variantName)!;
    const dataMap = new Map(items.map(i => [i.date, i.total]));
    const dataPoints = dateRange.apiDates.map(date => dataMap.get(date) || 0);
    const color = colors[colorIndex++];
    datasets.push({
      label: variantName,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color + '33',
      fill: true,
      tension: 0.4
    });
  }
  return { labels, datasets };
});

const variantTrendLabels = computed(() => variantLineChartData.value.labels);
const variantTrendData = computed(() => variantLineChartData.value.datasets);

const showModal = ref(false);
const selectedItem = ref<any>(null);
const videoList = ref<any[]>([]);
const isVideoLoading = ref(false);


async function handleItemClick(item: any) {
  if (!selectedInternalBrand.value) return;

  selectedItem.value = item;
  showModal.value = true;
  videoList.value = [];
  isVideoLoading.value = true;

  try {
    const filters = {
      group: [internalGroup.value],
      brand: [selectedInternalBrand.value],
      varian: [item.name]
    };

    const response = await fetchData('list', filters);

    if (response && response.data && response.data.length > 0) {
      // Kita bungkus agar formatnya dikenali modal premium
      // Modal premium butuh properti seperti .video_link, .channel, dll
      videoList.value = response.data;
    }
  } catch (error) {
    console.error("Gagal load video:", error);
  } finally {
    isVideoLoading.value = false;
  }
}
async function fetchGeneralData() {
  const internalFilter = { group: [internalGroup.value] };
  try {
    const [
      totalAds, totalBrands, totalVariants, totalCategories,
      topBrandData, trendBrandData, stackedBrandVarianData
    ] = await Promise.all([
      fetchData('total/ads', internalFilter),
      fetchData('total/brand', internalFilter),
      fetchData('total/varian', internalFilter),
      fetchData('total/category', internalFilter),
      fetchData('top/brand', internalFilter),
      fetchData('trend/brand', internalFilter),
      fetchData('stacked/brand/varian', internalFilter),
    ]);

    let processedTrend: number[] = [];
    let processedLabels: string[] = [];

    if (trendBrandData && Array.isArray(trendBrandData)) {
      const dailyMap: Record<string, number> = {};

      trendBrandData.forEach((item: any) => {
        const d = item.date;
        if (!dailyMap[d]) dailyMap[d] = 0;
        dailyMap[d] += (Number(item.total) || 0);
      });

      const sortedDates = Object.keys(dailyMap).sort();

      processedLabels = sortedDates.map(date => moment(date).format('DD MMM'));
      processedTrend = sortedDates.map(date => dailyMap[date] as number);

      // Simpan trend dasar
      unileverAdsTrend.value = processedTrend;
      // Simulasi trend untuk metrik lainnya (opsional, sesuaikan logika bisnis Anda)
      brandsTrend.value = processedTrend.map(v => Math.max(1, Math.round(v / 5)));
      variantsTrend.value = processedTrend.map(v => Math.round(v / 2));
      categoriesTrend.value = processedTrend.map(v => Math.max(1, Math.round(v / 10)));
    }

    // UPDATE VARIABEL GLOBAL (Jangan pakai 'const' atau 'ref' lagi di sini)
    internalMetricCards.value = [
      {
        title: 'Total of Unilever Ads',
        value: totalAds?.total || 0,
        icon: 'mdi-chart-line',
        trendData: unileverAdsTrend.value,
        labels: processedLabels
      },
      {
        title: 'Number of Brands',
        value: totalBrands?.total || 0,
        icon: 'mdi-tag',
        trendData: brandsTrend.value,
        labels: processedLabels
      },
      {
        title: 'Number of Brand Variants',
        value: totalVariants?.total || 0,
        icon: 'mdi-tag-multiple',
        trendData: variantsTrend.value,
        labels: processedLabels
      },
      {
        title: 'Total Category',
        value: totalCategories?.total || 0,
        icon: 'mdi-shape-outline',
        trendData: categoriesTrend.value,
        labels: processedLabels
      },
    ];

    rawInternalTopBrand.value = transformApiResponse(topBrandData);
    rawInternalTrendBrand.value = trendBrandData || [];
    rawInternalStackedBrandVarian.value = stackedBrandVarianData || [];
  } catch (error) {
    console.error("Gagal load general data:", error);
  }
}
async function fetchVariantData() {
  if (!selectedInternalBrand.value) {
    isVariantLoading.value = false;
    return;
  }
  isVariantLoading.value = true;
  try {
    const requiredFilters = {
      group: [internalGroup.value],
      brand: [selectedInternalBrand.value]
    };

    const [totalAdsData, topVarianData, trendVarianData, totalVariantsData] = await Promise.all([
      fetchData('total/ads', requiredFilters),
      fetchData('top/varian', requiredFilters),
      fetchData('trend/varian', requiredFilters),
      fetchData('total/varian', requiredFilters),
    ]);

    variantMetricCards.value = [
      { title: 'Total Brand Ads Detected', value: totalAdsData?.total || 0, icon: 'mdi-food-variant', color: 'purple', trendData: [] },
      { title: 'Number of Brand Variants', value: totalVariantsData?.total || 0, icon: 'mdi-tag-multiple', color: 'purple', trendData: [] }
    ];

    carouselTotalValue.value = totalAdsData?.total || 0;

    const rawVariantsList = transformApiResponse(topVarianData);
    const detailedVariants = await Promise.all(
      rawVariantsList.map(async (variant) => {
        let videoLink = '';
        try {
          const videoRes = await fetchData('list', { ...requiredFilters, varian: [variant.name] });
          if (videoRes?.data?.length > 0) videoLink = videoRes.data[0].video_link;
        } catch (e) { console.error(e); }
        return { ...variant, preview_video: videoLink };
      })
    );

    rawVariantTopVarian.value = detailedVariants;
    rawVariantTrendVarian.value = trendVarianData || [];
  } catch (error) {
    console.error("Gagal load variant data:", error);
  } finally {
    isVariantLoading.value = false;
  }
}

async function fetchBrandFilterDropdown() {
  try {
    const brandData = await fetchData('top/brand', { group: [internalGroup.value] });
    const transformedData = transformApiResponse(brandData);
    masterBrandsInternal.value = transformedData.map(brand => brand.name);
    if (masterBrandsInternal.value.length > 0) {
      selectedInternalBrand.value = masterBrandsInternal.value[0] ?? null;
    }
  } catch (error) {
    console.error("Failed to fetch internal brand list:", error);
  }
}

watch(
  [startDate, endDate, selectedChannels],
  async () => {
    isGeneralLoading.value = true;
    await Promise.all([
      fetchGeneralData(),
      fetchVariantData()
    ]);
    isGeneralLoading.value = false;
  },
  { deep: true }
);

watch(selectedInternalBrand, async (newBrand) => {
  if (!newBrand) return;
  await fetchVariantData();
});

onMounted(async () => {
  isGeneralLoading.value = true;
  isVariantLoading.value = true;
  await Promise.all([
    fetchGeneralData(),
    fetchBrandFilterDropdown()
  ]);
  isGeneralLoading.value = false;
});
</script>

<style>
.grey-label .v-label {
  color: rgb(var(--v-theme-grey-500)) !important;
  opacity: 1;
}

.v-btn-toggle .v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}
</style>