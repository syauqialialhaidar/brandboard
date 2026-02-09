<template>
  <HighlightsCarousel 
    total-title="Industry Top Highlights" 
    item-label="Top Performance" 
    :items="displayTopGroupsHighlight"
    :total-items-count="displayTopGroupsHighlight.length" 
    :total-value="totalHighlightMentions" 
    @item-click="handleBrandClick" 
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import HighlightsCarousel from '@/page-components/HighlightsCarousel.vue';

const props = defineProps({
  rawData: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['item-click']);

// Helper untuk avatar dipindah ke sini agar internal
const createLogoPlaceholder = (name: string) => {
  const initial = (name || 'U').charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;
};

// Logika mapping data highlight (mengambil 5 teratas)
const displayTopGroupsHighlight = computed(() => 
  props.rawData.slice(0, 5).map((i: any) => ({
    name: i.name,
    count: i.total || 0,
    logo: createLogoPlaceholder(i.name)
  }))
);

// Logika perhitungan total mention
const totalHighlightMentions = computed(() => 
  props.rawData.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0)
);

const handleBrandClick = (item: any) => {
  emit('item-click', item);
};
</script>