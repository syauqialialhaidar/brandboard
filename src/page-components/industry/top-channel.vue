<template>
    <v-card class="h-100 rounded-xl d-flex flex-column pa-5" variant="flat">
        <BarHorizontal title="TV Channels Performance" :data="aggregatedChannelData"
            :segment-labels="['Total Mentions']" :is-loading="loading" :show-toggle="true" :toggle="filterToggle"
            :is-stacked="false" class="h-100 rounded-xl" @toggle-change="filterToggle = $event"
            @click-bar="handleBarClick" />
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BarHorizontal from '@/page-components/BarHorizontal.vue';

// Props dari Parent
const props = defineProps({
    rawData: {
        type: Array as () => any[],
        required: true,
        default: () => []
    },
    dateRange: {
        type: Object,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const filterToggle = ref('top10'); // Default filter: top10, all, atau bottom10

// 1. Mengolah data Time Series menjadi Agregat (Total per Channel)
const allChannelsData = computed(() => {
    if (!props.rawData.length) return [];

    // Grouping dan Summing total per channel
    const channelTotals: Record<string, number> = {};

    props.rawData.forEach((item: any) => {
        if (!channelTotals[item.channel]) channelTotals[item.channel] = 0;
        channelTotals[item.channel] += (item.total || 0);
    });

    // Ubah ke format yang dibutuhkan BarHorizontal.vue:
    // { label: 'Nama Channel', values: [12345] }
    const formattedData = Object.entries(channelTotals)
        .map(([channel, total]) => ({
            label: channel,
            values: [total]
        }))
        // Sort dari terbesar ke terkecil secara default
        .sort((a, b) => b.values[0] - a.values[0]);

    return formattedData;
});

// 2. Logic Filter (Top 10 / All / Bottom 10)
const aggregatedChannelData = computed(() => {
    const data = [...allChannelsData.value];

    switch (filterToggle.value) {
        case 'top10':
            return data.slice(0, 10);
        case 'bottom10':
            // Ambil 10 terbawah, lalu balik urutannya agar yang paling kecil di bawah (opsional)
            return data.slice(-10).reverse();
        case 'all':
        default:
            return data;
    }
});

// Event Handler jika bar diklik
const handleBarClick = (channelName: string) => {
    console.log('Channel clicked:', channelName);
    // Bisa emit ke parent atau navigasi
};
</script>