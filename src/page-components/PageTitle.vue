<template>
  <v-card class="pa-4 rounded-lg" color="surface">
    <v-row class="d-flex align-center" no-gutters>
      <v-col cols="12" md="auto">
        <div class="d-flex align-center ga-3">
          <h1 class="text-h6 font-weight-bold">{{ title }}</h1>
          <div v-if="subtitle" class="text-subtitle-2 text-primary">{{ subtitle }}</div>
        </div>
      </v-col>

      <v-spacer></v-spacer>

      <v-col cols="12" md="auto" class="d-flex ga-3 flex-wrap">

        <v-sheet v-if="showCategoryFilter" width="200" color="transparent">
          <v-select
            v-model="selectedCategories"
            :items="masterCategories"
            label="Select Category"
            density="compact"
            variant="outlined"
            hide-details
            multiple
            chips
            closable-chips
          ></v-select>
        </v-sheet>

        <v-sheet v-if="showChannelFilter" width="200" color="transparent">
          <v-select
            v-model="selectedChannels"
            :items="masterChannels"
            label="Select Channel"
            density="compact"
            variant="outlined"
            hide-details
            multiple
            chips
            closable-chips
          ></v-select>
        </v-sheet>

        <v-sheet v-if="showDateFilter" width="300" color="transparent">
          <DateRangePicker
            :from="startDate"
            :to="endDate"
            @date-change="setDateRange"
          />
        </v-sheet>

      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import DateRangePicker from '@/page-components/DateRangePicker.vue'

withDefaults(defineProps<{
  title: string;
  subtitle?: string;
  showChannelFilter?: boolean;
  showCategoryFilter?: boolean;
  showDateFilter?: boolean;
}>(), {
  showChannelFilter: false,
  showCategoryFilter: false,
  showDateFilter: true,
});

const appStore = useAppStore()

const {
  startDate,
  endDate,
  masterChannels,
  masterCategories,
  selectedChannels,
  selectedCategories
} = storeToRefs(appStore)

const { setDateRange, fetchMasterFilters } = appStore

onMounted(() => {
  if (masterChannels.value.length === 0) {
    fetchMasterFilters()
  }
})
</script>
