<template>
  <v-container fluid class="pa-0">
    <PageTitle title="Internal Analysis" only-internal
      :enabled-filters="['channel', 'brand', 'variants', 'kategori', 'sub_kategori']"
      @update:filter="handleFilterUpdate" />

    <div>
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

      <v-row class="mb-2">
        <v-col cols="12">
          <HighlightsCarousel total-title="Internal Brands Mentions" item-label="Brands" :items="myBrandHighlights"
            :total-items-count="rawInternalBrandsForHighlight.length" :is-loading-more="isFetchingMore"
            :total-value="totalUnileverAds" :start-date="startDate" :end-date="endDate" @next-page="handleLoadMore"
            @item-click="handleBrandClick" />
        </v-col>
      </v-row>

      <div class="d-flex align-center mb-4 ga-2">
        <div class="text-h5 font-weight-bold">Brand Distribution</div>
      </div>

      <v-row class="d-flex mb-4">
        <v-col cols="12" md="4">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4 d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-bold">Internal Brand</div>
              <v-btn-toggle v-model="brandDistType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
              </v-btn-toggle>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <PieChartCard v-if="brandDistType === 'pie'" title="" :data="internalPieData" :has-legend="true"
                :is-loading="isGeneralLoading" />
              
              <BarChartCard v-else title="" 
                :data="[{ label: 'Total Mentions', values: internalPieData.map(d => d.value) }]" 
                :segment-labels="internalPieData.map(d => d.label)"
                :is-loading="isGeneralLoading" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
           <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
             <div class="pa-4">
               <div class="text-subtitle-1 font-weight-bold">Internal Brand Trends</div>
             </div>
             <v-divider />
             <div class="pa-4 flex-grow-1">
                <LineChartCard title="" :labels="brandTrendLabels" :data="internalLineData"
                  :is-loading="isGeneralLoading" />
             </div>
           </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2 mb-6 d-flex">
        <v-col cols="12" md="4">
          <TableCard title="Internal Brand Ranking" :headers="['Brand']" :rows="internalBrandRanking" :per-page="5" class="h-100 rounded-xl" />
        </v-col>
        <v-col cols="12" md="8">
           <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
             <div class="pa-4">
               <div class="text-subtitle-1 font-weight-bold">Internal Brand Variants Distribution</div>
             </div>
             <v-divider />
             <div class="pa-4 flex-grow-1">
               <BarChartCard title="" :data="variantDistributionData"
                 :segment-labels="variantDistributionSegments" :is-stacked="true" :is-loading="isGeneralLoading" />
             </div>
           </v-card>
        </v-col>
      </v-row>

      <div class="d-flex align-center mb-4 ga-2">
        <div class="text-h5 font-weight-bold">Variants Distribution</div>
      </div>

      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4 d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-bold">All Brand's Variants Share</div>
              <v-btn-toggle v-model="variantDistType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
              </v-btn-toggle>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <PieChartCard v-if="variantDistType === 'pie'" title="" :data="variantPieData" :has-legend="true"
                :is-loading="isVariantLoading" />
              
              <BarChartCard v-else title="" 
                 :data="[{ label: 'Total', values: variantPieData.map(d => d.value) }]" 
                 :segment-labels="variantPieData.map(d => d.label)"
                 :is-loading="isVariantLoading" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <TableCard title="Variant's Ranking" :headers="['Brand Variant']" :rows="variantRankingData" :per-page="5"
            class="h-100 rounded-xl" />
        </v-col>
      </v-row>

      <v-row class="mb-4">
        <v-col cols="12">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
             <div class="pa-4">
               <div class="text-subtitle-1 font-weight-bold">Internal Brand Variant Trends</div>
             </div>
             <v-divider />
             <div class="pa-4 flex-grow-1">
               <LineChartCard title="" :labels="variantTrendLabels" :data="variantTrendData"
                :is-loading="isVariantLoading" />
             </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" md="12">
          <HighlightsCarousel total-title="Variants Mentions" item-label="Variants" :show-total="true"
            total-icon="mdi-domain" total-icon-color="primary" :total-value="carouselTotalValue"
            :total-items-count="variantHighlights.length" :items="variantHighlights" :start-date="startDate"
            :end-date="endDate" :show-modal="showModal" :selected-item="selectedItem" :active-video="videoList[0]"
            :is-loading-detail="isVideoLoading" @close-modal="showModal = false" @item-click="handleItemClick" />
        </v-col>
      </v-row>

      <div class="d-flex align-center mb-4 ga-2">
        <div class="text-h5 font-weight-bold">Media and Audience</div>
      </div>

      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <TableMinim title="Top Program" :headers="['Name', 'Channel']" :rows="topPrograms" :per-page="5"
            class="h-100 rounded-xl" />
        </v-col>
        <v-col cols="12" md="6">
          <TableMinim title="Top Brand Ambassador" :headers="['Name']" :rows="topBrandAmbasador" :per-page="5"
            class="h-100 rounded-xl" />
        </v-col>
      </v-row>

      <v-row class="mb-2">
        
        <v-col cols="12" md="6">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4 d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-bold">Gender</div>
              <v-btn-toggle v-model="genderChartType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
              </v-btn-toggle>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <PieChartCard v-if="genderChartType === 'pie'" title="" :data="dummyGenderData" :has-legend="true" suffix="%" />
              <BarChartCard v-else title="" 
                :data="[{ label: 'Gender', values: dummyGenderData.map(d => d.value) }]" 
                :segment-labels="dummyGenderData.map(d => d.label)" suffix="%" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4 d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-bold">Age</div>
              <v-btn-toggle v-model="ageChartType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
              </v-btn-toggle>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <BarChartCard v-if="ageChartType === 'bar'" title="" :data="dummyAgeData.data" :segment-labels="dummyAgeData.segments" suffix="%" />
              <PieChartCard v-else title="" 
                :data="dummyAgeData.segments.map((label, i) => ({ label, value: dummyAgeData.data[0].values[i] }))" 
                :has-legend="true" suffix="%" />
            </div>
          </v-card>
        </v-col>

        
      </v-row>

      <v-row class="mb-2"><v-col cols="12" md="6">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4 d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-bold">Location</div>
              <v-btn-toggle v-model="locationChartType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
              </v-btn-toggle>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <PieChartCard v-if="locationChartType === 'pie'" title="" :data="dummyLocationData" :has-legend="true" />
              <BarChartCard v-else title="" 
                :data="[{ label: 'Total', values: dummyLocationData.map(d => d.value) }]" 
                :segment-labels="dummyLocationData.map(d => d.label)" />
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <TableMinim title="Program Types" :headers="['Name', 'Mention']" :rows="dummyProgramType" :per-page="5"
            class="rounded-xl h-100" />
        </v-col>
      </v-row>
      <v-row class="mb-2">
        <v-col cols="12" md="6">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4 d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-bold">Zone Time</div>
              <v-btn-toggle v-model="timezoneChartType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
              </v-btn-toggle>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <PieChartCard v-if="timezoneChartType === 'pie'" title="" :data="dummyTimezoneData" :has-legend="true" suffix="%" />
              <BarChartCard v-else title="" 
                :data="[{ label: 'Total', values: dummyTimezoneData.map(d => d.value) }]" 
                :segment-labels="dummyTimezoneData.map(d => d.label)" suffix="%" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4 d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-bold">Scope</div>
              <v-btn-toggle v-model="scopeChartType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
              </v-btn-toggle>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <BarChartCard v-if="scopeChartType === 'bar'" title="" :data="dummyScopeData.data" :segment-labels="dummyScopeData.segments" />
              <PieChartCard v-else title="" 
                :data="dummyScopeData.segments.map((label, i) => ({ label, value: dummyScopeData.data[0].values[i] }))" 
                :has-legend="true" />
            </div>
          </v-card>
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
import TableMinim from '@/page-components/TableMinim.vue';
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

