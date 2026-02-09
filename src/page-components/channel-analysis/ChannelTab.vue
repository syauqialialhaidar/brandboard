<template>
  <div>
    <v-row class="mt-2">
      <v-col v-for="(card, index) in metricCards" :key="card.title" cols="12" sm="6" md="3">
        <MetricCard :title="card.title" :value="card.value" :icon="card.icon" :trend-data="card.trendData"
          :labels="metricLabels" :index="index" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Channel Distribution</div>
            <v-btn-toggle v-model="channelDistType" density="compact" mandatory color="primary" variant="tonal"
              class="rounded-lg">
              <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
              <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <PieChartCard v-if="channelDistType === 'pie'" title="" :data="channelPieData" :has-legend="true"
              :is-loading="isLoading" />
            <BarChartCard v-else title="" :data="[{ label: 'Mentions', values: channelPieData.map(d => d.value) }]"
              :segment-labels="channelPieData.map(d => d.label)" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4">
            <div class="text-subtitle-1 font-weight-bold">Channel Trends</div>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <LineChartCard title="" :labels="channelTrendLabels" :data="channelTrendData" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <HeatmapCard title="Channel & Corporate" :data="channelCorporateData" :is-loading="isLoading"
          @item-click="handleHeatmapClick" />
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
          <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              {{ selectedCorporate ? `Mentions for: ${selectedCorporate}` : 'Total Mention per Channel' }}
            </div>
            <v-btn-toggle v-model="channelTotalType" density="compact" mandatory color="primary" variant="tonal"
              class="rounded-lg">
              <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
              <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
          </div>
          <v-divider />
          <div class="pa-4 flex-grow-1">
            <PieChartCard v-if="channelTotalType === 'pie'" title=""
              :data="channelSimpleBarData.map(d => ({ label: d.label, value: d.values[0] }))" :has-legend="true"
              :is-loading="isLoading" />
            <BarChartCard v-else title="" :data="[{
              label: 'Mentions',
              values: channelSimpleBarData.map(d => d.values[0])
            }]" :segment-labels="channelSimpleBarData.map(d => d.label)" :is-loading="isLoading" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12">
        <BubbleChartCard title="Channel & Brand" :data="channelBrandBubbleData" :is-loading="isLoading" />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <TableMinim :title="selectedCorporate ? `Ranking: ${selectedCorporate}` : 'Channel Ranking'"
          :headers="['Rank', 'Channel', 'Mention']" :rows="channelRankingData" />
      </v-col>
      <v-col cols="12" md="6">
        <TableMinim title="Top Brand Ambassador" :headers="['Rank', 'Name', 'Mention']" :rows="topAmbassadorData" />
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
import PieChartCard from '@/page-components/PieChartCard.vue';
import LineChartCard from '@/page-components/LineChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';
import HeatmapCard from '../HeatmapCard.vue'; // Pastikan path benar
import BubbleChartCard from '../BubbleChartCard.vue';
import TableMinim from '@/page-components/TableMinim.vue';

// Utils & Stores
import { generateBrightColors } from '@/utils/colors';
import { useAppStore } from '@/stores/app';
import { fetchData } from '@/utils/apiBuilder';

// --- INTERFACES ---
interface TableRow { name: string; mention: number; rank?: number; }
interface ChannelRow { name: string; channel: string; mention: number; rank?: number; }
interface AmbassadorRow { name: string; ambassador: string; brand: string; mention: number; rank?: number; }
interface TrendItem { total: number; channel: string; date: string; }
interface StackedItem { channel: string; group?: Record<string, number>; brand?: Record<string, number>; total: number; }
interface MetricCardItem { title: string; value: string | number; icon: string; trendData: number[]; }

// --- STATE ---
const appStore = useAppStore();
const { startDate, endDate, selectedChannels } = storeToRefs(appStore);
const isLoading = ref(true);
const channelDistType = ref('pie');
const selectedCorporate = ref<string | null>(null);
const channelTotalType = ref('bar');

// Raw Data from API
const rawTopChannel = ref<ChannelRow[]>([]);
const rawTrendChannel = ref<TrendItem[]>([]);
const rawStackedChannelGroup = ref<StackedItem[]>([]);
const rawStackedChannelBrand = ref<StackedItem[]>([]);
const rawAdsType = ref<TableRow[]>([]);
const rawTopAmbassador = ref<AmbassadorRow[]>([]);

// --- TRANSFORMERS ---
const transformChannelResponse = (data: any[]): ChannelRow[] =>
  (Array.isArray(data) ? data.map(i => ({ name: i.name, channel: i.name, mention: i.total || 0 })) : []);

const transformAmbassadorResponse = (data: any[]): AmbassadorRow[] =>
  (Array.isArray(data) ? data.map(i => ({ name: i.name, ambassador: i.name, brand: '', mention: i.total || 0 })) : []);

