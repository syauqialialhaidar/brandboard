<template>
  <TableMinim 
    title="Top Program" 
    :headers="['Name', 'Mention']" 
    :rows="rows" 
    :per-page="5" 
    :is-loading="isLoading"
    class="h-100 rounded-xl" 
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import TableMinim from '@/page-components/TableMinim.vue';
import { fetchData } from '@/utils/apiBuilder'; 
import { useAppStore } from '@/stores/app'; 
import { storeToRefs } from 'pinia';

// 1. Terima Filter dari Parent (wajib agar data sinkron dengan filter dashboard)
const props = defineProps<{
  filters: Record<string, any>;
}>();

const rows = ref<any[]>([]);
const isLoading = ref(false);

const appStore = useAppStore();
const { internalGroup } = storeToRefs(appStore);

// 2. Fungsi Fetch Data
async function fetchTopPrograms() {
  isLoading.value = true;
  try {
    const payload = { ...props.filters };
    const response = await fetchData('top/program', payload);
    if (Array.isArray(response)) {
      rows.value = response.map((item: any, index: number) => ({
        rank: index + 1,
        name: item.name || item.program,
        mention: item.total || 0         
      }));
    } else {
      rows.value = [];
    }
  } catch (error) {
    console.error("Gagal mengambil Top Program:", error);
    rows.value = [];
  } finally {
    isLoading.value = false;
  }
}

// 4. Watch perubahan filter dari parent
watch(
  () => props.filters,
  () => {
    fetchTopPrograms();
  },
  { deep: true }
);

// 5. Initial Load
onMounted(() => {
  fetchTopPrograms();
});
</script>