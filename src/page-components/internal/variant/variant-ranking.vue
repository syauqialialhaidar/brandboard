<template>
  <TableCard 
    title="Variant's Ranking" 
    :headers="['Brand Variant']" 
    :rows="rankingData" 
    :per-page="5" 
    class="h-100 rounded-xl" 
  />
</template>

<script setup>
import { computed } from 'vue';
import TableCard from '@/page-components/TableCard.vue';

const props = defineProps({
  data: { type: Array, default: () => [] }
});

const rankingData = computed(() => {
  return [...props.data]
    .sort((a, b) => (b.total || 0) - (a.total || 0))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      'brand variant': item.name,
      mention: String(item.total || 0)
    }));
});
</script>