<template>
  <TableMinim 
    title="Top Brand Ambassador" 
    :headers="['Name']" 
    :rows="displayBrandAmbassadors"
    :is-loading="loading"
    class="h-100 rounded-xl" 
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TableMinim from '@/page-components/TableMinim.vue';

const props = defineProps({
  rawData: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const displayBrandAmbassadors = computed(() => 
  props.rawData.map((i: any, idx: number) => ({ 
    name: i.name, 
    Mentions: i.total || 0, 
    rank: idx + 1 
  }))
);
</script>