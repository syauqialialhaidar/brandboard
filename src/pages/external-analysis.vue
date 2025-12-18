<template>
  <div>
    <PageTitle
      title="External Brand Analysis"
      :show-channel-filter="true"
      class="mb-6"
    />

    <div class="d-flex flex-wrap align-center mb-6 ga-4">
      <div class="text-h6 font-weight-bold">Competitor Analysis</div>
      <v-spacer></v-spacer>
      <v-sheet width="300" color="transparent">
        <v-select
          v-model="selectedExternalGroup"
          density="compact"
          label="Select Competitor Group"
          variant="outlined"
          hide-details
          :items="masterExternalGroups"
        ></v-select>
      </v-sheet>
    </div>

    <v-row>
      <v-col
        v-for="card in externalMetricCards"
        :key="card.title"
        cols="12"
        sm="6"
        md="4"
      >
        <MetricCard
          :title="card.title"
          :value="card.value"
          :icon="card.icon"
          :color="card.color"
        />
      </v-col>
    </v-row>
    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <PieChartCard
          :title="externalPieTitle"
          :data="externalPieData"
          :has-legend="true"
          :is-loading="isLoading"
        />
      </v-col>
      <v-col cols="12" md="8">
        <LineChartCard
          title="Brand Trends"
          :labels="brandTrendLabels"
          :data="externalLineData"
          :is-loading="isLoading"
        />
      </v-col>
    </v-row>
    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <TableCard
          title="Brand Ranking"
          :headers="['Brand']"
          :rows="brandRankingData"
          :per-page="5"
        />
      </v-col>
      <v-col cols="12" md="8">
        <BarChartCard
          :title="externalBarTitle"
          :data="variantDistributionData"
          :segment-labels="variantDistributionSegments"
          :is-loading="isLoading"
        />
      </v-col>
    </v-row>
    <div class="d-flex flex-wrap align-center my-6 ga-4">
      <div class="text-h6 font-weight-bold">Brand Variations</div>
    </div>
    <HighlightsCarousel
      class="mb-6"
      :show-total="false"
      :items="variantHighlights"
    />
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <TableCard
          title="Brand Variant Data"
          :headers="['Brand Variant']"
          :rows="variantRankingData"
          :per-page="5"
        />
      </v-col>
      <v-col cols="12" md="8">
        <LineChartCard
          title="Brand Variant Trends"
          :labels="variantTrendLabels"
          :data="variantTrendData"
          :is-loading="isLoading"
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
const isLoading = ref(true);
const masterExternalGroups = ref<string[]>([]);
const selectedExternalGroup = ref<string | null>(null);
const externalMetricCards = ref([
  { title: 'Total Group Ads', value: '...', icon: 'mdi-chart-pie', color: 'primary' },
  { title: 'Number of Brands', value: '...', icon: 'mdi-tag', color: 'primary' },
  { title: 'Number of Brand Variants', value: '...', icon: 'mdi-tag-multiple', color: 'primary' },
]);
const rawTopBrand = ref<TableRow[]>([]);
const rawTrendBrand = ref<TrendItem[]>([]);
const rawStackedBrandVarian = ref<StackedItem[]>([]);
const rawTopVarian = ref<TableRow[]>([]);
const rawTrendVarian = ref<TrendVarianItem[]>([]);
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
const createLogo = (name: string) => {
  const initial = (name || 'E').charAt(0).toUpperCase();
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
const externalPieTitle = computed(() =>
  `${selectedExternalGroup.value || 'Group'} Brand Distribution`
);
const externalPieData = computed<PieChartItem[]>(() => {
  return rawTopBrand.value
    .slice(0, 10)
    .map(item => ({
      label: item.name,
      value: item.mention
    }));
});
const brandLineChartData = computed(() => {
  if (!rawTrendBrand.value || rawTrendBrand.value.length === 0) {
    const emptyLabels = generateDateRange(startDate.value, endDate.value).labels;
    return { labels: emptyLabels, datasets: [] };
  }
  const data = rawTrendBrand.value;
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
const brandTrendLabels = computed(() => brandLineChartData.value.labels);
const externalLineData = computed(() => brandLineChartData.value.datasets);
const brandRankingData = computed(() => {
  return [...rawTopBrand.value]
    .sort((a, b) => b.mention - a.mention)
    .map((item, index) => ({
      ...item,
      mention: String(item.mention),
      rank: index + 1,
      'brand': item.name
    }));
});
const externalBarTitle = computed(() =>
  `${selectedExternalGroup.value || 'Group'} Brand Variants Distribution`
);
const variantBarChartData = computed(() => {
  if (!rawStackedBrandVarian.value || rawStackedBrandVarian.value.length === 0) {
    return { data: [], segments: [] };
  }
  const allVariants = new Set<string>();
  for (const item of rawStackedBrandVarian.value) {
    if (item.varian) {
      Object.keys(item.varian).forEach(name => allVariants.add(name));
    }
  }
  const segments = [...allVariants].sort();
  const data = rawStackedBrandVarian.value.map(brandItem => {
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
const variantHighlights = computed<HighlightItem[]>(() => {
  return rawTopVarian.value.map(item => ({
    name: item.name,
    count: item.mention,
    logo: createLogo(item.name)
  }));
});
const variantRankingData = computed(() => {
  return [...rawTopVarian.value]
    .sort((a, b) => b.mention - a.mention)
    .map((item, index) => ({
      ...item,
      mention: String(item.mention),
      rank: index + 1,
      'brand variant': item.name
    }));
});
const variantLineChartData = computed(() => {
  if (!rawTrendVarian.value || rawTrendVarian.value.length === 0) {
    const emptyLabels = generateDateRange(startDate.value, endDate.value).labels;
    return { labels: emptyLabels, datasets: [] };
  }
  const data = rawTrendVarian.value;
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
async function fetchGroupFilterDropdown() {
  try {
    const groupData = await fetchData('top/group');
    const transformedData = transformApiResponse(groupData);
    masterExternalGroups.value = transformedData
      .map(group => group.name)
      .filter(name => name !== internalGroup.value);
    if (masterExternalGroups.value.length > 0) {
      selectedExternalGroup.value = masterExternalGroups.value[0] ?? null;
    }
  } catch (error) {
    console.error("Failed to fetch external group list:", error);
  }
}
async function fetchAllData() {
  if (!selectedExternalGroup.value) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  const externalFilter = { group: [selectedExternalGroup.value] };
  try {
    const [
      totalAds, totalBrands, totalVariants,
      topBrandData, trendBrandData, stackedBrandVarianData,
      topVarianData, trendVarianData
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
    externalMetricCards.value = [
      { title: 'Total Group Ads', value: totalAds?.total || 0, icon: 'mdi-chart-pie', color: 'primary' },
      { title: 'Number of Brands', value: totalBrands?.total || 0, icon: 'mdi-tag', color: 'primary' },
      { title: 'Number of Brand Variants', value: totalVariants?.total || 0, icon: 'mdi-tag-multiple', color: 'primary' },
    ];
    rawTopBrand.value = transformApiResponse(topBrandData);
    rawTrendBrand.value = trendBrandData || [];
    rawStackedBrandVarian.value = stackedBrandVarianData || [];
    rawTopVarian.value = transformApiResponse(topVarianData);
    rawTrendVarian.value = trendVarianData || [];
  } catch (error) {
    console.error("Failed to fetch external data:", error);
    externalMetricCards.value.forEach(card => card.value = 'Error');
    rawTopBrand.value = [];
    rawTrendBrand.value = [];
    rawStackedBrandVarian.value = [];
    rawTopVarian.value = [];
    rawTrendVarian.value = [];
  } finally {
    isLoading.value = false;
  }
}
watch(
  [startDate, endDate, selectedChannels],
  async () => {
    await fetchAllData();
  },
  { deep: true }
);
watch(selectedExternalGroup, async (newGroup) => {
  if (!newGroup) return;
  await fetchAllData();
});
onMounted(async () => {
  isLoading.value = true;
  await fetchGroupFilterDropdown();
});
</script>