// --- TOGGLE ---
// --- STATE TOGGLE CHART ---
const brandDistType = ref('pie');   // Toggle untuk Internal Brand
const variantDistType = ref('pie'); // Toggle untuk Variant Distribution

// Toggle untuk Media & Audience
const genderChartType = ref('pie');
const ageChartType = ref('bar');
const locationChartType = ref('pie');
const timezoneChartType = ref('pie');
const scopeChartType = ref('bar');


// --- DATA DUMMY BARU ---

const dummyGenderData = ref([
  { label: 'Female', value: 60 },
  { label: 'Male', value: 40 },
]);

const dummyAgeData = ref({
  segments: ['Kids (0-12)', 'Teens (13-18)', 'Adults (19-45)', 'Seniors (45+)'],
  data: [
    { label: 'Audience', values: [15, 25, 45, 15] }
  ]
});

const dummyLocationData = ref([
  { label: 'Jawa Barat', value: 350 },
  { label: 'DKI Jakarta', value: 300 },
  { label: 'Jawa Timur', value: 200 },
  { label: 'Jawa Tengah', value: 150 },
]);

const dummyTimezoneData = ref([
  { label: 'WIB', value: 80 },
  { label: 'WITA', value: 15 },
  { label: 'WIT', value: 5 },
]);

