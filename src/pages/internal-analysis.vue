<template>
  <div>
    <PageTitle
      title="Internal Brand Analysis"
      :show-channel-filter="true"
      class="mb-6"
    />
    
    <h2 class="text-h6 font-weight-bold mb-4">General Internal</h2>
    
    <v-row>
      <v-col
        v-for="card in internalMetricCards"
        :key="card.title"
        cols="12"
        sm="6"
        md="3"
      >
        <MetricCard
          :title="card.title"
          :value="card.value"
          :icon="card.icon"
          :color="card.color"
        />
      </v-col>
    </v-row>

    <v-row class="mt-2 d-flex">
      <v-col cols="12" md="4">
        <PieChartCard
          title="Internal Brand Distribution Pie"
          :data="internalPieData"
          :has-legend="true"
          :is-loading="isGeneralLoading"
        />
      </v-col>
      <v-col cols="12" md="8">
        <LineChartCard
          title="Internal Brand Trends"
          :labels="brandTrendLabels"
          :data="internalLineData"
          :is-loading="isGeneralLoading"
        />
      </v-col>
    </v-row>

    <v-row class="mt-2 d-flex">
      <v-col cols="12" md="4">
        <TableCard
          title="Internal Brand Ranking"
          :headers="['Brand']"
          :rows="internalBrandRanking"
          :per-page="5"
        />
      </v-col>
      <v-col cols="12" md="8">
        <BarChartCard
          title="Unilever Brand Variants Distribution"
          :data="variantDistributionData"
          :segment-labels="variantDistributionSegments"
          :is-loading="isGeneralLoading"
        />
      </v-col>
    </v-row>

    <div class="d-flex flex-wrap align-center my-6 ga-4">
      <div class="text-h6 font-weight-bold">Internal Brand and Variants</div>
      <v-spacer></v-spacer>
      <v-sheet width="250" color="transparent">
        <v-select
          v-model="selectedInternalBrand"
          density="compact"
          label="Select Brand"
          variant="outlined"
          hide-details
          :items="masterBrandsInternal"
        ></v-select>
      </v-sheet>
    </div>

    <HighlightsCarousel
      class="mb-6"
      :show-total="true"
      total-icon="mdi-domain"
      total-icon-color="primary"
      :total-title="carouselTotalTitle"
      :total-value="carouselTotalValue"
      :items="variantHighlights"
    />

    <v-row class="mb-6 d-flex" align="stretch">
      <v-col md="3">
        <v-row class="h-100">
          <v-col v-for="card in variantMetricCards" cols="12">
             <MetricCard
              :title="card.title"
              :value="card.value"
              :icon="card.icon"
              :color="card.color"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="4">
        <PieChartCard
          title="All Brand's Variants"
          :data="variantPieData"
          :has-legend="true"
          :is-loading="isVariantLoading"
        />
      </v-col>
      <v-col cols="12" md="5">
        <TableCard
          title="Variant's Ranking"
          :headers="['Brand Variant']"
          :rows="variantRankingData"
          :per-page="5"
          class="h-100"
        />
      </v-col>
    </v-row>
    <v-row class="mb-6">
      <v-col cols="12">
        <LineChartCard
          title="Internal Brand Variant Trends"
          :labels="variantTrendLabels"
          :data="variantTrendData"
          :is-loading="isVariantLoading"
        />
      </v-col>
    </v-row>
  </div>
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

const appStore = useAppStore();
const {
  startDate,
  endDate,
  selectedChannels,
  internalGroup,
} = storeToRefs(appStore);

const isGeneralLoading = ref(true);
const isVariantLoading = ref(true);

const internalMetricCards = ref([
  { title: 'Total of Unilever Ads', value: '...', icon: 'mdi-chart-line', color: 'primary' },
  { title: 'Number of Brands', value: '...', icon: 'mdi-tag', color: 'primary' },
  { title: 'Number of Brand Variants', value: '...', icon: 'mdi-tag-multiple', color: 'primary' },
  { title: 'Total Category', value: '...', icon: 'mdi-shape-outline', color: 'primary' },
]);

const rawInternalTopBrand = ref<TableRow[]>([]);
const rawInternalTrendBrand = ref<TrendItem[]>([]);
const rawInternalStackedBrandVarian = ref<StackedItem[]>([]);
const masterBrandsInternal = ref<string[]>([]);
const selectedInternalBrand = ref<string | null>(null);
const carouselTotalValue = ref<number | string>('...');

const variantMetricCards = ref([
  { title: 'Total Brand Ads Detected', value: '...', icon: 'mdi-food-variant', color: 'purple' },
  { title: 'Number of Brand Variants', value: '...', icon: 'mdi-tag-multiple', color: 'purple' }
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
    logo: createLogo(item.name)
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
    internalMetricCards.value = [
      { title: 'Total of Unilever Ads', value: totalAds?.total || 0, icon: 'mdi-chart-line', color: 'primary' },
      { title: 'Number of Brands', value: totalBrands?.total || 0, icon: 'mdi-tag', color: 'primary' },
      { title: 'Number of Brand Variants', value: totalVariants?.total || 0, icon: 'mdi-tag-multiple', color: 'primary' },
      { title: 'Total Category', value: totalCategories?.total || 0, icon: 'mdi-shape-outline', color: 'primary' },
    ];
    rawInternalTopBrand.value = transformApiResponse(topBrandData);
    rawInternalTrendBrand.value = trendBrandData || [];
    rawInternalStackedBrandVarian.value = stackedBrandVarianData || [];
  } catch (error) {
    console.error("Failed to fetch general internal data:", error);
    internalMetricCards.value.forEach(card => card.value = 'Error');
    rawInternalTopBrand.value = [];
    rawInternalTrendBrand.value = [];
    rawInternalStackedBrandVarian.value = [];
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
    const [
      totalAdsData,
      topVarianData,
      trendVarianData
    ] = await Promise.all([
      fetchData('total/ads', requiredFilters),
      fetchData('top/varian', requiredFilters),
      fetchData('trend/varian', requiredFilters),
    ]);
    carouselTotalValue.value = totalAdsData?.total || 0;
    if (variantMetricCards.value[0]) {
      variantMetricCards.value[0].value = totalAdsData?.total || 0;
    }
    if (variantMetricCards.value[1]) {
      variantMetricCards.value[1].value = topVarianData?.length || 0;
    }
    rawVariantTopVarian.value = transformApiResponse(topVarianData);
    rawVariantTrendVarian.value = trendVarianData || [];
  } catch (error) {
    console.error("Failed to fetch variant data:", error);
    carouselTotalValue.value = 'Error';
    variantMetricCards.value.forEach(card => card.value = 'Error');
    rawVariantTopVarian.value = [];
    rawVariantTrendVarian.value = [];
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