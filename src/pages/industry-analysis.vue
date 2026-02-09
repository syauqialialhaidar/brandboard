<template>
  <v-container fluid class="pa-0">
    <PageTitle title="Industry Analysis" :enabled-filters="['channel', 'kategori', 'sub_kategori']" />

    <v-row>
      <v-col cols="12" lg="8">
        <v-row>
          <v-col cols="12">
            <TopChannel :raw-data="rawChannelTrend" :date-range="dateRange" :loading="isLoading" />
          </v-col>
          <v-col cols="12">
            <TopProgram :raw-data="rawTopPrograms" :loading="isLoading" class="h-100" />
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" lg="4">
        <TableCard title="Top Brands" :headers="['Name']" :rows="displayTopBrands" :is-loading="isLoading"
          :per-page="12" class="h-100 rounded-xl" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="4">
        <v-row>
          <v-col cols="12">
            <ProgramType :filters="filters"  />
          </v-col>
          <v-col cols="12">
            <v-col cols="12">
              <TopBrandambassador :raw-data="rawTopBA" :loading="isLoading" :per-page="6" />
            </v-col>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" lg="8">
        <v-row>
          <v-col cols="12">
            <Age :filters="filters" />
          </v-col>
          <v-col cols="12" md="6">
            <Gender :filters="filters" />
          </v-col>
          <v-col cols="12" md="6">
            <Location :filters="filters" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>






    <!-- <v-row class="mb-8">
      <v-col cols="12" md="4">
        <TableCard title="Top Groups" :headers="['Name']" :rows="displayTopGroups" :is-loading="isLoading"
          class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Brands" :headers="['Name']" :rows="displayTopBrands" :is-loading="isLoading"
          class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Variants" :headers="['Name']" :rows="displayTopVariants" :is-loading="isLoading"
          class="h-100 rounded-xl" />
      </v-col>
    </v-row> -->

    <!-- <v-row class="mb-8">
      <v-col cols="12">
        <IndustryHightlight :raw-data="rawTopGroups" @item-click="handleBrandClick" />
      </v-col>
    </v-row> -->

    <!-- <v-row class="mb-8">
      <v-col cols="12" lg="6">
        <PieChartCard title="Persentase Zona Waktu" :data="dummyTimezoneData" :has-legend="true" :is-loading="isLoading"
          suffix="%" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" lg="6">
        <TopBrandAmbassador :raw-data="rawTopBA" :loading="isLoading" />
      </v-col>
    </v-row> -->

    <!-- <v-row class="mb-8">
      <v-col cols="12" md="6">
        <BarChartCard title="Scope Penyiaran" :data="dummyScopeData.data" :segment-labels="dummyScopeData.segments"
          :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="3" class="d-flex flex-column ga-4">
        <MetricCard title="Rate Card" value="4.2B" icon="mdi-cash-multiple" :trend-data="[10, 20, 15, 30]"
          class="rounded-xl flex-grow-1" />
        <MetricCard title="Total Tipe Iklan" value="156" icon="mdi-advertisements" :trend-data="[5, 10, 8, 12]"
          class="rounded-xl flex-grow-1" />
      </v-col>
    </v-row> -->

    <!-- <div class="text-h5 font-weight-bold mb-4">Audience Insights</div>
    <v-row class="mb-2">
      <v-col cols="12" md="4">
        <PieChartCard title="Gender" :data="genderPieData" :has-legend="true" :is-loading="isLoading" suffix="%"
          class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <BarChartCard title="Age" :data="ageBarData.data" :segment-labels="ageBarData.segments" suffix="%"
          :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <PieChartCard title="Location" :data="locationPieData" :has-legend="true" :is-loading="isLoading"
          class="h-100 rounded-xl" />
      </v-col>
    </v-row> -->
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import moment from 'moment';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app';
import { fetchData } from '@/utils/apiBuilder';
import { generateBrightColors } from '@/utils/colors';

// Components
import PageTitle from '@/page-components/PageTitle.vue';
import MetricCard from '@/page-components/MetricCard.vue';
import TableCard from '@/page-components/TableCard.vue';
import PieChartCard from '@/page-components/PieChartCard.vue';
import LineChartCard from '@/page-components/LineChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';
import HighlightsCarousel from '@/page-components/HighlightsCarousel.vue';
import TableMinim from '@/page-components/TableMinim.vue';


import TopChannel from '@/page-components/industry/top-channel.vue';
import TopProgram from '@/page-components/industry/top-program.vue';
import TopTypeProgram from '@/page-components/industry/top-typeProgram.vue';



import IndustryHightlight from '@/page-components/industry/industry-hightlight.vue';

import TopBrandAmbassador from '@/page-components/industry/top-brandambassador.vue';
import Age from '@/page-components/industry/audience/age.vue';
import Gender from '@/page-components/industry/audience/gender.vue';
import Location from '@/page-components/industry/audience/location.vue';
import ProgramType from '@/page-components/industry/top-typeProgram.vue';
import TopBrandambassador from '@/page-components/industry/top-brandambassador.vue';


const filters = computed(() => ({
  start_date: startDate.value,
  end_date: endDate.value
}));

