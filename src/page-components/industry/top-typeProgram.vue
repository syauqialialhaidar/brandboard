<template>
  <ProgressList 
    title="Top Program Types" 
    :rows="formattedRows" 
    :per-page="5" 
    :is-loading="isLoading"
    class="rounded-xl h-100" 
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
// Pastikan path import sesuai dengan lokasi file ProgressList.vue yang baru Anda buat
import ProgressList from '@/page-components/ProgresList.vue';
import { fetchData } from '@/utils/apiBuilder';

// Menerima filters dari parent (External Analysis Page)
const props = defineProps<{
  filters: Record<string, any>;
}>();

const formattedRows = ref<any[]>([]);
const isLoading = ref(false);

// Fungsi Fetch Data ke API /top/program_type
async function fetchProgramTypes() {
  isLoading.value = true;
  try {
    const response = await fetchData('top/program_type', props.filters);

    if (Array.isArray(response)) {
      formattedRows.value = response.map((item, index) => ({
        rank: index + 1,      
        name: item.name || item.program_type, 
        mention: item.total || 0, 
      }));
    } else {
      formattedRows.value = [];
    }
  } catch (error) {
    console.error("Gagal mengambil Program Types:", error);
    formattedRows.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Watch perubahan filter (Date, Brand, dll)
watch(
  () => props.filters,
  () => {
    fetchProgramTypes();
  },
  { deep: true }
);

// Initial Load
onMounted(() => {
  fetchProgramTypes();
});
</script>