<template>
  <div>
    <PageTitle title="Brandboard TV Ads Analysis" :show-channel-filter="true" class="mb-6" />
    <h2 class="text-h6 font-weight-bold mb-4">Overview & Ranking</h2>

    <v-row>
  <v-col cols="12" md="6">
    <v-row align="center" justify="center" class="mb-6">
      <v-col cols="12" md="3" class="d-flex justify-center justify-md-start">
        <v-img
          src="@/assets/images/tvc.jpg"
          max-width="200"
          contain
          alt="TVC Logo"
          class="rounded-lg"
        ></v-img>
      </v-col>

      <v-col cols="12" md="6">
        <v-row dense>
          <v-col 
            v-for="card in metricCards" 
            :key="card.title" 
            cols="12" 
            sm="6"
          >
            <MetricCard 
              :title="card.title" 
              :value="card.value" 
              :icon="card.icon" 
              :color="card.color" 
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="3" class="d-none d-md-block">
        </v-col>
    </v-row>
  </v-col>
  
  <v-col md="6" class="d-none d-md-block"></v-col>
</v-row>

    <HighlightsCarousel class="mt-6" :show-total="true" total-icon="mdi-domain" total-icon-color="primary"
      total-title="Our Corporate Ads" :total-value="corporateTotal" :items="corporateHighlights"
      @item-click="handleBrandClick" />

    <div class="d-flex flex-wrap align-center my-6 ga-8">
      <div class="text-subtitle-1 font-weight-bold">View Analysis By</div>
      <v-btn-toggle v-model="analysisTab" density="compact" divided>
        <v-btn value="top10" class="text-capitalize px-5" style="height: 38px;">Top 10</v-btn>
        <v-btn value="all" class="text-capitalize px-5" style="height: 38px;">All</v-btn>
        <v-btn value="bottom10" class="text-capitalize px-5" style="height: 38px;">Bottom 10</v-btn>
      </v-btn-toggle>
      <v-switch v-model="alwaysShowInternal" label="Always Show Our Company" color="primary" density="compact"
        hide-details class="grey-label"></v-switch>
      <v-spacer></v-spacer>
      <v-menu :close-on-content-click="false" location="bottom end">
        <template v-slot:activator="{ props }">
          <v-text-field v-bind="props" :model-value="categoryFilterText" density="compact" label="Select Category"
            variant="outlined" hide-details readonly prepend-inner-icon="mdi-filter-variant"
            style="max-width: 250px;"></v-text-field>
        </template>
        <v-card color="surface" width="300">
          <v-list density="compact">
            <v-list-item v-for="item in categoryItems" :key="item.value">
              <template v-slot:prepend>
                <v-checkbox-btn v-model="selectedCategories" :value="item.value" color="primary"></v-checkbox-btn>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>

    <v-row class="mt-0">
      <v-col cols="12" md="4">
        <TableCard title="Top Groups" :headers="['Name']" :rows="topGroups" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Brands" :headers="['Name']" :rows="topBrands" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Variants" :headers="['Name']" :rows="topVariants" />
      </v-col>
    </v-row>

    <div class="d-flex flex-wrap align-center my-6 ga-4">
      <div class="text-h6 font-weight-bold">General Distributions and Trends</div>
    </div>

    <v-row class="mt-6 mb-6 d-flex">
      <v-col cols="12" md="4">
        <PieChartCard title="General Corporation Pie" :data="corporationPieData" :has-legend="true"
          :is-loading="isLoading" />
      </v-col>
      <v-col cols="12" md="8">
        <LineChartCard title="Corporation Trends" :labels="lineChartLabels" :data="lineChartDatasets"
          :show-toggle="true" :toggle="lineChartToggle" @toggle-change="lineChartToggle = $event"
          :is-loading="isLoading" />
      </v-col>
    </v-row>

    <BarChartCard class="mb-6" title="General Corporation Brand distribution" :data="brandDistributionData"
      :segment-labels="brandDistributionSegments" :show-toggle="true" :toggle="barChartToggle"
      @toggle-change="barChartToggle = $event" :is-loading="isLoading" />
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


