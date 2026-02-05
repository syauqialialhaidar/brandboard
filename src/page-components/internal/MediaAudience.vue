<template>
  <div>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <TableMinim title="Top Program" :headers="['Name', 'Mention']" :rows="topPrograms" :per-page="5" class="h-100 rounded-xl" />
      </v-col>
      <v-col cols="12" md="6">
        <TableMinim title="Top Brand Ambassador" :headers="['Name', 'Mention']" :rows="topBrandAmbasador" :per-page="5" class="h-100 rounded-xl" />
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
            <BarChartCard v-else title="" :data="[{ label: 'Gender', values: dummyGenderData.map(d => d.value) }]" :segment-labels="dummyGenderData.map(d => d.label)" suffix="%" />
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
            <PieChartCard v-else title="" :data="dummyAgeData.segments.map((label, i) => ({ label, value: dummyAgeData.data[0].values[i] }))" :has-legend="true" suffix="%" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-2">
      <v-col cols="12" md="6">
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
            <BarChartCard v-else title="" :data="[{ label: 'Total', values: dummyLocationData.map(d => d.value) }]" :segment-labels="dummyLocationData.map(d => d.label)" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <TableMinim title="Program Types" :headers="['Name', 'Mention']" :rows="dummyProgramType" :per-page="5" class="rounded-xl h-100" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PieChartCard from '@/page-components/PieChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';
import TableMinim from '@/page-components/TableMinim.vue';

// Terima filter dari parent (Internal.vue)
const props = defineProps({
  filters: { type: Object, required: true }
});

const genderChartType = ref('pie');
const ageChartType = ref('bar');
const locationChartType = ref('pie');

// --- Data Pindahan dari internal.vue ---
const dummyGenderData = ref([
  { label: 'Female', value: 60 },
  { label: 'Male', value: 40 },
]);

const dummyAgeData = ref({
  segments: ['Kids (0-12)', 'Teens (13-18)', 'Adults (19-45)', 'Seniors (45+)'],
  data: [{ label: 'Audience', values: [15, 25, 45, 15] }]
});

const dummyLocationData = ref([
  { label: 'Jawa Barat', value: 350 },
  { label: 'DKI Jakarta', value: 300 },
  { label: 'Jawa Timur', value: 200 },
  { label: 'Jawa Tengah', value: 150 },
]);

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
</script>