const dummyScopeData = ref({
  segments: ['National', 'Regional', 'Local'],
  data: [
    { label: 'Total Ads', values: [70, 20, 10] }
  ]
});

const dummyProgramType = ref([
  { name: 'Drama/Soap Opera', mention: '450' },
  { name: 'Variety Show', mention: '320' },
  { name: 'News', mention: '150' },
  { name: 'Sports', mention: '80' },
  { name: 'Movies', mention: '60' },
]);

const topPrograms = ref([
  { name: 'Ikatan Cinta', mention: '85%' },
  { name: 'Preman Pensiun', mention: '72%' },
  { name: 'Dahsyat', mention: '60%' },
  { name: 'MasterChef Indonesia', mention: '55%' },
  { name: 'Amanah Wali', mention: '48%' },
]);

const topBrandAmbasador = ref([
  { name: 'Raffi Ahmad', mention: '95%' },
  { name: 'Nagita Slavina', mention: '88%' },
  { name: 'Deddy Corbuzier', mention: '75%' },
  { name: 'Agnez Mo', mention: '65%' },
  { name: 'Maudy Ayunda', mention: '50%' },
]);

const selectedCategory = ref<string[]>([]);
const selectedSubCategory = ref<string[]>([]);
const selectedVariants = ref<string[]>([]);

const unileverAdsTrend = ref<number[]>([]);
const brandsTrend = ref<number[]>([]);
const variantsTrend = ref<number[]>([]);
const categoriesTrend = ref<number[]>([]);
const currentPageInternal = ref(0);
const pageSize = 5;
const isFetchingMore = ref(false);
const rawInternalBrandsForHighlight = ref<any[]>([]);
const myBrandHighlights = ref<any[]>([]);


const handleFilterUpdate = (newFilters: any) => {
  // Channel (Store)
  if (newFilters.channel) appStore.selectedChannels = newFilters.channel;

  // Brand (Local)
  if (newFilters.brand) selectedInternalBrand.value = newFilters.brand;

  // Filter Tambahan (Pastikan nama key sesuai dengan yang di-emit PageTitle)
  if (newFilters.kategori) selectedCategory.value = newFilters.kategori;
  if (newFilters.sub_kategori) selectedSubCategory.value = newFilters.sub_kategori;
  if (newFilters.variants) selectedVariants.value = newFilters.variants; // Biasanya key dari component adalah 'variants'
};


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
  { title: 'Total Unilever Ads', value: '...', icon: 'mdi-chart-line', trendData: [] },
  { title: 'Total of Brands', value: '...', icon: 'mdi-tag', trendData: [] },
  { title: 'Total of Brand Variants', value: '...', icon: 'mdi-tag-multiple', trendData: [] },
  { title: 'Total Spanding', value: '...', icon: 'mdi-cash-multiple', trendData: [] },
]);

