<template>
  <v-container fluid class="pa-0">
    <PageTitle title="External Analysis" exclude-internal
      :enabled-filters="['channel', 'group', 'brand', 'variants', 'kategori', 'sub_kategori']"
      @update:filter="handleFilterUpdate" />

    <div>
      <v-row class="mb-2">
        <v-col v-for="(card, i) in externalMetricCards" :key="card.title" cols="12" sm="6" md="3">
          <MetricCard :title="card.title" :value="card.value" :icon="card.icon" :index="i" :trend-data="card.trendData"
            :labels="card.labels" />
        </v-col>
      </v-row>

      <div class="d-flex align-center mb-4 ga-2">
        <div class="text-h5 font-weight-bold">Brand and Variants Distribution</div>
      </div>

      <v-row class="d-flex mb-4">
        <v-col cols="12" md="4">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4 d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-bold">Top 10 Brand Distribution</div>
              <v-btn-toggle v-model="brandDistType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
              </v-btn-toggle>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <PieChartCard v-if="brandDistType === 'pie'" title="" :data="externalPieData" :has-legend="true"
                :is-loading="isLoading" />
              
              <BarChartCard v-else title="" 
                :data="[{ label: 'Mentions', values: externalPieData.map(d => d.value) }]" 
                :segment-labels="externalPieData.map(d => d.label)"
                :is-loading="isLoading" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4">
              <div class="text-subtitle-1 font-weight-bold">Brand Trends</div>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <LineChartCard title="" :labels="brandTrendLabels" :data="externalLineData"
                :is-loading="isLoading" />
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2 mb-4 d-flex">
        <v-col cols="12" md="4">
          <TableCard title="Brand Ranking" :headers="['Brand']" :rows="brandRankingData" :per-page="5" class="h-100 rounded-xl" />
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
            <div class="pa-4 d-flex align-center justify-space-between">
              <div class="text-subtitle-1 font-weight-bold">Brand Variants Distribution</div>
              <v-btn-toggle v-model="variantDistType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
              </v-btn-toggle>
            </div>
            <v-divider />
            <div class="pa-4 flex-grow-1">
              <BarChartCard v-if="variantDistType === 'bar'" title="" 
                :data="variantDistributionData"
                :segment-labels="variantDistributionSegments" 
                :is-loading="isLoading" 
                :is-stacked="true"/>
              
              <PieChartCard v-else title="" 
                :data="variantDistributionData.map(d => ({ 
                  label: d.label, 
                  value: d.values.reduce((a, b) => a + b, 0) 
                }))"
                :has-legend="true" 
                :is-loading="isLoading" />
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-6" align="stretch">
        <v-col cols="12" md="4">
          <TableCard title="Brand Variant Data" :headers="['Brand Variant']" :rows="variantRankingData" :per-page="5" class="h-100 rounded-xl" />
        </v-col>
        <v-col cols="12" md="8">
          <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
             <div class="pa-4">
               <div class="text-subtitle-1 font-weight-bold">Brand Variant Trends</div>
             </div>
             <v-divider />
             <div class="pa-4 flex-grow-1">
               <LineChartCard title="" :labels="variantTrendLabels" :data="variantTrendData"
                 :is-loading="isLoading" />
             </div>
          </v-card>
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

      <!-- <div class="d-flex align-center mb-4 ga-2">
        <div class="text-h5 font-weight-bold">Media and Audience</div>
      </div>

      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <TableMinim title="Top Program" :headers="['Name', 'Channel']" :rows="topPrograms" :per-page="5"
            class="h-100 rounded-xl" />
        </v-col>
        <v-col cols="12" md="6">
          <TableMinim title="Top Brand Ambasador" :headers="['Name']" :rows="topBrandAmbasador" view-mode="minimal" :per-page="5"
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

        
      </v-row> -->

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
import TableMinim from '@/page-components/TableMinim.vue';

