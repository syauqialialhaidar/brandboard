<template>
  <v-card 
    class="glass-card cursor-pointer" 
    :class="`glass-variant-${color}`"
    flat
    @click="showModal = true"
  >
    <div class="glass-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>
    <div class="glass-sheen"></div>

    <v-card-text class="pa-6 d-flex flex-column fill-height glass-content">
      <div class="d-flex justify-space-between align-start">
        <div class="z-index-2">
          <span class="text-overline font-weight-black glass-label">{{ title }}</span>
          <div class="text-h3 font-weight-black mt-1 value-text">{{ value }}</div>
        </div>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-center mt-6 z-index-2">
        <v-spacer></v-spacer>
        <v-icon :icon="icon" size="100" class="glass-bg-icon"></v-icon>
      </div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="showModal" max-width="500" transition="dialog-bottom-transition">
    <v-card class="rounded-xl pa-0 overflow-hidden" elevation="15">
      <div class="d-flex justify-space-between align-center px-6 py-4 bg-secondary">
        <div class="text-h6 font-weight-bold d-flex align-center text-white">
          <v-icon :icon="icon" class="mr-3" size="default"></v-icon>
          {{ title }} Details
        </div>
        <v-btn icon="mdi-close" size="small" variant="text" color="white" @click="showModal = false"></v-btn>
      </div>

      <div class="pa-6">
        <v-card variant="flat" color="primary-lighten-5" class="pa-4 text-center mb-6 rounded-lg">
          <div class="text-subtitle-2 text-medium-emphasis mb-1">Current Total Value</div>
          <h2 class="text-h3 font-weight-bold text-primary">{{ value }}</h2>
        </v-card>
        
        <v-divider class="mb-6"></v-divider>
        
        <v-card variant="outlined" color="info" class="pa-4 text-left rounded-lg">
          <div class="text-caption text-uppercase font-weight-bold mb-2 text-info d-flex align-center">
            <v-icon icon="mdi-information-outline" size="small" class="mr-2"></v-icon>
            Data Overview
          </div>
          <div class="text-body-2 text-medium-emphasis">
            This section is reserved for a more detailed breakdown and historical trend analysis of <b>{{ title }}</b>.
          </div>
        </v-card>
        
        <v-btn block color="secondary" class="mt-6" size="large" variant="flat" rounded="lg" @click="showModal = false">
          Close Window
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
<style scoped>
/* --- BASE CARD DESIGN --- */
.glass-card {
  height: 100%;
  min-height: 200px;
  border-radius: 30px 60px 30px 60px !important;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  /* Glassmorphism Core */
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
}

/* --- LIGHT MODE ADJUSTMENTS --- */
.v-theme--light .glass-card {
  background: rgba(255, 255, 255, 0.4) !important;
  /* Border lebih gelap di light mode agar terlihat kotaknya */
  border: 1.5px solid rgba(0, 0, 0, 0.08) !important; 
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.1),
    inset 0 0 15px rgba(255, 255, 255, 0.5) !important;
  color: #2F3349 !important; /* Mengikuti on-surface vuetify.ts */
}

.v-theme--light .glass-label {
  background: rgba(0, 0, 0, 0.05);
  color: #4A5072;
}

.v-theme--light .main-icon {
  color: rgba(0, 0, 0, 0.6);
}

/* --- DARK MODE ADJUSTMENTS --- */
.v-theme--dark .glass-card {
  background: rgba(47, 51, 73, 0.4) !important; /* Surface color dari vuetify.ts */
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
  color: white !important;
}

.v-theme--dark .glass-label {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

/* --- COLOR BLOBS (Source: vuetify.ts) --- */
.glass-variant-primary .blob-1 { background: #2092EC; }
.glass-variant-primary .blob-2 { background: #00CFE8; }

.glass-variant-success .blob-1 { background: #28C76F; }
.glass-variant-success .blob-2 { background: #A8AAAE; }

.glass-variant-warning .blob-1 { background: #FF9F43; }
.glass-variant-warning .blob-2 { background: #EA5455; }

.glass-blobs {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.blob {
  position: absolute;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.5;
  animation: blob-float 10s infinite alternate;
}

.blob-1 { top: -20px; left: -20px; }
.blob-2 { bottom: -20px; right: -20px; animation-delay: -5s; }

@keyframes blob-float {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(30px, 20px) scale(1.2); }
}

/* --- INTERACTIVE --- */
.glass-card:hover {
  transform: translateY(-8px);
  border-radius: 50px 20px 50px 20px !important;
}

.v-theme--light .glass-card:hover {
  border-color: rgba(0, 0, 0, 0.15) !important;
  box-shadow: 0 25px 50px -15px rgba(0, 0, 0, 0.15) !important;
}

/* --- DECORATIONS --- */
.icon-glass-box {
  background: rgba(var(--v-theme-primary), 0.1);
  padding: 12px;
  border-radius: 16px;
  backdrop-filter: blur(5px);
}

.status-pill {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 10px;
}

.v-theme--dark .status-pill {
  background: rgba(255, 255, 255, 0.1);
}

.glass-bg-icon {
  position: absolute;
  right: -15px;
  bottom: -15px;
  opacity: 0.08;
  transform: rotate(-10deg);
}

.value-text {
  letter-spacing: -1.5px !important;
}

.z-index-2 { z-index: 2; position: relative; }
</style>

<script setup lang="ts">
import { ref } from 'vue'; // WAJIB DIIMPORT

defineProps<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
}>();

// DEKLARASIKAN VARIABLE AGAR TIDAK MERAH
const showModal = ref(false);
</script>