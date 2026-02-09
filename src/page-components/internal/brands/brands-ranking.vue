<template>
    <TableCard 
        title="Internal Brand Ranking" 
        :headers="['Brand']" 
        :rows="internalBrandRanking"
        :per-page="5" 
        class="h-100 rounded-xl" 
    />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TableCard from '@/page-components/TableCard.vue';

const props = defineProps({
    data: { type: Array as () => any[], default: () => [] },
    isLoading: { type: Boolean, default: false }
});

const internalBrandRanking = computed(() => {
    return [...props.data]
        .sort((a, b) => (b.total || 0) - (a.total || 0))
        .map((item, index) => ({
            ...item,
            rank: index + 1,
            brand: item.name,
            mention: String(item.total || 0),
            category: item.category || 'N/A',
            channel: item.channel || 'All Channels'
        }));
});
</script>