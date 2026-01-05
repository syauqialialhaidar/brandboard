<template>
  <v-card
    class="page-title-card d-flex align-center px-6 py-4 mb-6 mt-n6"
    :class="colorful ? 'text-white' : ''"
    :style="cardStyle"
    elevation="0"
    width="100%"  >
    <div class="d-flex flex-column">
      <h2 class="text-h5 font-weight-black" style="line-height: 1.1">
        {{ title }}
      </h2>
      <span 
        v-if="subtitle" 
        class="text-caption font-weight-bold mt-1" 
        :class="colorful ? 'text-white' : 'text-primary'"
        style="opacity: 0.8; letter-spacing: 1px; text-transform: uppercase;"
      >
        {{ subtitle }}
      </span>
    </div>

    <v-spacer />

    <div class="d-flex align-center gap-3">
      
      <div v-if="showDateFilter" style="width: 280px">
         <DateRangePicker 
           :from="startDate" 
           :to="endDate" 
           @date-change="setDateRange" 
           :theme="colorful ? 'light' : undefined"
         />
      </div>
      
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import DateRangePicker from '@/page-components/DateRangePicker.vue'

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  showChannelFilter?: boolean
  showCategoryFilter?: boolean
  showDateFilter?: boolean
  colorful?: boolean
}>(), {
  showChannelFilter: false,
  showCategoryFilter: false,
  showDateFilter: true,
  colorful: true // Back to Blue by default
})

const appStore = useAppStore()
const { startDate, endDate } = storeToRefs(appStore)
const { setDateRange } = appStore

const cardStyle = computed(() => {
  if (props.colorful) {
    return {
      background: 'linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #42A5F5 100%)', // Blue Gradient
      border: 'none'
    }
  }
  // Fallback for white version if ever needed
  return {
    background: 'rgb(var(--v-theme-surface))'
  }
})
</script>

<style scoped>
.page-title-card {
  /* Exact styling from Sidebar.vue for consistency */
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.3s ease;
  
  /* If not colorful (fallback), use border */
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

.page-title-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08) !important;
  transform: translateY(-2px);
}
</style>