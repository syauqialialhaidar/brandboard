<template>
    <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
        <div class="pa-4">
            <div class="text-subtitle-1 font-weight-bold">Internal Brand Variants Distribution</div>
        </div>
        <v-divider />
        <div class="pa-4 flex-grow-1">
            <BarChartCard title="" 
                :data="variantDistributionData"
                :segment-labels="variantDistributionSegments" 
                :is-stacked="true" 
                :is-loading="isLoading" 
            />
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BarChartCard from '@/page-components/BarChartCard.vue';

const props = defineProps({
    data: { type: Array as () => any[], default: () => [] },
    isLoading: { type: Boolean, default: false }
});

const variantDistributionSegments = computed(() => {
    const allVariants = new Set<string>();
    props.data.forEach(item => {
        if (item.varian) Object.keys(item.varian).forEach(v => allVariants.add(v));
    });
    return [...allVariants].sort();
});

const variantDistributionData = computed(() => {
    const segments = variantDistributionSegments.value;
    return props.data.map(brandItem => ({
        label: brandItem.brand,
        values: segments.map(v => brandItem.varian?.[v] || 0)
    }));
});
</script>