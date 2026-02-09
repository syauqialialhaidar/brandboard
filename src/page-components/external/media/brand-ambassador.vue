<template>
  <TableMinim 
    title="Top Brand Ambassador" 
    :headers="['Name', 'Mention']" 
    :rows="formattedRows" 
    :per-page="5" 
    :is-loading="isLoading"
    class="h-100 rounded-xl" 
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import TableMinim from '@/page-components/TableMinim.vue';
import { fetchData } from '@/utils/apiBuilder';

// 1. Terima Filter dari Parent
const props = defineProps<{
  filters: Record<string, any>;
}>();

// 2. Local State
const formattedRows = ref<any[]>([]);
const isLoading = ref(false);

// 3. Fetch Data Function
async function fetchBrandAmbassador() {
  isLoading.value = true;
  try {
    const response = await fetchData('top/brand_ambassador', props.filters);

    if (Array.isArray(response)) {
      formattedRows.value = response.map((item, index) => ({
        rank: index + 1,
        // API kadang mengembalikan 'name' atau 'brand_ambassador', kita jaga keduanya
        name: item.name || item.brand_ambassador, 
        mention: `${item.total || 0}` 
      }));
    } else {
      formattedRows.value = [];
    }
  } catch (error) {
    console.error("Gagal mengambil data Brand Ambassador:", error);
    formattedRows.value = [];
  } finally {
    isLoading.value = false;
  }
}

// 4. Watcher untuk update data jika filter berubah
watch(
  () => props.filters,
  () => {
    fetchBrandAmbassador();
  },
  { deep: true }
);

// 5. Initial Load
onMounted(() => {
  fetchBrandAmbassador();
});
</script>