// --- Interfaces ---
interface HighlightItem { logo: string; name: string; count: number | string; preview_video?: string; }
interface TableRow { name: string; mention: number; rank?: number; }
interface PieChartItem { label: string; value: number; }
interface TrendItem { total: number; brand: string; date: string; }
interface TrendVarianItem { total: number; varian: string; date: string; }
interface StackedItem { varian: { [key: string]: number }; total: number; brand: string; }
interface DateRange { labels: string[]; apiDates: string[]; }
interface MetricCardItem { title: string; value: string | number; icon: string; trendData: number[]; labels: string[]; }


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

// --- State Management ---
const appStore = useAppStore();
const { 
  startDate, 
  endDate, 
  internalGroup, 
  externalGroups // <--- Tinggal ambil dari sini
} = storeToRefs(appStore);

const isLoading = ref(true);
const masterExternalGroups = ref<string[]>([]);

const showModal = ref(false);
const selectedItem = ref<any>(null);
const videoList = ref<any[]>([]);
const isVideoLoading = ref(false);

const rawGlobalBrands = ref<HighlightItem[]>([]);
const isBrandsLoading = ref(false);

const brandMentionsHighlights = ref<HighlightItem[]>([]);
const brandMentionsTotalValue = ref<number | string>(0);
const brandMentionsCount = ref<number>(0);

//--TOGGLE FILTERS--
const brandDistType = ref('pie');   
const variantDistType = ref('bar'); 
// Media & Audience Toggles
const genderChartType = ref('pie');
const ageChartType = ref('bar');
const locationChartType = ref('pie');
const timezoneChartType = ref('pie');
const scopeChartType = ref('bar');



//--- Filter States ---
const selectedExternalGroup = ref<string[]>([]);
const selectedBrand = ref<string[]>([]);
const selectedCategory = ref<string[]>([]);
const selectedSubCategory = ref<string[]>([]);
const selectedVariants = ref<string[]>([]);
// Fungsi untuk menangkap data dari PageTitle
const handleFilterUpdate = (newFilters: any) => {
  if (newFilters.channel) appStore.selectedChannels = newFilters.channel;
  
  // Jika User mengganti Grup Kompetitor, reset brand/kategori sebelumnya
  if (newFilters.group) {
     selectedExternalGroup.value = newFilters.group;
     // Reset filter bawahannya agar tidak ada brand 'nyasar' dari grup sebelumnya
     selectedBrand.value = [];
     selectedCategory.value = [];
     selectedSubCategory.value = [];
     selectedVariants.value = [];
  }

  if (newFilters.brand) selectedBrand.value = newFilters.brand;
  if (newFilters.kategori) selectedCategory.value = newFilters.kategori;
  if (newFilters.sub_kategori) selectedSubCategory.value = newFilters.sub_kategori;
  if (newFilters.variants) selectedVariants.value = newFilters.variants;
};

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

