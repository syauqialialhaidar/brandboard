<template>
    <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
        <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Internal Brand</div>
            <v-btn-toggle v-model="brandDistType" density="compact" mandatory color="primary" variant="tonal" class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
        </div>
        <v-divider />
        <div class="pa-4 flex-grow-1">
            <PieChartCard v-if="brandDistType === 'pie'" title="" 
                :data="chartData"
                :colors="chartColors" 
                :has-legend="true" 
                :is-loading="isLoading" 
            />
            <BarChartCard v-else title=""
                :data="[{ label: 'Total Mentions', values: chartData.map(d => d.value) }]"
                :segment-labels="chartData.map(d => d.label)" 
                :is-loading="isLoading" 
            />
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { generateBrightColors } from '@/utils/colors';
import PieChartCard from '@/page-components/PieChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';

const props = defineProps({
    data: { type: Array as () => any[], default: () => [] },
    isLoading: { type: Boolean, default: false }
});

const brandDistType = ref('pie');
const chartColors = computed(() => generateBrightColors(15));

const chartData = computed(() => {
    return props.data.slice(0, 10).map(item => ({
        label: item.name,
        value: item.total || 0
    }));
});
</script>
