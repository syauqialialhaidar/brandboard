<template>
  <v-container fluid class="pa-0">
    <PageTitle 
      title="Internal Analysis" 
      only-internal
      :enabled-filters="['channel', 'brand', 'variants', 'kategori', 'sub_kategori']"
      @update:filter="handleFilterUpdate" 
    />

    <div>

      <InternalMetric :filters="applyFilter" />

      <v-row class="mb-2">
        <v-col cols="12">
          <InternalHighlights 
            title="Internal Brands Mentions" 
            item-label="Brands" 
            type="brand"
            :filters="applyFilter" 
            @click:item="handleItemClick"
          />
        </v-col>
      </v-row>

      <div class="text-h5 font-weight-bold mb-4">Brand Distribution</div>
      <BrandDistributions :filters="applyFilter" />

      <div class="text-h5 font-weight-bold mb-4">Variants Distribution</div>
      <VariantsDistributions :filters="applyFilter" />

      <v-row class="mb-2">
        <v-col cols="12">
          <InternalHighlights 
            title="Variants Mentions" 
            item-label="Variants" 
            type="varian" 
            :filters="applyFilter" 
            @click:item="handleItemClick"
          />
        </v-col>
      </v-row>

      <!-- <div class="text-h5 font-weight-bold mb-4">Media and Audience</div>

      <MediaAudience :filters="applyFilter" /> -->

    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app';
import { fetchData } from '@/utils/apiBuilder';

// Components
import PageTitle from '@/page-components/PageTitle.vue';
import InternalMetric from '@/page-components/internal/Metric.vue';
import InternalHighlights from '@/page-components/internal/InternalHighlights.vue';
import BrandDistributions from '@/page-components/internal/BrandDistributions.vue';
import VariantsDistributions from '@/page-components/internal/VariantsDistributions.vue';
import MediaAudience from '@/page-components/internal/MediaAudience.vue';

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

// Computed Filter (Source of Truth untuk semua sub-komponen)
const applyFilter = computed(() => ({
  group: [internalGroup.value],
  brand: selectedInternalBrand.value,
  category: selectedCategory.value,
  sub_category: selectedSubCategory.value,
  varian: selectedVariants.value,
  startDate: startDate.value,
  endDate: endDate.value
}));


// Methods
const handleFilterUpdate = (newFilters: any) => {
  if (newFilters.channel) appStore.selectedChannels = newFilters.channel;
  if (newFilters.brand) selectedInternalBrand.value = newFilters.brand;
  if (newFilters.kategori) selectedCategory.value = newFilters.kategori;
  if (newFilters.sub_kategori) selectedSubCategory.value = newFilters.sub_kategori;
  if (newFilters.variants) selectedVariants.value = newFilters.variants;
};

async function handleItemClick(item: any) {
  selectedItem.value = item;
  showModal.value = true;
  videoList.value = [];
  isVideoLoading.value = true;

  try {
    const filters = {
      group: [internalGroup.value],
      brand: selectedInternalBrand.value.length > 0 ? selectedInternalBrand.value : undefined,
      varian: [item.name]
    };
    const response = await fetchData('list', filters);
    if (response?.data) videoList.value = response.data;
  } catch (error) {
    console.error("Gagal load video:", error);
  } finally {
    isVideoLoading.value = false;
  }
}

onMounted(() => {
});
</script>

<style scoped>
.v-btn-toggle .v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}
</style>