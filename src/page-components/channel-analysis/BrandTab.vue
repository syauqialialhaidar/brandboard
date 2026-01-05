<template>
  <div>
    <div class="d-flex flex-wrap my-6 ga-4">
      <div class="text-h6 font-weight-bold">Filter Analysis by</div>
      <v-spacer></v-spacer>
      <v-sheet width="300" color="transparent">
        <v-select v-model="selectedLocalChannel" density="compact" label="Select Channel" variant="outlined"
          hide-details :items="masterChannels"></v-select>
      </v-sheet>
    </div>
    <v-row>
      <v-col v-for="(card, index) in metricCards" :key="card.title" cols="12" sm="6" md="3">
        <MetricCard :index="index" :title="card.title" :value="card.value" :icon="card.icon" :color="card.color"
          :trend-data="card.trendData || []" :labels="card.labels || []" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12">
        <BarChartCard title="Corporate & Brand in Channel" :data="corporateBrandData"
          :segment-labels="corporateBrandSegments" :is-loading="isLoading" :show-toggle="true" :toggle="barChartToggle"
          @toggle-change="barChartToggle = $event" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <PieChartCard title="Corporate Distribution in Channel" :data="corporatePieData" :has-legend="true"
          :is-loading="isLoading" />
      </v-col>
      <v-col cols="12" md="4">
        <PieChartCard title="Brand Distribution in Channel" :data="brandPieData" :has-legend="true"
          :is-loading="isLoading" />
      </v-col>
      <v-col cols="12" md="4">
        <PieChartCard title="Brand Variant Distribution in Channel" :data="variantPieData" :has-legend="true"
          :is-loading="isLoading" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <TableCard title="Top Corporates" :headers="['Rank', 'Corporation', 'Mention']" :rows="topCorporateData" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Brands" :headers="['Rank', 'Brand', 'Mention']" :rows="topBrandData" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Brand Variants" :headers="['Rank', 'Brand Variant', 'Mention']" :rows="topVariantData" />
      </v-col>
    </v-row>

    <v-row class="mt-2 mb-6">
      <v-col cols="12" md="6">
        <TableCard title="Top Brand Ambassador" :headers="['Rank', 'Ambassador', 'Brand', 'Mention']"
          :rows="topAmbassadorData" />
      </v-col>
      <v-col cols="12" md="6">
        <TableCard title="Top Program" :headers="['Rank', 'Program', 'Type', 'Channel', 'Mention']"
          :rows="topProgramData" />
      </v-col>
    </v-row>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import MetricCard from '@/page-components/MetricCard.vue';
import TableCard from '@/page-components/TableCard.vue';
import PieChartCard from '@/page-components/PieChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';

import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';
import { fetchData } from '@/utils/apiBuilder';

// --- Interfaces ---
interface TableRow {
  name: string;
  mention: number;
  rank?: number;
  [key: string]: any;
}
interface PieChartItem {
  label: string;
  value: number;
}
interface StackedItem {
  [key: string]: { [key: string]: number } | number | string;
  total: number;
  group: string;
}
interface AmbassadorRow {
  name: string;
  ambassador: string;
  brand: string;
  mention: number;
  rank?: number;
}
interface MetricCardItem {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  trendData: number[];
  labels: string[];
}

// --- Store ---
const appStore = useAppStore();
const {
  startDate,
  endDate,
  selectedChannels,
} = storeToRefs(appStore);

// --- State ---
const isLoading = ref(true);
const masterChannels = ref<string[]>([]);
const selectedLocalChannel = ref<string | null>(null);
const barChartToggle = ref('top10');

const metricCards = ref<MetricCardItem[]>([
  { title: 'Total Ads', value: '...', icon: 'mdi-chart-line', trendData: [], labels: [] },
  { title: 'Total Corporates', value: '...', icon: 'mdi-domain', trendData: [], labels: [] },
  { title: 'Total Brands', value: '...', icon: 'mdi-tag', trendData: [], labels: [] },
  { title: 'Total Brand Variants', value: '...', icon: 'mdi-tag-multiple', trendData: [], labels: [] },
]);

// --- Raw Data Refs ---
const rawStackedGroupBrand = ref<StackedItem[]>([]);
const rawTopGroup = ref<TableRow[]>([]);
const rawTopBrand = ref<TableRow[]>([]);
const rawTopVarian = ref<TableRow[]>([]);
const rawTopAmbassador = ref<AmbassadorRow[]>([]);