const rankData = (data: any[]) => data.map((item, index) => ({ ...item, rank: index + 1 }));

// --- INTERACTION HANDLER ---
const handleHeatmapClick = (item: any) => {
  // item.groupName berasal dari komponen HeatmapCard yang kita buat tadi
  selectedCorporate.value = selectedCorporate.value === item.groupName ? null : item.groupName;
};

// --- COMPUTED DATA ---

// 1. Bar Chart: Total Mention per Channel (SINKRON DENGAN HEATMAP)
const channelSimpleBarData = computed(() => {
  return rawStackedChannelGroup.value.map(item => {
    let val = 0;
    if (selectedCorporate.value) {
      // Ambil nilai spesifik corporate jika difilter
      val = item.group?.[selectedCorporate.value] || 0;
    } else {
      // Total semua group jika tidak difilter
      val = item.group ? Object.values(item.group).reduce((a: number, b: any) => a + (b || 0), 0) : 0;
    }
    return { label: item.channel, values: [val] };
  }).filter(i => i.values[0] > 0);
});

// 2. Heatmap Data
const channelCorporateData = computed(() => {
  const allGroups = new Set<string>();
  rawStackedChannelGroup.value.forEach(item => {
    if (item.group) Object.keys(item.group).forEach(g => allGroups.add(g));
  });
  const sortedGroups = Array.from(allGroups).sort();

  return rawStackedChannelGroup.value.map(item => ({
    label: item.channel,
    details: sortedGroups.map(g => ({
      groupName: g,
      value: item.group?.[g] || 0
    })).filter(d => d.value > 0)
  }));
});

// 3. Channel Ranking (SINKRON DENGAN HEATMAP)
const channelRankingData = computed(() => {
  if (!selectedCorporate.value) return rankData(rawTopChannel.value);

  const filtered = rawStackedChannelGroup.value.map(item => ({
    name: item.channel,
    mention: item.group?.[selectedCorporate.value!] || 0
  })).filter(i => i.mention > 0).sort((a, b) => b.mention - a.mention);

  return rankData(filtered);
});

// 4. Pie Distribution
const channelPieData = computed(() => rawTopChannel.value.map(item => ({ label: item.name, value: item.mention })));

// 5. Line Chart Trend
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

// 6. Bubble Chart
const channelBrandBubbleData = computed(() => {
  if (!rawStackedChannelBrand.value.length) return { datasets: [] };
  const allBrands = new Set<string>();
  rawStackedChannelBrand.value.forEach(item => {
    if (item.brand) Object.keys(item.brand).forEach(b => allBrands.add(b));
  });
  const brandList = Array.from(allBrands);
  const colors = generateBrightColors(brandList.length);

  const datasets = brandList.map((brandName, index) => {
    const dataPoints = rawStackedChannelBrand.value.map(item => ({
      x: item.brand?.[brandName] || 0
    })).filter(pt => pt.x > 0);

    return { label: brandName, data: dataPoints, backgroundColor: colors[index] };
  });
  return { datasets };
});

const topAmbassadorData = computed(() => rankData(rawTopAmbassador.value));

const metricLabels = computed(() => {
  let current = moment(startDate.value);
  const stop = moment(endDate.value);
  const labels: string[] = [];
  while (current.isSameOrBefore(stop, 'day')) {
    labels.push(current.format('DD MMM'));
    current.add(1, 'day');
  }
  return labels;
});

const metricCards = ref<MetricCardItem[]>([]);

// --- API ACTIONS ---
async function fetchAllData() {
  isLoading.value = true;
  selectedCorporate.value = null; // Reset filter saat ganti tanggal/channel
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

    // Trend Processing for Metric Cards
    let processedTrend: number[] = [];
    if (trendCh && Array.isArray(trendCh)) {
      let current = moment(startDate.value);
      const stop = moment(endDate.value);
      const dailyMap: Record<string, number> = {};
      while (current.isSameOrBefore(stop, 'day')) {
        dailyMap[current.format('YYYY-MM-DD')] = 0;
        current.add(1, 'day');
      }
      trendCh.forEach((item: any) => {
        if (dailyMap[item.date] !== undefined) dailyMap[item.date] += (Number(item.total) || 0);
      });
      processedTrend = Object.keys(dailyMap).sort().map(date => Number(dailyMap[date]));
    }

    metricCards.value = [
      { title: 'Total Channel', value: Array.isArray(topCh) ? topCh.length : 0, icon: 'mdi-access-point', trendData: processedTrend },
      { title: 'Total Sub Category', value: tSub?.total || 0, icon: 'mdi-shape-outline', trendData: [...processedTrend].reverse() },
      { title: 'Total Category', value: tCat?.total || 0, icon: 'mdi-buffer', trendData: processedTrend.map(v => Math.floor(v * 0.5)) },
      { title: 'Total Brand Ambassador', value: tAmb?.total || 0, icon: 'mdi-account-star-outline', trendData: processedTrend },
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