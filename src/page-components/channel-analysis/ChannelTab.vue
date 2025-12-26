<template>
  <div>
    <v-row class="mt-2">
      <v-col v-for="card in metricCards" :key="card.title" cols="12" sm="6" md="3">
  <MetricCard 
    :title="card.title" 
    :value="card.value" 
    :icon="card.icon" 
    :color="card.color"
    :trend-data="card.trendData" 
  />
</v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <PieChartCard title="Channel Distribution" :data="channelPieData" :has-legend="true" :is-loading="isLoading" />
      </v-col>
      <v-col cols="12" md="8">
        <LineChartCard title="Channel Trends" :labels="channelTrendLabels" :data="channelTrendData"
          :is-loading="isLoading" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <HeatmapCard title="Channel & Corporate" :data="channelCorporateData" :is-loading="isLoading" />
      </v-col>
      <v-col cols="12" md="6">
        <BarChartCard title="Total Mention per Channel" :data="channelSimpleBarData" :segment-labels="['Mentions']"
          :is-loading="isLoading" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <BubbleChartCard title="Channel & Brand" :data="channelBrandBubbleData" :is-loading="isLoading" />
      </v-col>

      <v-col cols="12" md="6">
        <BarChartCard title="Total Brands per Channel" :data="channelTotalBrandBarData"
          :segment-labels="['Total Brands']" :is-loading="isLoading" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <TableCard title="Channel Ranking" :headers="['Rank', 'Channel', 'Total Program', 'Mention']"
          :rows="channelRankingData" />
      </v-col>
      <v-col cols="12" md="6">
        <TableCard title="Top Program" :headers="['Rank', 'Program', 'Type', 'Channel', 'Mention']" :rows="[]" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="3">
        <PieChartCard title="Program Type" :data="adsTypeData" :has-legend="true" :is-loading="isLoading" />
      </v-col>
      <v-col cols="12" md="3">
        <PieChartCard title="Program Scope" :data="[]" :has-legend="true" :is-loading="isLoading" />
      </v-col>
      <v-col cols="12" md="3">
        <PieChartCard title="Audience Gender" :data="[]" :has-legend="true" :is-loading="isLoading" />
      </v-col>
      <v-col cols="12" md="3">
        <PieChartCard title="Audience Age" :data="[]" :has-legend="true" :is-loading="isLoading" />
      </v-col>
    </v-row>

    <v-row class="mt-2 mb-6">
      <v-col cols="12">
        <TableCard title="Top Brand Ambassador" :headers="['Rank', 'Ambassador', 'Brand', 'Mention']"
          :rows="topAmbassadorData" />
      </v-col>
    </v-row>
  </div>
</template>


<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import moment from 'moment';

// Components
import MetricCard from '@/page-components/MetricCard.vue';
import TableCard from '@/page-components/TableCard.vue';
import PieChartCard from '@/page-components/PieChartCard.vue';
import LineChartCard from '@/page-components/LineChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';
import HeatmapCard from '../HeatmapCard.vue';
import BubbleChartCard from '../BubbleChartCard.vue';

// Utils & Stores
import { generateBrightColors } from '@/utils/colors';
import { useAppStore } from '@/stores/app';
import { fetchData } from '@/utils/apiBuilder';

// Interfaces
interface TableRow {
  name: string;
  mention: number;
  rank?: number;
}
interface ChannelRow {
  name: string;
  channel: string;
  "total program": number;
  mention: number;
  rank?: number;
}
interface AmbassadorRow {
  name: string;
  ambassador: string;
  brand: string;
  mention: number;
  rank?: number;
}


interface TrendItem { total: number; channel: string; date: string; }
interface StackedItem { [key: string]: any; total: number; channel: string; }

interface MetricCardItem {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trendData: number[];
}

