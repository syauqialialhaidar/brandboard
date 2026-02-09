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
import { computed } from 'vue';
import TableMinim from '@/page-components/TableMinim.vue';

const props = defineProps({
  data: { type: Array as () => any[], default: () => [] },
  isLoading: { type: Boolean, default: false }
});

const formattedRows = computed(() => {
  return props.data.map((item, index) => ({
    rank: index + 1,
    name: item.name,
    mention: `${item.total || 0}` 
  }));
});
</script>