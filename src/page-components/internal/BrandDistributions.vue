<template>
    <div v-if="!isLoading">

        <v-row class="d-flex mb-2">
            <v-col cols="12" md="4">
                <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
                    <div class="pa-4 d-flex align-center justify-space-between">
                        <div class="text-subtitle-1 font-weight-bold">Internal Brand</div>
                        <v-btn-toggle v-model="brandDistType" density="compact" mandatory color="primary"
                            variant="tonal" class="rounded-lg">
                            <v-btn value="pie" icon size="x-large"><v-icon size="small">mdi-chart-pie</v-icon></v-btn>
                            <v-btn value="bar" icon size="x-large"><v-icon size="small">mdi-chart-bar</v-icon></v-btn>
                        </v-btn-toggle>
                    </div>
                    <v-divider />
                    <div class="pa-4 flex-grow-1">
                        <PieChartCard v-if="brandDistType === 'pie'" title="" :data="internalPieData"
                            :colors="chartColors" :has-legend="true" :is-loading="isLoading" />

                        <BarChartCard v-else title=""
                            :data="[{ label: 'Total Mentions', values: internalPieData.map(d => d.value) }]"
                            :segment-labels="internalPieData.map(d => d.label)" :is-loading="isLoading" />
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" md="8">
                <LineChartCard title="Internal Brand Trends" :labels="brandTrendLabels" :data="internalLineData"
                    :is-loading="isLoading" />
            </v-col>
        </v-row>

        <v-row class="mt-2 mb-2 d-flex">
            <v-col cols="12" md="4">
                <TableCard title="Internal Brand Ranking" :headers="['Brand']" :rows="internalBrandRanking"
                    :per-page="5" class="h-100 rounded-xl" />
            </v-col>

            <v-col cols="12" md="8">
                <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
                    <div class="pa-4">
                        <div class="text-subtitle-1 font-weight-bold">Internal Brand Variants Distribution</div>
                    </div>
                    <v-divider />
                    <div class="pa-4 flex-grow-1">
                        <BarChartCard title="" :data="variantDistributionData"
                            :segment-labels="variantDistributionSegments" :is-stacked="true" :is-loading="isLoading" />
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </div>

    <v-row v-else>
        <v-col cols="12" class="text-center pa-10">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4 text-grey">Loading Brand Analytics...</p>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import { generateBrightColors } from '@/utils/colors';
import moment from 'moment';

// Import komponen-komponen yang tadi kamu kirim
import PieChartCard from '@/page-components/PieChartCard.vue';
import LineChartCard from '@/page-components/LineChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';
import TableCard from '@/page-components/TableCard.vue';

const props = defineProps({
    filters: { type: Object, required: true }
});

const isLoading = ref(true);
const brandDistType = ref('pie');

// State Data Raw
const rawTopBrand = ref<any[]>([]);
const rawTrendBrand = ref<any[]>([]);
const rawStackedVariant = ref<any[]>([]);

// Generate warna yang konsisten untuk semua chart di sini
const chartColors = computed(() => generateBrightColors(15));

// --- API Fetching ---
async function loadBrandAnalytics() {
    isLoading.value = true;
    try {
        const [top, trend, stacked] = await Promise.all([
            fetchData('top/brand', props.filters),
            fetchData('trend/brand', props.filters),
            fetchData('stacked/brand/varian', props.filters)
        ]);
        rawTopBrand.value = top || [];
        rawTrendBrand.value = trend || [];
        rawStackedVariant.value = stacked || [];
    } catch (e) {
        console.error("Error loading brand distributions:", e);
    } finally {
        isLoading.value = false;
    }
}

// --- Computed: Pie/Bar Distribution ---
const internalPieData = computed(() => {
    return rawTopBrand.value.slice(0, 10).map(item => ({
        label: item.name,
        value: item.total || 0
    }));
});

// --- Computed: Ranking Table ---
const internalBrandRanking = computed(() => {
    return [...rawTopBrand.value]
        .sort((a, b) => (b.total || 0) - (a.total || 0))
        .map((item, index) => ({
            ...item,
            rank: index + 1,
            brand: item.name, // Key ini harus cocok dengan 'Brand' di headers
            mention: String(item.total || 0),
            // Data tambahan untuk Modal Detail di TableCard
            category: item.category || 'N/A',
            channel: item.channel || 'All Channels'
        }));
});

// --- Computed: Line Chart Trend ---
const brandTrendLabels = computed(() => {
    const dates = [...new Set(rawTrendBrand.value.map(i => i.date))].sort();
    return dates.map(d => moment(d).format('DD MMM'));
});

const internalLineData = computed(() => {
    if (!rawTrendBrand.value.length) return [];

    const brands = [...new Set(rawTrendBrand.value.map(i => i.brand))].sort();
    const apiDates = [...new Set(rawTrendBrand.value.map(i => i.date))].sort();

    return brands.map((brandName) => {
        const dataPoints = apiDates.map(date => {
            const match = rawTrendBrand.value.find(r => r.brand === brandName && r.date === date);
            return match ? match.total : 0;
        });

        return {
            label: brandName,
            data: dataPoints,
            fill: true // Sesuai props LineChartDataItem
        };
    });
});

// --- Computed: Stacked Bar Variants ---
const variantDistributionSegments = computed(() => {
    const allVariants = new Set<string>();
    rawStackedVariant.value.forEach(item => {
        if (item.varian) Object.keys(item.varian).forEach(v => allVariants.add(v));
    });
    return [...allVariants].sort();
});

const variantDistributionData = computed(() => {
    const segments = variantDistributionSegments.value;
    return rawStackedVariant.value.map(brandItem => ({
        label: brandItem.brand,
        values: segments.map(v => brandItem.varian?.[v] || 0)
    }));
});

// --- Watchers ---
watch(() => props.filters, () => {
    loadBrandAnalytics();
}, { deep: true });

onMounted(() => {
    loadBrandAnalytics();
});
</script>

<style scoped>
.v-btn-toggle .v-btn--active {
    background-color: rgba(var(--v-theme-primary), 0.1) !important;
    color: rgb(var(--v-theme-primary)) !important;
}
</style>