const appStore = useAppStore();
const { startDate, endDate, selectedChannels } = storeToRefs(appStore);
const isLoading = ref(true);
const rawTopChannel = ref<ChannelRow[]>([]);
const rawTrendChannel = ref<TrendItem[]>([]);
const rawStackedChannelGroup = ref<StackedItem[]>([]);
const rawStackedChannelBrand = ref<StackedItem[]>([]);
const rawAdsType = ref<TableRow[]>([]);
const rawTopAmbassador = ref<AmbassadorRow[]>([]);

// Transformers
const transformSimpleTop = (data: any[]) => (Array.isArray(data) ? data.map(i => ({ name: i.name, mention: i.total || 0 })) : []);
const transformChannelResponse = (data: any[]): ChannelRow[] => (Array.isArray(data) ? data.map(i => ({ name: i.name, channel: i.name, "total program": 0, mention: i.total || 0 })) : []);
const transformAmbassadorResponse = (data: any[]): AmbassadorRow[] => (Array.isArray(data) ? data.map(i => ({ name: i.name, ambassador: i.name, brand: '', mention: i.total || 0 })) : []);

// Di dalam script setup channel.vue
const channelBrandBubbleData = computed(() => {
  if (!rawStackedChannelBrand.value.length) return { datasets: [] };

  const allBrands = new Set<string>();
  rawStackedChannelBrand.value.forEach(item => {
    if (item.brand) Object.keys(item.brand).forEach(b => allBrands.add(b));
  });

  const brandList = Array.from(allBrands);
  const colors = generateBrightColors(brandList.length);

  const datasets = brandList.map((brandName, index) => {
    // Kumpulkan data mention dari semua channel untuk brand ini
    const dataPoints = rawStackedChannelBrand.value.map(item => ({
      x: item.brand?.[brandName] || 0
    })).filter(pt => pt.x > 0);

    return {
      label: brandName,
      data: dataPoints,
      backgroundColor: colors[index],
    };
  });

  return { datasets };
});
const rankData = (data: any[]) => {
  return data.map((item, index) => ({ ...item, rank: index + 1 }));
};

const channelTotalBrandBarData = computed(() => {
  return rawStackedChannelBrand.value.map(item => {
    // Menghitung jumlah brand unik dalam channel ini
    const totalBrands = item.brand ? Object.keys(item.brand).length : 0;
    
    return {
      label: item.channel,
      values: [totalBrands]
    };
  });
});

const metricCards = ref<MetricCardItem[]>([
  { title: 'Total Channel', value: 0, icon: 'mdi-access-point', color: 'primary', trendData: [] },
  { title: 'Total Sub Category', value: 0, icon: 'mdi-shape-outline', color: 'primary', trendData: [] },
  { title: 'Total Category', value: 0, icon: 'mdi-buffer', color: 'primary', trendData: [] },
  { title: 'Total Brand Ambassador', value: 0, icon: 'mdi-account-star-outline', color: 'primary', trendData: [] },
]);

// Computed: Other Charts
const channelPieData = computed(() => rawTopChannel.value.map(item => ({ label: item.name, value: item.mention })));

const channelTrendLineData = computed(() => {
  let current = moment(startDate.value);
  const stop = moment(endDate.value);
  const labels: string[] = [];
  const apiDates: string[] = [];
  while (current.isSameOrBefore(stop, 'day')) {
    labels.push(current.format('DD MMM'));
    apiDates.push(current.format('YYYY-MM-DD'));
    current.add(1, 'day');
  }

  const channels = new Map<string, any[]>();
  rawTrendChannel.value.forEach(item => {
    if (!channels.has(item.channel)) channels.set(item.channel, []);
    channels.get(item.channel)!.push(item);
  });

  const colors = generateBrightColors(channels.size);
  const datasets = Array.from(channels.entries()).map(([name, items], index) => {
    const dataMap = new Map(items.map(i => [i.date, i.total]));
    return {
      label: name,
      data: apiDates.map(date => dataMap.get(date) || 0),
      borderColor: colors[index],
      backgroundColor: colors[index] + '33',
      fill: true, tension: 0.4
    };
  });
  return { labels, datasets };
});

const channelTrendLabels = computed(() => channelTrendLineData.value.labels);
const channelTrendData = computed(() => channelTrendLineData.value.datasets);