// --- Helpers ---

// Generic transform for simple { name, total } -> { name, mention }
const transformSimpleTop = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    mention: item.total || 0,
  }));
};

// Specific transform for Top Corporates Table
const transformGroupResponse = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    corporation: item.name,
    mention: item.total || 0,
  }));
};

// Specific transform for Top Brands Table
const transformBrandResponse = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    brand: item.name,
    mention: item.total || 0,
  }));
};

// Specific transform for Top Brand Variants Table
const transformVarianResponse = (data: any[]): TableRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    "brand variant": item.name,
    mention: item.total || 0,
  }));
};

// Specific transform for Ambassador Table
const transformAmbassadorResponse = (data: any[]): AmbassadorRow[] => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    ambassador: item.name,
    brand: '',
    mention: item.total || 0,
  }));
};

const toPieData = (data: TableRow[]): PieChartItem[] => {
  return data.map(item => ({ label: item.name, value: item.mention }));
};

// Helper for Top 9 + Others Pie Slices
const processPieData = (data: TableRow[]): PieChartItem[] => {
  if (!data || data.length === 0) return [];

  const sortedData = [...data].sort((a, b) => b.mention - a.mention);

  if (sortedData.length <= 10) {
    return toPieData(sortedData);
  }

  const top9 = sortedData.slice(0, 9);
  const others = sortedData.slice(9);

  const othersTotal = others.reduce((acc, item) => acc + item.mention, 0);

  const pieData = toPieData(top9);
  if (othersTotal > 0) {
    pieData.push({ label: 'Others', value: othersTotal });
  }

  return pieData;
};

const rankData = (data: any[]) => {
  return data.map((item, index) => ({ ...item, rank: index + 1 }));
};

// Helper function from general-analysis to support bar chart filtering
const processTableData = (rawData: TableRow[], sortMode: string) => {
  if (!rawData) return [];
  const sorted = [...rawData];

  if (sortMode === 'top10') {
    sorted.sort((a, b) => b.mention - a.mention);
    return sorted.slice(0, 10);
  }
  if (sortMode === 'bottom10') {
    sorted.sort((a, b) => a.mention - b.mention);
    return sorted.slice(0, 10);
  }
  sorted.sort((a, b) => b.mention - a.mention);
  return sorted;
};

// --- Computed: Bar Chart ---
// Create raw data for the filter toggle
const barChartRawDataForFilter = computed<TableRow[]>(() => {
  return rawStackedGroupBrand.value.map(item => ({
    name: item.group as string,
    mention: item.total || 0
  }));
});

// Get the list of filtered group names
const barChartFilteredGroupNames = computed<string[]>(() => {
  return processTableData(barChartRawDataForFilter.value, barChartToggle.value).map(g => g.name);
});

const corporateBrandChartData = computed(() => {
  if (!rawStackedGroupBrand.value || rawStackedGroupBrand.value.length === 0) {
    return { data: [], segments: [] };
  }

  // Filter the data based on the toggle
  const filteredData = rawStackedGroupBrand.value.filter(item =>
    barChartFilteredGroupNames.value.includes(item.group as string)
  );

  // Sort the filtered data to match the toggle's order (Top 10, Bottom 10)
  filteredData.sort((a, b) => {
    const indexA = barChartFilteredGroupNames.value.indexOf(a.group as string);
    const indexB = barChartFilteredGroupNames.value.indexOf(b.group as string);
    return indexA - indexB;
  });

  const allSegments = new Set<string>();
  for (const item of filteredData) {
    if (item.brand) {
      Object.keys(item.brand).forEach(name => allSegments.add(name));
    }
  }
  const segments = [...allSegments].sort();

  const data = filteredData.map(item => {
    const values = segments.map(name => {
      return (item.brand as { [key: string]: number })?.[name] || 0;
    });
    return {
      label: item.group as string,
      values: values
    };
  });
  return { data, segments };
});

const corporateBrandData = computed(() => corporateBrandChartData.value.data);
const corporateBrandSegments = computed(() => corporateBrandChartData.value.segments);

// --- Computed: Pies ---
const corporatePieData = computed(() => processPieData(rawTopGroup.value));
const brandPieData = computed(() => processPieData(rawTopBrand.value));
const variantPieData = computed(() => processPieData(rawTopVarian.value));

