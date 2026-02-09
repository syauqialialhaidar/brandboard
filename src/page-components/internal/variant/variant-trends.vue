<template>
  <LineChartCard 
    title="Internal Brand Variant Trends" 
    :labels="trendLabels" 
    :data="trendData" 
    :is-loading="isLoading" 
  />
</template>

<script setup>
import { computed } from 'vue';
import moment from 'moment';
import LineChartCard from '@/page-components/LineChartCard.vue';

const props = defineProps({
  data: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false }
});

const trendLabels = computed(() => {
  const dates = [...new Set(props.data.map(i => i.date))].sort();
  return dates.map(d => moment(d).format('DD MMM'));
});

const trendData = computed(() => {
  if (!props.data.length) return [];
  const variants = [...new Set(props.data.map(i => i.varian))].sort();
  const apiDates = [...new Set(props.data.map(i => i.date))].sort();
  
  return variants.map((vName) => ({
    label: vName || 'Unknown',
    data: apiDates.map(date => {
      const match = props.data.find(r => r.varian === vName && r.date === date);
      return match ? match.total : 0;
    }),
    fill: true
  }));
});
</script>