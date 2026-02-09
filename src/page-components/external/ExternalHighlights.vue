<template>
  <div v-if="!isLoading">
    <HighlightsCarousel
      :total-title="title"
      :item-label="itemLabel"
      :items="displayItems"
      :total-items-count="rawDataList.length"
      :total-value="totalMentions"
      :is-loading-more="isFetchingMore"
      :start-date="filters.start_date"
      :end-date="filters.end_date"
      :show-modal="showModal"
      :selected-item="selectedItem"
      :active-video="activeVideo"
      :is-loading-detail="isLoadingDetail"
      @next-page="handleLoadMore"
      @item-click="handleItemClick"
      @close-modal="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';
import HighlightsCarousel from '@/page-components/HighlightsCarousel.vue';

const props = defineProps<{
  title?: string;
  itemLabel?: string;
  type?: 'brand' | 'varian';
  filters: Record<string, any>;
}>();

// --- STATE DATA ---
const isLoading = ref(false);
const isFetchingMore = ref(false);
const rawDataList = ref<any[]>([]); // Menyimpan list nama dari API pertama
const displayItems = ref<any[]>([]); // Menyimpan data yang sudah diproses + video preview

// --- STATE MODAL ---
const showModal = ref(false);
const selectedItem = ref<any>(null);
const activeVideo = ref<any>(null);
const isLoadingDetail = ref(false);

// --- COMPUTED ---
const totalMentions = computed(() => {
  return rawDataList.value.reduce((acc, curr) => acc + (Number(curr.mention || curr.total) || 0), 0);
});

// --- HELPERS: LOGO GENERATOR (Dari Kode 2) ---
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
  const color = Math.floor(Math.abs(Math.sin(hash) * 16777215) % 16777215).toString(16).padStart(6, '0');
  return `#${color}`;
}

const createLogo = (name: string) => {
  const initial = (name || 'U').charAt(0).toUpperCase();
  const color = stringToColor(name);
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
      <rect width='100%' height='100%' fill='${color}' />
      <text x='50%' y='55%' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='Arial'>${initial}</text>
    </svg>`)}`;
};

// --- API ACTIONS ---

// 1. Ambil list utama (Top Brand/Varian)
async function loadMainData() {
  isLoading.value = true;
  try {
    const endpoint = props.type === 'brand' ? 'top/brand' : 'top/varian';
    const res = await fetchData(endpoint, props.filters);
    rawDataList.value = Array.isArray(res) ? res : [];
    
    // Reset display dan ambil 6 item pertama (Lazy Loading awal)
    displayItems.value = [];
    await fetchVideoBatch(0, 6);
  } catch (error) {
    console.error("Load Main Data Error:", error);
  } finally {
    isLoading.value = false;
  }
}

// 2. Ambil detail preview video secara bertahap (Seperti Kode 1)
async function fetchVideoBatch(startIdx: number, limit: number) {
  const batch = rawDataList.value.slice(startIdx, startIdx + limit);
  if (batch.length === 0) return;

  const detailed = await Promise.all(batch.map(async (item) => {
    const name = item.name || item.brand || item.varian;
    let videoLink = '';
    
    try {
      // Fetch satu video untuk preview di card
      const vRes = await fetchData('list', { 
        ...props.filters, 
        [props.type === 'brand' ? 'brand' : 'varian']: [name] 
      });
      if (vRes?.data?.length > 0) videoLink = vRes.data[0].video_link;
    } catch (e) {
      console.warn("Gagal fetch preview untuk", name);
    }
    
    return {
      name: name,
      count: item.mention || item.total || 0,
      logo: createLogo(name),
      preview_video: videoLink,
    };
  }));

  displayItems.value.push(...detailed);
}

// 3. Handler Load More saat klik Next (Seperti Kode 1)
async function handleLoadMore() {
  if (isFetchingMore.value) return;
  
  if (displayItems.value.length < rawDataList.value.length) {
    isFetchingMore.value = true;
    await fetchVideoBatch(displayItems.value.length, 3);
    isFetchingMore.value = false;
  }
}

// 4. Detail Modal (Gabungan logic Kode 1 & 2)
async function handleItemClick(item: any) {
  selectedItem.value = item;
  showModal.value = true;
  isLoadingDetail.value = true;
  activeVideo.value = null;

  try {
    const detailFilter = { 
      ...props.filters, 
      [props.type === 'brand' ? 'brand' : 'varian']: [item.name] 
    };
    const res = await fetchData('list', detailFilter);
    if (res?.data?.length > 0) {
      activeVideo.value = res.data[0];
    }
  } catch (error) {
    console.error("Gagal load detail video:", error);
  } finally {
    isLoadingDetail.value = false;
  }
}

function closeModal() {
  showModal.value = false;
  activeVideo.value = null;
}

// --- WATCHER & LIFECYCLE ---
watch(() => props.filters, loadMainData, { deep: true });

onMounted(loadMainData);
</script>