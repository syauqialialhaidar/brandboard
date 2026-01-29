<template>
  <v-container fluid class="pa-0">
    <PageTitle title="Industry Analysis" />

    

    <v-row class="mb-8">
      <v-col cols="12" lg="7">
        <LineChartCard title="TV Channels Trends" :labels="dummyLabels" :data="channelTrendDatasets"
          :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" lg="5">
        <TableCard title="Top Program TV" :headers="['Name']" :rows="dummyPrograms" class="h-100 rounded-xl" />
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12">
        <HighlightsCarousel 
          total-title="Industry Top Highlights" 
          item-label="Top Performance" 
          :items="dummyHighlightItems"
          :total-items-count="dummyHighlightItems.length" 
          :total-value="4500" 
          @item-click="handleBrandClick" 
        />
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" md="4">
        <TableCard title="Top Groups" :headers="['Name']" :rows="dummyGroups" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Brands" :headers="['Name']" :rows="dummyBrands" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <TableCard title="Top Variants" :headers="['Name']" :rows="dummyVariants" class="h-100 rounded-xl" />
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" lg="6">
        <PieChartCard title="Persentase Zona Waktu" :data="dummyTimezoneData" :has-legend="true" :is-loading="isLoading"
          suffix="%" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" lg="6">
        <TableCard title="Top Brand Ambassador" :headers="['Name', 'Mentions']" :rows="dummyAmbassadors"
          class="h-100 rounded-xl" />
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12" md="5">
        <TableCard title="Program Types" :headers="['Type']" :rows="dummyProgramTypes" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <BarChartCard title="Scope Penyiaran" :data="dummyScopeData.data" :segment-labels="dummyScopeData.segments"
          :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="3" class="d-flex flex-column ga-4">
        <MetricCard title="Rate Card" value="4.2B" icon="mdi-cash-multiple" :trend-data="[10, 20, 15, 30]"
          class="rounded-xl flex-grow-1" />
        <MetricCard title="Total Tipe Iklan" value="156" icon="mdi-advertisements" :trend-data="[5, 10, 8, 12]"
          class="rounded-xl flex-grow-1" />
      </v-col>
    </v-row>

    <div class="text-h5 font-weight-bold mb-4">Audience Insights</div>
    <v-row class="mb-2">
      <v-col cols="12" md="4">
        <PieChartCard title="Gender" :data="genderPieData" :has-legend="true" :is-loading="isLoading"
          suffix="%" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <BarChartCard title="Age" :data="ageBarData.data" :segment-labels="ageBarData.segments" suffix="%"
          :is-loading="isLoading" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="4">
        <PieChartCard title="Location" :data="locationPieData" :has-legend="true" :is-loading="isLoading"
          class="h-100 rounded-xl" />
      </v-col>
    </v-row>

  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PageTitle from '@/page-components/PageTitle.vue';
import MetricCard from '@/page-components/MetricCard.vue';
import TableCard from '@/page-components/TableCard.vue';
import PieChartCard from '@/page-components/PieChartCard.vue';
import LineChartCard from '@/page-components/LineChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';
import HighlightsCarousel from '@/page-components/HighlightsCarousel.vue';


interface PieChartItem {
  label: string;
  value: number;
}
const isLoading = ref(true);

// --- DUMMY DATA ---



const dummyHighlightItems = ref([
  { 
    name: 'Unilever', 
    count: 1250, 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/Unilever.svg/1200px-Unilever.svg.png',
    preview_video: '' // Kosongkan jika tidak mau ada video
  },
  { 
    name: 'P&G', 
    count: 980, 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Procter_%26_Gamble_logo.svg/2560px-Procter_%26_Gamble_logo.svg.png',
    preview_video: '' 
  },
  { 
    name: 'Mayora', 
    count: 850, 
    logo: 'https://upload.wikimedia.org/wikipedia/id/c/c1/Logo_Mayora.svg',
    preview_video: '' 
  },
  { 
    name: 'Wings Group', 
    count: 720, 
    logo: 'https://upload.wikimedia.org/wikipedia/id/3/30/Logo_Wings.svg',
    preview_video: '' 
  },
  { 
    name: 'Nestle', 
    count: 610, 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Nestle-logo.svg/1200px-Nestle-logo.svg.png',
    preview_video: '' 
  }
]);

// Handle klik jika ingin membuka modal
const handleBrandClick = (item: any) => {
  console.log('Brand Clicked:', item.name);
};

const genderPieData = ref([
  { label: 'Laki-laki', value: 65 },
  { label: 'Perempuan', value: 35 },
]);

const ageBarData = ref({
  segments: ['Anak-anak', 'Remaja', 'Dewasa'],
  data: [
    { label: 'Persentase', values: [20, 30, 50] }
  ]
});
const dummyLocations = ref([
  { name: 'Jakarta', total: 1250 },
  { name: 'Surabaya', total: 980 },
  { name: 'Bandung', total: 850 },
  { name: 'Medan', total: 720 },
  { name: 'Semarang', total: 610 },
]);

const locationPieData = computed<PieChartItem[]>(() => {
  // Jika nanti pakai API, ganti dummyLocations.value dengan rawLocationData.value
  return dummyLocations.value.map(item => ({
    label: item.name,
    value: Number(item.total)
  }));
});

const dummyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const channelTrendDatasets = [
  { label: 'RCTI', data: [30, 45, 35, 50, 40, 60, 55], borderColor: '#1976D2', fill: false, tension: 0.4 },
  { label: 'SCTV', data: [25, 35, 40, 30, 45, 50, 48], borderColor: '#388E3C', fill: false, tension: 0.4 }
];

const dummyPrograms = [
  { name: 'Sinetron A', mention: '8.5', rank: 1 },
  { name: 'News Update', mention: '7.2', rank: 2 },
  { name: 'Talkshow Malam', mention: '6.8', rank: 3 }
];

const dummyGroups = [
  { name: 'Unilever', mention: 1500, rank: 1 },
  { name: 'Mayora', mention: 1200, rank: 2 }
];

const dummyBrands = [
  { name: 'Pepsodent', mention: 800, rank: 1 },
  { name: 'Indomie', mention: 750, rank: 2 }
];

const dummyVariants = [
  { name: 'Pepsodent White 190g', mention: 400, rank: 1 },
  { name: 'Indomie Goreng Jumbo', mention: 350, rank: 2 }
];

const dummyTimezoneData = [
  { label: 'WIB', value: 70 },
  { label: 'WITA', value: 20 },
  { label: 'WIT', value: 10 }
];

const dummyAmbassadors = [
  { name: 'Raffi Ahmad', mention: 120 },
  { name: 'Agnez Mo', mention: 95 },
  { name: 'Joe Taslim', mention: 80 }
];

const dummyProgramTypes = [
  { name: 'Variety Show', mention: 45 },
  { name: 'Drama Series', mention: 38 },
  { name: 'Sports', mention: 22 }
];

const dummyScopeData = {
  segments: ['National', 'Regional', 'Local'],
  data: [{ label: 'Coverage', values: [65, 25, 10] }]
};

const dummyGenderData = [
  { label: 'Male', value: 48 },
  { label: 'Female', value: 52 }
];

const dummyAgeData = {
  segments: ['13-17', '18-24', '25-34', '35-44', '45+'],
  data: [{ label: 'Percentage', values: [15, 25, 30, 20, 10] }]
};

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
});
</script>