// --- Computed: Tables ---
const topCorporateData = computed(() => rankData(rawTopGroup.value));
const topBrandData = computed(() => rankData(rawTopBrand.value));
const topVariantData = computed(() => rankData(rawTopVarian.value));
const topAmbassadorData = computed(() => rankData(rawTopAmbassador.value));
const topProgramData = computed(() => []);

// --- Data Fetching ---
async function fetchChannelDropdown() {
  try {
    const channelData = await fetchData('top/channel');
    const transformed = transformSimpleTop(channelData);
    masterChannels.value = transformed.map(c => c.name);
    if (masterChannels.value.length > 0) {
      selectedLocalChannel.value = masterChannels.value[0] ?? null;
    }
  } catch (error) {
    console.error("Failed to fetch channel list:", error);
  }
}

async function fetchAllData() {
  if (!selectedLocalChannel.value) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  const localFilter = { channel: [selectedLocalChannel.value] };

  try {
    const [
      totalAds, totalGroup, totalBrand, totalVarian,
      stackedGroupBrand,
      topGroup, topBrand, topVarian,
      topAmbassador,
      trendDataRaw
    ] = await Promise.all([
      fetchData('total/ads', localFilter),
      fetchData('total/group', localFilter),
      fetchData('total/brand', localFilter),
      fetchData('total/varian', localFilter),
      fetchData('stacked/group/brand', localFilter),
      fetchData('top/group', localFilter),
      fetchData('top/brand', localFilter),
      fetchData('top/varian', localFilter),
      fetchData('top/brand_ambassador', localFilter),
      fetchData('trend/group', localFilter),
    ]);

    // OLAH TREND DATA (Berdasarkan Tanggal)
    // Pastikan tipe data variabel sudah didefinisikan sebagai number[]
    let processedTrend: number[] = [];
    let processedLabels: string[] = []; // Array untuk tanggal

    if (trendDataRaw && Array.isArray(trendDataRaw)) {
      const dailyMap: Record<string, number> = {};

      trendDataRaw.forEach((item: any) => {
        const d = String(item.date);
        if (!dailyMap[d]) dailyMap[d] = 0;
        dailyMap[d] += (Number(item.total) || 0);
      });

      // Ambil tanggal yang sudah urut
      const sortedDates = Object.keys(dailyMap).sort();
      
      processedLabels = sortedDates.map(date => {
        // Opsional: Format tanggal agar lebih pendek, misal "2024-01-01" jadi "01 Jan"
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      });

      processedTrend = sortedDates.map((date) => dailyMap[date] as number);
    }

    // UPDATE METRIC CARDS DENGAN WARNA DINAMIS (color dikosongkan agar pakai index)
    metricCards.value = [
      {
        title: 'Total Ads',
        value: totalAds?.total || 0,
        icon: 'mdi-chart-line',
        trendData: processedTrend,
        labels: processedLabels
      },
      {
        title: 'Total Corporates',
        value: totalGroup?.total || 0,
        icon: 'mdi-domain',
        trendData: [...processedTrend].reverse(), // Variasi visual
        labels: processedLabels
      },
      {
        title: 'Total Brands',
        value: totalBrand?.total || 0,
        icon: 'mdi-tag',
        trendData: processedTrend.map(v => Math.floor(v * 0.8)),
        labels: processedLabels
      },
      {
        title: 'Total Brand Variants',
        value: totalVarian?.total || 0,
        icon: 'mdi-tag-multiple',
        trendData: processedTrend,
        labels: processedLabels
      },
    ];

    rawStackedGroupBrand.value = stackedGroupBrand || [];
    rawTopGroup.value = transformGroupResponse(topGroup);
    rawTopBrand.value = transformBrandResponse(topBrand);
    rawTopVarian.value = transformVarianResponse(topVarian);
    rawTopAmbassador.value = transformAmbassadorResponse(topAmbassador);

  } catch (error) {
    console.error("Failed to fetch brand tab data:", error);
  } finally {
    isLoading.value = false;
  }
}

// --- Watchers ---
watch(
  [startDate, endDate, selectedChannels],
  async () => {
    await fetchAllData();
  },
  { deep: true }
);

watch(selectedLocalChannel, async (newChannel) => {
  if (!newChannel) return;
  await fetchAllData();
});

// --- Initial Load ---
onMounted(async () => {
  isLoading.value = true;
  await fetchChannelDropdown();
});

</script>
