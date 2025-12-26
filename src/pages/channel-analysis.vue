<template>
  <div>
    <v-tabs
      v-model="currentTab"
      align-tabs="center"
      color="primary"
      grow
    >
      <v-tab value="channel">
        <v-icon start>mdi-access-point</v-icon>
        Channel
      </v-tab>
      <v-tab value="brand">
        <v-icon start>mdi-tag-outline</v-icon>
        Brand
      </v-tab>
    </v-tabs>

    <v-divider class="mb-4"></v-divider>

    <v-window v-model="currentTab" class="mt-4">
      <v-window-item value="channel">
        <ChannelTab />
      </v-window-item>

      <v-window-item value="brand">
        <BrandTab />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageTitle from '@/page-components/PageTitle.vue';
import ChannelTab from '@/page-components/channel-analysis/ChannelTab.vue';
import BrandTab from '@/page-components/channel-analysis/BrandTab.vue';

const currentTab = ref('channel');
</script>

<style scoped>
.v-tabs {
  border-radius: 12px;
  background-color: rgb(var(--v-theme-surface));
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.v-tab {
  text-transform: capitalize;
  font-weight: 500;
  height: 40px;
}

.v-tab--selected {
  background-color: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}
</style>
