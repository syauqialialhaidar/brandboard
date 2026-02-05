<template>
  <HighlightsCarousel
    :total-title="title"
    :item-label="itemLabel"
    :items="displayItems"
    :total-items-count="totalItemsCount"
    :total-value="totalAdsCount"
    :is-loading-more="isFetchingMore"
    :start-date="filters.startDate"
    :end-date="filters.endDate"
    :show-modal="showModal"
    :selected-item="selectedItem"
    :active-video="activeVideo"
    :is-loading-detail="isLoadingDetail"
    @next-page="handleLoadMore"
    @item-click="handleItemClick"
    @close-modal="closeModal"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import HighlightsCarousel from '@/page-components/HighlightsCarousel.vue';
import { fetchData } from '@/utils/apiBuilder';

const props = defineProps({
  title: String,
  itemLabel: String,
  type: { type: String, default: 'brand' }, // 'brand' atau 'varian'
  filters: { type: Object, required: true }
});

// --- STATE DATA ---
const rawDataList = ref<any[]>([]);
const displayItems = ref<any[]>([]);
const isFetchingMore = ref(false);

// --- STATE MODAL ---
const showModal = ref(false);
const selectedItem = ref<any>(null);
const activeVideo = ref<any>(null);
const isLoadingDetail = ref(false);

const totalItemsCount = computed(() => rawDataList.value.length);
const totalAdsCount = computed(() => {
  return rawDataList.value.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
});

// Ambil list utama (Top Brand / Top Varian)
async function loadMainList() {
  const endpoint = props.type === 'brand' ? 'top/brand' : 'top/varian';
  try {
    const res = await fetchData(endpoint, props.filters);
    rawDataList.value = res || [];
    
    // Reset data display dan ambil batch awal (misal 6 item)
    displayItems.value = [];
    await fetchVideoPreviews(0, 6);
  } catch (e) {
    console.error(`Gagal load ${props.type} list:`, e);
  }
}

// Fungsi bantu ambil preview video untuk card carousel
async function fetchVideoPreviews(startIdx: number, limit: number) {
  const batch = rawDataList.value.slice(startIdx, startIdx + limit);
  if (batch.length === 0) return;

  const detailed = await Promise.all(batch.map(async (item) => {
    let videoLink = '';
    try {
      // Cari video berdasarkan brand atau varian
      const vRes = await fetchData('list', { 
        ...props.filters, 
        [props.type]: [item.name] 
      });
      if (vRes?.data?.length > 0) videoLink = vRes.data[0].video_link;
    } catch (e) {}
    
    return {
      name: item.name,
      count: item.total || 0,
      preview_video: videoLink,
    };
  }));
  displayItems.value.push(...detailed);
}

// Handler saat user klik tombol "Next" di carousel
async function handleLoadMore() {
  if (isFetchingMore.value) return;
  
  // Jika data yang di-load belum mencakup seluruh list API
  if (displayItems.value.length < rawDataList.value.length) {
    isFetchingMore.value = true;
    await fetchVideoPreviews(displayItems.value.length, 3);
    isFetchingMore.value = false;
  }
}

// Handler klik item untuk buka modal detail
async function handleItemClick(item: any) {
  selectedItem.value = item;
  showModal.value = true;
  isLoadingDetail.value = true;
  activeVideo.value = null;

  try {
    const res = await fetchData('list', { 
      ...props.filters, 
      [props.type]: [item.name] 
    });
    if (res?.data?.length > 0) {
      activeVideo.value = res.data[0];
    }
  } catch (e) {
    console.error("Gagal load detail video:", e);
  } finally {
    isLoadingDetail.value = false;
  }
}

function closeModal() {
  showModal.value = false;
  activeVideo.value = null;
}

// Watcher jika filter global (tanggal, channel, dll) berubah
watch(() => props.filters, loadMainList, { deep: true });

onMounted(loadMainList);
</script>