const rawInternalTopBrand = ref<TableRow[]>([]);
const rawInternalTrendBrand = ref<TrendItem[]>([]);
const rawInternalStackedBrandVarian = ref<StackedItem[]>([]);
const masterBrandsInternal = ref<string[]>([]);
const selectedInternalBrand = ref<string[]>([]);
const carouselTotalValue = ref<number | string>('...');
const totalUnileverAds = computed(() => {
  return internalMetricCards.value[0]?.value || 0;
});

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
  const brands = selectedInternalBrand.value;

  if (brands.length === 0) {
    return 'Total Ads (All Brands)';
  } else if (brands.length === 1) {
    return `${brands[0]} Total Ads`;
  } else {
    // Jika lebih dari 1, tampilkan jumlahnya saja agar rapi
    return `${brands.length} Selected Brands Total Ads`;
  }
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
  // 1. Cek panjang array, bukan existency-nya
  // Catatan: Jika kamu ingin video bisa diklik saat mode "All Brands", hapus baris ini.
  if (selectedInternalBrand.value.length === 0) return;

  selectedItem.value = item;
  showModal.value = true;
  videoList.value = [];
  isVideoLoading.value = true;

  try {
    const filters: Record<string, any> = {
      group: [internalGroup.value],
      // 2. Langsung pakai value-nya (karena sudah array), JANGAN pakai kurung siku [] lagi
      brand: selectedInternalBrand.value,
      varian: [item.name]
    };

    const response = await fetchData('list', filters);

    if (response && response.data && response.data.length > 0) {
      videoList.value = response.data;
    }
  } catch (error) {
    console.error("Gagal load video:", error);
  } finally {
    isVideoLoading.value = false;
  }
}
async function fetchGeneralData() {
  // 1. Base Filter
  const internalFilter: Record<string, any> = {
    group: [internalGroup.value]
  };

  // 2. Inject Filter Dinamis (Brand, Category, Sub, Variant)
  if (selectedInternalBrand.value.length > 0) internalFilter.brand = selectedInternalBrand.value;

  // Asumsi parameter API untuk kategori adalah 'category', sesuaikan jika 'kategori'
  if (selectedCategory.value.length > 0) internalFilter.category = selectedCategory.value;

  // Asumsi parameter API untuk sub kategori
  if (selectedSubCategory.value.length > 0) internalFilter.sub_category = selectedSubCategory.value;

  // Asumsi parameter API untuk varian adalah 'varian'
  if (selectedVariants.value.length > 0) internalFilter.varian = selectedVariants.value;
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
    if (topBrandData && Array.isArray(topBrandData)) {
      rawInternalBrandsForHighlight.value = topBrandData;
      myBrandHighlights.value = [];
      currentPageInternal.value = 0;
      // Load 3-5 item pertama sebagai inisialisasi
      await fetchMoreInternalHighlights(0, 5);
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
        title: 'Total of Brands',
        value: totalBrands?.total || 0,
        icon: 'mdi-tag',
        trendData: brandsTrend.value,
        labels: processedLabels
      },
      {
        title: 'Total of Variants',
        value: totalVariants?.total || 0,
        icon: 'mdi-tag-multiple',
        trendData: variantsTrend.value,
        labels: processedLabels
      },
      {
        title: 'Total Spanding',
        value: '...',
        icon: 'mdi-cash-multiple',
        trendData: categoriesTrend.value,
        labels: processedLabels
      },
    ];


    rawInternalTopBrand.value = transformApiResponse(topBrandData);
    rawInternalTrendBrand.value = trendBrandData || [];
    rawInternalStackedBrandVarian.value = stackedBrandVarianData || [];
  }
  catch (error) {
    console.error("Gagal load general data:", error);
  }

}

// Fungsi untuk memuat data lebih banyak saat carousel digeser/diklik next
async function handleLoadMore() {
  if (isFetchingMore.value) return;
  const nextStartIndex = (currentPageInternal.value + 1) * pageSize;

  if (myBrandHighlights.value.length <= nextStartIndex && nextStartIndex < rawInternalBrandsForHighlight.value.length) {
    isFetchingMore.value = true;
    await fetchMoreInternalHighlights(nextStartIndex, pageSize);
    currentPageInternal.value++;
    isFetchingMore.value = false;
  } else if (nextStartIndex < rawInternalBrandsForHighlight.value.length) {
    currentPageInternal.value++;
  }
}