// --- Logic & Actions ---
async function fetchGlobalCompetitorBrands() {
  isBrandsLoading.value = true;
  try {
    // Ambil data dengan filter exclude internal langsung dari API jika memungkinkan
    const allBrandsRaw = await fetchData('top/brand', {
      exclude_group: [internalGroup.value]
    });

    const transformed = transformApiResponse(allBrandsRaw);

    rawGlobalBrands.value = transformed.map(brand => ({
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
    // Tambahkan exclude_group agar brand internal tidak masuk ke carousel
    const topBrandsRaw = await fetchData('top/brand', {
      exclude_group: [internalGroup.value]
    });

    const transformed = transformApiResponse(topBrandsRaw);
    const totalMentions = transformed.reduce((acc, curr) => acc + (Number(curr.mention) || 0), 0);

    brandMentionsHighlights.value = transformed.map(brand => ({
      name: brand.name,
      count: brand.mention,
      logo: createLogo(brand.name),
      preview_video: ''
    }));

    brandMentionsTotalValue.value = totalMentions;
    brandMentionsCount.value = transformed.length;
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
  // { title: 'Total Spanding', value: '...', icon: 'mdi-cash-multiple', trendData: [], labels: [] },
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
  isVideoLoading.value = true;
  
  try {
    const response = await fetchData('list', {
      exclude_group: [internalGroup.value], // Menjamin video yang muncul bukan video kita
      varian: [item.name]
    });
    if (response?.data) videoList.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    isVideoLoading.value = false;
  }
}

async function fetchOverallExternalData() {
  // Gunakan logika yang sama: Pilih Spesifik atau Exclude Internal
  const metricFilter: Record<string, any> = {};
  
  if (selectedExternalGroup.value && selectedExternalGroup.value.length > 0) {
      metricFilter.group = selectedExternalGroup.value;
  } else {
      metricFilter.exclude_group = [internalGroup.value];
  }

  try {
    const [
      industryAds, industryBrands, industryVariants, industryCategories, industryTrend,
      // HAPUS request data internal (myAds, myBrands, dll) karena tidak dipakai
    ] = await Promise.all([
      fetchData('total/ads', metricFilter),
      fetchData('total/brand', metricFilter),
      fetchData('total/varian', metricFilter),
      fetchData('total/category', metricFilter),
      fetchData('trend/brand', metricFilter),
    ]);// Proses Trend tanpa pengurangan manual
    let processedTrend: number[] = [];
    let processedLabels: string[] = [];
    
    if (industryTrend && Array.isArray(industryTrend)) {
        const dailyMap: Record<string, number> = {};
        industryTrend.forEach((item: any) => {
            const d = String(item.date);
            dailyMap[d] = (dailyMap[d] || 0) + (Number(item.total) || 0);
        });
        const sortedDates = Object.keys(dailyMap).sort();
        processedLabels = sortedDates.map(d => moment(d).format('DD MMM'));
        processedTrend = sortedDates.map(d => dailyMap[d] || 0);
    }overallMetricCards.value = [
      { title: 'Total External Ads', value: industryAds?.total || 0, icon: 'mdi-chart-line', trendData: processedTrend, labels: processedLabels },
      { title: 'Total Competitor Brands', value: industryBrands?.total || 0, icon: 'mdi-tag', trendData: processedTrend.map(v => Math.ceil(v / 5)), labels: processedLabels },
      { title: 'Total Variants', value: industryVariants?.total || 0, icon: 'mdi-tag-multiple', trendData: processedTrend.map(v => Math.ceil(v / 2)), labels: processedLabels },
      { title: 'Total Category', value: industryCategories?.total || 0, icon: 'mdi-shape-outline', trendData: processedTrend.map(v => Math.ceil(v / 10)), labels: processedLabels },
    ];
  } catch (error) {
    console.error(error);
  }
}

// Di dalam fetchGroupFilterDropdown
async function fetchGroupFilterDropdown() {
  // Tidak perlu fetch API lagi, karena sudah ada di Store
  masterExternalGroups.value = externalGroups.value; 
}
async function initializeDefaultFilters(groups: string[]) {
  const filterParams = { group: groups };
  
  try {
    const [brands, categories, subCategories, variants] = await Promise.all([
      fetchData('top/brand', filterParams),
      fetchData('top/category', filterParams),
      fetchData('top/sub_category', filterParams),
      fetchData('top/varian', filterParams)
    ]);

    // Isi state selected dengan semua value yang didapat dari API
    if (brands) selectedBrand.value = brands.map((b: any) => b.name);
    if (categories) selectedCategory.value = categories.map((c: any) => c.name);
    if (subCategories) selectedSubCategory.value = subCategories.map((s: any) => s.name);
    if (selectedVariants.value.length === 0 && variants) {
       selectedVariants.value = variants.map((v: any) => v.name);
    }
  } catch (error) {
    console.error("Gagal inisialisasi default filters:", error);
  }
}

async function fetchAllData() {
  isLoading.value = true;
  
  const dynamicFilter: Record<string, any> = {};

  if (selectedExternalGroup.value && selectedExternalGroup.value.length > 0) {
     dynamicFilter.group = selectedExternalGroup.value;
  } else {
     dynamicFilter.exclude_group = [internalGroup.value];
  }

  if (selectedBrand.value.length > 0) dynamicFilter.brand = selectedBrand.value;
  if (selectedCategory.value.length > 0) dynamicFilter.category = selectedCategory.value;
  if (selectedSubCategory.value.length > 0) dynamicFilter.sub_category = selectedSubCategory.value;
  if (selectedVariants.value.length > 0) dynamicFilter.varian = selectedVariants.value;

  try {
    const [
      totalAds, totalBrands, totalVariants,
      topBrandData, trendBrandData, stackedBrandVarianData,
      topVarianRaw, trendVarianData
    ] = await Promise.all([
      fetchData('total/ads', dynamicFilter),
      fetchData('total/brand', dynamicFilter),
      fetchData('total/varian', dynamicFilter),
      fetchData('top/brand', dynamicFilter),
      fetchData('trend/brand', dynamicFilter),
      fetchData('stacked/brand/varian', dynamicFilter),
      fetchData('top/varian', dynamicFilter),
      fetchData('trend/varian', dynamicFilter),
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
      // { title: 'Total Spanding', value: '...', icon: 'mdi-cash-multiple', trendData: processedTrend.map(v => v * 100), labels: processedLabels },
    ];

    rawTopBrand.value = transformApiResponse(topBrandData);
    rawTrendBrand.value = trendBrandData || [];
    rawStackedBrandVarian.value = stackedBrandVarianData || [];
    rawTrendVarian.value = trendVarianData || [];

    const rawVariantsList = transformApiResponse(topVarianRaw);
    rawTopVarian.value = await Promise.all(rawVariantsList.map(async (variant) => {
      let videoLink = '';
      try {
        // Buat objek filter video secara eksplisit
        const videoFilter: Record<string, any> = {
          varian: [variant.name]
        };

        // Hanya masukkan group jika ada isinya
        if (selectedExternalGroup.value && selectedExternalGroup.value.length > 0) {
          videoFilter.group = selectedExternalGroup.value;
        } else {
          // Jika kosong, gunakan exclude_group agar konsisten dengan data dashboard
          videoFilter.exclude_group = [internalGroup.value];
        }

        const res = await fetchData('list', videoFilter);
        if (res?.data?.length > 0) videoLink = res.data[0].video_link;
      } catch (e) {
        console.error("Gagal load video link:", e);
      }
      return { ...variant, preview_video: videoLink, logo: createLogo(variant.name) };
    }));
  } catch (error) { console.error(error); } finally { isLoading.value = false; }
}
watch(
  [
    startDate,
    endDate,
    selectedExternalGroup,
    selectedBrand,
    selectedCategory,
    selectedSubCategory,
    selectedVariants
  ],
  async () => {
    // Menjalankan ulang semua fetcher saat ada perubahan filter
    await Promise.all([
      fetchOverallExternalData(),
      fetchAllData(),
      fetchBrandHighlightsData(),
      fetchGlobalCompetitorBrands()
    ]);
  },
  { deep: true }
);
onMounted(async () => {
  isLoading.value = true;
  
  // 1. Siapkan data dropdown (ambil dari store/API)
  await fetchGroupFilterDropdown(); 

  // 2. HAPUS langkah ini! Biarkan filter kosong secara default.
  // await initializeDefaultFiltersWithExclusion(); <--- SUMBER MASALAH URL KEPANJANGAN

  // 3. Jalankan penarikan data utama
  await Promise.all([
    fetchAllData(), 
    fetchOverallExternalData(), // Pastikan ini juga mengikuti logika dynamicFilter jika perlu
    fetchBrandHighlightsData(),
    fetchGlobalCompetitorBrands()
  ]);

  isLoading.value = false;
});
</script>