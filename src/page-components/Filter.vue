<template>
  <div class="d-flex align-center">
    <v-menu
      v-model="menuOpen"
      :close-on-content-click="false"
      location="bottom end"
      transition="scale-transition"
      min-width="400"
      max-width="500"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="flat"
          border
          class="rounded-lg text-capitalize"
          prepend-icon="mdi-filter-variant"
        >
          Filter
          <v-badge
            v-if="totalActiveFilters > 0"
            color="primary"
            :content="totalActiveFilters"
            inline
            class="ml-2"
          ></v-badge>
        </v-btn>
      </template>

      <v-card class="rounded-xl shadow-lg border mt-2">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-subtitle-1 font-weight-bold">Advanced Filter</span>
          <v-btn 
            variant="text" 
            color="error" 
            size="small" 
            @click="resetAll"
            :disabled="totalActiveFilters === 0"
          >
            Reset All
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4 overflow-y-auto" style="max-height: 500px">
          <div class="d-flex flex-column ga-6">
            <div 
              v-for="(level, index) in levels" 
              :key="level.key"
              class="filter-group"
            >
              <label class="text-caption font-weight-bold text-uppercase text-grey-darken-1 mb-2 d-block">
                {{ level.label }}
              </label>
              
              <v-select
                v-model="selections[level.key]"
                :items="options[level.key]"
                :loading="loadings[level.key]"
                :disabled="loadings[level.key]"
                placeholder="Pilih opsi..."
                variant="outlined"
                density="compact"
                multiple
                clearable
                hide-details
                class="rounded-lg"
              >
                <template v-slot:selection="{ item, index: i }">
                  <v-chip v-if="i === 0" size="x-small" color="primary" variant="flat">
                    {{ item.title }}
                  </v-chip>
                  <span v-if="i === 1" class="text-caption text-grey ml-1">
                    (+{{ (selections[level.key]?.length || 0) - 1 }})
                  </span>
                </template>
              </v-select>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-btn
            block
            color="primary"
            variant="flat"
            class="rounded-lg font-weight-bold"
            @click="applyAndClose"
          >
            Apply Filters
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchData } from '@/utils/apiBuilder';

interface FilterLevel {
  key: string;
  label: string;
  endpoint?: string;
  paramName?: string;
}

const props = defineProps({
  levels: { type: Array as () => FilterLevel[], required: true },
  initialOptions: { type: Array as () => any[], default: () => [] }
});

const emit = defineEmits(['update:filter']);

const menuOpen = ref(false);
const selections = ref<Record<string, any[]>>({});
const options = ref<Record<string, any[]>>({});
const loadings = ref<Record<string, boolean>>({});

// Inisialisasi State
props.levels.forEach((level) => {
  selections.value[level.key] = [];
  options.value[level.key] = [];
  loadings.value[level.key] = false;
});

const totalActiveFilters = computed(() => {
  return Object.values(selections.value).reduce((acc, curr) => acc + (curr?.length || 0), 0);
});

/**
 * Memuat semua data untuk setiap level secara paralel
 * agar user bisa langsung memilih tanpa urutan.
 */
async function loadAllOptions() {
  const loadPromises = props.levels.map(async (level, index) => {
    // Level 0 menggunakan initialOptions jika tersedia
    if (index === 0 && props.initialOptions.length > 0) {
      options.value[level.key] = props.initialOptions;
      return;
    }

    if (!level.endpoint) return;

    loadings.value[level.key] = true;
    try {
      const response = await fetchData(level.endpoint, {});
      if (response && Array.isArray(response)) {
        options.value[level.key] = response
          .map((item: any) => item.name || item.title)
          .filter(Boolean)
          .sort();
      }
    } catch (error) {
      console.error(`Error loading ${level.key}:`, error);
    } finally {
      loadings.value[level.key] = false;
    }
  });

  await Promise.all(loadPromises);
}

const applyAndClose = () => {
  emit('update:filter', { ...selections.value });
  menuOpen.value = false;
};

const resetAll = () => {
  props.levels.forEach((level) => {
    selections.value[level.key] = [];
  });
};

// Load data saat komponen dipasang
onMounted(() => {
  loadAllOptions();
});
</script>