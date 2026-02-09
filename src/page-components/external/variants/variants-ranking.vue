<template>
  <TableCard 
    title="Brand Variant Data" 
    :headers="['Brand Variant']" 
    :rows="rankingData" 
    :per-page="5"
    :is-loading="loading"
    class="h-100 rounded-xl" 
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import TableCard from '@/page-components/TableCard.vue';
import { fetchData } from '@/utils/apiBuilder';

const props = defineProps<{
  filters: Record<string, any>
}>();

// Simpan data mentah dari API di sini
const rawData = ref<any[]>([]);
const loading = ref(false);

// Fungsi hanya bertugas mengambil data mentah
const fetchRanking = async () => {
  loading.value = true;
  try {
    const res = await fetchData('top/varian', props.filters);
    if (res) {
      rawData.value = res;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// Logika pemrosesan data (Sorting & Mapping) dipindah ke computed 
// Persis seperti Kode 1
const rankingData = computed(() => {
  return [...rawData.value]
    .sort((a, b) => (b.total || 0) - (a.total || 0))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      'brand variant': item.name,
      mention: String(item.total || 0)
    }));
});

watch(() => props.filters, fetchRanking, { deep: true });
onMounted(fetchRanking);
</script>