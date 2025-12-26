<template>
  <div>
    <v-row class="">
      <v-col cols="12" md="7"> <v-sheet
          class="custom-banner h-100 pa-10 d-flex align-center overflow-hidden position-relative rounded-lg"
          elevation="1">
          <div class="circle-deco deco-1"></div>
          <div class="circle-deco deco-2"></div>

          <v-row align="center" class="position-relative" style="z-index: 2;">
            <v-col cols="12" sm="6" class="white--text">
              <h1 class="text-h3 font-weight-black mb-3 line-height-tight font-poppins"
                style="font-family: 'Poppins', sans-serif !important;">
                BRANDBOARD <br /><span class="text-gradient">TV ADS</span>
              </h1>
              <p class="text-body-1 mb-6 opacity-80 font-weight-light font-poppins"
                style="font-family: 'Poppins', sans-serif !important;">
                Analyze your performance and dominate the market with real-time TVC data tracking.
              </p>
            </v-col>

            <v-col cols="12" sm="6" class="d-flex justify-end">
              <v-img src="@/assets/images/tvc.png" max-width="450" width="100%" contain alt="TVC Illustration"
                class="floating-img mt-n4"></v-img>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>

      <v-col cols="12" md="5">

        <div class="d-flex align-center justify-center mt-6">
          <span class="text-h6 font-weight-bold text-high-emphasis">
            Top 3 Competitor Company
          </span>
        </div>

        <div class="flex-grow-1 d-flex align-center justify-center">
          <BrandCarousel :items="top3CorporateAds" />
        </div>
      </v-col></v-row>

    <h2 class="text-h6 font-weight-bold my-6 ga-8">Overview & Ranking</h2>
    <v-row align="stretch">

      <v-col cols="12" md="4">
        <v-row dense>
          <v-col v-for="card in metricCards" :key="card.title" cols="6">
            <MetricCard :title="card.title" :value="card.value" :icon="card.icon" :color="card.color"
              :trend-data="card.trendData" class="h-100" />
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="8">
        <HighlightsCarousel :items="myBrandHighlights" :total-items-count="rawInternalBrands.length"
          :is-loading-more="isFetchingMore" :total-value="corporateTotal" :show-modal="showBrandModal"
          :selected-item="selectedBrandData" :active-video="activeVideo" :is-loading-detail="isLoadingVideos"
          @close-modal="showBrandModal = false" @next-page="handleLoadMore" @item-click="handleBrandClick" />
      </v-col>
    </v-row>

    <div class="d-flex flex-wrap align-center my-6 ga-8">
      <div class="text-h6 font-weight-bold">View Analysis By</div>
      <v-btn-toggle v-model="analysisTab" density="compact" divided>
        <v-btn value="top10" class="text-capitalize px-5" style="height: 38px;">Top 10</v-btn>
        <v-btn value="all" class="text-capitalize px-5" style="height: 38px;">All</v-btn>
        <v-btn value="bottom10" class="text-capitalize px-5" style="height: 38px;">Bottom 10</v-btn>
      </v-btn-toggle>
      <v-switch v-model="alwaysShowInternal" label="Always Show Our Company" color="primary" density="compact"
        hide-details class="grey-label"></v-switch>
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


    <div class="text-h6 font-weight-bold my-6 ga-8">General Distributions and Trends</div>

    <v-row class="mt-6">
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
                {{ selectedGroupForDetail === 'ALL_DATA' ? 'All Corporations' : (selectedGroupForDetail || 'Select a Corporation') }}
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
    </v-row>

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
import HeatmapCard from '@/page-components/HeatmapCard.vue';
import BrandCarousel from '@/page-components/BrandCarousel.vue';
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
interface MetricCardItem {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trendData: number[];
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

//------------------corosel---------------
// Tambahkan state untuk kontrol pagination
const currentPageInternal = ref(0);
const pageSize = 3;
const isFetchingMore = ref(false);

async function handleLoadMore() {
  if (isFetchingMore.value) return;

  // Cek apakah kita sudah punya data di myBrandHighlights untuk page berikutnya
  // Index awal untuk page selanjutnya (misal page 1 dimulai dari index 3)
  const nextStartIndex = (currentPageInternal.value + 1) * pageSize;

  // Jika data lokal belum cukup untuk menampilkan page berikutnya, ambil dari API
  if (myBrandHighlights.value.length <= nextStartIndex && nextStartIndex < rawInternalBrands.value.length) {
    isFetchingMore.value = true;

    // Ambil data untuk batch berikutnya (3 item sekaligus)
    await fetchMoreInternalBrands(nextStartIndex, pageSize);

    currentPageInternal.value++;
    isFetchingMore.value = false;
  } else if (nextStartIndex < rawInternalBrands.value.length) {
    // Jika data sudah ada di myBrandHighlights (hasil load sebelumnya), 
    // cukup naikkan index page saja
    currentPageInternal.value++;
  }
}



// Tambahkan fungsi handler untuk heatmap
// Cari fungsi ini di script setup dan ubah isinya:

function handleHeatmapClick(item: any) {
  // LOGIKA BARU: Cek apakah item yang diklik SAMA dengan yang sedang dipilih sekarang?
  if (selectedGroupForDetail.value === item.groupName) {
    // Jika YA (diklik ulang), kosongkan variable agar Bar Chart hilang (Deselect)
    selectedGroupForDetail.value = '';
  } else {
    // Jika TIDAK (klik item baru), set nilainya seperti biasa
    selectedGroupForDetail.value = item.groupName;
  }
}

// Tambahkan computed property untuk memformat data ke Heatmap
const heatmapData = computed(() => {
  // Gunakan fungsi logic yang sudah ada untuk filter Top10/All/Bottom10
  const filteredGroups = processTableData(rawChartTopGroups.value, barChartToggle.value);

  // Bungkus ke dalam format yang diminta Heatmap: Array<{ label: string, details: HeatmapDetail[] }>
  return [{
    label: 'Corporations',
    details: filteredGroups.map(item => ({
      groupName: item.name,
      value: Number(item.mention)
    }))
  }];
});


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

const metricCards = ref<MetricCardItem[]>([
  {
    title: 'Total Brand Ads',
    value: '...',
    icon: 'mdi-chart-line',
    color: 'primary',
    trendData: []
  },
  {
    title: 'Total Corporates',
    value: '...',
    icon: 'mdi-domain',
    color: 'primary',
    trendData: []
  },
  { title: 'Total Brands', value: '...', icon: 'mdi-tag', color: 'primary', trendData: [] },
  {
    title: 'Total Brand Variants',
    value: '...',
    icon: 'mdi-tag-multiple',
    color: 'primary',
    trendData: []
  },
]);


//----------------Distribution & Ranking----------------
const selectedGroupForDetail = ref<string>('');
// 1. Ambil daftar nama group yang difilter & diurutkan berdasarkan toggle
const filteredGroupNamesForBar = computed(() => {
  if (!rawChartTopGroups.value || rawChartTopGroups.value.length === 0) return [];

  // Salin data mentah
  let dataCopy = [...rawChartTopGroups.value];

  // LOGIKA SORTING
  if (barChartToggle.value === 'bottom10') {
    // Urutkan dari yang TERKECIL ke terbesar
    dataCopy.sort((a, b) => Number(a.mention) - Number(b.mention));
  } else {
    // Default (Top 10 / All): Urutkan dari TERBESAR ke terkecil
    dataCopy.sort((a, b) => Number(b.mention) - Number(a.mention));
  }

  // LOGIKA LIMIT
  if (barChartToggle.value === 'all') {
    return dataCopy.map(item => item.name);
  } else {
    // Ambil 10 data pertama setelah diurutkan
    return dataCopy.slice(0, 10).map(item => item.name);
  }
});

// Ubah computed ini di dalam script setup Anda
const brandDistributionData = computed(() => {
  if (!rawChartStackedGroupBrand.value.length) return [];

  const groupNames = filteredGroupNamesForBar.value;

  return rawChartStackedGroupBrand.value
    .filter(item => groupNames.includes(item.group))
    .sort((a, b) => groupNames.indexOf(a.group) - groupNames.indexOf(b.group))
    .map((groupItem, index) => {
      // Hitung total mention untuk grup ini
      const totalMentions = Object.values(groupItem.brand || {}).reduce((acc, val) => acc + (val as number), 0);

      // Buat array values yang berisi 0 untuk semua posisi, 
      // kecuali pada indeks grup itu sendiri
      const values = new Array(groupNames.length).fill(0);
      values[index] = totalMentions;

      return {
        label: groupItem.group, // Nama di sumbu X
        values: values
      };
    });
});
// Cari bagian ini di script Anda dan ubah menjadi:
const brandDistributionSegments = computed(() => {
  // Mengambil daftar nama grup yang sudah difilter (Top 10/All/Bottom 10)
  return filteredGroupNamesForBar.value;
});

// Di Script Dashboard Utama
const detailedBarChartData = computed(() => {
  // 1. Cek data (sama seperti sebelumnya)
  if (!rawChartStackedGroupBrand.value || !selectedGroupForDetail.value) {
    return { data: [], segments: [] };
  }

  let brandMap: { [key: string]: number } = {};

  // 2. Logika pengambilan data (sama seperti sebelumnya)
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

  // 3. Sorting Top 20 (sama seperti sebelumnya)
  const brandsInGroup = Object.entries(brandMap)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  const brandNames = brandsInGroup.map(([name]) => name);
  const brandValues = brandsInGroup.map(([_, val]) => val);
  const count = brandNames.length;

  // --- BAGIAN INI TRIKNYA ---
  return {
    // 1. Masukkan semua nama brand ke segments agar LEGEND MUNCUL lengkap
    segments: brandNames,

    // 2. Buat data "Diagonal":
    //    Untuk batang ke-1 (misal: Royco), kita isi nilai di index 0, sisanya 0.
    //    Untuk batang ke-2 (misal: Clear), kita isi nilai di index 1, sisanya 0.
    //    Ini membuat efek visual batang terpisah tapi warnanya beda-beda.
    data: brandNames.map((name, index) => {
      // Buat array isi 0 semua sepanjang jumlah brand
      const emptySlots = new Array(count).fill(0);

      // Isi nilai asli HANYA di posisi index brand tersebut
      emptySlots[index] = brandValues[index];

      return {
        label: name,      // Label X-Axis
        values: emptySlots // Array nilai [10, 0, 0...] lalu [0, 20, 0...] dst
      };
    })
  };
});


const corporateTotal = ref<number | string>('...');
const corporateHighlights = ref<HighlightItem[]>([]);
const rawInternalBrands = ref<any[]>([]);
const myBrandHighlights = ref<any[]>([]);
const rawTableTopGroups = ref<TableRow[]>([]);
const rawTableTopBrands = ref<TableRow[]>([]);
const rawTableTopVariants = ref<TableRow[]>([]);
const analysisTab = ref('top10');
const rawChartTopGroups = ref<TableRow[]>([]);
const rawChartTrendGroup = ref<TrendItem[]>([]);
const rawChartStackedGroupBrand = ref<StackedItem[]>([]);
const lineChartToggle = ref('top10');
const barChartToggle = ref('top10');

const transformApiResponse = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    mention: item.total || 0,
  }));
};
const processTableData = (rawData: TableRow[], sortMode: string, type: 'group' | 'brand' | 'variant' = 'group') => {
  if (!rawData || rawData.length === 0) return [];

  // 1. Salin data asli
  let dataCopy = [...rawData];

  // 2. Sorting Berdasarkan Mode
  if (sortMode === 'bottom10') {
    dataCopy.sort((a, b) => Number(a.mention) - Number(b.mention));
  } else {
    dataCopy.sort((a, b) => Number(b.mention) - Number(a.mention));
  }

  // 3. Tentukan displayList
  let displayList: TableRow[];
  if (sortMode === 'all') {
    displayList = dataCopy;
  } else {
    displayList = dataCopy.slice(0, 10);
  }

  // 4. Logika "Always Show Our Company" (Hanya untuk mode top10)
  if (alwaysShowInternal.value && sortMode === 'top10') {
    // Cari item internal berdasarkan tipe
    const internalItem = dataCopy.find(item => {
      if (type === 'group') return item.name === internalGroup.value;
      // Untuk brand/variant, cek apakah ada di daftar brand milik internal
      return rawInternalBrands.value.some(b => b.name === item.name);
    });

    if (internalItem && !displayList.some(d => d.name === internalItem.name)) {
      displayList[9] = internalItem;
    }
  }

  // 5. Penentuan Rank dan isInternal (KUNCI PERBAIKAN)
  return displayList.map((item) => {
    const actualRank = dataCopy.findIndex(d => d.name === item.name) + 1;

    let isInternal = false;
    if (alwaysShowInternal.value) {
      if (type === 'group') {
        // Mark jika nama grup sesuai dengan internalGroup dari store
        isInternal = item.name === internalGroup.value;
      } else {
        // Mark jika nama brand/variant ada di daftar rawInternalBrands
        isInternal = rawInternalBrands.value.some(b => b.name === item.name);
      }
    }

    return {
      ...item,
      rank: actualRank,
      mention: String(item.mention),
      isInternal: isInternal // Flag untuk warna di table.vue
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
  processTableData(rawTableTopGroups.value, analysisTab.value, 'group')
);
const topBrands = computed(() =>
  processTableData(rawTableTopBrands.value, analysisTab.value, 'brand')
);
const topVariants = computed(() =>
  processTableData(rawTableTopVariants.value, analysisTab.value, 'variant')
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

const top3CorporateHighlights = computed(() => {
  return corporateHighlights.value.slice(0, 3);
});

const top3CorporateAds = computed(() => {
  return corporateHighlights.value.slice(0, 3);
});
const adsTrendData = ref<number[]>([]);
const groupsTrendData = ref<number[]>([]);
const brandsTrendData = ref<number[]>([]);
const variantsTrendData = ref<number[]>([]);

async function fetchGlobalData() {
  const internalFilter = { group: [internalGroup.value] };
  isLoading.value = true;

  try {
    const [
      totalAds,
      totalGroups,
      totalBrands,
      totalVariants,
      totalAdsWithGroup,
      chartTopGroupData,
      chartTrendGroupData,
      chartStackedGroupBrandData,
      internalBrandData
    ] = await Promise.all([
      fetchData('total/ads'),
      fetchData('total/group'),
      fetchData('total/brand'),
      fetchData('total/varian'),
      fetchData('total/ads', internalFilter),
      fetchData('top/group'),
      fetchData('trend/group'),
      fetchData('stacked/group/brand'),
      fetchData('top/brand', internalFilter),
    ]);

    if (chartTrendGroupData && Array.isArray(chartTrendGroupData)) {
      // 1. Pastikan dailyMap didefinisikan dengan tipe Record yang jelas
      const dailyMap: Record<string, number> = {};

      chartTrendGroupData.forEach((item: any) => {
        const d = item.date;
        if (!dailyMap[d]) dailyMap[d] = 0;
        // Gunakan Number() untuk memastikan nilai yang masuk adalah angka
        dailyMap[d] += (Number(item.total) || 0);
      });

      // 2. Tambahkan ": number[]" DAN "as number[]" di ujung map
      const sortedTrend: number[] = Object.keys(dailyMap)
        .sort()
        .map(date => dailyMap[date]) as number[]; // <--- Tambahkan 'as number[]' di sini

      // Sekarang bagian ini tidak akan merah lagi
      adsTrendData.value = sortedTrend;
      groupsTrendData.value = sortedTrend.map(v => Math.round(v / 10));
      brandsTrendData.value = [...sortedTrend].reverse();
      variantsTrendData.value = sortedTrend.map(v => Math.floor(Math.random() * v));
    }

    // Mapping ulang ke metricCards (Tidak akan merah lagi karena Interface MetricCardItem)
    metricCards.value = [
      {
        title: 'Total Brand Ads',
        value: totalAds?.total || 0,
        icon: 'mdi-chart-line',
        color: 'primary',
        trendData: adsTrendData.value
      },
      {
        title: 'Total Corporates',
        value: totalGroups?.total || 0,
        icon: 'mdi-domain',
        color: 'primary',
        trendData: groupsTrendData.value
      },
      {
        title: 'Total Brands',
        value: totalBrands?.total || 0,
        icon: 'mdi-tag',
        color: 'primary',
        trendData: brandsTrendData.value
      },
      {
        title: 'Total Brand Variants',
        value: totalVariants?.total || 0,
        icon: 'mdi-tag-multiple',
        color: 'primary',
        trendData: variantsTrendData.value
      },
    ]

    // D. UPDATE HIGHLIGHTS & LAINNYA
    corporateTotal.value = totalAdsWithGroup?.total || 0;

    // Logika Pagination Internal Brand
    if (internalBrandData && Array.isArray(internalBrandData)) {
      rawInternalBrands.value = internalBrandData;
      myBrandHighlights.value = [];
      currentPageInternal.value = 0;
      await fetchMoreInternalBrands(0, 3);
    }

    // Logika Top 3 Competitor
    if (chartTopGroupData && Array.isArray(chartTopGroupData)) {
      const top3Groups = [...chartTopGroupData]
        .sort((a: any, b: any) => (b.total || 0) - (a.total || 0))
        .slice(0, 3);

      corporateHighlights.value = await Promise.all(
        top3Groups.map(async (group: any) => {
          let previewVideo = '';
          try {
            const videoRes = await fetchData('list', { group: [group.name] });
            if (videoRes?.data?.length > 0) {
              previewVideo = videoRes.data[0].video_link;
            }
          } catch (e) { console.error(e); }
          return {
            name: group.name,
            count: group.total || 0,
            preview_video: previewVideo,
            logo: '',
          };
        })
      );
    }

    rawChartTopGroups.value = transformApiResponse(chartTopGroupData);
    rawChartTrendGroup.value = chartTrendGroupData || [];
    rawChartStackedGroupBrand.value = chartStackedGroupBrandData || [];

  } catch (error) {
    console.error('Gagal mengambil data global dashboard:', error);
  } finally {
    isLoading.value = false;
  }
}
// Perbaikan fungsi fetch batch agar lebih stabil
async function fetchMoreInternalBrands(startIndex: number, fetchLimit: number) {
  const nextBatch = rawInternalBrands.value.slice(startIndex, startIndex + fetchLimit);

  if (nextBatch.length === 0) return;

  const detailedBatch = await Promise.all(
    nextBatch.map(async (brand: any) => {
      let previewVideo = '';
      try {
        const videoRes = await fetchData('list', {
          group: [internalGroup.value],
          brand: [brand.name]
        });
        // Pastikan mengambil video_link dengan benar
        if (videoRes?.data && videoRes.data.length > 0) {
          previewVideo = videoRes.data[0].video_link;
        }
      } catch (e) {
        console.error(`Gagal load video untuk brand ${brand.name}:`, e);
      }

      return {
        name: brand.name,
        count: brand.total || 0,
        preview_video: previewVideo,
        logo: '',
      };
    })
  );

  myBrandHighlights.value.push(...detailedBatch);
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
    adsTrendData.value = [];
    currentPageInternal.value = 0; // RESET DISINI
    try {
      await Promise.all([fetchGlobalData(), fetchTableData()]);
    } catch (error) {
      console.error('Error updating data:', error);
    } finally {
      isLoading.value = false;
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
  color: rgb(var(--v-theme-on-surface)) !important;
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


/* Banner Styling */
.custom-banner {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
  border-radius: 16px !important;
  color: white !important;
  /* Tetap putih karena backgroundnya gelap */

}

.text-gradient {
  background: linear-gradient(to right, #ffffff, #a5c9fd);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Dekorasi Lingkaran */
.circle-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
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

/* Glassmorphism untuk Card */
.metric-glass-card {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 20px !important;
  transition: all 0.3s ease;
}

.metric-glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
  background: #ffffff !important;
}

.backdrop-blur {
  backdrop-filter: blur(10px);
}

/* Animasi Mengapung untuk Gambar */
.floating-img {
  animation: floating 3s ease-in-out infinite;
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.3));
}

@keyframes floating {
  0% {
    transform: translate(0, 0px);
  }

  50% {
    transform: translate(0, -15px);
  }

  100% {
    transform: translate(0, 0px);
  }
}

.line-height-tight {
  line-height: 1.1;
}

.font-poppins {
  font-family: 'Poppins', sans-serif !important;
}

/* Samakan dengan radius Banner dan Table */
.custom-empty-card {
  border-radius: 16px !important;
  /* HAPUS background-color: #ffffff !important; */
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.1),
    0px 4px 5px 0px rgba(0, 0, 0, 0.02),
    0px 1px 10px 0px rgba(0, 0, 0, 0.01) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  transition: box-shadow 0.3s ease;
}

/* Opsional: Jika ingin ada efek hover yang halus seperti card lainnya */
.custom-empty-card:hover {
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.08) !important;
}



/* Pastikan Banner juga menggunakan radius yang sama */
.custom-banner {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
  border-radius: 16px !important;
  /* Update dari 24px ke 16px agar sama */
  color: white !important;
}


.grid-card {
  transition: transform 0.3s ease;
}
</style>