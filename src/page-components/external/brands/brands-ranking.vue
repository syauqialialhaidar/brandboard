<template>
  <TableCard 
    title="Brand Ranking" 
    :headers="['Brand']" 
    :rows="tableData" 
    :per-page="5" 
    :is-loading="isLoading"
    class="h-100 rounded-xl" 
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import TableCard from '@/page-components/TableCard.vue';

const props = defineProps<{ filters: Record<string, any> }>();

const isLoading = ref(false);
const rawData = ref<any[]>([]);

// Format data agar sesuai dengan TableCard
const tableData = computed(() => {
  return rawData.value.map((item, index) => ({
    name: item.name,
    mention: Number(item.mention).toLocaleString(),
    rank: index + 1,
    // Field 'brand' dibutuhkan jika TableCard mengharapkan key tertentu untuk nama
    brand: item.name 
  }));
});

async function loadData() {
  isLoading.value = true;
  try {
    const res = await fetchData('top/brand', props.filters);
    // Sort berdasarkan mention tertinggi
    rawData.value = (res || []).sort((a: any, b: any) => b.mention - a.mention);
  } catch (e) {
    console.error("Brands Rank Error:", e);
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.filters, loadData, { deep: true });
onMounted(loadData);
</script>