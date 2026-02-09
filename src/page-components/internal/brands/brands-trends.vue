<template>
    <LineChartCard 
        title="Internal Brand Trends" 
        :labels="brandTrendLabels" 
        :data="internalLineData"
        :is-loading="isLoading" 
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import moment from 'moment';
import LineChartCard from '@/page-components/LineChartCard.vue';

const props = defineProps({
    data: { type: Array as () => any[], default: () => [] },
    isLoading: { type: Boolean, default: false }
});

const brandTrendLabels = computed(() => {
    const dates = [...new Set(props.data.map(i => i.date))].sort();
    return dates.map(d => moment(d).format('DD MMM'));
});

const internalLineData = computed(() => {
    if (!props.data.length) return [];
    
    const brands = [...new Set(props.data.map(i => i.brand))].sort();
    const apiDates = [...new Set(props.data.map(i => i.date))].sort();

    return brands.map((brandName) => {
        const dataPoints = apiDates.map(date => {
            const match = props.data.find(r => r.brand === brandName && r.date === date);
            return match ? match.total : 0;
        });

        return {
            label: brandName,
            data: dataPoints,
            fill: true
        };
    });
});
</script>