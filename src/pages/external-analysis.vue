<template>
  <v-container fluid class="pa-0">
    <PageTitle title="External Analysis" exclude-internal
      :enabled-filters="['channel', 'group', 'brand', 'variants', 'kategori', 'sub_kategori']"
      @update:filter="handleFilterUpdate" />

    <div>
      <ExternalMetric :filters="applyFilter" />

      <div class="d-flex align-center mb-4 ga-2">
        <div class="text-h5 font-weight-bold">Brand and Variants Distribution</div>
      </div>

      <v-row class="d-flex mb-4">
        <v-col cols="12" md="4">
          <BrandsDistribution :filters="applyFilter" />
        </v-col>
        <v-col cols="12" md="8">
          <BrandsTrends :filters="applyFilter" />
        </v-col>
      </v-row>

      <v-row class="mt-2 mb-4 d-flex">
        <v-col cols="12" md="4">
          <VariantsRanking :filters="applyFilter" />
        </v-col>

        <v-col cols="12" md="8">
          <BrandsVariants :filters="applyFilter" />
        </v-col>
      </v-row>

      <v-row class="mb-6" align="stretch">
        <v-col cols="12" md="4">
          <VariantsRanking :filters="applyFilter" />
        </v-col>
        <v-col cols="12" md="8">
          <VariantsTrends :filters="applyFilter" />
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12">
          <ExternalHighlights title="Variants Mentions" item-label="Variants" type="varian" :filters="applyFilter" />
        </v-col>
      </v-row>

      <div class="d-flex align-center mb-4 ga-2">
        <div class="text-h5 font-weight-bold">Media and Audience</div>
      </div>

      <v-row class="mb-2">
        <v-col cols="12" md="6">
          <ProgramTypes :filters="applyFilter" />
        </v-col>
        <v-col cols="12" md="6">
          <Program :filters="applyFilter" />
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" md="6">
          <AudienceGender :filters="applyFilter" />
        </v-col>
        <v-col cols="12" md="6">
          <AudienceAge :filters="applyFilter" />
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" md="6">
          <AudienceLocation :filters="applyFilter" />
        </v-col>
        <v-col cols="12" md="6">
          <BrandAmbassador :filters="applyFilter" />
        </v-col>
      </v-row>


    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import PageTitle from '@/page-components/PageTitle.vue';
import { useAppStore } from '@/stores/app';
import { storeToRefs } from 'pinia';

import ExternalMetric from '@/page-components/external/Metric.vue';
import ExternalHighlights from '@/page-components/external/ExternalHighlights.vue';

import BrandsDistribution from '@/page-components/external/brands/brands-distributions.vue';
import BrandsTrends from '@/page-components/external/brands/brands-trends.vue';

import VariantsRanking from '@/page-components/external/variants/variants-ranking.vue';
import VariantsTrends from '@/page-components/external/variants/variants-trends.vue';

import Program from '@/page-components/external/media/program.vue';
import ProgramTypes from '@/page-components/external/media/program-type.vue';
import BrandAmbassador from '@/page-components/external/media/brand-ambassador.vue';

import AudienceGender from '@/page-components/external/audience/gender.vue';
import AudienceAge from '@/page-components/external/audience/age.vue';
import AudienceLocation from '@/page-components/external/audience/location.vue';
import BrandsVariants from '@/page-components/external/brands/brands-variants.vue';


// --- State Management ---
const appStore = useAppStore();
const { startDate, endDate, internalGroup, externalGroups } = storeToRefs(appStore);

const selectedExternalGroup = ref<string[]>([]);
const selectedBrand = ref<string[]>([]);
const selectedCategory = ref<string[]>([]);
const selectedSubCategory = ref<string[]>([]);
const selectedVariants = ref<string[]>([]);
const masterExternalGroups = ref<string[]>([]);

// Computed Filter Utama
const applyFilter = computed(() => {
  const filter: Record<string, any> = {
    start_date: startDate.value,
    end_date: endDate.value,
    brand: selectedBrand.value,
    category: selectedCategory.value,
    sub_category: selectedSubCategory.value,
    varian: selectedVariants.value
  };

  if (selectedExternalGroup.value.length > 0) {
    filter.group = selectedExternalGroup.value;
  } else {
    filter.exclude_group = [internalGroup.value];
  }
  return filter;
});

const handleFilterUpdate = (newFilters: any) => {
  if (newFilters.channel) appStore.selectedChannels = newFilters.channel;
  if (newFilters.group) {
    selectedExternalGroup.value = newFilters.group;
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

onMounted(() => {
  masterExternalGroups.value = externalGroups.value;
});
</script>