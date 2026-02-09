<template>
    <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
        <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Top 10 Brand Distribution</div>
            <v-btn-toggle v-model="brandDistType" density="compact" mandatory color="primary" variant="tonal"
                class="rounded-lg">
                <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
            </v-btn-toggle>
        </div>

        <v-divider />

        <div class="pa-4 flex-grow-1" style="min-height: 300px;">
            <v-row v-if="isLoading" class="fill-height" align="center" justify="center">
                <v-progress-circular indeterminate color="primary" />
            </v-row>

            <template v-else>
                <PieChartCard v-if="brandDistType === 'pie'" title="" :data="chartData" :colors="chartColors"
                    :has-legend="true" :is-loading="isLoading" />

                <BarChartCard v-else title="" :data="[{ label: 'Total Mentions', values: chartData.map(d => d.value) }]"
                    :segment-labels="chartData.map(d => d.label)" :is-loading="isLoading" />
            </template>
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import { generateBrightColors } from '@/utils/colors';
import PieChartCard from '@/page-components/PieChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';

const props = defineProps<{
    filters: Record<string, any>
}>();

const isLoading = ref(false);
const brandDistType = ref('pie');
const rawData = ref<any[]>([]);

// Pastikan jumlah warna cukup untuk 10 brand
const chartColors = computed(() => generateBrightColors(10));

const chartData = computed(() => {
    // Mapping field 'mention' atau 'total' untuk fleksibilitas API
    return rawData.value.slice(0, 10).map(item => ({
        label: item.name || 'Unknown',
        value: Number(item.mention || item.total || 0)
    }));
});

async function loadData() {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
        const res = await fetchData('top/brand', props.filters);
        rawData.value = Array.isArray(res) ? res : [];
    } catch (e) {
        console.error("Brands Dist Error:", e);
    } finally {
        isLoading.value = false;
    }
}

watch(() => props.filters, loadData, { deep: true });
onMounted(loadData);
</script>