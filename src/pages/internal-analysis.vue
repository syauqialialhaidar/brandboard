<template>
  <v-container fluid class="pa-0">
    <PageTitle title="Internal Analysis" only-internal
      :enabled-filters="['channel', 'brand', 'variants', 'kategori', 'sub_kategori']"
      @update:filter="handleFilterUpdate" />

    <div>
      <!-- Bagian Metric Cards -->
      <InternalMetric :filters="applyFilter" />

      <!-- Bagian Highlights Brands -->
      <v-row class="mb-2">
        <v-col cols="12">
          <InternalHighlights title="Internal Brands Mentions" item-label="Brands" type="brand" :filters="applyFilter"
            :start-date="startDate" :end-date="endDate" @click:item="handleItemClick" />
        </v-col>
      </v-row>


      <div class="text-h5 font-weight-bold mb-4">Brands Distribution</div>

      <!--Brand Pie dan Trends-->
      <div v-if="!isAnalyticsLoading">
        <v-row class="d-flex mb-2">
          <v-col cols="12" md="4">
            <BrandsInternal :data="rawTopBrand" :is-loading="isAnalyticsLoading" />
          </v-col>
          <v-col cols="12" md="8">
            <BrandsTrends :data="rawTrendBrand" :is-loading="isAnalyticsLoading" />
          </v-col>
        </v-row>

        <!--Brand Ranking dan Variants-->
        <v-row class="d-flex mb-2">
          <v-col cols="12" md="6">
            <BrandsRanking :data="rawTopBrand" :is-loading="isAnalyticsLoading" />
          </v-col>
          <v-col cols="12" md="6">
            <BrandsVariants :data="rawStackedVariant" :is-loading="isAnalyticsLoading" />
          </v-col>
        </v-row>
      </div>

      <div class="text-h5 font-weight-bold mb-4">Variants Distribution</div>

      <!--Variants Distribution dan Ranking-->
      <div v-if="!isAnalyticsLoading">
        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <VariantsDistributions :data="rawTopVarian" :colors="variantColors" :is-loading="isAnalyticsLoading" />
          </v-col>
          <v-col cols="12" md="6">
            <VariantsRanking :data="rawTopVarian" />
          </v-col>
        </v-row>

        <!--Variants Trends-->
        <v-row class="mb-4">
          <v-col cols="12">
            <VariantsTrends :data="rawTrendVarian" :is-loading="isAnalyticsLoading" />
          </v-col>
        </v-row>
      </div>

      <!-- Bagian Variants Highlights -->
      <v-row class="mb-2 mt-4">
        <v-col cols="12">
          <InternalHighlights title="Variants Mentions" item-label="Variants" type="varian" :filters="applyFilter"
            :start-date="startDate" :end-date="endDate" @click:item="handleItemClick" />
        </v-col>
      </v-row>

      <!-- Bagian Media dan Audients-->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <BrandAmbassador :data="rawTopBA" :is-loading="isAnalyticsLoading" />
        </v-col>
        <v-col cols="12" md="6">
          <ProgramTypes :data="rawProgramTypes" :is-loading="isAnalyticsLoading" />
        </v-col>
      </v-row>

      <!-- <v-row class="mb-4">
        <v-col cols="12" md="4">
          <Age :filters="applyFilter" />
        </v-col>
        <v-col cols="12" md="4">
          <Gender :filters="applyFilter" />
        </v-col>
        <v-col cols="12" md="4">
          <Location :filters="applyFilter" />
        </v-col>
      </v-row> -->

    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app';
import { fetchData } from '@/utils/apiBuilder';

// Existing Components
import PageTitle from '@/page-components/PageTitle.vue';
import InternalMetric from '@/page-components/internal/Metric.vue';
import InternalHighlights from '@/page-components/internal/InternalHighlights.vue';

import BrandsInternal from '@/page-components/internal/brands/brands-internal.vue';
import BrandsTrends from '@/page-components/internal/brands/brands-trends.vue';
import BrandsRanking from '@/page-components/internal/brands/brands-ranking.vue';
import BrandsVariants from '@/page-components/internal/brands/brands-variants.vue';

import VariantsDistributions from '@/page-components/internal/variant/variant-distributions.vue';
import VariantsRanking from '@/page-components/internal/variant/variant-ranking.vue';
import VariantsTrends from '@/page-components/internal/variant/variant-trends.vue';

