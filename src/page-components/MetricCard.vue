<template>
  <v-card 
    :color="computedColor" 
    class="metric-stat-card rounded-xl elevation-4 h-100 d-flex flex-column"
    variant="flat"
    @click="showDetails = true" 
    style="cursor: pointer;"
  >
    <div class="card-overlay">
      <v-icon :icon="icon" class="bg-icon-watermark"></v-icon>
    </div>

    <v-card-text class="pa-0 d-flex flex-column h-100 position-relative" style="z-index: 2;">
      <div class="px-6 pt-6 d-flex justify-space-between align-start">
        <div class="d-flex flex-column">
          <span class="category-label text-white font-weight-bold mb-1 opacity-80">
            {{ title }}
          </span>
          <h2 class="display-value text-h3 font-weight-black text-white">
            {{ prefix }}{{ value }}
          </h2>
        </div>

      </div>

      <v-spacer></v-spacer>

      <div class="chart-container mb-2">
        <v-sparkline 
          :model-value="trendData" 
          :labels="labels" 
          :fill="true"
          :gradient="['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.1)', 'transparent']" 
          height="100" 
          padding="12"
          line-width="3" 
          stroke-linecap="round" 
          smooth 
          auto-draw 
          color="white" 
          show-labels 
          label-size="7"
          class="sparkline-custom"
        ></v-sparkline>
      </div>
    </v-card-text>

    <v-dialog v-model="showDetails" max-width="800" transition="scale-transition">
  <v-card class="rounded-xl overflow-hidden">
    <v-row no-gutters>
      <v-col cols="12" md="7" class="pa-6 bg-grey-lighten-5">
        <div class="d-flex align-center mb-6">
          <v-avatar :color="computedColor" size="48" rounded="lg" class="mr-4">
            <v-icon :icon="icon" color="white" size="28"></v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ title }}</div>
            <div class="text-caption text-medium-emphasis">Mentions</div>
          </div>
        </div>

        <div class="mb-4">
          <div class="text-caption text-medium-emphasis mb-1">Current Value</div>
          <div class="d-flex align-center">
            <h2 class="text-h3 font-weight-black mr-3">{{ prefix }}{{ value }}</h2>
          </div>
        </div>

        <v-sheet height="200" class="transparent mt-10">
          <v-sparkline
            :model-value="trendData"
            :color="computedColor"
            height="100"
            padding="8"
            stroke-linecap="round"
            smooth
            line-width="3"
            fill
            auto-draw
          ></v-sparkline>
        </v-sheet>
      </v-col>

      <v-col cols="12" md="5" class="pa-6 bg-white border-s">
        <div class="d-flex justify-end mb-4">
          <v-btn icon="mdi-close" variant="text" density="comfortable" @click="showDetails = false"></v-btn>
        </div>

        <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-1">Card</div>
          <div class="text-caption text-medium-emphasis mb-4">Value Details</div>
          
          <v-list border rounded="lg" class="pa-0 mb-6">
            <v-list-item @click="">
              <v-list-item-title class="text-body-2">Computed Color</v-list-item-title>
              <template v-slot:append>
                <div class="text-caption text-medium-emphasis mr-2">Value</div>
                <v-icon icon="mdi-chevron-right" size="18"></v-icon>
              </template>
            </v-list-item>
          </v-list>

          <div class="text-subtitle-2 font-weight-bold mb-1">Trends</div>
          <v-list border rounded="lg" class="pa-0">
            <v-list-item @click="" lines="two">
              <v-list-item-title class="text-body-2 font-weight-bold">Rend & rend lus months value</v-list-item-title>
              <v-list-item-subtitle class="text-caption text-cyan-darken-2">
                Ho eopaix the deloing
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-icon icon="mdi-chevron-right" size="18"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </div>

        <div>
          <div class="text-subtitle-2 font-weight-bold mb-1">Details Dialog</div>
          <p class="text-caption text-medium-emphasis">
            The stats displayed are based on the latest container data and the computed values.
          </p>
        </div>

        <v-btn 
          block 
          flat 
          color="grey-darken-3" 
          class="mt-8 rounded-lg text-none"
          @click="showDetails = false"
        >
          Dismiss
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'; // Ditambahkan ref
import { useTheme } from 'vuetify'; 

const showDetails = ref(false);
const theme = useTheme(); 

const COLORS_LIGHT = [
  'indigo-darken-1', 'teal-darken-1', 'purple-darken-1',
  'deep-orange-darken-1', 'pink-darken-1', 'cyan-darken-1'
];

const COLORS_DARK = [
  'indigo-darken-3', 'teal-darken-3', 'purple-darken-3',
  'deep-orange-darken-4', 'pink-darken-3', 'cyan-darken-3'
];

interface Props {
  title: string;
  value: string | number;
  prefix?: string;
  icon: string;
  trendData: number[];
  labels?: string[];
  index?: number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  labels: () => [],
  prefix: ''
});

const computedColor = computed(() => {
  if (props.color) return props.color;
  const isDark = theme.global.current.value.dark;
  const targetPalette = isDark ? COLORS_DARK : COLORS_LIGHT;
  return targetPalette[props.index % targetPalette.length];
});
</script>

<style scoped>
.metric-stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-height: 200px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22) !important;
}

.category-label {
  font-size: 0.75rem;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.display-value {
  letter-spacing: -1.5px !important;
  line-height: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

/* Bagian Background Icon */
.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
  z-index: 1;
  overflow: hidden;
}

.bg-icon-watermark {
  position: absolute;
  right: -10%;
  top: 10%;
  font-size: 160px !important; /* Ukuran icon raksasa */
  opacity: 0.15; /* Transparansi rendah */
  transform: rotate(-15deg); /* Sedikit miring agar estetik */
  color: white !important;
}

:deep(g text) {
  fill: rgba(255, 255, 255, 0.9) !important;
  font-weight: 600;
  font-size: 6px;
}
</style>