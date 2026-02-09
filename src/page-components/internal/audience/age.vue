<template>
    <v-card class="h-100 rounded-xl d-flex flex-column" variant="flat">
        <div class="pa-4 d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Age Distribution</div>
            <v-btn-toggle v-model="chartType" density="compact" mandatory color="primary" variant="tonal"
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
                <PieChartCard v-if="chartType === 'pie'" title="" :data="chartData" :has-legend="true"
                    :is-loading="isLoading" suffix="%" />

                <BarChartCard v-else title="" :data="[{ label: 'Audience', values: chartData.map(d => d.value) }]"
                    :segment-labels="chartData.map(d => d.label)" :is-loading="isLoading" suffix="%" />
            </template>
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder'; // Menggunakan utility API yang sama dengan Kode 1
import PieChartCard from '@/page-components/PieChartCard.vue';
import BarChartCard from '@/page-components/BarChartCard.vue';

// Menambahkan props filters agar grafik bisa update otomatis
const props = defineProps<{
    filters: Record<string, any>
}>();

const isLoading = ref(false);
const chartType = ref('bar');
const rawData = ref<any[]>([]);

// Mengolah data secara reaktif (Computed)
const chartData = computed(() => {
    return rawData.value
    .filter(item => item.name || item.age_group || item.age)
    .map(item => ({
      label: item.name || item.age_group || item.age, 
      value: Number(item.total || item.value || 0)
    }));
});

// Fungsi load data yang mendukung filter
async function loadAgeData() {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
        // Menggunakan endpoint /top/ages dengan parameter filter
        const res = await fetchData('top/ages', props.filters);
        rawData.value = Array.isArray(res) ? res : [];
    } catch (e) {
        console.error("Age Dist Error:", e);
    } finally {
        isLoading.value = false;
    }
}
watch(() => props.filters, loadAgeData, { deep: true });

onMounted(loadAgeData);
</script>