const appStore = useAppStore();
const {
  startDate,
  endDate,
  selectedChannels,
  selectedCategories,
  internalGroup,
  masterCategories,
} = storeToRefs(appStore);

const isLoading = ref(true);

// --- MODAL STATES ---
// 1. Modal Brand (Lama)
const showBrandModal = ref(false);
const selectedBrandData = ref<HighlightItem | null>(null);




const alwaysShowInternal = ref(false);

//--------video --------------
const brandVideos = ref<any[]>([]);
const isLoadingVideos = ref(false);

const activeVideo = computed<VideoAdItem | null>(() => {
  if (brandVideos.value && brandVideos.value.length > 0) {
    return brandVideos.value[0]; // Ambil video pertama (terbaru)
  }
  return null;
});

// --- UPDATE FUNGSI handleBrandClick ---
async function handleBrandClick(item: HighlightItem) {
  selectedBrandData.value = item;
  showBrandModal.value = true;

  // Reset data lama
  brandVideos.value = [];
  isLoadingVideos.value = true;

  try {
    // KUNCI LOGIKA: Kita kirim filter Group (dari Store) DAN Brand (dari item yang diklik)
    // apiBuilder akan menggabungkannya menjadi query string
    const specificFilter = {
      group: [internalGroup.value], // misal: "PT Unilever..."
      brand: [item.name] 			// misal: "Royco"
    };

    // Panggil endpoint /list/
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

// Helper untuk format tanggal dari "2025-12-01 06:49:48.400000" jadi lebih cantik
function formatDateTime(dateStr: string) {
  if (!dateStr) return '-';
  return moment(dateStr).format('DD MMM YYYY, HH:mm');
}

const metricCards = ref([
  {
    title: 'Total Brand Ads',
    value: '...',
    icon: 'mdi-chart-line',
    color: 'primary',
  },
  {
    title: 'Total Corporates',
    value: '...',
    icon: 'mdi-domain',
    color: 'primary',
  },
  { title: 'Total Brands', value: '...', icon: 'mdi-tag', color: 'primary' },
  {
    title: 'Total Brand Variants',
    value: '...',
    icon: 'mdi-tag-multiple',
    color: 'primary',
  },
]);
const corporateTotal = ref<number | string>('...');
const corporateHighlights = ref<HighlightItem[]>([]);
const rawTableTopGroups = ref<TableRow[]>([]);
const rawTableTopBrands = ref<TableRow[]>([]);
const rawTableTopVariants = ref<TableRow[]>([]);
const analysisTab = ref('top10');
const rawChartTopGroups = ref<TableRow[]>([]);
const rawChartTrendGroup = ref<TrendItem[]>([]);
const rawChartStackedGroupBrand = ref<StackedItem[]>([]);
const lineChartToggle = ref('top10');
const barChartToggle = ref('top10');
const categoryItems = computed(() =>
  masterCategories.value.map((name) => ({ title: name, value: name }))
);
const categoryFilterText = computed(() => {
  if (selectedCategories.value.length === 0) return 'All Categories';
  if (selectedCategories.value.length === 1) return selectedCategories.value[0];
  return `${selectedCategories.value.length} categories selected`;
});
const transformApiResponse = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    mention: item.total || 0,
  }));
};
const processTableData = (rawData: TableRow[], sortMode: string) => {
  if (!rawData || rawData.length === 0) return [];

  // 1. Salin data asli
  let dataCopy = [...rawData];

  // 2. Sorting Berdasarkan Mode
  // Kita urutkan berdasarkan mention (total)
  if (sortMode === 'bottom10') {
    dataCopy.sort((a, b) => Number(a.mention) - Number(b.mention));
  } else {
    // Default untuk 'top10' dan 'all' adalah urutan terbesar
    dataCopy.sort((a, b) => Number(b.mention) - Number(a.mention));
  }

  // 3. LOGIKA BARU: Tentukan berapa banyak data yang ditampilkan
  let displayList: TableRow[];
  
  if (sortMode === 'all') {
    // Jika "All", ambil semua data tanpa di-slice
    displayList = dataCopy;
  } else {
    // Jika "top10" atau "bottom10", ambil hanya 10 data
    displayList = dataCopy.slice(0, 10);
  }

  // 4. Logika "Always Show Our Company" 
  // Hanya dijalankan jika mode 'top10' dan switch aktif
  if (alwaysShowInternal.value && sortMode === 'top10') { 
    const internalItem = dataCopy.find(item => 
      item.name === internalGroup.value || 
      corporateHighlights.value.some(h => h.name === item.name)
    );
    
    if (internalItem && !displayList.some(d => d.name === internalItem.name)) {
      displayList[9] = internalItem;
    }
  }

  // 5. Penentuan Rank Visual dan isInternal
  return displayList.map((item, index) => {
    // Cari index asli di dataCopy untuk mendapatkan rank yang benar 
    // (terutama penting untuk mode 'all' dan 'bottom10')
    const actualRank = dataCopy.findIndex(d => d.name === item.name) + 1;

    return {
      ...item,
      rank: actualRank,
      mention: String(item.mention),
      isInternal: alwaysShowInternal.value && (
        item.name === internalGroup.value || 
        corporateHighlights.value.some(h => h.name === item.name)
      )
    };
  });
};
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
const topGroups = computed(() =>
  processTableData(rawTableTopGroups.value, analysisTab.value)
);
const topBrands = computed(() =>
  processTableData(rawTableTopBrands.value, analysisTab.value)
);
const topVariants = computed(() =>
  processTableData(rawTableTopVariants.value, analysisTab.value)
);
const corporationPieData = computed<PieChartItem[]>(() => {
  const top10 = [...rawChartTopGroups.value]
    .sort((a, b) => b.mention - a.mention)
    .slice(0, 10);
  return top10.map((item) => ({
    label: item.name,
    value: item.mention,
  }));
});
const lineChartFilteredGroupNames = computed<string[]>(() => {
  return processTableData(rawChartTopGroups.value, lineChartToggle.value).map(
    (g) => g.name
  );
});
const barChartFilteredGroupNames = computed<string[]>(() => {
  return processTableData(rawChartTopGroups.value, barChartToggle.value).map(
    (g) => g.name
  );
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
  if (filteredData.length === 0) {
    return { labels, datasets: [] };
  }
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
const barChartData = computed(() => {
  if (
    !rawChartStackedGroupBrand.value ||
    rawChartStackedGroupBrand.value.length === 0
  ) {
    return { data: [], segments: [] };
  }
  const filteredData = rawChartStackedGroupBrand.value.filter((item) =>
    barChartFilteredGroupNames.value.includes(item.group)
  );
  filteredData.sort((a, b) => {
    const indexA = barChartFilteredGroupNames.value.indexOf(a.group);
    const indexB = barChartFilteredGroupNames.value.indexOf(b.group);
    return indexA - indexB;
  });
  const allBrands = new Set<string>();
  for (const item of filteredData) {
    if (item.brand) {
      Object.keys(item.brand).forEach((brandName) => allBrands.add(brandName));
    }
  }
  const segments = [...allBrands].sort();
  const data = filteredData.map((groupItem) => {
    const values = segments.map((brandName) => {
      return groupItem.brand?.[brandName] || 0;
    });
    return {
      label: groupItem.group,
      values: values,
    };
  });
  return { data, segments };
});
const brandDistributionData = computed(() => barChartData.value.data);
const brandDistributionSegments = computed(() => barChartData.value.segments);
async function fetchGlobalData() {
  const internalFilter = { group: [internalGroup.value] };
  try {
    const [
      totalAds,
      totalGroups,
      totalBrands,
      totalVariants,
      totalAdsWithGroup,
      topBrandsWithGroup,
      chartTopGroupData,
      chartTrendGroupData,
      chartStackedGroupBrandData,
    ] = await Promise.all([
      fetchData('total/ads'),
      fetchData('total/group'),
      fetchData('total/brand'),
      fetchData('total/varian'),
      fetchData('total/ads', internalFilter),
      fetchData('top/brand', internalFilter),
      fetchData('top/group'),
      fetchData('trend/group'),
      fetchData('stacked/group/brand'),
    ]);
    metricCards.value = [
      {
        title: 'Total Brand Ads',
        value: totalAds?.total || 0,
        icon: 'mdi-chart-line',
        color: 'primary',
      },
      {
        title: 'Total Corporates',
        value: totalGroups?.total || 0,
        icon: 'mdi-domain',
        color: 'primary',
      },
      { title: 'Total Brands', value: totalBrands?.total || 0, icon: 'mdi-tag', color: 'primary' },
      {
        title: 'Total Brand Variants',
        value: totalVariants?.total || 0,
        icon: 'mdi-tag-multiple',
        color: 'primary',
      },
    ];
    corporateTotal.value = totalAdsWithGroup?.total || 0;
    if (topBrandsWithGroup && Array.isArray(topBrandsWithGroup)) {
      // HIT API LIST UNTUK MENDAPATKAN PREVIEW VIDEO SETIAP BRAND
      const highlightsWithVideos = await Promise.all(
        topBrandsWithGroup.map(async (brand: any) => {
          const name = brand.name || 'Unknown';
          
          // Ambil 1 video terbaru untuk preview di card
          let previewVideo = '';
          try {
            const videoRes = await fetchData('list', { 
              group: [internalGroup.value], 
              brand: [name] 
            });
            if (videoRes?.data?.length > 0) {
              previewVideo = videoRes.data[0].video_link;
            }
          } catch (e) {
            console.error(`Gagal ambil preview video untuk ${name}`);
          }

          const color = stringToColor(name);
          // (Keep SVG logic if needed for fallback)
          
          return {
            name,
            count: brand.total || 0,
            preview_video: previewVideo, // INI KUNCINYA
            logo: '', // Bisa dikosongkan jika pakai video
          };
        })
      );corporateHighlights.value = highlightsWithVideos;
    }
    rawChartTopGroups.value = transformApiResponse(chartTopGroupData);
    rawChartTrendGroup.value = chartTrendGroupData || [];
    rawChartStackedGroupBrand.value = chartStackedGroupBrandData || [];
  } catch (error) {
    console.error('Failed to update global data:', error);
    metricCards.value.forEach((card) => (card.value = 'Error'));
    corporateTotal.value = 'Error';
    corporateHighlights.value = [];
    rawChartTopGroups.value = [];
    rawChartTrendGroup.value = [];
    rawChartStackedGroupBrand.value = [];
  }
}
async function fetchTableData() {
  try {
    const [topGroupData, topBrandData, topVarianData] = await Promise.all([
      fetchData('top/group'),
      fetchData('top/brand'),
      fetchData('top/varian'),
    ]);
    rawTableTopGroups.value = transformApiResponse(topGroupData);
    rawTableTopBrands.value = transformApiResponse(topBrandData);
    rawTableTopVariants.value = transformApiResponse(topVarianData);
  } catch (error) {
    console.error('Failed to update table data:', error);
    rawTableTopGroups.value = [];
    rawTableTopBrands.value = [];
    rawTableTopVariants.value = [];
  }
}
watch(
  [startDate, endDate, selectedChannels],
  async () => {
    isLoading.value = true;
    try {
      await Promise.all([fetchGlobalData(), fetchTableData()]);
    } catch (error) {
      console.error('Error updating data on common filter change:', error);
    } finally {
      isLoading.value = false;
    }
  },
  { deep: true }
);
watch(
  [selectedCategories],
  async () => {
    try {
      await fetchTableData();
    } catch (error) {
      console.error('Error updating table data on category change:', error);
    }
  },
  { deep: true }
);
onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([fetchGlobalData(), fetchTableData()]);
  } catch (error) {
    console.error('Error on initial page load:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style>
.grey-label .v-label {
  color: #6c757d !important;
  opacity: 1;
}

.v-btn-toggle .v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

/* Styling untuk efek hover pada Metric Card */
.cursor-pointer {
  cursor: pointer;
}

.elevation-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.elevation-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.15) !important;
  z-index: 1;
}
</style>