import BrandAmbassador from '@/page-components/internal/media/brand-ambassador.vue';
import ProgramTypes from '@/page-components/internal/media/program-type.vue';

import Age from '@/page-components/internal/audience/age.vue';
import Gender from '@/page-components/internal/audience/gender.vue';
import Location from '@/page-components/internal/audience/location.vue';

interface FilterParams {
  group?: string[];
  brand?: string[];
  category?: string[];
  sub_category?: string[];
  varian?: string[];
  start_date?: string | null;
  end_date?: string | null;
  [key: string]: any;
}

// State Store
const appStore = useAppStore();
const { startDate, endDate, internalGroup } = storeToRefs(appStore);

// Filter States
const selectedInternalBrand = ref<string[]>([]);
const selectedCategory = ref<string[]>([]);
const selectedSubCategory = ref<string[]>([]);
const selectedVariants = ref<string[]>([]);

// UI States
const showModal = ref(false);
const selectedItem = ref<any>(null);
const videoList = ref<any[]>([]);
const isVideoLoading = ref(false);

// Analytics Data State 
const isAnalyticsLoading = ref(false);
const rawTopBrand = ref<any[]>([]);
const rawTrendBrand = ref<any[]>([]);
const rawStackedVariant = ref<any[]>([]);

const rawTopVarian = ref([]);
const rawTrendVarian = ref([]);
const variantColors = ref(['#1867C0', '#5CBBFF', '#050B18']);

const rawTopBA = ref<any[]>([]);
const rawProgramTypes = ref<any[]>([]);

// Computed Filter
const applyFilter = computed<FilterParams>(() => ({
  group: [internalGroup.value],
  brand: selectedInternalBrand.value,
  category: selectedCategory.value,
  sub_category: selectedSubCategory.value,
  varian: selectedVariants.value,
  start_date: startDate.value,
  end_date: endDate.value
}));

// Methods: Filter Update
const handleFilterUpdate = (newFilters: any) => {
  if (newFilters.channel) appStore.selectedChannels = newFilters.channel;
  if (newFilters.brand) selectedInternalBrand.value = newFilters.brand;
  if (newFilters.kategori) selectedCategory.value = newFilters.kategori;
  if (newFilters.sub_kategori) selectedSubCategory.value = newFilters.sub_kategori;
  if (newFilters.variants) selectedVariants.value = newFilters.variants;
};

async function loadAnalyticsData() {
  isAnalyticsLoading.value = true;
  try {
    const [top, trend, stacked, topVarian, trendVarian, topBA, topProgramTypes] = await Promise.all([
      fetchData('top/brand', applyFilter.value),
      fetchData('trend/brand', applyFilter.value),
      fetchData('stacked/brand/varian', applyFilter.value),
      fetchData('top/varian', applyFilter.value),
      fetchData('trend/varian', applyFilter.value),
      fetchData('top/brand_ambassador', applyFilter.value),
      fetchData('top/program_type', applyFilter.value)
    ]);

    rawTopBrand.value = top || [];
    rawTrendBrand.value = trend || [];
    rawStackedVariant.value = stacked || [];
    rawTopVarian.value = topVarian || [];
    rawTrendVarian.value = trendVarian || [];
    rawTopBA.value = topBA || [];
    rawProgramTypes.value = topProgramTypes || [];
  } catch (e) {
    console.error("Error loading analytics:", e);
  } finally {
    isAnalyticsLoading.value = false;
  }
}

async function handleItemClick(item: any) {
  selectedItem.value = item;
  showModal.value = true;
  videoList.value = [];
  isVideoLoading.value = true;

  try {
    const filters: Record<string, string[]> = {
      group: [internalGroup.value],
      varian: [item.name]
    };
    if (selectedInternalBrand.value.length > 0) {
      filters.brand = selectedInternalBrand.value;
    }
    const response = await fetchData('list', filters);
    if (response?.data) videoList.value = response.data;
  } catch (error) {
    console.error("Gagal load video:", error);
  } finally {
    isVideoLoading.value = false;
  }
}

watch(applyFilter, () => {
  loadAnalyticsData();
}, { deep: true });

onMounted(() => {
  loadAnalyticsData();
});
</script>