// --- State & Store ---
const appStore = useAppStore();
const { startDate, endDate } = storeToRefs(appStore);
const isLoading = ref(true);

// Data Raw dari API
const rawChannelTrend = ref<any[]>([]);
const rawTopPrograms = ref<any[]>([]);
const rawTopGroups = ref<any[]>([]);
const rawTopBrands = ref<any[]>([]);
const rawTopVariants = ref<any[]>([]);
const rawTopBA = ref<any[]>([]); // New state for Brand Ambassador

// --- Helpers ---
const createLogoPlaceholder = (name: string) => {
  const initial = (name || 'U').charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;
};

const dateRange = computed(() => {
  const labels: string[] = [], apiDates: string[] = [];
  let current = moment(startDate.value), stop = moment(endDate.value);
  while (current.isSameOrBefore(stop, 'day')) {
    labels.push(current.format('DD MMM'));
    apiDates.push(current.format('YYYY-MM-DD'));
    current.add(1, 'day');
  }
  return { labels, apiDates };
});

const trendLabels = computed(() => dateRange.value.labels);

// --- Computeds for UI ---
const channelTrendDatasets = computed(() => {
  if (!rawChannelTrend.value.length) return [];
  const channelsMap = new Map<string, any[]>();
  rawChannelTrend.value.forEach(item => {
    if (!channelsMap.has(item.channel)) channelsMap.set(item.channel, []);
    channelsMap.get(item.channel)!.push(item);
  });
  const channelNames = [...channelsMap.keys()].sort();
  const colors = generateBrightColors(channelNames.length);
  return channelNames.map((name, index) => {
    const items = channelsMap.get(name)!;
    const dataMap = new Map(items.map(i => [i.date, i.total]));
    return {
      label: name,
      data: dateRange.value.apiDates.map(date => dataMap.get(date) || 0),
      borderColor: colors[index],
      backgroundColor: colors[index] + '33',
      fill: true,
      tension: 0.4
    };
  });
});

const displayTopPrograms = computed(() => rawTopPrograms.value.map((i, idx) => ({
  name: i.name,
  mention: i.total || 0,
  rank: idx + 1
})));

const displayTopGroups = computed(() => rawTopGroups.value.map((i, idx) => ({
  name: i.name,
  mention: i.total || 0,
  rank: idx + 1
})));

const displayTopBrands = computed(() => rawTopBrands.value.map((i, idx) => ({
  name: i.name,
  mention: i.total || 0,
  rank: idx + 1
})));

const displayTopVariants = computed(() => rawTopVariants.value.map((i, idx) => ({
  name: i.name,
  mention: i.total || 0,
  rank: idx + 1
})));
// Dynamic Brand Ambassador computed
const displayBrandAmbassadors = computed(() => rawTopBA.value.map((i, idx) => ({
  name: i.name,
  Mentions: i.total || 0,
  rank: idx + 1
})));

const displayTopGroupsHighlight = computed(() => rawTopGroups.value.slice(0, 5).map(i => ({
  name: i.name,
  count: i.total || 0,
  logo: createLogoPlaceholder(i.name)
})));

const totalHighlightMentions = computed(() => rawTopGroups.value.reduce((acc, curr) => acc + (curr.total || 0), 0));

// --- Main Fetch Function ---
async function fetchAllIndustryData() {
  isLoading.value = true;
  try {
    const params = { start_date: startDate.value, end_date: endDate.value };
    const [trend, program, group, brand, varian, ba] = await Promise.all([
      fetchData('trend/channel', params),
      fetchData('top/program', params),
      fetchData('top/group', params),
      fetchData('top/brand', params),
      fetchData('top/varian', params),
      fetchData('top/brand_ambassador', params), // New endpoint
    ]);

    rawChannelTrend.value = trend || [];
    rawTopPrograms.value = program || [];
    rawTopGroups.value = group || [];
    rawTopBrands.value = brand || [];
    rawTopVariants.value = varian || [];
    rawTopBA.value = ba || [];
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoading.value = false;
  }
}

// --- Watcher & Lifecycle ---
watch([startDate, endDate], () => fetchAllIndustryData(), { deep: true });
onMounted(() => fetchAllIndustryData());

const handleBrandClick = (item: any) => console.log('Highlight Clicked:', item.name);

// --- Remaining Dummy Data ---
const genderPieData = ref([{ label: 'Laki-laki', value: 65 }, { label: 'Perempuan', value: 35 }]);
const ageBarData = ref({ segments: ['Anak-anak', 'Remaja', 'Dewasa'], data: [{ label: 'Persentase', values: [20, 30, 50] }] });
const locationPieData = ref([{ label: 'Jakarta', value: 1250 }, { label: 'Surabaya', value: 980 }, { label: 'Bandung', value: 850 }]);
const dummyTimezoneData = [{ label: 'WIB', value: 70 }, { label: 'WITA', value: 20 }, { label: 'WIT', value: 10 }];
const dummyProgramTypes = [{ name: 'Variety Show' }, { name: 'Drama Series' }];
const dummyScopeData = { segments: ['National', 'Regional', 'Local'], data: [{ label: 'Coverage', values: [65, 25, 10] }] };
</script>