// Fungsi pembantu untuk mengambil video preview brand satu per satu
async function fetchMoreInternalHighlights(startIndex: number, fetchLimit: number) {
  const nextBatch = rawInternalBrandsForHighlight.value.slice(startIndex, startIndex + fetchLimit);
  if (nextBatch.length === 0) return;

  const detailedBatch = await Promise.all(
    nextBatch.map(async (brand: any) => {
      let previewVideo = '';
      try {
        const videoRes = await fetchData('list', {
          group: [internalGroup.value],
          brand: [brand.name]
        });
        if (videoRes?.data && videoRes.data.length > 0) {
          previewVideo = videoRes.data[0].video_link;
        }
      } catch (e) {
        console.error(`Gagal load video preview:`, e);
      }
      return {
        name: brand.name,
        count: brand.total || 0,
        preview_video: previewVideo,
        logo: createLogo(brand.name), // Menggunakan fungsi logo yang sudah ada di internal.vue
      };
    })
  );
  myBrandHighlights.value.push(...detailedBatch);
}
async function handleBrandClick(item: any) {
  // item adalah data brand yang diklik dari carousel
  selectedItem.value = item;
  showModal.value = true;
  videoList.value = [];
  isVideoLoading.value = true;

  try {
    const filters = {
      group: [internalGroup.value],
      brand: [item.name] // Mencari video berdasarkan brand
    };

    const response = await fetchData('list', filters);

    if (response && response.data && response.data.length > 0) {
      videoList.value = response.data;
    }
  } catch (error) {
    console.error("Gagal load video brand:", error);
  } finally {
    isVideoLoading.value = false;
  }
}

async function fetchVariantData() {
  isVariantLoading.value = true;
  try {
    // Bangun filter secara dinamis
    const requiredFilters: Record<string, any> = {
      group: [internalGroup.value]
    };

    if (selectedInternalBrand.value.length > 0) {
      // Langsung assign array-nya
      requiredFilters.brand = selectedInternalBrand.value;
    }
    if (selectedCategory.value.length > 0) {
      requiredFilters.category = selectedCategory.value;
    }

    // 3. Filter Sub Kategori
    if (selectedSubCategory.value.length > 0) {
      requiredFilters.sub_category = selectedSubCategory.value;
    }

    // 4. Filter Varian (Jaga-jaga jika user memfilter spesifik varian di header)
    if (selectedVariants.value.length > 0) {
      requiredFilters.varian = selectedVariants.value;
    }

    const [totalAdsData, topVarianData, trendVarianData, totalVariantsData] = await Promise.all([
      fetchData('total/ads', requiredFilters),
      fetchData('top/varian', requiredFilters),
      fetchData('trend/varian', requiredFilters),
      fetchData('total/varian', requiredFilters),
    ]);

    // Update kartu metrik varian
    variantMetricCards.value = [
      { title: 'Total Brand Ads Detected', value: totalAdsData?.total || 0, icon: 'mdi-food-variant', color: 'purple', trendData: [] },
      { title: 'Number of Brand Variants', value: totalVariantsData?.total || 0, icon: 'mdi-tag-multiple', color: 'purple', trendData: [] }
    ];

    carouselTotalValue.value = totalAdsData?.total || 0;

    const rawVariantsList = transformApiResponse(topVarianData);

    // Ambil video preview untuk tiap varian (tetap jalan baik single brand maupun all)
    const detailedVariants = await Promise.all(
      rawVariantsList.map(async (variant) => {
        let videoLink = '';
        try {
          // Kirim requiredFilters yang sudah berisi group (dan brand jika ada)
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

    // JANGAN langsung isi selectedInternalBrand.value di sini 
    // agar default-nya tetap null (menampilkan semua data)
  } catch (error) {
    console.error("Failed to fetch internal brand list:", error);
  }
}
watch(
  [
    startDate,
    endDate,
    selectedChannels,
    selectedInternalBrand,
    // Tambahkan ini:
    selectedCategory,
    selectedSubCategory,
    selectedVariants
  ],
  async () => {
    isGeneralLoading.value = true;
    isVariantLoading.value = true;

    await Promise.all([
      fetchGeneralData(),
      fetchVariantData()
    ]);

    isGeneralLoading.value = false;
    isVariantLoading.value = false;
  },
  { deep: true }
);


onMounted(async () => {
  isGeneralLoading.value = true;
  isVariantLoading.value = true;
  await Promise.all([
    fetchGeneralData(),
    fetchBrandFilterDropdown(),
    fetchVariantData()
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