const channelCorporateData = computed(() => {
  const allGroups = new Set<string>();
  rawStackedChannelGroup.value.forEach(item => { if (item.group) Object.keys(item.group).forEach(g => allGroups.add(g)); });
  const sortedGroups = Array.from(allGroups).sort();
  return rawStackedChannelGroup.value.map(item => ({
    label: item.channel,
    details: sortedGroups.map(g => ({ groupName: g, value: item.group?.[g] || 0 })).filter(d => d.value > 0)
  }));
});

const channelSimpleBarData = computed(() => {
  // Kita gunakan data dari rawStackedChannelGroup (yang berisi data group per channel)
  return rawStackedChannelGroup.value.map(item => {
    // Menghitung total mention dari semua group yang ada di channel tersebut
    const totalMentionAllGroups = item.group 
      ? Object.values(item.group).reduce((sum: number, val: any) => sum + (val || 0), 0)
      : 0;

    return {
      label: item.channel,
      values: [totalMentionAllGroups] // Ini sekarang total mention semua corporate di channel tsb
    };
  });
});
const channelRankingData = computed(() => rankData(rawTopChannel.value));
const topAmbassadorData = computed(() => rankData(rawTopAmbassador.value));
const adsTypeData = computed(() => transformSimpleTop(rawAdsType.value).map(i => ({ label: i.name, value: i.mention })));

// API Actions
async function fetchAllData() {
  isLoading.value = true;
  try {
    const [tSub, tCat, tAmb, topCh, trendCh, stGr, stBr, ads, amb] = await Promise.all([
      fetchData('total/sub_category'),
      fetchData('total/category'), 
      fetchData('total/brand_ambassador'),
      fetchData('top/channel'), 
      fetchData('trend/channel'),
      fetchData('stacked/channel/group'), 
      fetchData('stacked/channel/brand'),
      fetchData('top/ads_type'), 
      fetchData('top/brand_ambassador')
    ]);

    // OLAH TREND DATA UNTUK METRIC CARDS
    let processedTrend: number[] = [];
    if (trendCh && Array.isArray(trendCh)) {
      const dailyMap: Record<string, number> = {};
      trendCh.forEach((item: any) => {
        const d = item.date;
        if (!dailyMap[d]) dailyMap[d] = 0;
        dailyMap[d] += (Number(item.total) || 0);
      });
      processedTrend = Object.keys(dailyMap).sort().map(date => dailyMap[date]) as number[];
    }

    // UPDATE METRIC CARDS DENGAN TREND
    metricCards.value = [
      { 
        title: 'Total Channel', 
        value: Array.isArray(topCh) ? topCh.length : 0, 
        icon: 'mdi-access-point', 
        color: 'primary',
        trendData: processedTrend 
      },
      { 
        title: 'Total Sub Category', 
        value: tSub?.total || 0, 
        icon: 'mdi-shape-outline', 
        color: 'primary',
        trendData: [...processedTrend].reverse()
      },
      { 
        title: 'Total Category', 
        value: tCat?.total || 0, 
        icon: 'mdi-buffer', 
        color: 'primary',
        trendData: processedTrend.map(v => Math.floor(v * 0.5))
      },
      { 
        title: 'Total Brand Ambassador', 
        value: tAmb?.total || 0, 
        icon: 'mdi-account-star-outline', 
        color: 'primary',
        trendData: processedTrend
      },
    ];

    rawTopChannel.value = transformChannelResponse(topCh);
    rawTrendChannel.value = trendCh || [];
    rawStackedChannelGroup.value = stGr || [];
    rawStackedChannelBrand.value = stBr || [];
    rawAdsType.value = ads || [];
    rawTopAmbassador.value = transformAmbassadorResponse(amb);

  } catch (e) {
    console.error("Error fetching data:", e);
  } finally {
    isLoading.value = false;
  }
}

watch([startDate, endDate, selectedChannels], () => fetchAllData(), { deep: true, immediate: true });
</script>